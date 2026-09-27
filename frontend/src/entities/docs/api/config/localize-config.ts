import { applyLanguageBundles, loadConfigLanguageBundles, type JsonReader } from "@gitpagedocs/tools/i18n";
import type { GitPageDocsConfig } from "@/entities/docs/model/types";

/**
 * Folds the bundles `config.json` enables (`site.languages` → one
 * `gitpagedocs/langs/<lang>.json` per language toggled on) into the config's
 * `site.langmenu` / `translations`, using the same reader that fetched the
 * config (local fs, remote raw GitHub, browser fetch). Disabled languages are
 * never fetched; a config without toggles comes back unchanged. Run this
 * BEFORE `withConfigDefaults` so bundles outrank the baseline backfill.
 */
export async function localizeConfig(config: GitPageDocsConfig, readJson: JsonReader): Promise<GitPageDocsConfig> {
  const bundles = await loadConfigLanguageBundles(config, readJson);
  return applyLanguageBundles(config, bundles);
}
