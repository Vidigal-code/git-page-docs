import { THEME_URL_PARAM } from "@/shared/config/constants";

export interface HomeHrefOptions {
  /** Active layout id, e.g. `skyline-dark`. */
  themeId?: string;
  /** Mode of that layout, mirrored in the `modetheme` param the shells read. */
  mode?: "light" | "dark";
}

/**
 * The site root carrying the visitor's current look (`/?theme=<id>&modetheme=<mode>`)
 * so the page they return to opens in the theme they were already using.
 * Relative to the app root: Next's `Link` prepends the basePath.
 */
export function buildHomeHref({ themeId, mode }: HomeHrefOptions = {}): string {
  const params = new URLSearchParams();
  if (themeId) params.set(THEME_URL_PARAM, themeId);
  if (mode) params.set("modetheme", mode);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
