import path from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import type { ConfigExtension, ConfigLoader, LoadedConfig } from "../ports/config";
import { CONFIG_BASE, CONFIG_EXTENSIONS } from "../constants/config";
import { ConfigurationError } from "../errors/app-error";

/**
 * Node config loader for gitpagedocs/config.{json,js,ts}. Behaviour mirrors the
 * frontend loader (src/entities/docs/api/io/config-loader.ts) so the contract
 * is identical: JSON is parsed, JS/TS are dynamically imported (default export
 * or module namespace).
 */
export class GitPageDocsConfigLoader implements ConfigLoader {
  async resolveConfigPath(cwd: string = process.cwd()): Promise<string | undefined> {
    const base = path.join(cwd, CONFIG_BASE);
    for (const ext of CONFIG_EXTENSIONS) {
      const fullPath = base + ext;
      if (existsSync(fullPath)) return fullPath;
    }
    return undefined;
  }

  async loadGitPageDocsConfig<TConfig = Record<string, unknown>>(
    cwd: string = process.cwd(),
  ): Promise<LoadedConfig<TConfig>> {
    const sourcePath = await this.resolveConfigPath(cwd);
    if (!sourcePath) {
      throw new ConfigurationError(
        `No config file found. Expected one of: ${CONFIG_EXTENSIONS.map((e) => CONFIG_BASE + e).join(", ")}`,
        { details: { cwd } },
      );
    }
    const extension = path.extname(sourcePath) as ConfigExtension;
    const config = await this.parse<TConfig>(sourcePath, extension);
    return { config, sourcePath, extension };
  }

  private async parse<TConfig>(resolvedPath: string, ext: ConfigExtension): Promise<TConfig> {
    if (ext === ".json") {
      const text = await readFile(resolvedPath, "utf8");
      return JSON.parse(text) as TConfig;
    }
    if (ext === ".js" || ext === ".ts") {
      const mod = (await import(pathToFileURL(resolvedPath).href)) as Record<string, unknown>;
      const value = (mod.default ?? mod) as TConfig | undefined;
      if (value == null) {
        throw new ConfigurationError(
          `Config file ${resolvedPath} did not export default or module.exports.`,
        );
      }
      return value;
    }
    throw new ConfigurationError(`Unsupported config extension: ${ext}`);
  }
}

export const defaultConfigLoader = new GitPageDocsConfigLoader();
