/** Home distribution use case - static site + auxiliary files */

import path from "node:path";
import { existsSync, rmSync, cpSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { writeConfigOnlyOutput, writeText } from "../../runtime/output.mjs";
import { writeHomeFiles } from "../../home/home-file-writer.mjs";
import { STATIC_OUTPUT_DIR, ARTIFACTS_DIR } from "../../home/constants.mjs";
import { logSuccess, logInfo } from "../../ui/logger.mjs";

function ensureDirEmpty(root, dir) {
  const full = path.join(root, dir);
  if (existsSync(full)) rmSync(full, { recursive: true, force: true });
}

function copyRecursive(src, dest) {
  cpSync(src, dest, { recursive: true, force: true });
}

/**
 * Execute home distribution use case
 * @param {Object} params
 * @param {Object} params.options - Parsed CLI options
 * @param {string} params.root - Project root
 * @param {string} params.pkgRoot - Package root
 * @param {Function} params.buildConfigArtifacts - Artifact builder
 * @param {Function} params.createThemeTemplate - Theme template creator
 * @param {Array} params.layouts - Layout definitions
 */
export async function executeHome(params) {
  const { options, root, pkgRoot, buildConfigArtifacts, createThemeTemplate, layouts } = params;
  const outputDir = options.outputDir || "gitpagedocshome";
  const repositorySearch = options.repositorySearch ?? false;
  const basePath = options.basePath ?? "";

  const isCurrentDir = outputDir === "." || outputDir === "./";
  const targetDir = isCurrentDir ? root : path.join(root, outputDir);

  if (!isCurrentDir) ensureDirEmpty(root, outputDir);

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

  await writeConfigOnlyOutput({
    root,
    pkgRoot,
    outputDir: ARTIFACTS_DIR,
    artifacts,
    useLocalLayoutConfig: false,
    layouts,
    createThemeTemplate,
  });

  execSync("npx next build", { cwd: root, env: buildEnv, stdio: "inherit" });

  const outPath = path.join(root, STATIC_OUTPUT_DIR);
  if (!existsSync(outPath)) {
    throw new Error(`Static export not found at ${STATIC_OUTPUT_DIR}/. Ensure next.config exports when GITHUB_ACTIONS=true.`);
  }

  const destBase = isCurrentDir ? root : path.join(root, outputDir);
  if (isCurrentDir) {
    for (const name of readdirSync(outPath)) {
      copyRecursive(path.join(outPath, name), path.join(destBase, name));
    }
  } else {
    copyRecursive(outPath, destBase);
  }
  copyRecursive(path.join(root, ARTIFACTS_DIR), path.join(destBase, ARTIFACTS_DIR));

  await writeHomeFiles(root, isCurrentDir ? "." : outputDir, { repositorySearch, basePath });
  await writeText(root, (isCurrentDir ? "" : outputDir + "/") + ".nojekyll", "");

  const cdDir = isCurrentDir ? "." : outputDir;
  logSuccess(`Generated: ${cdDir}/ (static site + .env + Dockerfile + README.md)`);
  logInfo(`Serve: cd ${cdDir} && npx serve .`);
  logInfo(`Docker: cd ${cdDir} && docker build -t gitpagedocshome . && docker run -p 3000:80 gitpagedocshome`);
}
