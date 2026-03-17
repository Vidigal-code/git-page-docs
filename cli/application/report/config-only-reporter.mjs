/** Config-only command output messages - SRP: single place for all report messages */

import { logInfo } from "../../ui/logger.mjs";

export function reportConfigOnlySuccess(options) {
  logInfo(`Generated: ${options.outputDir}/ (config-only)`);
  logInfo("No index.html/index.js generated.");
}

export function reportLayoutConfig(options) {
  if (options.useLocalLayoutConfig) {
    logInfo("Local layouts generated in gitpagedocs/layouts/ (--layoutconfig).");
  } else {
    logInfo("Using official remote layouts config by default (no local gitpagedocs/layouts generated).");
  }
}

export function reportRenderingUrl(options) {
  if (options.githubOwner && options.githubRepo) {
    logInfo(`Configured rendering URL: https://${options.githubOwner}.github.io/${options.githubRepo}/`);
    logInfo(
      `Official viewer remains available: https://vidigal-code.github.io/git-page-docs/${options.githubOwner}/${options.githubRepo}?modetheme=light&lang=pt`,
    );
  }
}

export function reportPushMode() {
  logInfo("Generated: .github/workflows/gitpagedocs-pages.yml");
  logInfo("Push mode enabled: committed and pushed gitpagedocs/ + workflow to origin.");
}

export function reportBuildFlag() {
  logInfo("`--build` keeps compatibility flag but output remains gitpagedocs/.");
}

export function reportFullOrServeSkipped() {
  logInfo("External commands were skipped (no prebuilt copy and no local serve spawn).");
}

export function reportPrebuiltDetected() {
  logInfo("`prebuilt/` detected, but ignored by config-only generator.");
}

export function reportAll(options, prebuiltDetected) {
  reportConfigOnlySuccess(options);
  reportLayoutConfig(options);
  reportRenderingUrl(options);
  if (options.shouldPush) {
    reportPushMode();
  }
  if (options.isBuild) {
    reportBuildFlag();
  }
  if (options.mode === "full" || options.isServe) {
    reportFullOrServeSkipped();
  }
  if (prebuiltDetected) {
    reportPrebuiltDetected();
  }
}
