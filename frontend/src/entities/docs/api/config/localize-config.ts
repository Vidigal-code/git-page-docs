import { applyLanguageBundles, loadLanguageBundles, type JsonReader } from "@gitpagedocs/tools/i18n";
import type { GitPageDocsConfig } from "@/entities/docs/model/types";

/**
 * Folds `gitpagedocs/langs.json` + `gitpagedocs/langs/<lang>.json` into the
 * config's `site.langmenu` / `translations`, using the same reader that
 * fetched the config (local fs, remote raw GitHub, browser fetch). Configs
 * without a manifest come back unchanged, so legacy inline strings keep
 * working; run this BEFORE `withConfigDefaults` so bundles outrank the
 * baseline backfill.
 */
export async function localizeConfig(config: GitPageDocsConfig, readJson: JsonReader): Promise<GitPageDocsConfig> {
  const bundles = await loadLanguageBundles(readJson);
  return applyLanguageBundles(config, bundles);
}
