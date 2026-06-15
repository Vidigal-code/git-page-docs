#!/usr/bin/env node
/**
 * Generates the config baselines from the canonical gitpagedocs/config.json:
 *   - frontend/src/shared/config/site-baseline.json         (the `site` section)
 *   - frontend/src/shared/config/translations-baseline.json (the `translations` section)
 *
 * These baselines are deep-merged UNDER any loaded config (see with-config-defaults.ts)
 * so that OLD config.json files — which lack newer `site` fields (icon flags, react
 * icon tags, langmenu en/pt/es entries, language defaults) or the whole `translations`
 * section (navigation/footer/notFound en/pt/es text) — inherit the exact values shipped
 * in the current config.json instead of rendering empty/undefined/english-only.
 *
 * config.json is the single source of truth; re-run this whenever it changes
 * (wired into `npm run baseline:create`).
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, "gitpagedocs", "config.json");
const sharedConfigDir = path.join(root, "frontend", "src", "shared", "config");
const siteOutPath = path.join(sharedConfigDir, "site-baseline.json");
const translationsOutPath = path.join(sharedConfigDir, "translations-baseline.json");

const config = JSON.parse(readFileSync(configPath, "utf-8"));
if (!config || typeof config.site !== "object" || config.site === null) {
  throw new Error(`Expected a "site" object in ${configPath}`);
}

writeFileSync(siteOutPath, JSON.stringify(config.site, null, 2) + "\n", "utf-8");
console.log(`[gen-site-baseline] wrote ${path.relative(root, siteOutPath)} (${Object.keys(config.site).length} site keys)`);

const translations = config.translations ?? {};
writeFileSync(translationsOutPath, JSON.stringify(translations, null, 2) + "\n", "utf-8");
console.log(`[gen-site-baseline] wrote ${path.relative(root, translationsOutPath)} (${Object.keys(translations).length} translation groups)`);
