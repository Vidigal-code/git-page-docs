/**
 * Config constants — mirror of src/shared/config/constants.ts so the shared
 * core stays contract-compatible with the frontend's config loader.
 */
export const CONFIG_BASE = "gitpagedocs/config";
export const CONFIG_EXTENSIONS = [".json", ".js", ".ts"] as const;
export const DEFAULT_CONFIG_PATH = "gitpagedocs/config.json";
export const DEFAULT_HIERARCHY = { md: 0, html: 1, video: 2, audio: 3 } as const;
