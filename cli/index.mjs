#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { printBanner, printCredits } from "./ui/banner.mjs";
import { resolveOptions } from "./options/resolver.mjs";
import { runConfigOnly } from "./commands/run-config-only.mjs";
import { runHome } from "./commands/run-home.mjs";
import { buildConfigArtifacts } from "./builders/config-orchestrator.mjs";
import { createThemeTemplate } from "./builders/theme-template.mjs";
import { LAYOUTS } from "./data/layouts.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();
const PKG_ROOT = path.join(SCRIPT_DIR, "..");
const PREBUILT_DIR = path.join(PKG_ROOT, "prebuilt");

/** Clean architecture layers: presentation -> application -> infrastructure */
const params = {
  root: ROOT,
  pkgRoot: PKG_ROOT,
  prebuiltDir: PREBUILT_DIR,
  buildConfigArtifacts,
  createThemeTemplate,
  layouts: LAYOUTS,
};

async function main() {
  printBanner();
  const options = await resolveOptions(process.argv, process.env);

  if (options.mode === "home") {
    await runHome({ ...params, options });
  } else {
    await runConfigOnly({ ...params, options });
  }

  printCredits();
}

main().catch((err) => {
  console.error("Failed to create Git Page Docs scaffold.", err);
  process.exitCode = 1;
});
