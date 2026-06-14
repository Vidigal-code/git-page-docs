/**
 * Config-loading port. Implemented in Phase 4 by relocating the shared loader
 * logic currently in src/entities/docs/api/io/config-loader.ts. Must preserve
 * the legacy CONFIG_EXTENSIONS = [".json", ".js", ".ts"] contract.
 */
export type ConfigExtension = ".json" | ".js" | ".ts";

export interface LoadedConfig<TConfig = Record<string, unknown>> {
  readonly config: TConfig;
  /** Absolute path the config was resolved from. */
  readonly sourcePath: string;
  readonly extension: ConfigExtension;
}

export interface ConfigLoader {
  /** Resolve gitpagedocs/config.{json,js,ts} relative to a working directory. */
  resolveConfigPath(cwd: string): Promise<string | undefined>;
  loadGitPageDocsConfig<TConfig = Record<string, unknown>>(
    cwd: string,
  ): Promise<LoadedConfig<TConfig>>;
}
