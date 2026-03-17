/** Config-only command: generate gitpagedocs/ */

import { existsSync } from "node:fs";
import { sanitizeSegment } from "../options/parser.mjs";
import { getCurrentGitBranch, runGitPushForGeneratedArtifacts } from "../runtime/git-ops.mjs";
import { writeConfigOnlyOutput, writeText } from "../runtime/output.mjs";
import { ensureGitHubPagesWorkflow } from "../runtime/workflow.mjs";
import { logInfo } from "../ui/logger.mjs";

export async function runConfigOnly(params) {
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

  logInfo(`Generated: ${options.outputDir}/ (config-only)`);
  logInfo("No index.html/index.js generated.");
  if (options.useLocalLayoutConfig) {
    logInfo("Local layouts generated in gitpagedocs/layouts/ (--layoutconfig).");
  } else {
    logInfo("Using official remote layouts config by default (no local gitpagedocs/layouts generated).");
  }
  if (options.githubOwner && options.githubRepo) {
    logInfo(`Configured rendering URL: https://${options.githubOwner}.github.io/${options.githubRepo}/`);
    logInfo(
      `Official viewer remains available: https://vidigal-code.github.io/git-page-docs/${options.githubOwner}/${options.githubRepo}?modetheme=light&lang=pt`,
    );
  }
  if (options.shouldPush) {
    logInfo("Generated: .github/workflows/gitpagedocs-pages.yml");
    logInfo("Push mode enabled: committed and pushed gitpagedocs/ + workflow to origin.");
  }
  if (options.isBuild) {
    logInfo("`--build` keeps compatibility flag but output remains gitpagedocs/.");
  }
  if (options.mode === "full" || options.isServe) {
    logInfo("External commands were skipped (no prebuilt copy and no local serve spawn).");
  }
  if (existsSync(prebuiltDir)) {
    logInfo("`prebuilt/` detected, but ignored by config-only generator.");
  }
}
