export function sanitizeSegment(value: string | undefined | null): string {
  if (!value) return "";
  const normalized = value.trim();
  return /^[A-Za-z0-9._-]+$/.test(normalized) ? normalized : "";
}
