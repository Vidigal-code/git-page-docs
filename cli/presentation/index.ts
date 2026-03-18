#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { printBanner, printCredits } from "./ui/banner";
import { resolveOptions } from "./options/resolver";
import { dispatchMode } from "../application/use-cases/dispatch-mode";
import type {
  CliRuntimeParams,
  ConfigOnlyRuntimePort,
  HomeRuntimePort,
} from "../application/ports/cli-runtime-ports";
// @ts-expect-error .mjs modules are runtime-only in this package.
import { buildConfigArtifacts } from "../builders/config-orchestrator.mjs";
// @ts-expect-error .mjs modules are runtime-only in this package.
import { createThemeTemplate } from "../builders/theme-template.mjs";
// @ts-expect-error .mjs modules are runtime-only in this package.
import { LAYOUTS } from "../data/layouts.mjs";
// @ts-expect-error .mjs modules are runtime-only in this package.
import { executeConfigOnly } from "../application/config-only/handler.mjs";
// @ts-expect-error .mjs modules are runtime-only in this package.
import { executeHome } from "../application/home/handler.mjs";
// @ts-expect-error .mjs modules are runtime-only in this package.
import { createConfigOnlyRuntime } from "../infrastructure/config-only/runtime.mjs";
// @ts-expect-error .mjs modules are runtime-only in this package.
import { createHomeRuntime } from "../infrastructure/home/runtime.mjs";

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
  const configOnlyRuntime = createConfigOnlyRuntime() as ConfigOnlyRuntimePort;
  const homeRuntime = createHomeRuntime() as HomeRuntimePort;
  await dispatchMode(options, params, {
    runConfigOnly: async (context) => {
      const safePrebuiltDir =
        typeof context.prebuiltDir === "string"
          ? context.prebuiltDir
          : path.join(String(context.pkgRoot ?? process.cwd()), "prebuilt");
      await executeConfigOnly(
        {
          ...context,
          prebuiltDir: safePrebuiltDir,
        },
        configOnlyRuntime,
      );
    },
    runHome: async (context) => {
      await executeHome(context, homeRuntime);
    },
  });
  printCredits();
}

main().catch((err: unknown) => {
  console.error("Failed to create Git Page Docs scaffold.", err);
  process.exitCode = 1;
});
