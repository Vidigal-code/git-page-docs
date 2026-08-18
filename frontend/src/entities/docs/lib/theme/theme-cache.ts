import type { LayoutsConfig, ThemeTemplate } from "@/entities/docs/model/types";

/**
 * Last-known layout catalogue and theme palettes, kept in localStorage.
 *
 * Standalone pages fetch both from the official remote layouts host, which
 * costs roughly half a second before any palette exists. Until then the CSS
 * variables fall back to the built-in defaults, so a page opened on
 * `?theme=carbon-dark` paints the default colours and only then switches — the
 * flash this cache removes. A cached entry is read synchronously during the
 * pre-paint window, so a revisit renders the requested theme in its first
 * painted frame; the network result then refreshes the cache for next time.
 */
export interface CachedShellThemes {
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}

/** Bump when the cached shape changes, so stale entries are ignored, not parsed. */
const CACHE_SCHEMA_VERSION = 1;

/** Storage key, shared with the pre-paint theme script that reads the same entry. */
export const SHELL_THEME_CACHE_KEY = `git-page-docs:shell-themes:v${CACHE_SCHEMA_VERSION}`;

function getStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Storage can throw outright when blocked by browser privacy settings.
    return null;
  }
}

/** Cached catalogue, or null when absent, unreadable, or not the expected shape. */
export function readCachedShellThemes(): CachedShellThemes | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(SHELL_THEME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedShellThemes>;
    if (!parsed?.layoutsConfig?.layouts?.length || !parsed.themes) return null;
    return { layoutsConfig: parsed.layoutsConfig, themes: parsed.themes };
  } catch {
    return null;
  }
}

/** Stores the resolved catalogue. Failures are ignored: the cache is an optimisation. */
export function writeCachedShellThemes(value: CachedShellThemes): void {
  const storage = getStorage();
  if (!storage || !value.layoutsConfig?.layouts?.length) return;
  try {
    storage.setItem(SHELL_THEME_CACHE_KEY, JSON.stringify(value));
  } catch {
    /* quota or privacy mode: keep the page working without the cache */
  }
}
