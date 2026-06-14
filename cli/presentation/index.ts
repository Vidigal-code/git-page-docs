#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { printBanner, printCredits } from "./ui/banner";
import { resolveOptions } from "./options/resolver";
import { runNewCommand } from "./commands/run-command";
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
  // `mcp start` owns stdout (the MCP stdio channel) — no banner/credits there.
  const stdoutOwnedByCommand = process.argv[2] === "mcp";
  if (!stdoutOwnedByCommand) printBanner();

  // New informational/utility commands (version, doctor, provider, models,
  // config, mcp, update) are handled before the legacy flag flow. Alias verbs
  // (init, document, deploy, pages) are mapped in the parser and fall through.
  if (await runNewCommand(process.argv, pkgRoot)) {
    if (!stdoutOwnedByCommand) printCredits();
    return;
  }

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
    runAi: async (context) => {
      console.log("[gitpagedocs] Iniciando Módulo de IA na CLI...");
      // @ts-ignore
      const { runAiCliCommand } = await import("../../src/cli/application/run-ai-cli-command.ts");
      const result = await runAiCliCommand({
        cwd: process.cwd(),
        onInfo: (message: string) => console.log(message),
      });

      if (result.summary.scannedFilesCount === 0) {
        console.log("[gitpagedocs:ai] Nenhum arquivo elegível foi encontrado nos paths informados.");
        return;
      }

      if (result.runConfigScaffold) {
        console.log("\n[gitpagedocs] Scaffolding GitPageDocs ecosystem automatically...");
        const safePrebuiltDir = typeof context.prebuiltDir === "string" ? context.prebuiltDir : path.join(String(context.pkgRoot ?? process.cwd()), "prebuilt");
        await executeConfigOnly({ ...context, prebuiltDir: safePrebuiltDir }, configOnlyRuntime);
      }

      console.log(`\n🎉 Processo completo! Arquivos gerados: ${result.summary.outputs.join(", ")}`);
    },
  });
  printCredits();
}

main().catch((err: unknown) => {
  console.error("Failed to create Git Page Docs scaffold.", err);
  process.exitCode = 1;
});
