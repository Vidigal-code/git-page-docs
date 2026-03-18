import type { CliOptions } from "../../domain/models/cli-options";
import { DEFAULTS } from "./schema";

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
  "--interactive",
  "-i",
]);

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

export function parseCliOptions(argv: string[], env: NodeJS.ProcessEnv): CliOptions {
  const args = argv.slice(2);

  let githubOwner = readOptionValue(args, "--owner");
  let githubRepo = readOptionValue(args, "--repo");
  const docsPath = readOptionValue(args, "--path");
  const outputDir = readOptionValue(args, "--output");
  const searchRaw = readOptionValue(args, "--search");

  const fallbackDashedArgs = args
    .filter((a) => a.startsWith("--"))
    .filter((a) => !KNOWN_FLAGS.has(a))
    .filter((a) => !a.startsWith("--owner"))
    .filter((a) => !a.startsWith("--repo"))
    .filter((a) => !a.startsWith("--path"))
    .filter((a) => !a.startsWith("--home"))
    .filter((a) => !a.startsWith("--output"))
    .filter((a) => !a.startsWith("--search"))
    .map((a) => a.replace(/^--/, "").trim())
    .filter(Boolean);

  if (!githubOwner && fallbackDashedArgs[0]) githubOwner = fallbackDashedArgs[0];
  if (!githubRepo && fallbackDashedArgs[1]) githubRepo = fallbackDashedArgs[1];

  const isBuild = args.includes("--build") || env.GITPAGEDOCS_BUILD === "1";
  const isServe = args.includes("--serve");
  const useLocalLayoutConfig = args.includes("--layoutconfig");
  const shouldPush = args.includes("--push");
  const isHome = args.includes("--home");
  const isInteractive = args.includes("--interactive") || args.includes("-i");
  const mode = isHome ? "home" : args.includes("--full") ? "full" : "config-only";
  const repositorySearch =
    searchRaw === "true"
      ? true
      : searchRaw === "false"
        ? false
        : isHome
          ? DEFAULTS.home.repositorySearch
          : undefined;

  const normalizedPath = docsPath.trim();

  return {
    isBuild,
    isServe,
    mode,
    outputDir: outputDir || (isHome ? DEFAULTS.home.outputDir : DEFAULTS.outputDir),
    useLocalLayoutConfig,
    shouldPush,
    githubOwner,
    githubRepo,
    docsPath: normalizedPath,
    basePath: normalizedPath,
    repositorySearch,
    isInteractive,
    hasArgs: args.length > 0,
  };
}
