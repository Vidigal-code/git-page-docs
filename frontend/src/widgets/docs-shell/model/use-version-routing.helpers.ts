import type { LanguageCode, VersionEntry } from "@/entities/docs";
import { isKnownVersion } from "./version-url";

export interface SelectVersionInput {
  versionFromPath: string | undefined;
  versionFromQuery: string | null;
  activeVersionId: string | undefined;
  availableVersions: VersionEntry[];
}

/** The version to show: path segment, then `?version`, then the active id, then the first available (or ""). */
export function selectVersionValue(input: SelectVersionInput): string {
  const { availableVersions } = input;
  for (const candidate of [input.versionFromPath, input.versionFromQuery, input.activeVersionId]) {
    if (isKnownVersion(availableVersions, candidate)) {
      return candidate as string;
    }
  }
  return availableVersions[0]?.id ?? "";
}

export interface VersionChangeOptions {
  isRemoteRepositorySession: boolean;
  isLanguageSelectVisible: boolean;
  language: LanguageCode;
}

/**
 * Query for a version switch: `version` is dropped (the path carries it) and
 * `lang` is pinned for remote sessions or while the selector is visible, and
 * removed otherwise.
 */
export function buildVersionChangeParams(current: URLSearchParams, options: VersionChangeOptions): URLSearchParams {
  const params = new URLSearchParams(current);
  params.delete("version");
  if (options.isRemoteRepositorySession || options.isLanguageSelectVisible) {
    params.set("lang", String(options.language));
  } else {
    params.delete("lang");
  }
  return params;
}
