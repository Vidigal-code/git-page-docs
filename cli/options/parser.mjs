/** Parse CLI argv into options */

import { DEFAULTS } from "./schema.mjs";

const KNOWN_FLAGS = new Set([
  "--build", "--serve", "--layoutconfig", "--full", "--push", "--home",
  "--search", "--path", "--output", "--interactive", "-i",
]);

function readOptionValue(args, optionName) {
  const equalsArg = args.find((a) => a.startsWith(`${optionName}=`));
  if (equalsArg) return equalsArg.slice(optionName.length + 1).trim();
  const idx = args.indexOf(optionName);
  if (idx >= 0) {
    const next = args[idx + 1];
    if (next && !next.startsWith("--")) return next.trim();
  }
  return "";
}

export function parseCliOptions(argv, env) {
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
    searchRaw === "true" ? true : searchRaw === "false" ? false : isHome ? DEFAULTS.home.repositorySearch : undefined;

  const pathVal = docsPath ? docsPath.trim() : "";

  return {
    isBuild,
    isServe,
    mode,
    outputDir: outputDir || (isHome ? DEFAULTS.home.outputDir : DEFAULTS.outputDir),
    useLocalLayoutConfig,
    shouldPush,
    githubOwner: githubOwner ?? "",
    githubRepo: githubRepo ?? "",
    docsPath: pathVal,
    basePath: pathVal,
    repositorySearch,
    isInteractive,
    hasArgs: args.length > 0,
  };
}

export function sanitizeSegment(value) {
  if (!value) return "";
  const n = value.trim();
  return /^[A-Za-z0-9._-]+$/.test(n) ? n : "";
}
