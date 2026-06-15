import type { GitPageDocsConfig, SiteConfig, UiTranslationsConfig } from "@/entities/docs/model/types";
import siteBaseline from "@/shared/config/site-baseline.json";
import translationsBaseline from "@/shared/config/translations-baseline.json";

/**
 * Baseline `site` defaults, generated from the canonical gitpagedocs/config.json
 * (see tools/gen-site-baseline.mjs). OLD config.json files lack newer `site` fields
 * — react icon flags/tags for the header controls and the en/pt/es langmenu entries
 * the AI chat reads. Deep-merging them UNDER the loaded config makes any missing
 * field inherit the exact value shipped in the current config.json.
 */
export const SITE_CONFIG_DEFAULTS = siteBaseline as unknown as SiteConfig;

/**
 * Baseline `translations` defaults (navigation/footer/notFound en/pt/es text),
 * generated from the canonical gitpagedocs/config.json. OLD config.json files often
 * omit the whole `translations` section, which left prev/next/menu/footer labels
 * falling back to hardcoded English. Merging this baseline restores pt/es text.
 */
export const TRANSLATIONS_CONFIG_DEFAULTS = translationsBaseline as unknown as UiTranslationsConfig;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deep-merges `override` onto `base`, where `base` provides the defaults.
 * - Nested plain objects (e.g. langmenu.pt) merge recursively so missing keys are filled.
 * - Arrays and scalars from `override` replace the base wholesale when present.
 * - `undefined` keys in `override` are ignored (the base default is kept).
 */
function deepMergeDefaults<T>(base: T, override: unknown): T {
  if (!isPlainObject(base)) {
    return override === undefined ? base : (override as T);
  }
  if (!isPlainObject(override)) {
    return base;
  }
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const overrideValue = override[key];
    if (overrideValue === undefined) continue;
    const baseValue = (base as Record<string, unknown>)[key];
    out[key] =
      isPlainObject(baseValue) && isPlainObject(overrideValue)
        ? deepMergeDefaults(baseValue, overrideValue)
        : overrideValue;
  }
  return out as T;
}

/**
 * Returns a config whose `site` and `translations` sections are backfilled with the
 * baseline defaults. Only chrome defaults are merged — routes, menus, auth and
 * VersionControl come from the loaded config untouched (they are deployment content).
 */
export function withConfigDefaults(config: GitPageDocsConfig): GitPageDocsConfig {
  const mergedSite = deepMergeDefaults(SITE_CONFIG_DEFAULTS, config?.site);
  const mergedTranslations = deepMergeDefaults(TRANSLATIONS_CONFIG_DEFAULTS, config?.translations);
  return { ...config, site: mergedSite, translations: mergedTranslations };
}
