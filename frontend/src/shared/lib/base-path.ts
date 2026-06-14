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
 * Converts app path to full pathname for window.location / plain <a href>.
 */
export function toFullPath(appPath: string): string {
  const base = getBasePath();
  if (!base) return appPath;
  const normalized = (appPath.startsWith("/") ? appPath : `/${appPath}`).replace(/\/+$/, "") || "/";
  return normalized === "/" ? `${base}/` : `${base}${normalized}`;
}
