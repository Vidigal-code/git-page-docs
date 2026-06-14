import type { Cache, CacheEntryOptions } from "../ports/cache";

/**
 * Minimal subset of the Web Storage API. Injected so this module stays free of
 * DOM lib types and works in the Node-typed tools package. The browser passes
 * `window.localStorage` (→ LocalStorageCache) or `window.sessionStorage`
 * (→ SessionStorageCache).
 */
export interface WebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

interface StoredEntry {
  readonly value: unknown;
  readonly expiresAt?: number;
}

/** Cache backed by a Web Storage-like store, namespaced by key prefix. */
export class WebStorageCache<TValue = unknown> implements Cache<TValue> {
  constructor(
    private readonly storage: WebStorageLike,
    private readonly prefix = "gpd:cache:",
    private readonly now: () => number = () => Date.now(),
  ) {}

  private k(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<TValue | undefined> {
    const raw = this.storage.getItem(this.k(key));
    if (raw === null) return undefined;
    let entry: StoredEntry;
    try {
      entry = JSON.parse(raw) as StoredEntry;
    } catch {
      this.storage.removeItem(this.k(key));
      return undefined;
    }
    if (entry.expiresAt !== undefined && entry.expiresAt <= this.now()) {
      this.storage.removeItem(this.k(key));
      return undefined;
    }
    return entry.value as TValue;
  }

  async set(key: string, value: TValue, options?: CacheEntryOptions): Promise<void> {
    const entry: StoredEntry = {
      value,
      expiresAt: options?.ttlMs !== undefined ? this.now() + options.ttlMs : undefined,
    };
    this.storage.setItem(this.k(key), JSON.stringify(entry));
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined;
  }

  async delete(key: string): Promise<void> {
    this.storage.removeItem(this.k(key));
  }

  async clear(): Promise<void> {
    const toRemove: string[] = [];
    for (let i = 0; i < this.storage.length; i += 1) {
      const k = this.storage.key(i);
      if (k && k.startsWith(this.prefix)) toRemove.push(k);
    }
    for (const k of toRemove) this.storage.removeItem(k);
  }
}

/** localStorage-backed cache (persistent). */
export function createLocalStorageCache<TValue = unknown>(
  storage: WebStorageLike,
  prefix?: string,
): WebStorageCache<TValue> {
  return new WebStorageCache<TValue>(storage, prefix ?? "gpd:local:");
}

/** sessionStorage-backed cache (per-session). */
export function createSessionStorageCache<TValue = unknown>(
  storage: WebStorageLike,
  prefix?: string,
): WebStorageCache<TValue> {
  return new WebStorageCache<TValue>(storage, prefix ?? "gpd:session:");
}
