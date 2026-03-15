export function parseCliOptions(argv, env) {
  const args = argv.slice(2);
  const knownFlags = new Set(["--build", "--serve", "--layoutconfig", "--full", "--push"]);
  const readOptionValue = (optionName) => {
    const equalsArg = args.find((arg) => arg.startsWith(`${optionName}=`));
    if (equalsArg) {
      return equalsArg.slice(optionName.length + 1).trim();
    }
    const index = args.indexOf(optionName);
    if (index >= 0) {
      const nextArg = args[index + 1];
      if (nextArg && !nextArg.startsWith("--")) {
        return nextArg.trim();
      }
    }
    return "";
  };

  let githubOwner = readOptionValue("--owner");
  let githubRepo = readOptionValue("--repo");
  const fallbackDashedArgs = args
    .filter((arg) => arg.startsWith("--"))
    .filter((arg) => !knownFlags.has(arg))
    .filter((arg) => !arg.startsWith("--owner"))
    .filter((arg) => !arg.startsWith("--repo"))
    .map((arg) => arg.replace(/^--/, "").trim())
    .filter(Boolean);
  if (!githubOwner && fallbackDashedArgs[0]) {
    githubOwner = fallbackDashedArgs[0];
  }
  if (!githubRepo && fallbackDashedArgs[1]) {
    githubRepo = fallbackDashedArgs[1];
  }

  const isBuild = argv.includes("--build") || env.GITPAGEDOCS_BUILD === "1";
  const isServe = argv.includes("--serve");
  const useLocalLayoutConfig = argv.includes("--layoutconfig");
  const shouldPush = argv.includes("--push");
  const mode = argv.includes("--full") ? "full" : "config-only";
  const outputDir = "gitpagedocs";
  return {
    isBuild,
    isServe,
    mode,
    outputDir,
    useLocalLayoutConfig,
    shouldPush,
    githubOwner,
    githubRepo,
  };
}

export function sanitizeSegment(value) {
  if (!value) return "";
  const normalized = value.trim();
  return /^[A-Za-z0-9._-]+$/.test(normalized) ? normalized : "";
}
