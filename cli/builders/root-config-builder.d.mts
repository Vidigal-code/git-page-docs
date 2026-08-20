/** Options that shape the generated root config. */
export interface RootConfigOptions {
  useLocalLayoutConfig?: boolean;
  githubOwner?: string;
  githubRepo?: string;
  /** Repo-relative layouts home referenced by the generated config. */
  layoutsDir?: string;
}

export interface RootConfig {
  site: Record<string, unknown>;
  VersionControl: { versions: Array<Record<string, unknown>> };
  translations: Record<string, unknown>;
}

export declare function buildRootConfig(options?: RootConfigOptions): RootConfig;
