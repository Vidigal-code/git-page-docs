/** Config-only use case - orchestrates build, write, and optional push */

import { existsSync } from "node:fs";
import { sanitizeSegment } from "../../options/parser.mjs";
import { getCurrentGitBranch, runGitPushForGeneratedArtifacts } from "../../runtime/git-ops.mjs";
import { writeConfigOnlyOutput, writeText } from "../../runtime/output.mjs";
import { ensureGitHubPagesWorkflow } from "../../runtime/workflow.mjs";
import { reportAll } from "../report/config-only-reporter.mjs";

/**
 * Execute config-only use case
 * @param {Object} params
 * @param {Object} params.options - Parsed CLI options
 * @param {string} params.root - Project root
 * @param {string} params.pkgRoot - Package root
 * @param {string} params.prebuiltDir - Prebuilt directory path
 * @param {Function} params.buildConfigArtifacts - Artifact builder
 * @param {Function} params.createThemeTemplate - Theme template creator
 * @param {Array} params.layouts - Layout definitions
 */
export async function executeConfigOnly(params) {
  const { options, root, pkgRoot, prebuiltDir, buildConfigArtifacts, createThemeTemplate, layouts } = params;

  const artifacts = buildConfigArtifacts({
    useLocalLayoutConfig: options.useLocalLayoutConfig,
    githubOwner: sanitizeSegment(options.githubOwner),
    githubRepo: sanitizeSegment(options.githubRepo),
    root,
  });

  await writeConfigOnlyOutput({
    root,
    pkgRoot,
    outputDir: options.outputDir,
    artifacts,
    useLocalLayoutConfig: options.useLocalLayoutConfig,
    layouts,
    createThemeTemplate,
  });

  if (options.shouldPush) {
    await ensureGitHubPagesWorkflow(
      () => getCurrentGitBranch(root),
      (relativePath, content) => writeText(root, relativePath, content),
      options.docsPath || "",
    );
    runGitPushForGeneratedArtifacts(options, root, sanitizeSegment);
  }

  reportAll(options, existsSync(prebuiltDir));
}
