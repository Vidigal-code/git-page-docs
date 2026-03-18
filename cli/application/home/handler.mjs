/** Home distribution use case - static site + auxiliary files */

import { STATIC_OUTPUT_DIR, ARTIFACTS_DIR } from "../../home/constants.mjs";

/**
 * Execute home distribution use case
 * @param {Object} params
 * @param {Object} params.options - Parsed CLI options
 * @param {string} params.root - Project root
 * @param {string} params.pkgRoot - Package root
 * @param {Function} params.buildConfigArtifacts - Artifact builder
 * @param {Function} params.createThemeTemplate - Theme template creator
 * @param {Array} params.layouts - Layout definitions
 * @param {import("../ports/cli-runtime-ports").HomeRuntimePort} runtime
 */
export async function executeHome(params, runtime) {
  if (!runtime) {
    throw new Error("Home runtime is required.");
  }

  const { options, root, pkgRoot, buildConfigArtifacts, createThemeTemplate, layouts } = params;
  const outputDir = options.outputDir || "gitpagedocshome";
  const repositorySearch = options.repositorySearch ?? false;
  const basePath = options.basePath ?? "";

  const isCurrentDir = outputDir === "." || outputDir === "./";
  const targetDir = isCurrentDir ? root : runtime.joinPath(root, outputDir);

  if (!isCurrentDir) {
    runtime.ensureDirEmpty(root, outputDir);
  }

  const pathSegment = basePath ? basePath.replace(/^\/+|\/+$/g, "") : "";
  const buildEnv = {
    ...process.env,
    GITHUB_ACTIONS: "true",
    GITPAGEDOCS_REPOSITORY_SEARCH: String(repositorySearch),
    GITPAGEDOCS_BASE_PATH: pathSegment ? `/${pathSegment}` : "",
    GITPAGEDOCS_PATH: pathSegment,
  };

  const artifacts = buildConfigArtifacts({
    useLocalLayoutConfig: false,
    githubOwner: "",
    githubRepo: "",
    root,
  });

  await runtime.writeConfigOnlyOutput({
    root,
    pkgRoot,
    outputDir: ARTIFACTS_DIR,
    artifacts,
    useLocalLayoutConfig: false,
    layouts,
    createThemeTemplate,
  });

  runtime.runNextBuild(root, buildEnv);

  const outPath = runtime.joinPath(root, STATIC_OUTPUT_DIR);
  if (!runtime.existsPath(outPath)) {
    throw new Error(`Static export not found at ${STATIC_OUTPUT_DIR}/. Ensure next.config exports when GITHUB_ACTIONS=true.`);
  }

  const destBase = isCurrentDir ? root : targetDir;
  if (isCurrentDir) {
    for (const name of runtime.readDirNames(outPath)) {
      runtime.copyRecursive(runtime.joinPath(outPath, name), runtime.joinPath(destBase, name));
    }
  } else {
    runtime.copyRecursive(outPath, destBase);
  }
  runtime.copyRecursive(runtime.joinPath(root, ARTIFACTS_DIR), runtime.joinPath(destBase, ARTIFACTS_DIR));

  await runtime.writeHomeFiles(root, isCurrentDir ? "." : outputDir, { repositorySearch, basePath });
  await runtime.writeText(root, (isCurrentDir ? "" : outputDir + "/") + ".nojekyll", "");

  const cdDir = isCurrentDir ? "." : outputDir;
  runtime.logSuccess(`Generated: ${cdDir}/ (static site + .env + Dockerfile + README.md)`);
  runtime.logInfo(`Serve: cd ${cdDir} && npx serve .`);
  runtime.logInfo(`Docker: cd ${cdDir} && docker build -t gitpagedocshome . && docker run -p 3000:80 gitpagedocshome`);
}
