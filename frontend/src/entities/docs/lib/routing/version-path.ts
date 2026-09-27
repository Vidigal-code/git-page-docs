import { trimTrailingSlashes } from "@/shared/lib/base-path";

export function buildVersionPath(basePath: string | undefined, versionId: string): string {
  const cleanedBase = trimTrailingSlashes(basePath ?? "");
  if (!cleanedBase) {
    return `/v/${versionId}`;
  }
  return `${cleanedBase}/v/${versionId}`;
}
