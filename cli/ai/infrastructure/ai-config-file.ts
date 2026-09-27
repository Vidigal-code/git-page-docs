import fs from "node:fs/promises";
import path from "node:path";
import { resolveUserConfigDir } from "@gitpagedocs/tools";
import {
  AI_CLI_CONFIG_FILENAME,
  type AiCliConfig,
} from "../core/models/ai-cli-config";
import { parseAiCliConfig } from "../core/models/parse-ai-cli-config";

/** Owner-only directory/file permissions (no-op on Windows, enforced on POSIX). */
const CONFIG_DIR_MODE = 0o700;
const CONFIG_FILE_MODE = 0o600;

export interface AiConfigFileRepositoryOptions {
  /** Destination directory; defaults to the per-user OS config directory. */
  configDir?: string;
}

/**
 * Stores `.gitpagedocsconfig` in the per-user OS config directory
 * (`%APPDATA%\gitpagedocs` on Windows, `~/Library/Application Support/gitpagedocs`
 * on macOS, `$XDG_CONFIG_HOME/gitpagedocs` elsewhere) with owner-only
 * permissions, so the API key never lives inside a repository checkout.
 */
export class AiConfigFileRepository {
  private readonly configDir: string;

  constructor(options: AiConfigFileRepositoryOptions = {}) {
    this.configDir = options.configDir ?? resolveUserConfigDir();
  }

  getConfigPath(): string {
    return path.join(this.configDir, AI_CLI_CONFIG_FILENAME);
  }

  async read(): Promise<AiCliConfig | null> {
    return this.readFrom(this.getConfigPath());
  }

  /** Delete the stored configuration, wiping any saved settings. Returns the removed path, if any. */
  async clear(): Promise<string[]> {
    const configPath = path.resolve(this.getConfigPath());
    try {
      await fs.rm(configPath);
      return [configPath];
    } catch {
      // Missing file: nothing to remove.
      return [];
    }
  }

  async write(config: AiCliConfig): Promise<void> {
    const configPath = this.getConfigPath();
    await fs.mkdir(path.dirname(configPath), { recursive: true, mode: CONFIG_DIR_MODE });
    const data = `${JSON.stringify(config, null, 2)}\n`;
    await fs.writeFile(configPath, data, { encoding: "utf-8", mode: CONFIG_FILE_MODE });
  }

  private async readFrom(configPath: string): Promise<AiCliConfig | null> {
    try {
      const content = await fs.readFile(configPath, "utf-8");
      return parseAiCliConfig(JSON.parse(content));
    } catch {
      return null;
    }
  }

}
