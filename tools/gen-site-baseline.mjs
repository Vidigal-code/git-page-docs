#!/usr/bin/env node
/**
 * Generates the config baselines from the canonical gitpagedocs/ output:
 *   - frontend/src/shared/config/site-baseline.json         (the `site` section + langmenu)
 *   - frontend/src/shared/config/translations-baseline.json (the `translations` section)
 *
 * The UI strings live in gitpagedocs/langs/<lang>.json, one file per language
 * that `site.languages` (gitpagedocs/config.json) enables; they are folded back
 * into the legacy inline shape here so the baselines keep the exact keys the
 * viewer reads. These baselines are deep-merged UNDER any loaded config (see
 * with-config-defaults.ts) so that OLD config.json files — which lack newer
 * `site` fields, ship no langs/ folder, or omit the whole `translations`
 * section — inherit the values shipped in the current release instead of
 * rendering empty/undefined/english-only.
 *
 * `site.languages` and `site.supportedLanguages` are deliberately left out of
 * the site baseline: which languages a deployment enables is content, not
 * chrome, and backfilling them would silently re-enable a language a site
 * switched off.
 *
 * gitpagedocs/ is the single source of truth; re-run this whenever it changes
 * (wired into `npm run baseline:create`; runs under `node --import tsx`).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyLanguageBundles, loadConfigLanguageBundles } from "./src/i18n/language-bundles.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, "gitpagedocs", "config.json");
const sharedConfigDir = path.join(root, "frontend", "src", "shared", "config");
const siteOutPath = path.join(sharedConfigDir, "site-baseline.json");
const translationsOutPath = path.join(sharedConfigDir, "translations-baseline.json");

function readRepoJson(relativePath) {
  const absolutePath = path.join(root, ...relativePath.split("/"));
  if (!existsSync(absolutePath)) return null;
  return JSON.parse(readFileSync(absolutePath, "utf-8"));
}

const rawConfig = readRepoJson("gitpagedocs/config.json");
if (!rawConfig || typeof rawConfig.site !== "object" || rawConfig.site === null) {
  throw new Error(`Expected a "site" object in ${configPath}`);
}

const bundles = await loadConfigLanguageBundles(rawConfig, async (relativePath) => readRepoJson(relativePath));
if (!bundles) {
  throw new Error("Expected site.languages in gitpagedocs/config.json and its gitpagedocs/langs/ bundles; run `node cli/index.mjs` first.");
}
const config = applyLanguageBundles(rawConfig, bundles);

const siteBaseline = { ...config.site };
delete siteBaseline.languages;
delete siteBaseline.supportedLanguages;

writeFileSync(siteOutPath, JSON.stringify(siteBaseline, null, 2) + "\n", "utf-8");
console.log(
  `[gen-site-baseline] wrote ${path.relative(root, siteOutPath)} (${Object.keys(siteBaseline).length} site keys, langmenu: ${Object.keys(bundles).join(", ")})`,
);

const translations = config.translations ?? {};
writeFileSync(translationsOutPath, JSON.stringify(translations, null, 2) + "\n", "utf-8");
console.log(`[gen-site-baseline] wrote ${path.relative(root, translationsOutPath)} (${Object.keys(translations).length} translation groups)`);
