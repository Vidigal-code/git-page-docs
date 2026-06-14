/**
 * Cache port (Strategy). Implemented in Phase 4 by MemoryCache, FileCache,
 * LocalStorageCache and SessionStorageCache.
 */
export interface CacheEntryOptions {
  /** Time-to-live in milliseconds. Omitted = no expiry. */
  readonly ttlMs?: number;
}

export interface Cache<TValue = unknown> {
  get(key: string): Promise<TValue | undefined>;
  set(key: string, value: TValue, options?: CacheEntryOptions): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
