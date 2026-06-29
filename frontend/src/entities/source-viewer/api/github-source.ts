import type { SourceFileContent, SourceTreeEntry, SourceViewerRepository } from "../model/types";

interface GithubBranchResponse {
  commit?: {
    commit?: {
      tree?: {
        sha?: string;
      };
    };
  };
}

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

function buildGithubApiUrl(path: string): string {
  return `${GITHUB_API_BASE}${path}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}`);
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

async function resolveTreeSha(owner: string, repo: string, branch: string): Promise<string> {
  const branchData = await fetchJson<GithubBranchResponse>(
    buildGithubApiUrl(`/repos/${encodePathSegment(owner)}/${encodePathSegment(repo)}/branches/${encodePathSegment(branch)}`),
  );
  const treeSha = branchData.commit?.commit?.tree?.sha;
  if (!treeSha) {
    throw new Error("GitHub branch tree could not be resolved.");
  }
  return treeSha;
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
  const treeSha = await resolveTreeSha(owner, repo, branch);
  const treeData = await fetchJson<GithubTreeResponse>(
    buildGithubApiUrl(`/repos/${encodePathSegment(owner)}/${encodePathSegment(repo)}/git/trees/${treeSha}?recursive=1`),
  );

  return {
    owner,
    repo,
    branch,
    entries: toTreeEntries(treeData.tree ?? []),
  };
}

export async function loadSourceFile(owner: string, repo: string, branch: string, path: string): Promise<SourceFileContent> {
  const response = await fetch(buildRawFileUrl(owner, repo, branch, path), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Source file request failed with status ${response.status}`);
  }

  return {
    path,
    content: await readUtf8Text(response),
  };
}
