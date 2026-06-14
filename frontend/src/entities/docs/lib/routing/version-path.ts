export function buildVersionPath(basePath: string | undefined, versionId: string): string {
  const cleanedBase = (basePath ?? "").replace(/\/+$/, "");
  if (!cleanedBase) {
    return `/v/${versionId}`;
  }
  return `${cleanedBase}/v/${versionId}`;
}
