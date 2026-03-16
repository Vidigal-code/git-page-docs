export function parseOwnerRepoFromRenderingUrl(rendering: string): { owner?: string; repo?: string } {
  try {
    const parsed = new URL(rendering);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch {
    return {};
  }
  return {};
}
