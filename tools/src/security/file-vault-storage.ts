import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { VaultStorage } from "./credential-vault";

/** Node file-backed vault storage (CLI + MCP). */
export class FileVaultStorage implements VaultStorage {
  constructor(private readonly filePath: string) {}

  async load(): Promise<string | null> {
    if (!existsSync(this.filePath)) return null;
    const raw = await readFile(this.filePath, "utf8");
    return raw.trim() ? raw : null;
  }

  async save(serialized: string): Promise<void> {
    const dir = path.dirname(this.filePath);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(this.filePath, serialized, { encoding: "utf8", mode: 0o600 });
  }

  async clear(): Promise<void> {
    if (existsSync(this.filePath)) await rm(this.filePath, { force: true });
  }
}
