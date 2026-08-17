import { getBasePath } from "./base-path";

const SOURCE_VIEWER_PREFIX = "/source-viewer";

/** Query param carrying a deep source-viewer route through the 404 fallback. */
export const SOURCE_VIEWER_FALLBACK_PARAM = "src";

/**
 * On a statically exported deploy only `/source-viewer/` (plus the official
 * sample) is prerendered, so any deeper source-viewer URL is served by
 * 404.html. Redirect those requests to the exported page, carrying the deep
 * route in a query param so it can be restored client-side.
 * Returns true when a redirect was issued.
 */
export function redirectSourceViewerDeepLink(): boolean {
  if (typeof window === "undefined") return false;
  const base = getBasePath();
  const path = window.location.pathname;
  const withoutBase = base && path.startsWith(base) ? path.slice(base.length) : path;
  if (withoutBase !== SOURCE_VIEWER_PREFIX && !withoutBase.startsWith(`${SOURCE_VIEWER_PREFIX}/`)) {
    return false;
  }
  const deepRoute = withoutBase
    .slice(SOURCE_VIEWER_PREFIX.length)
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  const query = deepRoute ? `?${SOURCE_VIEWER_FALLBACK_PARAM}=${encodeURIComponent(deepRoute)}` : "";
  window.location.replace(`${base}${SOURCE_VIEWER_PREFIX}/${query}`);
  return true;
}
