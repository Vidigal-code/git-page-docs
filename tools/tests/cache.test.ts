import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync } from "node:fs";
import { MemoryCache } from "../src/cache/memory-cache";
import { FileCache } from "../src/cache/file-cache";
import { WebStorageCache, createLocalStorageCache, createSessionStorageCache } from "../src/cache/web-storage-cache";
import type { WebStorageLike } from "../src/cache/web-storage-cache";

describe("MemoryCache", () => {
  it("set/get/has/delete/clear", async () => {
    const c = new MemoryCache<string>();
    await c.set("k", "v");
    expect(await c.get("k")).toBe("v");
    expect(await c.has("k")).toBe(true);
    await c.delete("k");
    expect(await c.get("k")).toBeUndefined();
    await c.set("a", "1");
    await c.clear();
    expect(await c.has("a")).toBe(false);
  });

  it("respects TTL with injected clock", async () => {
    let now = 0;
    const c = new MemoryCache<number>(() => now);
    await c.set("k", 1, { ttlMs: 100 });
    expect(await c.get("k")).toBe(1);
    now = 200;
    expect(await c.get("k")).toBeUndefined();
  });
});

describe("FileCache", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gpd-cache-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("persists across instances", async () => {
    const file = path.join(dir, "c.json");
    const a = new FileCache<string>(file);
    await a.set("k", "v");
    const b = new FileCache<string>(file);
    expect(await b.get("k")).toBe("v");
  });

  it("expires entries and supports clear/delete", async () => {
    let now = 0;
    const c = new FileCache<string>(path.join(dir, "c.json"), () => now);
    await c.set("k", "v", { ttlMs: 50 });
    now = 100;
    expect(await c.get("k")).toBeUndefined();
    await c.set("x", "y");
    await c.delete("x");
    expect(await c.has("x")).toBe(false);
    await c.set("z", "z");
    await c.clear();
    expect(await c.get("z")).toBeUndefined();
  });

  it("returns undefined for a missing file", async () => {
    const c = new FileCache<string>(path.join(dir, "missing.json"));
    expect(await c.get("nope")).toBeUndefined();
  });
});

class FakeStorage implements WebStorageLike {
  private map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? (this.map.get(k) as string) : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  get length() {
    return this.map.size;
  }
}

describe("WebStorageCache", () => {
  it("namespaces, expires, and clears by prefix", async () => {
    let now = 0;
    const storage = new FakeStorage();
    const c = new WebStorageCache<string>(storage, "p:", () => now);
    await c.set("k", "v", { ttlMs: 10 });
    expect(await c.get("k")).toBe("v");
    now = 50;
    expect(await c.get("k")).toBeUndefined();
    await c.set("a", "1");
    await c.set("b", "2");
    await c.clear();
    expect(await c.has("a")).toBe(false);
  });

  it("handles corrupt JSON and factories", async () => {
    const storage = new FakeStorage();
    storage.setItem("gpd:local:bad", "{not json");
    const local = createLocalStorageCache<string>(storage);
    expect(await local.get("bad")).toBeUndefined();
    const session = createSessionStorageCache<string>(storage);
    await session.set("s", "v");
    expect(await session.get("s")).toBe("v");
  });
});
