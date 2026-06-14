import type { Cache, CacheEntryOptions } from "../ports/cache";

interface Entry<TValue> {
  readonly value: TValue;
  readonly expiresAt?: number;
}

/** Clock injection keeps the cache testable without Date.now() flakiness. */
export type Clock = () => number;

/** In-process cache with optional TTL. Default Strategy for hot, ephemeral data. */
export class MemoryCache<TValue = unknown> implements Cache<TValue> {
  private readonly store = new Map<string, Entry<TValue>>();

  constructor(private readonly now: Clock = () => Date.now()) {}

  private isExpired(entry: Entry<TValue>): boolean {
    return entry.expiresAt !== undefined && entry.expiresAt <= this.now();
  }

  async get(key: string): Promise<TValue | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async set(key: string, value: TValue, options?: CacheEntryOptions): Promise<void> {
    const expiresAt = options?.ttlMs !== undefined ? this.now() + options.ttlMs : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
