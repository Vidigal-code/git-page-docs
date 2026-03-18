#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { printBanner, printCredits } from "./ui/banner";
import { resolveOptions } from "./options/resolver";
import { runConfigOnly } from "./commands/run-config-only";
import { runHome } from "./commands/run-home";
import { dispatchMode } from "../application/use-cases/dispatch-mode";
import type { CliRuntimeParams } from "../application/ports/cli-runtime-ports";
// @ts-expect-error Legacy .mjs module kept for backward compatibility during migration.
import { buildConfigArtifacts } from "../builders/config-orchestrator.mjs";
// @ts-expect-error Legacy .mjs module kept for backward compatibility during migration.
import { createThemeTemplate } from "../builders/theme-template.mjs";
// @ts-expect-error Legacy .mjs module kept for backward compatibility during migration.
import { LAYOUTS } from "../data/layouts.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const pkgRoot = path.join(scriptDir, "..", "..");
const prebuiltDir = path.join(pkgRoot, "prebuilt");

const params: CliRuntimeParams = {
  root,
  pkgRoot,
  prebuiltDir,
  buildConfigArtifacts,
  createThemeTemplate,
  layouts: LAYOUTS,
};

async function main(): Promise<void> {
  printBanner();
  const options = await resolveOptions(process.argv, process.env);
  await dispatchMode(options, params, { runConfigOnly, runHome });
  printCredits();
}

main().catch((err: unknown) => {
  console.error("Failed to create Git Page Docs scaffold.", err);
  process.exitCode = 1;
});
