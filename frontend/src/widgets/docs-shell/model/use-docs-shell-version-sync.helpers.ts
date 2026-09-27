import { buildVersionPath, type VersionEntry } from "@/entities/docs";
import { getVersionFromPath, isKnownVersion, stripVersionFromPath } from "./version-url";

export interface VersionSyncInput {
  isRemoteRepositorySession: boolean;
  pathname: string;
  /** Current query; left untouched, the action carries its own copy. */
  params: URLSearchParams;
  availableVersions: VersionEntry[];
  /** Version persisted from an earlier visit (local sessions only). */
  savedVersion: string | null;
}

/**
 * What the shell must do to reconcile `?version=` with the `/v/<id>` path:
 * - `hard-redirect`: full page load onto the version path (remote sessions);
 * - `rewrite-url`: drop an unknown `?version` in place, no navigation;
 * - `route`: client-side navigation onto the version path (local sessions).
 * The path is the app path (no base path); params never contain `version`.
 */
export type VersionSyncAction =
  | { kind: "hard-redirect"; path: string; params: URLSearchParams }
  | { kind: "rewrite-url"; path: string; params: URLSearchParams }
  | { kind: "route"; path: string; params: URLSearchParams };

function resolveRemoteAction(input: VersionSyncInput, params: URLSearchParams): VersionSyncAction | null {
  const { pathname, availableVersions } = input;
  const urlVersion = params.get("version");
  const versionFromPath = getVersionFromPath(pathname);
  const validUrlVersion = isKnownVersion(availableVersions, urlVersion) ? urlVersion : undefined;
  const validPathVersion = isKnownVersion(availableVersions, versionFromPath) ? versionFromPath : undefined;

  if (validUrlVersion && validUrlVersion !== validPathVersion) {
    params.delete("version");
    return { kind: "hard-redirect", path: buildVersionPath(stripVersionFromPath(pathname), validUrlVersion), params };
  }
  if (urlVersion && !validUrlVersion) {
    params.delete("version");
    return { kind: "rewrite-url", path: pathname, params };
  }
  return null;
}

function resolveLocalAction(input: VersionSyncInput, params: URLSearchParams): VersionSyncAction | null {
  const { pathname, availableVersions, savedVersion } = input;
  const urlVersion = params.get("version");
  params.delete("version");
  if (getVersionFromPath(pathname) !== undefined) {
    return null;
  }
  if (isKnownVersion(availableVersions, urlVersion)) {
    const appBase = pathname.replace(/\/$/, "") || pathname;
    return { kind: "route", path: `${appBase}/v/${urlVersion}`, params };
  }
  if (isKnownVersion(availableVersions, savedVersion)) {
    const appBase = stripVersionFromPath(pathname) || pathname;
    return { kind: "route", path: buildVersionPath(appBase, savedVersion as string), params };
  }
  return null;
}

/** Decides the version sync for the current URL, or null when nothing has to change. */
export function resolveVersionSyncAction(input: VersionSyncInput): VersionSyncAction | null {
  const params = new URLSearchParams(input.params);
  return input.isRemoteRepositorySession ? resolveRemoteAction(input, params) : resolveLocalAction(input, params);
}

/** The persisted version id, or null when storage is unavailable (private mode / blocked storage). */
export function readSavedVersion(storageKey: string): string | null {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}
