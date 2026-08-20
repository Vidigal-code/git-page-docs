/** Shared derivation of project URLs from CLI options (single source of truth
 * for root and version config builders). */

import { layoutsArtifactPaths } from "../contracts/layouts-paths.mjs";

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

/**
 * Where the viewer should look for locally generated layouts.
 *
 * Mirrors resolveSourceViewerPath: user repositories use the symbolic HEAD ref
 * so any default branch resolves. Without an owner/repo pair there is no URL to
 * build, so the repo-relative path is returned - the viewer reads it directly in
 * local mode and still discovers it by probing the repository otherwise.
 *
 * @param {string} githubOwner
 * @param {string} githubRepo
 * @param {string} layoutsDir Repo-relative layouts home.
 * @returns {{ config: string, templates: string }}
 */
export function resolveLayoutsLinks(githubOwner, githubRepo, layoutsDir) {
  const paths = layoutsArtifactPaths(layoutsDir);
  if (!githubOwner || !githubRepo) {
    return { config: paths.config, templates: paths.templates };
  }
  const base = `${resolveProjectLink(githubOwner, githubRepo)}/blob/HEAD`;
  return { config: `${base}/${paths.config}`, templates: `${base}/${paths.templates}` };
}

export function resolveSourceViewerPath(githubOwner, githubRepo) {
  // User repositories use the symbolic HEAD ref so any default branch works
  // (github.com, the trees API and raw.githubusercontent all accept it);
  // the official repository keeps its stable main link.
  return githubOwner && githubRepo
    ? `${resolveProjectLink(githubOwner, githubRepo)}/tree/HEAD`
    : `${DEFAULT_PROJECT_LINK}/tree/main`;
}
