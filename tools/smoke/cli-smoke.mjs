#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { DOC_VERSIONS } from "../../cli/contracts/doc-versions.mjs";
import { languageArtifactPaths } from "../../cli/contracts/langs-paths.mjs";
import { SUPPORTED_LANGUAGES } from "../../cli/contracts/languages.mjs";
import { parseLanguageBundle, parseLanguageManifest } from "../../tools/src/i18n/language-bundles.ts";

const root = process.cwd();
/** Every shipped bundle carries at least this many langmenu keys (the full UI vocabulary). */
const MIN_LANGMENU_KEYS = 100;
const REQUIRED_TRANSLATION_SECTIONS = ["notFound", "navigation", "footer"];

function ensureExists(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required artifact: ${relativePath}`);
  }
}

function ensureMissing(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (existsSync(absolutePath)) {
    throw new Error(`Unexpected legacy artifact: ${relativePath}`);
  }
}

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return JSON.parse(readFileSync(absolutePath, "utf-8"));
}

console.log("[smoke:cli] Running config-only generation...");
execSync("node cli/index.mjs", { cwd: root, stdio: "inherit" });

ensureExists(path.join("gitpagedocs", "config.json"));
ensureExists(path.join("gitpagedocs", "icon.svg"));

const rootConfig = readJson(path.join("gitpagedocs", "config.json"));
if (!rootConfig.site || !rootConfig.VersionControl) {
  throw new Error("Invalid root config: missing site or VersionControl.");
}
if (rootConfig.site.langmenu || rootConfig.translations) {
  throw new Error("Root config must not inline UI strings any more: they belong in gitpagedocs/langs/.");
}

const langs = languageArtifactPaths("gitpagedocs");
ensureExists(langs.manifest);
const manifest = parseLanguageManifest(readJson(langs.manifest));
if (!manifest || manifest.languages.join(",") !== SUPPORTED_LANGUAGES.join(",")) {
  throw new Error(`Invalid language manifest: expected languages ${SUPPORTED_LANGUAGES.join(",")}.`);
}
for (const language of manifest.languages) {
  ensureExists(langs.bundle(language));
  const bundle = parseLanguageBundle(readJson(langs.bundle(language)));
  const langmenuKeys = Object.keys(bundle?.langmenu ?? {});
  if (langmenuKeys.length < MIN_LANGMENU_KEYS) {
    throw new Error(`Invalid language bundle (${language}): expected at least ${MIN_LANGMENU_KEYS} langmenu keys.`);
  }
  for (const section of REQUIRED_TRANSLATION_SECTIONS) {
    if (!bundle?.translations?.[section]) {
      throw new Error(`Invalid language bundle (${language}): translations.${section} is missing.`);
    }
  }
}

for (const version of DOC_VERSIONS) {
  const versionConfigPath = path.join("gitpagedocs", "docs", "versions", version, "config.json");
  ensureExists(versionConfigPath);
  const versionConfig = readJson(versionConfigPath);
  if (!Array.isArray(versionConfig["routes-md"])) {
    throw new Error(`Invalid version config (${version}): routes-md is missing.`);
  }
  if (!Array.isArray(versionConfig["routes-html"])) {
    throw new Error(`Invalid version config (${version}): routes-html is missing.`);
  }
  ensureMissing(path.join("gitpagedocs", "docs", "versions", version, "en", "source-viewer"));
  ensureMissing(path.join("gitpagedocs", "docs", "versions", version, "en", "source-viewer.html"));
}

console.log("[smoke:cli] OK - core artifacts and schemas validated.");
