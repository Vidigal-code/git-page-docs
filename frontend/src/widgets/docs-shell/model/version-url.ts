import type { VersionEntry } from "@/entities/docs";

/** Trailing `/v/<id>` segment, with an optional final slash. */
const VERSION_SEGMENT = /\/v\/([^/]+)\/?$/;

/** The version id that ends the path (`.../v/<id>`), if any. */
export function getVersionFromPath(pathname: string): string | undefined {
  return VERSION_SEGMENT.exec(pathname)?.[1];
}

/** The path without its trailing `/v/<id>` segment and without a trailing slash. */
export function stripVersionFromPath(pathname: string): string {
  return pathname.replace(VERSION_SEGMENT, "").replace(/\/$/, "");
}

export function isKnownVersion(availableVersions: VersionEntry[], versionId: string | null | undefined): boolean {
  return Boolean(versionId && availableVersions.some((version) => version.id === versionId));
}
