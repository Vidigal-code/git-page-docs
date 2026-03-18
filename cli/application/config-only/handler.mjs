/** Config-only use case - orchestrates build, write, and optional push */

import { sanitizeSegment } from "../../domain/services/sanitize-segment.mjs";
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
 * @param {import("../ports/cli-runtime-ports").ConfigOnlyRuntimePort} runtime
 */
export async function executeConfigOnly(params, runtime) {
  if (!runtime) {
    throw new Error("Config-only runtime is required.");
  }

  const { options, root, pkgRoot, prebuiltDir, buildConfigArtifacts, createThemeTemplate, layouts } = params;

  const artifacts = buildConfigArtifacts({
    useLocalLayoutConfig: options.useLocalLayoutConfig,
    githubOwner: sanitizeSegment(options.githubOwner),
    githubRepo: sanitizeSegment(options.githubRepo),
    root,
  });

  await runtime.writeConfigOnlyOutput({
    root,
    pkgRoot,
    outputDir: options.outputDir,
    artifacts,
    useLocalLayoutConfig: options.useLocalLayoutConfig,
    layouts,
    createThemeTemplate,
  });

  if (options.shouldPush) {
    await runtime.ensureGitHubPagesWorkflow(
      () => runtime.getCurrentGitBranch(root),
      (relativePath, content) => runtime.writeText(root, relativePath, content),
      options.docsPath || "",
    );
    runtime.runGitPushForGeneratedArtifacts(options, root, sanitizeSegment);
  }

  const reportLines = reportAll(options, runtime.hasPath(prebuiltDir));
  for (const line of reportLines) {
    runtime.logInfo(line);
  }
}
