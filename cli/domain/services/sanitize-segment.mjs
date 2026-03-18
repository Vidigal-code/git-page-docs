/** Domain-level sanitization for owner/repo/path segments */

export function sanitizeSegment(value) {
  if (!value) return "";
  const normalized = value.trim();
  return /^[A-Za-z0-9._-]+$/.test(normalized) ? normalized : "";
}
