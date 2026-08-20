/**
 * Legacy layouts migration — planning only.
 *
 * Deciding *what* should move is domain logic, so it stays free of prompts and
 * filesystem writes: callers list the two folders, ask the user, and perform
 * the move. That keeps the rule testable with plain arrays.
 */
import { legacyLayoutsDir, normalizeLayoutsDir } from "../../contracts/layouts-paths.mjs";

/**
 * @typedef {Object} LayoutsMigrationPlan
 * @property {boolean} required     True when the legacy folder holds files to move.
 * @property {string}  from         Repo-relative legacy folder.
 * @property {string}  to           Repo-relative destination folder.
 * @property {string[]} files       Paths relative to `from`, sorted.
 * @property {string[]} overwrites  Subset of `files` already present at `to`.
 */

/**
 * Plan the move from the legacy layouts folder to the standalone home.
 *
 * @param {Object} options
 * @param {string} options.outputDir     Docs output dir (owns the legacy folder).
 * @param {string} options.layoutsDir    Destination layouts folder.
 * @param {string[]} [options.legacyFiles] Paths relative to the legacy folder.
 * @param {string[]} [options.targetFiles] Paths relative to the destination folder.
 * @returns {LayoutsMigrationPlan}
 */
export function planLayoutsMigration(options = {}) {
  const { outputDir, layoutsDir, legacyFiles, targetFiles } = options;

  const from = legacyLayoutsDir(outputDir);
  const to = normalizeLayoutsDir(layoutsDir);

  const files = toSortedPaths(legacyFiles);
  const present = new Set(toSortedPaths(targetFiles));

  return {
    required: files.length > 0 && from !== to,
    from,
    to,
    files,
    overwrites: files.filter((file) => present.has(file)),
  };
}

/**
 * Normalize, de-duplicate and sort a list of relative paths so a plan is
 * deterministic regardless of directory-read order.
 *
 * @param {unknown} paths
 * @returns {string[]}
 */
function toSortedPaths(paths) {
  if (!Array.isArray(paths)) return [];
  const normalized = paths
    .filter((entry) => typeof entry === "string" && entry.trim().length > 0)
    .map((entry) => entry.replace(/[\\/]+/g, "/").replace(/^\/+/, ""));
  return [...new Set(normalized)].sort();
}
