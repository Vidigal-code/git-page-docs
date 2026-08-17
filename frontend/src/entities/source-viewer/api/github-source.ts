import { fetchWithTimeout } from "@/shared/api/fetch-client";
import type { SourceFileContent, SourceTreeEntry, SourceViewerRepository, SourceViewerRoute } from "../model/types";

interface GithubTreeResponse {
  tree?: Array<{
    path?: string;
    type?: "tree" | "blob";
    size?: number;
  }>;
}

const GITHUB_API_BASE = "https://api.github.com";
const RAW_GITHUB_BASE = "https://raw.githubusercontent.com";
const UTF8_BOM = "\uFEFF";

/** Source fetches get a longer deadline than config fetches: recursive tree
 * responses for large repositories can take well past the default timeout. */
const SOURCE_FETCH_TIMEOUT_MS = 30_000;

export class GithubRequestError extends Error {
  constructor(readonly status: number) {
    super(`GitHub request failed with status ${status}`);
    this.name = "GithubRequestError";
  }
}

function buildGithubApiUrl(path: string): string {
  return `${GITHUB_API_BASE}${path}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetchWithTimeout(
    url,
    { headers: { Accept: "application/vnd.github+json" } },
    SOURCE_FETCH_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new GithubRequestError(response.status);
  }

  return response.json() as Promise<T>;
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

function buildRawFileUrl(owner: string, repo: string, branch: string, path: string): string {
  const encodedPath = path.split("/").map(encodePathSegment).join("/");
  return `${RAW_GITHUB_BASE}/${encodePathSegment(owner)}/${encodePathSegment(repo)}/${encodePathSegment(branch)}/${encodedPath}`;
}

async function readUtf8Text(response: Response): Promise<string> {
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(await response.arrayBuffer());
  return text.startsWith(UTF8_BOM) ? text.slice(UTF8_BOM.length) : text;
}

function toTreeEntries(tree: NonNullable<GithubTreeResponse["tree"]>): SourceTreeEntry[] {
  return tree
    .filter((entry) => entry.path && (entry.type === "tree" || entry.type === "blob"))
    .map((entry) => {
      const path = entry.path ?? "";
      const parts = path.split("/");
      return {
        path,
        name: parts[parts.length - 1] ?? path,
        type: entry.type as "tree" | "blob",
        size: entry.size,
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
      return a.path.localeCompare(b.path);
    });
}

export async function loadSourceRepository(owner: string, repo: string, branch: string): Promise<SourceViewerRepository> {
  // The trees endpoint accepts a ref name directly, so no branch-lookup
  // round-trip is needed (and slashed refs work when URL-encoded).
  const treeData = await fetchJson<GithubTreeResponse>(
    buildGithubApiUrl(
      `/repos/${encodePathSegment(owner)}/${encodePathSegment(repo)}/git/trees/${encodePathSegment(branch)}?recursive=1`,
    ),
  );

  return {
    owner,
    repo,
    branch,
    entries: toTreeEntries(treeData.tree ?? []),
  };
}

/**
 * Load a repository for a parsed route, disambiguating branch names that
 * contain "/": a GitHub tree URL like `.../tree/release/v2` parses as
 * branch `release` + path `v2`, so on failure the leading path segments are
 * folded into the branch until a ref resolves. Returns the repository along
 * with the corrected route.
 */
export async function resolveSourceRepository(
  route: SourceViewerRoute,
): Promise<{ repository: SourceViewerRepository; route: SourceViewerRoute }> {
  let branch = route.branch;
  const remainingPath = route.path ? route.path.split("/") : [];
  for (;;) {
    try {
      const repository = await loadSourceRepository(route.owner, route.repo, branch);
      return { repository, route: { ...route, branch, path: remainingPath.join("/") } };
    } catch (error) {
      // Only a missing ref suggests a mis-split branch; rate limits, network
      // failures and timeouts must surface instead of cascading bogus refs.
      const isMissingRef = error instanceof GithubRequestError && error.status === 404;
      if (!isMissingRef || !remainingPath.length) throw error;
      branch = `${branch}/${remainingPath.shift() as string}`;
    }
  }
}

export async function loadSourceFile(owner: string, repo: string, branch: string, path: string): Promise<SourceFileContent> {
  const response = await fetchWithTimeout(
    buildRawFileUrl(owner, repo, branch, path),
    { cache: "no-store" },
    SOURCE_FETCH_TIMEOUT_MS,
  );
  if (!response.ok) {
    throw new GithubRequestError(response.status);
  }

  return {
    path,
    content: await readUtf8Text(response),
  };
}
