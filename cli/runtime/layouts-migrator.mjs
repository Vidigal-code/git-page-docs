/**
 * Filesystem side of the legacy layouts migration.
 *
 * The decision of *what* moves lives in the domain planner; this module only
 * reads directories and performs the move, so both halves stay testable on
 * their own.
 */
import {
  existsSync,
  readdirSync,
  statSync,
  mkdirSync,
  renameSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import path from "node:path";

/**
 * List every file under a directory, as POSIX paths relative to it.
 *
 * @param {string} absoluteDir
 * @returns {string[]} Empty when the directory is absent or unreadable.
 */
export function listFilesRecursively(absoluteDir) {
  if (!absoluteDir || !existsSync(absoluteDir)) return [];

  const found = [];
  const walk = (currentDir, prefix) => {
    let entries;
    try {
      entries = readdirSync(currentDir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const absolute = path.join(currentDir, entry);
      const relative = prefix ? `${prefix}/${entry}` : entry;
      let isDirectory = false;
      try {
        isDirectory = statSync(absolute).isDirectory();
      } catch {
        continue;
      }
      if (isDirectory) walk(absolute, relative);
      else found.push(relative);
    }
  };

  walk(absoluteDir, "");
  return found.sort();
}

/**
 * Move one file, falling back to copy + delete when rename is not possible
 * (different volumes, or a locked handle on Windows).
 *
 * @param {string} fromAbsolute
 * @param {string} toAbsolute
 */
function moveFile(fromAbsolute, toAbsolute) {
  mkdirSync(path.dirname(toAbsolute), { recursive: true });
  try {
    renameSync(fromAbsolute, toAbsolute);
  } catch {
    copyFileSync(fromAbsolute, toAbsolute);
    rmSync(fromAbsolute, { force: true });
  }
}

/**
 * Execute a migration plan produced by `planLayoutsMigration`.
 *
 * Files are moved one by one so a single failure is reported without aborting
 * the rest; the legacy folder is removed only once it is genuinely empty.
 *
 * @param {string} root Project root the plan's paths are relative to.
 * @param {{ from: string, to: string, files: string[] }} plan
 * @returns {{ moved: string[], failed: Array<{ file: string, reason: string }> }}
 */
export function executeLayoutsMigration(root, plan) {
  const moved = [];
  const failed = [];

  const fromRoot = path.join(root, ...plan.from.split("/"));
  const toRoot = path.join(root, ...plan.to.split("/"));

  for (const file of plan.files) {
    const segments = file.split("/");
    try {
      moveFile(path.join(fromRoot, ...segments), path.join(toRoot, ...segments));
      moved.push(file);
    } catch (error) {
      failed.push({ file, reason: error instanceof Error ? error.message : String(error) });
    }
  }

  if (failed.length === 0 && listFilesRecursively(fromRoot).length === 0) {
    rmSync(fromRoot, { recursive: true, force: true });
  }

  return { moved, failed };
}
