/** Repo-relative paths owned by a layouts folder. */
export interface LayoutsArtifactPaths {
  root: string;
  config: string;
  fallbackConfig: string;
  templates: string;
}

export declare const DEFAULT_LAYOUTS_DIR: string;
export declare const LAYOUTS_CONFIG_FILENAME: string;
export declare const LAYOUTS_FALLBACK_CONFIG_FILENAME: string;
export declare const LAYOUTS_TEMPLATES_DIRNAME: string;

export declare function normalizeLayoutsDir(dir: string): string;
export declare function layoutsArtifactPaths(layoutsDir: string): LayoutsArtifactPaths;
