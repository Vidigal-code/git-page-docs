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
  /** Working directory searched for a legacy `<cwd>/.gitpagedocsconfig`. */
  cwd?: string;
  /** Destination directory; defaults to the per-user OS config directory. */
  configDir?: string;
  /** Notified after a legacy config is moved into the user config directory. */
  onMigrate?: (fromPath: string, toPath: string) => void;
}

/**
 * Stores `.gitpagedocsconfig` in the per-user OS config directory
 * (`%APPDATA%\gitpagedocs` on Windows, `~/Library/Application Support/gitpagedocs`
 * on macOS, `$XDG_CONFIG_HOME/gitpagedocs` elsewhere) with owner-only
 * permissions, so the API key never lives inside a repository checkout.
 * A legacy `<cwd>/.gitpagedocsconfig` is migrated automatically on first read.
 */
export class AiConfigFileRepository {
  private readonly cwd: string;
  private readonly configDir: string;
  private readonly onMigrate?: (fromPath: string, toPath: string) => void;

  constructor(options: AiConfigFileRepositoryOptions = {}) {
    this.cwd = options.cwd ?? process.cwd();
    this.configDir = options.configDir ?? resolveUserConfigDir();
    this.onMigrate = options.onMigrate;
  }

  getConfigPath(): string {
    return path.join(this.configDir, AI_CLI_CONFIG_FILENAME);
  }

  getLegacyConfigPath(): string {
    return path.join(this.cwd, AI_CLI_CONFIG_FILENAME);
  }

  async read(): Promise<AiCliConfig | null> {
    const current = await this.readFrom(this.getConfigPath());
    if (current) return current;
    return this.migrateLegacyConfig();
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

  private async migrateLegacyConfig(): Promise<AiCliConfig | null> {
    const legacyPath = this.getLegacyConfigPath();
    if (path.resolve(legacyPath) === path.resolve(this.getConfigPath())) return null;
    const legacy = await this.readFrom(legacyPath);
    if (!legacy) return null;
    try {
      await this.write(legacy);
      await fs.rm(legacyPath, { force: true });
      this.onMigrate?.(legacyPath, this.getConfigPath());
    } catch {
      // Migration is best-effort: keep serving the legacy config on failure.
    }
    return legacy;
  }
}
