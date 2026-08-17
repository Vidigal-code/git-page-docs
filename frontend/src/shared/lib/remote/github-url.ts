export function toRawGithubUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") {
      return url;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    const blobOrTreeIndex = parts.findIndex((part) => part === "blob" || part === "tree");
    if (parts.length >= 5 && blobOrTreeIndex === 2) {
      const owner = parts[0];
      const repo = parts[1];
      const branch = parts[3];
      const filePath = parts.slice(4).join("/");
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    }
  } catch {
    return url;
  }

  return url;
}

export function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

export interface GithubResource {
  owner: string;
  repo: string;
  path: string;
}

/**
 * Identify a GitHub-hosted file URL (github.com blob/tree, raw.githubusercontent,
 * or jsDelivr gh) so it can be fetched through the full mirror candidate list
 * instead of a single host. Returns null for any other URL.
 */
export function parseGithubResource(url: string): GithubResource | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parsed.hostname === "github.com") {
      const blobOrTreeIndex = parts.findIndex((part) => part === "blob" || part === "tree");
      if (parts.length >= 5 && blobOrTreeIndex === 2) {
        return { owner: parts[0], repo: parts[1], path: parts.slice(4).join("/") };
      }
      return null;
    }
    if (parsed.hostname === "raw.githubusercontent.com" && parts.length >= 4) {
      return { owner: parts[0], repo: parts[1], path: parts.slice(3).join("/") };
    }
    if (parsed.hostname === "cdn.jsdelivr.net" && parts[0] === "gh" && parts.length >= 4) {
      const [owner, repoAtRef] = [parts[1], parts[2]];
      return { owner, repo: repoAtRef.split("@")[0], path: parts.slice(3).join("/") };
    }
  } catch {
    return null;
  }
  return null;
}

export function buildGithubRawCandidates(owner: string, repo: string, relativePath: string): string[] {
  const safePath = relativePath.replace(/^\/+/, "");
  return [
    `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${safePath}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/${safePath}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/${safePath}`,
    `https://cdn.jsdelivr.net/gh/${owner}/${repo}@HEAD/${safePath}`,
    `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${safePath}`,
    `https://cdn.jsdelivr.net/gh/${owner}/${repo}@master/${safePath}`,
  ];
}
