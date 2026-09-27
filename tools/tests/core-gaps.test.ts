import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { FileService } from "../src/filesystem/file-service";
import { FileCache } from "../src/cache/file-cache";
import { WebStorageCache, type WebStorageLike } from "../src/cache/web-storage-cache";
import { NodeCryptoService } from "../src/crypto/node-crypto-service";
import { EncryptedCredentialVault, type VaultStorage } from "../src/security/credential-vault";
import { FileVaultStorage } from "../src/security/file-vault-storage";
import { WebStorageVaultStorage } from "../src/security/web-storage-vault-storage";
import { SessionPasswordGate } from "../src/security/password-gate";
import { migratePlaintextKey } from "../src/security/migrate-plaintext-key";
import { CacheError, RepositoryError } from "../src/errors/app-error";

/** Branches the main suites leave out: search filtering/limits, cache and vault edge paths. */

class FakeStorage implements WebStorageLike {
  private readonly map = new Map<string, string>();
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
}

class MemoryVaultStorage implements VaultStorage {
  data: string | null = null;
  cleared = 0;
  async load(): Promise<string | null> {
    return this.data;
  }
  async save(serialized: string): Promise<void> {
    this.data = serialized;
  }
  async clear(): Promise<void> {
    this.cleared += 1;
    this.data = null;
  }
}

const crypto = new NodeCryptoService(20_000);

describe("FileService search filtering", () => {
  let dir: string;
  let fs: FileService;

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gpd-fs-gaps-"));
    fs = new FileService(dir);
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function seed(relative: string, content: string): void {
    const absolute = path.join(dir, ...relative.split("/"));
    mkdirSync(path.dirname(absolute), { recursive: true });
    writeFileSync(absolute, content, "utf8");
  }

  it("matches text extensions case-insensitively, including dotfiles, and ignores dots in folder names", async () => {
    seed(".env", "SECRET=1\n");
    seed("UPPER.MD", "secret heading\n");
    seed("dir.x/file", "secret inside\n");
    seed("image.png", "secret bytes\n");

    const files = (await fs.search("secret")).map((match) => match.file).sort();
    expect(files).toEqual([".env", "UPPER.MD"]);

    const explicit = (await fs.search("secret", { extension: "file" })).map((match) => match.file);
    expect(explicit).toEqual(["dir.x/file"]);
  });

  it("caps the number of matches across and within files", async () => {
    seed("a.md", "hit\nhit\nhit\n");
    seed("b.md", "hit\nhit\n");
    seed("c.md", "hit\n");

    const two = await fs.search("hit", { maxResults: 2 });
    expect(two).toEqual([
      { file: "a.md", line: 1, text: "hit" },
      { file: "a.md", line: 2, text: "hit" },
    ]);

    const four = await fs.search("hit", { maxResults: 4 });
    expect(four.map((match) => `${match.file}:${match.line}`)).toEqual(["a.md:1", "a.md:2", "a.md:3", "b.md:1"]);

    expect(await fs.search("hit")).toHaveLength(6);
  });

  it("skips files that exceed the per-file byte limit and trims long lines", async () => {
    seed("small.md", "needle\n");
    seed("large.md", `${"x".repeat(300)} needle\n`);

    const matches = await fs.search("needle", { maxFileBytes: 50 });
    expect(matches.map((match) => match.file)).toEqual(["small.md"]);

    const [long] = await fs.search("needle", { extension: "large.md" });
    expect(long.text).toHaveLength(240);
    expect(long.text).toBe("x".repeat(240));
  });

  it("wraps an unreadable directory listing in a RepositoryError", async () => {
    seed("plain.txt", "x");
    await expect(fs.list("plain.txt")).rejects.toBeInstanceOf(RepositoryError);
    await expect(fs.list("missing-folder")).rejects.toBeInstanceOf(RepositoryError);
  });

  it("stops listing at maxEntries", async () => {
    seed("one.md", "");
    seed("two.md", "");
    seed("three.md", "");
    expect(await fs.list(".", { maxEntries: 2 })).toHaveLength(2);
  });
});

describe("cache edge paths", () => {
  it("FileCache rejects a corrupt cache file with a CacheError", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "gpd-cache-gaps-"));
    try {
      const file = path.join(dir, "cache.json");
      writeFileSync(file, "{ corrupt", "utf8");
      await expect(new FileCache(file).get("k")).rejects.toBeInstanceOf(CacheError);
      writeFileSync(file, "   ", "utf8");
      expect(await new FileCache(file).get("k")).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("WebStorageCache deletes a single key and ignores foreign keys on clear", async () => {
    const storage = new FakeStorage();
    storage.setItem("other:key", "kept");
    const cache = new WebStorageCache<string>(storage, "p:");
    await cache.set("a", "1");
    await cache.set("b", "2");
    await cache.delete("a");
    expect(await cache.get("a")).toBeUndefined();
    expect(await cache.get("b")).toBe("2");
    await cache.clear();
    expect(await cache.get("b")).toBeUndefined();
    expect(storage.getItem("other:key")).toBe("kept");
  });
});

describe("vault edge paths", () => {
  it("re-reads a vault persisted by another instance and resets it entirely", async () => {
    const storage = new MemoryVaultStorage();
    const first = new EncryptedCredentialVault(storage, crypto);
    await first.initialize("pw");
    await first.setCredential("pw", "openai", "sk-1");

    const second = new EncryptedCredentialVault(storage, crypto);
    expect(await second.isInitialized()).toBe(true);
    expect(await second.getCredential("pw", "openai")).toBe("sk-1");

    await second.reset();
    expect(storage.cleared).toBe(1);
    expect(storage.data).toBeNull();
    expect(await second.isInitialized()).toBe(false);
    await expect(second.unlock("pw")).rejects.toThrow(/not initialized/);
  });

  it("FileVaultStorage clears an existing file and tolerates a missing one", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "gpd-vault-gaps-"));
    try {
      const file = path.join(dir, "vault.json");
      const storage = new FileVaultStorage(file);
      await storage.clear();
      await storage.save("{}");
      expect(existsSync(file)).toBe(true);
      await storage.clear();
      expect(existsSync(file)).toBe(false);
      expect(await storage.load()).toBeNull();
      writeFileSync(file, "   ", "utf8");
      expect(await storage.load()).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("WebStorageVaultStorage clears its single entry", async () => {
    const backing = new FakeStorage();
    const storage = new WebStorageVaultStorage(backing, "vault-key");
    await storage.save("{\"v\":1}");
    expect(backing.getItem("vault-key")).toBe("{\"v\":1}");
    await storage.clear();
    expect(backing.getItem("vault-key")).toBeNull();
    expect(await storage.load()).toBeNull();
  });

  it("SessionPasswordGate prompts every time when session caching is off", async () => {
    const vault = new EncryptedCredentialVault(new MemoryVaultStorage(), crypto);
    await vault.initialize("pw");
    let prompts = 0;
    const gate = new SessionPasswordGate({
      vault,
      cacheForSession: false,
      prompt: async ({ firstRun, attempt }) => {
        prompts += 1;
        expect(firstRun).toBe(false);
        expect(attempt).toBe(1);
        return "pw";
      },
    });
    expect(await gate.authorize("run-ai")).toBe("pw");
    expect(await gate.authorize("run-ai")).toBe("pw");
    expect(prompts).toBe(2);
  });

  it("migratePlaintextKey reuses an already initialized vault", async () => {
    const vault = new EncryptedCredentialVault(new MemoryVaultStorage(), crypto);
    await vault.initialize("pw");
    let cleared = false;
    const result = await migratePlaintextKey({
      vault,
      password: "pw",
      providerId: "openai",
      plaintextKey: "sk-legacy",
      clearPlaintext: async () => {
        cleared = true;
      },
    });
    expect(result).toEqual({ migrated: true, initializedVault: false });
    expect(cleared).toBe(true);
    expect(await vault.getCredential("pw", "openai")).toBe("sk-legacy");
  });
});
