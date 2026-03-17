export function parseOwnerRepoFromUrl(input: string | undefined): { owner?: string; repo?: string } {
  if (!input) return {};
  try {
    const normalized = input
      .replace(/^git\+/, "")
      .replace(/^git@github\.com:/, "https://github.com/")
      .replace(/\.git$/, "");
    const parsed = new URL(normalized);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch {
    return {};
  }
  return {};
}

export function parseRepoAndVersion(
  repoSlug: string[] | undefined,
): { owner?: string; repo?: string; version?: string } {
  if (!repoSlug?.length) return {};
  if (repoSlug.length >= 2 && repoSlug[0] === "v" && repoSlug[1]) {
    return { version: repoSlug[1] };
  }
  if (repoSlug.length >= 4 && repoSlug[2] === "v" && repoSlug[3]) {
    return { owner: repoSlug[0], repo: repoSlug[1], version: repoSlug[3] };
  }
  if (repoSlug.length >= 2) {
    return { owner: repoSlug[0], repo: repoSlug[1] };
  }
  return {};
}
