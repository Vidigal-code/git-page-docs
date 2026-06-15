/**
 * New-verb command layer (Phase 6). Intercepts the informational/utility
 * commands that are NOT part of the legacy flag flow (version, doctor, provider,
 * models, config, mcp, update) and routes them to thin handlers that consume
 * @gitpagedocs/tools. Alias verbs (init, document, deploy, pages) are mapped in
 * the parser and fall through to the legacy dispatch, so this returns false for
 * them.
 */
export interface CommandContext {
  argv: string[];
  args: string[];
  pkgRoot: string;
  cwd: string;
}

export type CommandHandler = (ctx: CommandContext) => Promise<void>;

import { runVersion, runDoctor, runUpdate } from "./diagnostics";
import { runProvider, runModels } from "./ai-info";
import { runConfig } from "./config-info";
import { runMcp } from "./mcp";
import { runDocs } from "./docs";
import { runPagesActions, runPagesDeploy } from "./pages";
import { runPassword } from "./password";

const REGISTRY: Record<string, CommandHandler> = {
  version: runVersion,
  "--version": runVersion,
  "-v": runVersion,
  doctor: runDoctor,
  update: runUpdate,
  provider: runProvider,
  providers: runProvider,
  models: runModels,
  config: runConfig,
  mcp: runMcp,
  docs: runDocs,
  password: runPassword,
};

/** Returns true if a new command handled the invocation (skip legacy flow). */
export async function runNewCommand(argv: string[], pkgRoot: string): Promise<boolean> {
  const args = argv.slice(2);
  const ctx: CommandContext = { argv, args, pkgRoot, cwd: process.cwd() };

  // Configure-only Pages→Actions: `--pages-actions` flag or `pages actions` verb.
  if (args.includes("--pages-actions") || (args[0] === "pages" && args[1] === "actions")) {
    await runPagesActions(ctx);
    return true;
  }
  // Full deploy: `pages deploy` (detect owner/repo, confirm, run the proven
  // push flow, print URL). Bare `pages`/`deploy` still fall through to legacy.
  if (args[0] === "pages" && args[1] === "deploy") {
    await runPagesDeploy(ctx);
    return true;
  }

  const handler = REGISTRY[args[0] ?? ""];
  if (!handler) return false;
  await handler(ctx);
  return true;
}

export const NEW_COMMAND_NAMES = Object.keys(REGISTRY).filter((n) => !n.startsWith("-"));
