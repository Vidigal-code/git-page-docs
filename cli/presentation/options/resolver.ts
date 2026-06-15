import type { CliOptions } from "../../domain/models/cli-options";
import { parseCliOptions } from "./parser";
import {
  shouldRunInteractive,
  promptConfigOnlyOptions,
  promptHomeOptions,
  promptDeployOptions,
  interactivePromptsAvailable,
} from "../ui/prompts";
import { DEFAULTS } from "./schema";
// @ts-expect-error .mjs runtime module is type-less in this package.
import { detectRepoFromGit } from "../../runtime/git-ops.mjs";

export async function resolveOptions(argv: string[], env: NodeJS.ProcessEnv): Promise<CliOptions> {
  const parsed = parseCliOptions(argv, env);

  if (parsed.mode === "home") {
    parsed.repositorySearch = parsed.repositorySearch ?? DEFAULTS.home.repositorySearch;
    parsed.basePath = parsed.basePath ?? parsed.docsPath ?? DEFAULTS.home.basePath;
  }

  // `deploy` / `--push` need owner + repo. If absent, prompt interactively
  // (pre-filled from the git origin remote) instead of throwing. In CI/non-TTY
  // we fall through so the explicit "requires owner and repo" guard still fires.
  if (parsed.shouldPush && (!parsed.githubOwner || !parsed.githubRepo) && interactivePromptsAvailable()) {
    const detected = detectRepoFromGit(process.cwd()) as { owner: string; repo: string } | null;
    return promptDeployOptions(parsed, detected);
  }

  const runHomeInteractive = parsed.isInteractive || (shouldRunInteractive(argv) && parsed.mode === "home");
  if (runHomeInteractive && parsed.mode === "home") {
    return promptHomeOptions(parsed);
  }

  const runConfigInteractive = parsed.isInteractive || (shouldRunInteractive(argv) && parsed.mode === "config-only");
  if (runConfigInteractive && parsed.mode === "config-only") {
    return promptConfigOnlyOptions(parsed);
  }

  return parsed;
}
