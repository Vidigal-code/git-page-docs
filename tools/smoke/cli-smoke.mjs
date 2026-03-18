#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { DOC_VERSIONS } from "../../cli/data/version-constants.mjs";

const root = process.cwd();

function ensureExists(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required artifact: ${relativePath}`);
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
  ensureExists(path.join("gitpagedocs", "docs", "versions", version, "en", "source-viewer"));
}

console.log("[smoke:cli] OK - core artifacts and schemas validated.");
