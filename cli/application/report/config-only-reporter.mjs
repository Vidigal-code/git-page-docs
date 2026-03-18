/** Config-only command output messages - SRP: single place for all report messages */

export function reportConfigOnlySuccess(options) {
  return [`Generated: ${options.outputDir}/ (config-only)`, "No index.html/index.js generated."];
}

export function reportLayoutConfig(options) {
  if (options.useLocalLayoutConfig) {
    return ["Local layouts generated in gitpagedocs/layouts/ (--layoutconfig)."];
  } else {
    return ["Using official remote layouts config by default (no local gitpagedocs/layouts generated)."];
  }
}

export function reportRenderingUrl(options) {
  if (options.githubOwner && options.githubRepo) {
    return [
      `Configured rendering URL: https://${options.githubOwner}.github.io/${options.githubRepo}/`,
      `Official viewer remains available: https://vidigal-code.github.io/git-page-docs/${options.githubOwner}/${options.githubRepo}?modetheme=light&lang=pt`,
    ];
  }
  return [];
}

export function reportPushMode() {
  return [
    "Generated: .github/workflows/gitpagedocs-pages.yml",
    "Push mode enabled: committed and pushed gitpagedocs/ + workflow to origin.",
  ];
}

export function reportBuildFlag() {
  return ["`--build` keeps compatibility flag but output remains gitpagedocs/."];
}

export function reportFullOrServeSkipped() {
  return ["External commands were skipped (no prebuilt copy and no local serve spawn)."];
}

export function reportPrebuiltDetected() {
  return ["`prebuilt/` detected, but ignored by config-only generator."];
}

export function reportAll(options, prebuiltDetected) {
  const lines = [];
  lines.push(...reportConfigOnlySuccess(options));
  lines.push(...reportLayoutConfig(options));
  lines.push(...reportRenderingUrl(options));
  if (options.shouldPush) {
    lines.push(...reportPushMode());
  }
  if (options.isBuild) {
    lines.push(...reportBuildFlag());
  }
  if (options.mode === "full" || options.isServe) {
    lines.push(...reportFullOrServeSkipped());
  }
  if (prebuiltDetected) {
    lines.push(...reportPrebuiltDetected());
  }
  return lines;
}
