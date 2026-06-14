#!/usr/bin/env node
/**
 * Phase 5b self-test: browser-capable security primitives. Exercises
 * WebCryptoService (SubtleCrypto, available under Node 22), the encrypted vault
 * over a fake Web Storage, the plaintext-key migration, and legacy provider
 * mapping. No network, no real browser.
 */
import { WebCryptoService } from "../src/crypto/web-crypto-service";
import { EncryptedCredentialVault } from "../src/security/credential-vault";
import { WebStorageVaultStorage } from "../src/security/web-storage-vault-storage";
import { migratePlaintextKey } from "../src/security/migrate-plaintext-key";
import type { WebStorageLike } from "../src/cache/web-storage-cache";
import { legacyProviderToCatalogId, parseLegacyProviderAndModel } from "../src/ai/legacy-adapter";
import { SecurityError } from "../src/errors/app-error";

let failures = 0;
function check(label: string, cond: boolean, detail = ""): void {
  if (cond) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/** In-memory Web Storage stand-in. */
class FakeStorage implements WebStorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }
  get length(): number {
    return this.map.size;
  }
  raw(): string {
    return [...this.map.values()].join("|");
  }
}

async function main(): Promise<void> {
  const crypto = new WebCryptoService(50_000);

  console.log("[smoke:secweb] WebCryptoService");
  const abc = await crypto.sha256("abc");
  check(
    "sha256('abc') known vector",
    abc === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    abc,
  );
  const sealed = await crypto.encrypt("sk-secret-XYZ-1234567890", "pw");
  check("encrypt/decrypt round trip", (await crypto.decrypt(sealed, "pw")) === "sk-secret-XYZ-1234567890");
  let wrong = false;
  try {
    await crypto.decrypt(sealed, "bad");
  } catch (e) {
    wrong = e instanceof SecurityError;
  }
  check("wrong password rejected", wrong);

  console.log("[smoke:secweb] vault over web storage");
  const storage = new FakeStorage();
  const vault = new EncryptedCredentialVault(new WebStorageVaultStorage(storage), crypto);
  await vault.initialize("master");
  await vault.setCredential("master", "anthropic", "sk-ant-browser-123");
  check("credential round trip", (await vault.getCredential("master", "anthropic")) === "sk-ant-browser-123");
  check("stored web vault has no plaintext", !storage.raw().includes("sk-ant-browser-123"));

  console.log("[smoke:secweb] plaintext migration");
  let plaintext: string | null = "sk-old-plaintext-999";
  const storage2 = new FakeStorage();
  const vault2 = new EncryptedCredentialVault(new WebStorageVaultStorage(storage2), crypto);
  const result = await migratePlaintextKey({
    vault: vault2,
    password: "newpass",
    providerId: "openai",
    plaintextKey: plaintext,
    clearPlaintext: () => {
      plaintext = null;
    },
  });
  check("migration reports migrated", result.migrated && result.initializedVault);
  check("plaintext cleared after migration", plaintext === null);
  check("migrated key retrievable", (await vault2.getCredential("newpass", "openai")) === "sk-old-plaintext-999");

  console.log("[smoke:secweb] legacy provider mapping");
  check("legacy 'claude' -> 'anthropic'", legacyProviderToCatalogId("claude") === "anthropic");
  check("legacy 'openai' -> 'openai'", legacyProviderToCatalogId("openai") === "openai");
  check("unknown legacy -> 'openai'", legacyProviderToCatalogId("???") === "openai");
  const parsed = parseLegacyProviderAndModel("claude:claude-sonnet-4-6");
  check("parse provider", parsed.providerId === "anthropic");
  check("parse model", parsed.model === "claude-sonnet-4-6");
  check("parse provider-only fills default model", parseLegacyProviderAndModel("gemini").model.length > 0);

  if (failures > 0) {
    console.error(`\n[smoke:secweb] FAILED with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log("\n[smoke:secweb] OK - browser security primitives verified.");
}

main().catch((err) => {
  console.error("[smoke:secweb] crashed:", err);
  process.exit(1);
});
