import type { VersionEntry } from "@/entities/docs/model/types";

/**
 * Keeps the first occurrence of each version `id` so duplicate entries do not
 * force the version selector to appear when only one logical version exists.
 */
export function dedupeVersionEntriesById(versions: VersionEntry[]): VersionEntry[] {
  const seen = new Set<string>();
  const result: VersionEntry[] = [];
  for (const entry of versions) {
    const id = entry?.id?.trim();
    if (!id) {
      result.push(entry);
      continue;
    }
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(entry);
  }
  return result;
}
