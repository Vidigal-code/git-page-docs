/**
 * Canonical locations for layout artifacts.
 *
 * Local layouts are generated into the standalone `gitpagelayouts/` home at the
 * project root. `<outputDir>/layouts/` is the legacy location that earlier
 * versions wrote: the viewer still reads it, and the CLI offers to migrate it,
 * but nothing is generated there any more.
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

/** Sub-folder of the docs output dir that older versions generated into. */
export const LEGACY_LAYOUTS_SUBDIR = "layouts";

/**
 * Normalize a user-supplied folder name to a repo-relative POSIX path with no
 * leading/trailing separators, so it can be joined and stored in config.json
 * identically on every platform.
 *
 * @param {string} dir Raw folder name (may use either separator).
 * @returns {string} Normalized path, or `DEFAULT_LAYOUTS_DIR` when empty.
 */
export function normalizeLayoutsDir(dir) {
  const normalized = String(dir ?? "")
    .replace(/[\\/]+/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .trim();
  return normalized || DEFAULT_LAYOUTS_DIR;
}

/**
 * Legacy layouts folder for a given docs output dir.
 *
 * @param {string} outputDir Docs output dir (e.g. `gitpagedocs`).
 * @returns {string} Repo-relative POSIX path (e.g. `gitpagedocs/layouts`).
 */
export function legacyLayoutsDir(outputDir) {
  return `${normalizeLayoutsDir(outputDir)}/${LEGACY_LAYOUTS_SUBDIR}`;
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
