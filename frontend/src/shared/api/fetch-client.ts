import { REMOTE_FETCH_TIMEOUT_MS } from "../config/remote-urls";
import { parseJsonSafely } from "@/shared/lib/parse-json-safely";
import { buildGithubRawCandidates, parseGithubResource, toRawGithubUrl } from "@/shared/lib/remote/github-url";

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs: number = REMOTE_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function tryFetchText(url: string): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch {
    return null;
  }
}

export async function fetchRepoText(owner: string, repo: string, relativePath: string): Promise<string | null> {
  const candidates = buildGithubRawCandidates(owner, repo, relativePath);
  for (const candidate of candidates) {
    const content = await tryFetchText(candidate);
    if (content !== null) {
      return content;
    }
  }
  return null;
}

export async function fetchUrlText(url: string): Promise<string | null> {
  // GitHub-hosted files go through the full mirror list (raw + jsDelivr), so a
  // rate-limited or unavailable host degrades to the next one instead of
  // failing the load outright.
  const resource = parseGithubResource(url);
  if (resource) {
    return fetchRepoText(resource.owner, resource.repo, resource.path);
  }
  return tryFetchText(toRawGithubUrl(url));
}

export async function fetchRepoJson<T>(owner: string, repo: string, relativePath: string): Promise<T | null> {
  const text = await fetchRepoText(owner, repo, relativePath);
  return text ? parseJsonSafely<T>(text) : null;
}

export async function fetchUrlJson<T>(url: string): Promise<T | null> {
  const text = await fetchUrlText(url);
  return text ? parseJsonSafely<T>(text) : null;
}
