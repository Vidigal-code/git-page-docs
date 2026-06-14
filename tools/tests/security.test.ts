import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { NodeCryptoService } from "../src/crypto/node-crypto-service";
import { EncryptedCredentialVault, type VaultStorage } from "../src/security/credential-vault";
import { SessionPasswordGate } from "../src/security/password-gate";
import { FileVaultStorage } from "../src/security/file-vault-storage";
import { migratePlaintextKey } from "../src/security/migrate-plaintext-key";
import { SecurityError } from "../src/errors/app-error";

const crypto = new NodeCryptoService(20_000);

class MemoryVaultStorage implements VaultStorage {
  data: string | null = null;
  async load() {
    return this.data;
  }
  async save(s: string) {
    this.data = s;
  }
}

describe("EncryptedCredentialVault", () => {
  it("initializes, unlocks, and round-trips credentials without leaking plaintext", async () => {
    const storage = new MemoryVaultStorage();
    const vault = new EncryptedCredentialVault(storage, crypto);
    expect(await vault.isInitialized()).toBe(false);
    await vault.initialize("master");
    expect(await vault.isInitialized()).toBe(true);
    expect(await vault.unlock("master")).toBe(true);
    expect(await vault.unlock("wrong")).toBe(false);

    await vault.setCredential("master", "openai", "sk-secret-value");
    expect(await vault.getCredential("master", "openai")).toBe("sk-secret-value");
    expect(storage.data).not.toContain("sk-secret-value");
    expect(await vault.listProviders()).toContain("openai");

    await vault.removeCredential("master", "openai");
    expect(await vault.listProviders()).not.toContain("openai");
  });

  it("throws on double init and on wrong-password mutations", async () => {
    const vault = new EncryptedCredentialVault(new MemoryVaultStorage(), crypto);
    await vault.initialize("pw");
    await expect(vault.initialize("pw")).rejects.toBeInstanceOf(SecurityError);
    await expect(vault.setCredential("bad", "p", "k")).rejects.toBeInstanceOf(SecurityError);
    await expect(vault.getCredential("bad", "p")).rejects.toBeInstanceOf(SecurityError);
  });

  it("throws unlocking an uninitialized vault and getCredential returns undefined for missing", async () => {
    const vault = new EncryptedCredentialVault(new MemoryVaultStorage(), crypto);
    await expect(vault.unlock("x")).rejects.toBeInstanceOf(SecurityError);
    await vault.initialize("pw");
    expect(await vault.getCredential("pw", "missing")).toBeUndefined();
    expect(await vault.listProviders()).toEqual([]);
  });
});

describe("SessionPasswordGate", () => {
  it("initializes the vault on first run and caches the password", async () => {
    const vault = new EncryptedCredentialVault(new MemoryVaultStorage(), crypto);
    let prompts = 0;
    const gate = new SessionPasswordGate({
      vault,
      prompt: async () => {
        prompts += 1;
        return "pw";
      },
    });
    expect(await gate.authorize("run-ai")).toBe("pw");
    expect(await vault.isInitialized()).toBe(true);
    await gate.authorize("deploy"); // cached, no new prompt
    expect(prompts).toBe(1);
    gate.reset();
    await gate.authorize("run-mcp");
    expect(prompts).toBe(2);
  });

  it("retries then throws after max attempts", async () => {
    const vault = new EncryptedCredentialVault(new MemoryVaultStorage(), crypto);
    await vault.initialize("correct");
    const gate = new SessionPasswordGate({ vault, prompt: async () => "wrong", maxAttempts: 2 });
    await expect(gate.authorize("run-ai")).rejects.toBeInstanceOf(SecurityError);
  });
});

describe("migratePlaintextKey", () => {
  it("is a no-op for a blank key", async () => {
    const vault = new EncryptedCredentialVault(new MemoryVaultStorage(), crypto);
    const r = await migratePlaintextKey({
      vault,
      password: "pw",
      providerId: "openai",
      plaintextKey: "",
      clearPlaintext: () => {},
    });
    expect(r).toEqual({ migrated: false, initializedVault: false });
  });

  it("initializes, stores, and clears the plaintext", async () => {
    const vault = new EncryptedCredentialVault(new MemoryVaultStorage(), crypto);
    let plaintext: string | null = "sk-old";
    const r = await migratePlaintextKey({
      vault,
      password: "pw",
      providerId: "anthropic",
      plaintextKey: "sk-old",
      clearPlaintext: () => {
        plaintext = null;
      },
    });
    expect(r.migrated).toBe(true);
    expect(r.initializedVault).toBe(true);
    expect(plaintext).toBeNull();
    expect(await vault.getCredential("pw", "anthropic")).toBe("sk-old");
  });
});

describe("FileVaultStorage", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gpd-vault-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("loads null when absent and persists across instances", async () => {
    const file = path.join(dir, "nested", "vault.json");
    const a = new FileVaultStorage(file);
    expect(await a.load()).toBeNull();
    await a.save("{\"v\":1}");
    expect(existsSync(file)).toBe(true);
    const b = new FileVaultStorage(file);
    expect(await b.load()).toBe("{\"v\":1}");
  });
});
