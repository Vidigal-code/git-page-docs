import { existsSync } from "node:fs";
import { getCurrentGitBranch, runGitPushForGeneratedArtifacts } from "../../runtime/git-ops.mjs";
import { writeConfigOnlyOutput, writeText } from "../../runtime/output.mjs";
import { ensureGitHubPagesWorkflow } from "../../runtime/workflow.mjs";
import { logInfo } from "../../ui/logger.mjs";

export function createConfigOnlyRuntime() {
  return {
    hasPath: existsSync,
    writeConfigOnlyOutput,
    writeText,
    ensureGitHubPagesWorkflow,
    getCurrentGitBranch,
    runGitPushForGeneratedArtifacts,
    logInfo,
  };
}
