import type { VaultStorage } from "./credential-vault";
import type { WebStorageLike } from "../cache/web-storage-cache";

/** Browser vault storage backed by a single Web Storage entry. */
export class WebStorageVaultStorage implements VaultStorage {
  constructor(
    private readonly storage: WebStorageLike,
    private readonly key = "gitpagedocs:vault",
  ) {}

  async load(): Promise<string | null> {
    const raw = this.storage.getItem(this.key);
    return raw && raw.trim() ? raw : null;
  }

  async save(serialized: string): Promise<void> {
    this.storage.setItem(this.key, serialized);
  }
}
