/**
 * Idempotent marker-based content patcher. Only the region between the markers
 * is rewritten; manual content outside is preserved. Used by update flows and
 * the Phase 9 documentation automation.
 */
export const START_MARKER = "<!-- gitpagedocs:start -->";
export const END_MARKER = "<!-- gitpagedocs:end -->";

export interface PatchResult {
  readonly content: string;
  /** True when an existing managed region was replaced (vs appended). */
  readonly replaced: boolean;
}

/**
 * Replace the managed region in `existing` with `generated`. If no markers are
 * present, the managed block is appended. Re-running with the same generated
 * content yields identical output (idempotent).
 */
export function patchManagedRegion(existing: string, generated: string): PatchResult {
  const block = `${START_MARKER}\n${generated.trim()}\n${END_MARKER}`;
  const startIdx = existing.indexOf(START_MARKER);
  const endIdx = existing.indexOf(END_MARKER);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = existing.slice(0, startIdx);
    const after = existing.slice(endIdx + END_MARKER.length);
    return { content: `${before}${block}${after}`, replaced: true };
  }

  const separator = existing.trim() ? `${existing.replace(/\s+$/, "")}\n\n` : "";
  return { content: `${separator}${block}\n`, replaced: false };
}
