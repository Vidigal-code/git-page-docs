#!/usr/bin/env node
/**
 * Phase 4 self-test for the @gitpagedocs/tools core. Validates crypto round
 * trips, the encrypted vault, logger redaction, and cache TTL without a full
 * test framework. Run via tsx (see package.json "smoke:core").
 */
import { NodeCryptoService } from "../src/crypto/node-crypto-service";
import { EncryptedCredentialVault, type VaultStorage } from "../src/security/credential-vault";
import { MemoryCache } from "../src/cache/memory-cache";
import { createLogger, NullSink } from "../src/logger/logger";
import { redact } from "../src/logger/redaction";
import { SecurityError } from "../src/errors/app-error";

let failures = 0;
function check(label: string, condition: boolean, detail = ""): void {
  if (condition) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main(): Promise<void> {
  const crypto = new NodeCryptoService(50_000);

  console.log("[smoke:core] crypto");
  // Known SHA-256 vector for "abc".
  const abc = await crypto.sha256("abc");
  check(
    "sha256('abc') known vector",
    abc === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    abc,
  );
  const secret = "sk-test-1234567890abcdefXYZ";
  const sealed = await crypto.encrypt(secret, "hunter2");
  const opened = await crypto.decrypt(sealed, "hunter2");
  check("encrypt/decrypt round trip", opened === secret);
  let wrongRejected = false;
  try {
    await crypto.decrypt(sealed, "wrong-password");
  } catch (e) {
    wrongRejected = e instanceof SecurityError;
  }
  check("decrypt with wrong password throws SecurityError", wrongRejected);
  check("mask hides the secret", !crypto.mask(secret).includes("1234567890"));

  console.log("[smoke:core] vault");
  let stored: string | null = null;
  const storage: VaultStorage = {
    async load() {
      return stored;
    },
    async save(s) {
      stored = s;
    },
  };
  const vault = new EncryptedCredentialVault(storage, crypto);
  check("vault starts uninitialized", !(await vault.isInitialized()));
  await vault.initialize("master-pass");
  check("vault initialized", await vault.isInitialized());
  check("unlock with correct password", await vault.unlock("master-pass"));
  check("unlock with wrong password fails", !(await vault.unlock("nope")));
  await vault.setCredential("master-pass", "openai", "sk-openai-abc");
  const got = await vault.getCredential("master-pass", "openai");
  check("credential round trip", got === "sk-openai-abc");
  check("stored vault does not contain plaintext secret", !(stored ?? "").includes("sk-openai-abc"));
  const providers = await vault.listProviders();
  check("listProviders returns openai", providers.includes("openai"));

  console.log("[smoke:core] logger redaction");
  const masked = redact({ apiKey: "sk-supersecretvalue-1234", note: "ok" }) as Record<string, unknown>;
  check("redact masks apiKey field", masked.apiKey !== "sk-supersecretvalue-1234");
  check("redact keeps non-secret field", masked.note === "ok");
  // logger does not throw and uses NullSink
  const log = createLogger({ sink: new NullSink(), level: "debug" });
  log.info("hello", { token: "ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
  check("logger runs with NullSink", true);

  console.log("[smoke:core] cache TTL");
  let clock = 1_000;
  const cache = new MemoryCache<string>(() => clock);
  await cache.set("k", "v", { ttlMs: 100 });
  check("cache hit before expiry", (await cache.get("k")) === "v");
  clock = 2_000;
  check("cache miss after expiry", (await cache.get("k")) === undefined);

  if (failures > 0) {
    console.error(`\n[smoke:core] FAILED with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log("\n[smoke:core] OK - tools core verified.");
}

main().catch((err) => {
  console.error("[smoke:core] crashed:", err);
  process.exit(1);
});
