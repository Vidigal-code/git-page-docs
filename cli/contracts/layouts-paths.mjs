import { trimSlashes } from "./path-segments.mjs";

/**
 * Canonical locations for layout artifacts.
 *
 * Local layouts are generated into the standalone `gitpagelayouts/` home at the
 * project root.
 *
 * Every consumer derives its paths from here so the folder name exists in one
 * place only.
 */

/** Standalone layouts home, relative to the project root. */
export const DEFAULT_LAYOUTS_DIR = "gitpagelayouts";

/** Index file listing every layout, inside a layouts folder. */
export const LAYOUTS_CONFIG_FILENAME = "layoutsConfig.json";

/** Fallback index used when a layout id cannot be resolved. */
export const LAYOUTS_FALLBACK_CONFIG_FILENAME = "layoutsFallbackConfig.json";

/** Folder holding one JSON template per layout, inside a layouts folder. */
export const LAYOUTS_TEMPLATES_DIRNAME = "templates";

/**
 * Normalize a user-supplied folder name to a repo-relative POSIX path with no
 * leading/trailing separators, so it can be joined and stored in config.json
 * identically on every platform.
 *
 * @param {string} dir Raw folder name (may use either separator).
 * @returns {string} Normalized path, or `DEFAULT_LAYOUTS_DIR` when empty.
 */
export function normalizeLayoutsDir(dir) {
  const collapsed = String(dir ?? "").replace(/[\\/]+/g, "/");
  const normalized = trimSlashes(collapsed).trim();
  return normalized || DEFAULT_LAYOUTS_DIR;
}

/**
 * Repo-relative paths of every artifact a layouts folder owns.
 *
 * @param {string} layoutsDir Layouts folder, repo-relative.
 * @returns {{ root: string, config: string, fallbackConfig: string, templates: string }}
 */
export function layoutsArtifactPaths(layoutsDir) {
  const root = normalizeLayoutsDir(layoutsDir);
  return {
    root,
    config: `${root}/${LAYOUTS_CONFIG_FILENAME}`,
    fallbackConfig: `${root}/${LAYOUTS_FALLBACK_CONFIG_FILENAME}`,
    templates: `${root}/${LAYOUTS_TEMPLATES_DIRNAME}`,
  };
}
