/**
 * Single source of truth for the "repository search" build mode.
 *
 * Repository search is enabled when the build runs on GitHub Pages
 * (`GITHUB_ACTIONS=true`) or when `GITPAGEDOCS_REPOSITORY_SEARCH=true` is set
 * explicitly. In this mode the app exposes the repository-search home and the
 * standalone guide pages (e.g. /introduction-guide) instead of a single repo's docs.
 *
 * Centralizing this predicate avoids the `GITHUB_ACTIONS || GITPAGEDOCS_REPOSITORY_SEARCH`
 * expression being re-implemented across server modules and route gates.
 */
export function isRepositorySearchEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.GITHUB_ACTIONS === "true" || env.GITPAGEDOCS_REPOSITORY_SEARCH === "true";
}

/** True only for the GitHub Pages (static export) build. */
export function isGithubPagesBuild(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.GITHUB_ACTIONS === "true";
}
