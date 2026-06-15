import type { GitPageDocsConfig, SiteConfig } from "@/entities/docs/model/types";
import siteBaseline from "@/shared/config/site-baseline.json";

/**
 * Baseline `site` defaults, generated from the canonical gitpagedocs/config.json
 * (see tools/gen-site-baseline.mjs). OLD config.json files lack newer `site` fields
 * — react icon flags/tags for the header controls and the en/pt/es langmenu entries
 * the AI chat reads. Deep-merging them UNDER the loaded config makes any missing
 * field inherit the exact value shipped in the current config.json.
 */
export const SITE_CONFIG_DEFAULTS = siteBaseline as unknown as SiteConfig;

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
 * Returns a config whose `site` section is backfilled with the baseline defaults.
 * Only `site` is merged — routes, menus, auth and VersionControl come from the
 * loaded config untouched (they are deployment content, not chrome defaults).
 */
export function withConfigDefaults(config: GitPageDocsConfig): GitPageDocsConfig {
  const mergedSite = deepMergeDefaults(SITE_CONFIG_DEFAULTS, config?.site);
  return { ...config, site: mergedSite };
}
