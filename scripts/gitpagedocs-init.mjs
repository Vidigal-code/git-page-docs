#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "./runtime/run.mjs";
import { buildConfigArtifacts } from "./builders/config-artifacts.mjs";
import { createThemeTemplate } from "./builders/theme-template.mjs";
import { LAYOUTS } from "./data/layouts.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();
const PKG_ROOT = path.join(SCRIPT_DIR, "..");
const PREBUILT_DIR = path.join(PKG_ROOT, "prebuilt");

runCli({
  argv: process.argv,
  env: process.env,
  root: ROOT,
  pkgRoot: PKG_ROOT,
  prebuiltDir: PREBUILT_DIR,
  buildConfigArtifacts,
  createThemeTemplate,
  layouts: LAYOUTS,
}).catch((error) => {
  console.error("Failed to create Git Page Docs scaffold.", error);
  process.exitCode = 1;
});
