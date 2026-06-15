#!/usr/bin/env node
/**
 * Generates frontend/src/shared/config/site-baseline.json from the canonical
 * gitpagedocs/config.json `site` section.
 *
 * This baseline is deep-merged UNDER any loaded config (see with-config-defaults.ts)
 * so that OLD config.json files — which lack newer `site` fields (icon flags, react
 * icon tags, langmenu en/pt/es entries, language defaults) — inherit the exact values
 * shipped in the current config.json instead of rendering empty/undefined.
 *
 * config.json is the single source of truth; re-run this whenever it changes
 * (wired into `npm run baseline:create`).
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, "gitpagedocs", "config.json");
const outPath = path.join(root, "frontend", "src", "shared", "config", "site-baseline.json");

const config = JSON.parse(readFileSync(configPath, "utf-8"));
if (!config || typeof config.site !== "object" || config.site === null) {
  throw new Error(`Expected a "site" object in ${configPath}`);
}

const header =
  "// AUTO-GENERATED from gitpagedocs/config.json by tools/gen-site-baseline.mjs.\n" +
  "// Do not edit by hand — run `npm run baseline:site` (or `baseline:create`) to refresh.\n";
// JSON files can't carry comments, so the provenance note lives in the generator only.
void header;

writeFileSync(outPath, JSON.stringify(config.site, null, 2) + "\n", "utf-8");
console.log(`[gen-site-baseline] wrote ${path.relative(root, outPath)} (${Object.keys(config.site).length} site keys)`);
