import type { CliMode, CliOptions } from "../../domain/models/cli-options";
import { DEFAULTS } from "./schema";
import { normalizeLayoutsDir } from "../../contracts/layouts-paths.mjs";

const KNOWN_FLAGS = new Set([
  "--build",
  "--serve",
  "--layoutconfig",
  "--full",
  "--push",
  "--home",
  "--search",
  "--path",
  "--output",
  "--layouts-dir",
  "--interactive",
  "-i",
  "--no-interactive",
  "--yes",
  "-y",
  "--ai",
  "--pages-actions",
]);

/** Options that carry a value; `--name=value` spellings must never be read as an owner/repo. */
const VALUE_OPTION_PREFIXES = ["--owner", "--repo", "--path", "--home", "--output", "--layouts-dir", "--search"];

function readOptionValue(args: string[], optionName: string): string {
  const equalsArg = args.find((a) => a.startsWith(`${optionName}=`));
  if (equalsArg) return equalsArg.slice(optionName.length + 1).trim();
  const index = args.indexOf(optionName);
  if (index >= 0) {
    const next = args[index + 1];
    if (next && !next.startsWith("--")) return next.trim();
  }
  return "";
}

/** Legacy `--<owner> --<repo>` spelling: every dashed arg that is not a known flag or option. */
function readFallbackOwnerRepo(args: string[]): string[] {
  return args
    .filter((a) => a.startsWith("--") && !KNOWN_FLAGS.has(a))
    .filter((a) => !VALUE_OPTION_PREFIXES.some((prefix) => a.startsWith(prefix)))
    .map((a) => a.slice(2).trim())
    .filter(Boolean);
}

/** New verb aliases (Phase 6) that map onto existing modes without new modes. */
function readCommandAliases(args: string[]): { isDocument: boolean; isDeploy: boolean; aiCommand?: string } {
  const command = args[0];
  if (command === "ai") return { isDocument: false, isDeploy: false, aiCommand: args[1] };
  if (command === "document") return { isDocument: true, isDeploy: false, aiCommand: args[1] ?? "repo" };
  if (command?.startsWith("document:")) return { isDocument: true, isDeploy: false, aiCommand: command.split(":")[1] };
  return { isDocument: false, isDeploy: command === "deploy" || command === "pages", aiCommand: undefined };
}

function resolveMode(flags: { isAi: boolean; isHome: boolean; isFull: boolean }): CliMode {
  if (flags.isAi) return "ai";
  if (flags.isHome) return "home";
  if (flags.isFull) return "full";
  return "config-only";
}

function resolveRepositorySearch(searchRaw: string, isHome: boolean): boolean | undefined {
  if (searchRaw === "true") return true;
  if (searchRaw === "false") return false;
  return isHome ? DEFAULTS.home.repositorySearch : undefined;
}

export function parseCliOptions(argv: string[], env: NodeJS.ProcessEnv): CliOptions {
  const args = argv.slice(2);

  const docsPath = readOptionValue(args, "--path");
  const outputDir = readOptionValue(args, "--output");
  const layoutsDir = readOptionValue(args, "--layouts-dir");
  const searchRaw = readOptionValue(args, "--search");

  const fallbackDashedArgs = readFallbackOwnerRepo(args);
  const githubOwner = readOptionValue(args, "--owner") || fallbackDashedArgs[0] || "";
  const githubRepo = readOptionValue(args, "--repo") || fallbackDashedArgs[1] || "";

  const { isDocument, isDeploy, aiCommand } = readCommandAliases(args);

  const isBuild = args.includes("--build") || env.GITPAGEDOCS_BUILD === "1";
  const isServe = args.includes("--serve");
  const useLocalLayoutConfig = args.includes("--layoutconfig");
  const shouldPush = args.includes("--push") || isDeploy;
  const isHome = args.includes("--home");
  const isInteractive = args.includes("--interactive") || args.includes("-i");
  const isAi = args[0] === "ai" || args.includes("--ai") || isDocument;

  const mode = resolveMode({ isAi, isHome, isFull: args.includes("--full") });
  const repositorySearch = resolveRepositorySearch(searchRaw, isHome);
  const defaultOutputDir = isHome ? DEFAULTS.home.outputDir : DEFAULTS.outputDir;

  return {
    isBuild,
    isServe,
    mode,
    aiCommand,
    outputDir: outputDir || defaultOutputDir,
    layoutsDir: normalizeLayoutsDir(layoutsDir || DEFAULTS.layoutsDir),
    useLocalLayoutConfig,
    shouldPush,
    githubOwner,
    githubRepo,
    docsPath,
    basePath: docsPath,
    repositorySearch,
    isInteractive,
    hasArgs: args.length > 0,
    explicit: {
      useLocalLayoutConfig,
      layoutsDir: Boolean(layoutsDir),
      githubOwner: Boolean(githubOwner),
      githubRepo: Boolean(githubRepo),
      outputDir: Boolean(outputDir),
    },
  };
}
