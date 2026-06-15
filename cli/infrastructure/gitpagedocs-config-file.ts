import fs from "node:fs/promises";
import { defaultConfigLoader } from "@gitpagedocs/tools";

export interface DocsAccessConfig {
  enabled: boolean;
  publicKey: string;
}

/**
 * Reads and patches the generated gitpagedocs/config.json IN PLACE, preserving
 * every existing key (raw-JSON round-trip — it never reserializes through a typed
 * model that could drop unknown fields). Used by interactive commands that need
 * to persist a single value (e.g. the documentation password public key).
 */
export class GitPageDocsConfigRepository {
  constructor(private readonly cwd: string = process.cwd()) {}

  /** Absolute path to the JSON config, or throws a friendly, actionable error. */
  async resolvePath(): Promise<string> {
    const resolved = await defaultConfigLoader.resolveConfigPath(this.cwd);
    if (!resolved) {
      throw new Error("gitpagedocs config.json not found. Run `gitpagedocs` first to generate it.");
    }
    if (!resolved.endsWith(".json")) {
      throw new Error(`Expected a JSON config to patch, found "${resolved}". Use a gitpagedocs/config.json.`);
    }
    return resolved;
  }

  /**
   * Set `site.docsAccess = { enabled, publicKey }`, leaving all other config keys
   * untouched. Returns the path that was written.
   */
  async patchDocsAccess(publicKey: string, enabled = true): Promise<string> {
    const configPath = await this.resolvePath();
    const raw = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(raw) as Record<string, unknown>;
    const site =
      config.site && typeof config.site === "object"
        ? (config.site as Record<string, unknown>)
        : {};
    site.docsAccess = { enabled, publicKey } satisfies DocsAccessConfig;
    config.site = site;
    await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf-8");
    return configPath;
  }
}
