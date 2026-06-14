/** Resolves icon path for headers, metadata, and Image components (SRP) */

export const FALLBACK_ICON_PATH = "/icon.svg";

/**
 * Resolves the icon path for use in headers, metadata, and Image components.
 * For local icons: uses siteIconPath with basePath when present.
 * Remote URLs (http/https) are returned as-is.
 */
export function resolveIconPath(siteIconPath: string | undefined, basePath: string): string {
  const trimmed = siteIconPath?.trim();
  if (!trimmed) {
    return basePath ? `${basePath}${FALLBACK_ICON_PATH}` : FALLBACK_ICON_PATH;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const localPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return basePath ? `${basePath}${localPath}` : localPath;
}
