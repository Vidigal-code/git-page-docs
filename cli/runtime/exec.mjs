import { accessSync, constants, statSync } from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";

/**
 * Child-process helpers that never rely on the OS resolving a bare command
 * name through PATH at spawn time and never build a shell command string.
 *
 * Every entry point takes the program name (e.g. "git"), resolves it to an
 * absolute path up front by walking PATH ourselves, and hands that absolute
 * path plus an argument ARRAY to `execFileSync`/`spawn`. Owner, repo, branch
 * and URL values therefore reach the child as discrete argv entries instead of
 * being interpolated into a shell string.
 */

const IS_WINDOWS = process.platform === "win32";

/** Windows extensions that CreateProcess/cmd.exe can actually launch. */
const WINDOWS_EXECUTABLE_EXTENSIONS = [".COM", ".EXE", ".BAT", ".CMD"];

/** Batch launchers are not executables: Windows runs them through cmd.exe. */
const CMD_SHELL_EXTENSIONS = new Set([".cmd", ".bat"]);

function readEnvVar(env, name) {
  if (env[name] !== undefined) return env[name];
  if (!IS_WINDOWS) return undefined;
  // A plain object spread from `process.env` on Windows keeps the original
  // casing ("Path"), so the case-insensitive lookup `process.env` offers is
  // lost. Restore it for the two variables PATH resolution depends on.
  const wanted = name.toUpperCase();
  const key = Object.keys(env).find((candidate) => candidate.toUpperCase() === wanted);
  return key === undefined ? undefined : env[key];
}

function pathDirectories(env) {
  return (readEnvVar(env, "PATH") ?? "").split(path.delimiter).filter(Boolean);
}

function windowsExtensions(env) {
  const configured = (readEnvVar(env, "PATHEXT") ?? "")
    .split(";")
    .map((ext) => ext.trim().toUpperCase())
    .filter((ext) => WINDOWS_EXECUTABLE_EXTENSIONS.includes(ext));
  return configured.length > 0 ? configured : WINDOWS_EXECUTABLE_EXTENSIONS;
}

function isExecutableFile(candidate) {
  try {
    if (!statSync(candidate).isFile()) return false;
    if (!IS_WINDOWS) accessSync(candidate, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function candidateFileNames(name, env) {
  if (!IS_WINDOWS) return [name];
  const upper = name.toUpperCase();
  const extensions = windowsExtensions(env);
  if (extensions.some((ext) => upper.endsWith(ext))) return [name];
  return extensions.map((ext) => `${name}${ext}`);
}

function usesCmdShell(file) {
  return IS_WINDOWS && CMD_SHELL_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function quoteForCmd(value) {
  const text = String(value);
  if (/["\r\n]/.test(text)) {
    throw new Error(`Cannot pass ${JSON.stringify(text)} through a .cmd/.bat launcher: quotes and line breaks are not supported.`);
  }
  return `"${text}"`;
}

/**
 * Resolve `name` to the absolute path of the executable that PATH points at.
 *
 * Directories are scanned in PATH order. On Windows the PATHEXT executable
 * extensions are tried in their configured order (.COM, .EXE, .BAT, .CMD by
 * default), so `git` resolves to `git.exe` before any `git.cmd` shim. A name
 * that already contains a path separator is only checked, never searched.
 *
 * @param {string} name Program name such as "git", "gh" or "npx".
 * @param {{ env?: NodeJS.ProcessEnv }} [options] Environment whose PATH/PATHEXT drive the lookup (defaults to `process.env`).
 * @returns {string} Absolute path of the executable.
 * @throws {Error} When nothing on PATH matches, with an actionable message.
 */
export function resolveExecutable(name, options = {}) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new TypeError("resolveExecutable(name) requires a non-empty program name.");
  }
  const env = options.env ?? process.env;

  if (name.includes("/") || name.includes("\\")) {
    const direct = path.resolve(name);
    if (isExecutableFile(direct)) return direct;
    throw new Error(`\`${name}\` is not an executable file (looked at ${direct}).`);
  }

  const fileNames = candidateFileNames(name, env);
  for (const directory of pathDirectories(env)) {
    for (const fileName of fileNames) {
      const candidate = path.join(directory, fileName);
      if (isExecutableFile(candidate)) return path.resolve(candidate);
    }
  }

  throw new Error(
    `\`${name}\` was not found on PATH. Install it and make sure the directory that contains it is listed in the PATH environment variable, then retry.`,
  );
}

function launchOptions(file, args, options) {
  if (usesCmdShell(file)) {
    // Node refuses to spawn .cmd/.bat files without a shell (EINVAL, see
    // CVE-2024-27980) because only cmd.exe can interpret them. The launcher path
    // is already absolute and every argument is individually quoted, so cmd.exe
    // receives a fixed command line rather than one assembled from user input.
    return { file: quoteForCmd(file), args: args.map(quoteForCmd), options: { ...options, shell: true } };
  }
  return { file, args, options: { ...options, shell: false } };
}

/**
 * Run `name` synchronously with an argument array and wait for it to finish.
 * Same contract as `execFileSync` (throws on a non-zero exit, returns stdout).
 *
 * @param {string} name Program name such as "git".
 * @param {readonly string[]} [args] Arguments passed verbatim, one argv entry each.
 * @param {import("node:child_process").ExecFileSyncOptions} [options] Forwarded to `execFileSync` (cwd, env, stdio, ...).
 * @returns {Buffer | string} stdout, as `execFileSync` returns it.
 */
export function runExecutable(name, args = [], options = {}) {
  const resolved = resolveExecutable(name, { env: options.env });
  const launch = launchOptions(resolved, args, options);
  return execFileSync(launch.file, launch.args, launch.options);
}

/**
 * Run `name` synchronously and return its trimmed stdout as a string.
 * Uses `stdio: "pipe"` unless the caller overrides it.
 *
 * @param {string} name Program name such as "git".
 * @param {readonly string[]} [args] Arguments passed verbatim, one argv entry each.
 * @param {import("node:child_process").ExecFileSyncOptions} [options] Forwarded to `execFileSync`.
 * @returns {string} Trimmed stdout.
 */
export function runExecutableCapture(name, args = [], options = {}) {
  const output = runExecutable(name, args, { stdio: "pipe", ...options });
  // execFileSync yields null when the caller routes stdout away from "pipe".
  return output == null ? "" : output.toString().trim();
}

/**
 * Start `name` asynchronously (like `spawn`) with an argument array.
 *
 * @param {string} name Program name such as "npx".
 * @param {readonly string[]} [args] Arguments passed verbatim, one argv entry each.
 * @param {import("node:child_process").SpawnOptions} [options] Forwarded to `spawn` (cwd, env, stdio, ...).
 * @returns {import("node:child_process").ChildProcess} The spawned child.
 */
export function spawnExecutable(name, args = [], options = {}) {
  const resolved = resolveExecutable(name, { env: options.env });
  const launch = launchOptions(resolved, args, options);
  return spawn(launch.file, launch.args, launch.options);
}
