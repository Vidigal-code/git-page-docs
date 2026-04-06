import { REMOTE_FETCH_TIMEOUT_MS } from "../config/remote-urls";
import { toRawGithubUrl, buildGithubRawCandidates } from "@/entities/docs/lib/remote/github-url";

export async function tryFetchText(url: string): Promise<string | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REMOTE_FETCH_TIMEOUT_MS);
    try {
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });
        if (!response.ok) {
            return null;
        }
        return await response.text();
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
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
    return tryFetchText(toRawGithubUrl(url));
}

export async function fetchRepoJson<T>(owner: string, repo: string, relativePath: string): Promise<T | null> {
    const text = await fetchRepoText(owner, repo, relativePath);
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}

export async function fetchUrlJson<T>(url: string): Promise<T | null> {
    const text = await fetchUrlText(url);
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}
