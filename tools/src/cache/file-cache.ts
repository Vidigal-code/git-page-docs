import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Cache, CacheEntryOptions } from "../ports/cache";
import { CacheError } from "../errors/app-error";

interface PersistedEntry {
  readonly value: unknown;
  readonly expiresAt?: number;
}

type PersistedMap = Record<string, PersistedEntry>;

/**
 * JSON-file backed cache (Node). Suitable for CLI/MCP persistence across runs.
 * One file holds the whole namespace; loaded lazily and written on mutation.
 */
export class FileCache<TValue = unknown> implements Cache<TValue> {
  private cache?: PersistedMap;

  constructor(
    private readonly filePath: string,
    private readonly now: () => number = () => Date.now(),
  ) {}

  private async load(): Promise<PersistedMap> {
    if (this.cache) return this.cache;
    if (!existsSync(this.filePath)) {
      this.cache = {};
      return this.cache;
    }
    try {
      const raw = await readFile(this.filePath, "utf8");
      this.cache = raw.trim() ? (JSON.parse(raw) as PersistedMap) : {};
    } catch (cause) {
      throw new CacheError(`Failed to read cache file: ${this.filePath}`, { cause });
    }
    return this.cache;
  }

  private async persist(): Promise<void> {
    const dir = path.dirname(this.filePath);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(this.filePath, JSON.stringify(this.cache ?? {}, null, 2), "utf8");
  }

  private isExpired(entry: PersistedEntry): boolean {
    return entry.expiresAt !== undefined && entry.expiresAt <= this.now();
  }

  async get(key: string): Promise<TValue | undefined> {
    const map = await this.load();
    const entry = map[key];
    if (!entry) return undefined;
    if (this.isExpired(entry)) {
      delete map[key];
      await this.persist();
      return undefined;
    }
    return entry.value as TValue;
  }

  async set(key: string, value: TValue, options?: CacheEntryOptions): Promise<void> {
    const map = await this.load();
    map[key] = {
      value,
      expiresAt: options?.ttlMs !== undefined ? this.now() + options.ttlMs : undefined,
    };
    await this.persist();
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined;
  }

  async delete(key: string): Promise<void> {
    const map = await this.load();
    delete map[key];
    await this.persist();
  }

  async clear(): Promise<void> {
    this.cache = {};
    await this.persist();
  }
}
