import { existsSync } from "node:fs";
import { parseCliOptions, sanitizeSegment } from "./cli-options.mjs";
import { getCurrentGitBranch, runGitPushForGeneratedArtifacts } from "./git-ops.mjs";
import { writeConfigOnlyOutput, writeText } from "./output.mjs";
import { ensureGitHubPagesWorkflow } from "./workflow.mjs";

export async function runCli(params) {
  const { argv, env, root, pkgRoot, prebuiltDir, buildConfigArtifacts, createThemeTemplate, layouts } = params;
  const options = parseCliOptions(argv, env);
  const artifacts = buildConfigArtifacts({
    useLocalLayoutConfig: options.useLocalLayoutConfig,
    githubOwner: sanitizeSegment(options.githubOwner),
    githubRepo: sanitizeSegment(options.githubRepo),
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
    );
    runGitPushForGeneratedArtifacts(options, root, sanitizeSegment);
  }

  console.log(`Generated: ${options.outputDir}/ (config-only)`);
  console.log("No index.html/index.js generated.");
  if (options.useLocalLayoutConfig) {
    console.log("Local layouts generated in gitpagedocs/layouts/ (--layoutconfig).");
  } else {
    console.log("Using official remote layouts config by default (no local gitpagedocs/layouts generated).");
  }
  if (options.githubOwner && options.githubRepo) {
    console.log(`Configured rendering URL: https://${options.githubOwner}.github.io/${options.githubRepo}/`);
    console.log(
      `Official viewer remains available: https://vidigal-code.github.io/git-page-docs/${options.githubOwner}/${options.githubRepo}?modetheme=light&lang=pt`,
    );
  }
  if (options.shouldPush) {
    console.log("Generated: .github/workflows/gitpagedocs-pages.yml");
    console.log("Push mode enabled: committed and pushed gitpagedocs/ + workflow to origin.");
  }
  if (options.isBuild) {
    console.log("`--build` keeps compatibility flag but output remains gitpagedocs/.");
  }
  if (options.mode === "full" || options.isServe) {
    console.log("External commands were skipped (no prebuilt copy and no local serve spawn).");
  }
  if (existsSync(prebuiltDir)) {
    console.log("`prebuilt/` detected, but ignored by config-only generator.");
  }
}
