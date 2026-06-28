import type { SourceViewerRoute } from "./types";

export const DEFAULT_SOURCE_VIEWER_OWNER = "Vidigal-code";
export const DEFAULT_SOURCE_VIEWER_REPO = "git-page-docs";
export const DEFAULT_SOURCE_VIEWER_BRANCH = "main";

const TREE_SEGMENT = "tree";

function sanitizeSegment(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim().replace(/^\/+|\/+$/g, "");
  return trimmed || fallback;
}

export function parseSourceViewerRoute(source: string[] | undefined): SourceViewerRoute {
  if (!source?.length) {
    return {
      owner: DEFAULT_SOURCE_VIEWER_OWNER,
      repo: DEFAULT_SOURCE_VIEWER_REPO,
      branch: DEFAULT_SOURCE_VIEWER_BRANCH,
      path: "",
    };
  }

  const [owner, repo, treeSegment, branch, ...pathParts] = source;
  return {
    owner: sanitizeSegment(owner, DEFAULT_SOURCE_VIEWER_OWNER),
    repo: sanitizeSegment(repo, DEFAULT_SOURCE_VIEWER_REPO),
    branch: treeSegment === TREE_SEGMENT ? sanitizeSegment(branch, DEFAULT_SOURCE_VIEWER_BRANCH) : DEFAULT_SOURCE_VIEWER_BRANCH,
    path: treeSegment === TREE_SEGMENT ? pathParts.join("/") : "",
  };
}

export function buildSourceViewerPath(route: SourceViewerRoute): string {
  const encodedPath = route.path
    ? `/${route.path.split("/").map(encodeURIComponent).join("/")}`
    : "";

  return `/source-viewer/${encodeURIComponent(route.owner)}/${encodeURIComponent(route.repo)}/tree/${encodeURIComponent(route.branch)}${encodedPath}`;
}

export function buildGithubTreeUrl(route: SourceViewerRoute): string {
  const encodedPath = route.path
    ? `/${route.path.split("/").map(encodeURIComponent).join("/")}`
    : "";

  return `https://github.com/${encodeURIComponent(route.owner)}/${encodeURIComponent(route.repo)}/tree/${encodeURIComponent(route.branch)}${encodedPath}`;
}

export function parseGithubTreeUrl(input: string | undefined): SourceViewerRoute | null {
  if (!input) return null;
  try {
    const parsed = new URL(input);
    if (parsed.hostname !== "github.com") return null;
    const [owner, repo, treeSegment, branch, ...pathParts] = parsed.pathname.split("/").filter(Boolean);
    if (!owner || !repo || treeSegment !== TREE_SEGMENT || !branch) return null;
    return {
      owner,
      repo,
      branch,
      path: pathParts.join("/"),
    };
  } catch {
    return null;
  }
}
