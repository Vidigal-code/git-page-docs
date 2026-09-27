/**
 * Returns the app base path. Must be identical on server and client to avoid hydration errors.
 * Uses only NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH (set at build time from GITPAGEDOCS_REPOSITORY_SEARCH).
 * - false/local dev: "" → render own gitpagedocs at /
 * - true/GitHub Pages: "/git-page-docs" → all repositories
 */
export function getBasePath(): string {
  return (process.env.NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH ?? "").trim();
}

/**
 * Removes every leading "/" in a single forward scan: same result as
 * `.replace(/^\/+/, "")` without regex backtracking.
 */
export function trimLeadingSlashes(value: string): string {
  let start = 0;
  while (start < value.length && value[start] === "/") start += 1;
  return start === 0 ? value : value.slice(start);
}

/**
 * Removes every trailing "/" in a single backward scan: same result as
 * `.replace(/\/+$/, "")` without the super-linear backtracking an unanchored
 * `\/+$` incurs on long slash runs.
 */
export function trimTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") end -= 1;
  return end === value.length ? value : value.slice(0, end);
}

/** Removes leading and trailing "/" runs: same result as `.replace(/^\/+|\/+$/g, "")`. */
export function trimSlashes(value: string): string {
  return trimTrailingSlashes(trimLeadingSlashes(value));
}

/**
 * Converts app path to full pathname for window.location / plain <a href>.
 */
export function toFullPath(appPath: string): string {
  const base = getBasePath();
  if (!base) return appPath;
  const normalized = trimTrailingSlashes(appPath.startsWith("/") ? appPath : `/${appPath}`) || "/";
  return normalized === "/" ? `${base}/` : `${base}${normalized}`;
}
