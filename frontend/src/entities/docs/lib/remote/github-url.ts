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
