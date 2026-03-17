/** Orchestrate home distribution build: artifacts, Next.js export, copy, aux files */

import path from "node:path";
import { existsSync, rmSync, cpSync } from "node:fs";
import { execSync } from "node:child_process";
import { writeConfigOnlyOutput, writeText } from "../runtime/output.mjs";
import { writeHomeFiles } from "./home-file-writer.mjs";
import { HOME_OUTPUT_DIR, STATIC_OUTPUT_DIR, ARTIFACTS_DIR } from "./constants.mjs";

const HOME_BUILD_ENV = {
  ...process.env,
  GITHUB_ACTIONS: "true",
  GITPAGEDOCS_REPOSITORY_SEARCH: "false",
  GITPAGEDOCS_BASE_PATH: "",
};

function ensureDirEmpty(root, dir) {
  const fullPath = path.join(root, dir);
  if (existsSync(fullPath)) {
    rmSync(fullPath, { recursive: true, force: true });
  }
}

function copyRecursive(src, dest) {
  cpSync(src, dest, { recursive: true, force: true });
}

/**
 * Run full home distribution build.
 * @param {object} params
 * @param {string} params.root
 * @param {string} params.pkgRoot
 * @param {Function} params.buildConfigArtifacts
 * @param {Function} params.createThemeTemplate
 * @param {Array} params.layouts
 */
export async function runHomeBuild(params) {
  const { root, pkgRoot, buildConfigArtifacts, createThemeTemplate, layouts } = params;

  ensureDirEmpty(root, HOME_OUTPUT_DIR);

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

  execSync("npx next build", {
    cwd: root,
    env: HOME_BUILD_ENV,
    stdio: "inherit",
  });

  const outPath = path.join(root, STATIC_OUTPUT_DIR);
  const homePath = path.join(root, HOME_OUTPUT_DIR);

  if (!existsSync(outPath)) {
    throw new Error(`Static export not found at ${STATIC_OUTPUT_DIR}/. Ensure next.config exports when GITHUB_ACTIONS=true.`);
  }

  copyRecursive(outPath, homePath);
  copyRecursive(path.join(root, ARTIFACTS_DIR), path.join(homePath, ARTIFACTS_DIR));

  await writeHomeFiles(root, HOME_OUTPUT_DIR);

  await writeText(root, `${HOME_OUTPUT_DIR}/.nojekyll`, "");

  console.log(`Generated: ${HOME_OUTPUT_DIR}/ (static site + .env + Dockerfile + README.md)`);
  console.log(`Serve with: cd ${HOME_OUTPUT_DIR} && npx serve .`);
  console.log(`Docker: cd ${HOME_OUTPUT_DIR} && docker build -t gitpagedocshome . && docker run -p 3000:80 gitpagedocshome`);
}
