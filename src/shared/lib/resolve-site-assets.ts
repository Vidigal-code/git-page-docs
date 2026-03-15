export const FALLBACK_HEADER_NAME = "Git Pages Docs";
export const FALLBACK_ICON_PATH = "/icon.svg";

/**
 * Resolves the icon path for use in headers and metadata.
 * SiteIconPath like "gitpagedocs/icon.svg" is not served in static export;
 * we use the fallback (public/icon.svg) which is deployed at /icon.svg or {basePath}/icon.svg.
 */
export function resolveIconPath(siteIconPath: string | undefined, basePath: string): string {
  const trimmed = siteIconPath?.trim();
  if (!trimmed) {
    return basePath ? `${basePath}${FALLBACK_ICON_PATH}` : FALLBACK_ICON_PATH;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed === FALLBACK_ICON_PATH || trimmed === "/icon.svg") {
    return basePath ? `${basePath}${FALLBACK_ICON_PATH}` : trimmed;
  }
  return basePath ? `${basePath}${FALLBACK_ICON_PATH}` : FALLBACK_ICON_PATH;
}

/**
 * Resolves the site header name with fallback.
 */
export function resolveHeaderName(
  siteHeaderName: string | undefined,
  siteName: string | undefined
): string {
  const header = siteHeaderName?.trim() || siteName?.trim();
  return header || FALLBACK_HEADER_NAME;
}
