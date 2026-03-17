import { buildGithubRawCandidates, ensureTrailingSlash, toRawGithubUrl } from "@/entities/docs/lib/remote/github-url";
import type { RemoteFetcher } from "./types";

export async function tryFetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "git-page-docs",
      },
    });
    if (!response.ok) {
      return null;
    }
    return response.text();
  } catch {
    return null;
  }
}

export async function readRemoteJson<T>(url: string): Promise<T | null> {
  const rawUrl = toRawGithubUrl(url);
  const text = await tryFetchText(rawUrl);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function buildRepoRawBase(owner: string, repo: string, relativeBasePath: string): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${ensureTrailingSlash(relativeBasePath)}`;
}

export async function readRemoteText(owner: string, repo: string, relativePath: string): Promise<string | null> {
  const candidates = buildGithubRawCandidates(owner, repo, relativePath);
  for (const candidate of candidates) {
    const result = await tryFetchText(candidate);
    if (result !== null) {
      return result;
    }
  }
  return null;
}

export async function readRemoteJsonFromRepo<T>(owner: string, repo: string, relativePath: string): Promise<T | null> {
  const text = await readRemoteText(owner, repo, relativePath);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export const defaultRemoteFetcher: RemoteFetcher = {
  readRemoteText,
  readRemoteJsonFromRepo,
};
