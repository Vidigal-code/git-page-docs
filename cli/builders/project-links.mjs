/** Shared derivation of project URLs from CLI options (single source of truth
 * for root and version config builders). */

export const DEFAULT_PROJECT_LINK = "https://github.com/Vidigal-code/git-page-docs";
export const DEFAULT_RENDERING_URL = "https://vidigal-code.github.io/git-page-docs/";

export function resolveProjectLink(githubOwner, githubRepo) {
  return githubOwner && githubRepo
    ? `https://github.com/${githubOwner}/${githubRepo}`
    : DEFAULT_PROJECT_LINK;
}

export function resolveRenderingUrl(githubOwner, githubRepo) {
  return githubOwner && githubRepo
    ? `https://${githubOwner}.github.io/${githubRepo}/`
    : DEFAULT_RENDERING_URL;
}

export function resolveSourceViewerPath(githubOwner, githubRepo) {
  // User repositories use the symbolic HEAD ref so any default branch works
  // (github.com, the trees API and raw.githubusercontent all accept it);
  // the official repository keeps its stable main link.
  return githubOwner && githubRepo
    ? `${resolveProjectLink(githubOwner, githubRepo)}/tree/HEAD`
    : `${DEFAULT_PROJECT_LINK}/tree/main`;
}
