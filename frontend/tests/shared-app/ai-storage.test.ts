import { afterEach, describe, expect, it, vi } from "vitest";
import type { WebStorageLike } from "@gitpagedocs/tools/cache/web";
import { aiStorage } from "@/shared/lib/ai-storage";
import { AiSecureStorage, aiSecureStorage } from "@/shared/lib/ai-secure-storage";

function memoryStorage(): WebStorageLike & { dump(): Record<string, string> } {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
    key: (index) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
    dump: () => Object.fromEntries(map),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("aiStorage (legacy plaintext)", () => {
  it("is inert without a window", () => {
    expect(typeof window).toBe("undefined");
    expect(() => aiStorage.saveKey("k")).not.toThrow();
    expect(() => aiStorage.saveProvider("openai")).not.toThrow();
    expect(() => aiStorage.clearKey()).not.toThrow();
    expect(aiStorage.getKey()).toBeNull();
    expect(aiStorage.getProvider()).toBeNull();
  });

  it("round-trips the key and provider through localStorage in the browser", () => {
    const storage = memoryStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);

    aiStorage.saveKey("sk-test");
    aiStorage.saveProvider("claude");
    expect(aiStorage.getKey()).toBe("sk-test");
    expect(aiStorage.getProvider()).toBe("claude");
    expect(storage.dump()).toEqual({ gitpagedocs_ai_key: "sk-test", gitpagedocs_ai_provider: "claude" });

    aiStorage.clearKey();
    expect(aiStorage.getKey()).toBeNull();
    expect(aiStorage.getProvider()).toBe("claude");
  });
});

describe("AiSecureStorage", () => {
  it("has no vault outside the browser and answers conservatively", async () => {
    const storage = new AiSecureStorage();
    expect(await storage.isInitialized()).toBe(false);
    expect(await storage.unlock("pw")).toBe(false);
    expect(await storage.getKey("pw", "openai")).toBeUndefined();
    expect(await storage.migrateFromPlaintext("pw", "openai", "sk-legacy", vi.fn())).toBe(false);
    await expect(storage.setPassword("pw")).resolves.toBeUndefined();
    await expect(storage.saveKey("pw", "openai", "sk")).resolves.toBeUndefined();
    await expect(storage.removeKey("pw", "openai")).resolves.toBeUndefined();
    await expect(storage.reset()).resolves.toBeUndefined();
    expect(await aiSecureStorage.isInitialized()).toBe(false);
  });

  it("encrypts keys behind the local password in the injected storage", async () => {
    const backing = memoryStorage();
    const storage = new AiSecureStorage(backing);
    const clearPlaintext = vi.fn();

    expect(await storage.isInitialized()).toBe(false);
    await storage.setPassword("hunter2");
    expect(await storage.isInitialized()).toBe(true);
    // A second call must not re-initialize (and wipe) an existing vault.
    await storage.setPassword("other");
    expect(await storage.unlock("other")).toBe(false);
    expect(await storage.unlock("hunter2")).toBe(true);

    await storage.saveKey("hunter2", "openai", "sk-secret");
    expect(await storage.getKey("hunter2", "openai")).toBe("sk-secret");
    expect(JSON.stringify(backing.dump())).not.toContain("sk-secret");

    expect(await storage.migrateFromPlaintext("hunter2", "claude", "sk-legacy", clearPlaintext)).toBe(true);
    expect(clearPlaintext).toHaveBeenCalledTimes(1);
    expect(await storage.getKey("hunter2", "claude")).toBe("sk-legacy");
    expect(await storage.migrateFromPlaintext("hunter2", "claude", "", clearPlaintext)).toBe(false);
    expect(clearPlaintext).toHaveBeenCalledTimes(1);

    await storage.removeKey("hunter2", "openai");
    expect(await storage.getKey("hunter2", "openai")).toBeUndefined();

    await storage.reset();
    expect(await storage.isInitialized()).toBe(false);
    expect(backing).toHaveLength(0);
  }, 60_000);
});
