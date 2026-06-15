import type { CliOptions } from "../../domain/models/cli-options";
import { DEFAULTS } from "../options/schema";
import { askText, askConfirm, note } from "./clack";

function isCiOrNonTty(): boolean {
  if (process.env.CI === "true") return true;
  if (process.env.GITHUB_ACTIONS === "true") return true;
  if (process.stdin && !process.stdin.isTTY) return true;
  return false;
}

/** True when clack prompts can run (interactive TTY, not CI). */
export function interactivePromptsAvailable(): boolean {
  return !isCiOrNonTty();
}

export function shouldRunInteractive(argv: string[]): boolean {
  if (isCiOrNonTty()) return false;
  const args = argv.slice(2);
  if (args.includes("--interactive") || args.includes("-i")) return true;
  if (args.length === 0) return true;
  if (args.length === 1 && args[0] === "--home") return true;
  return false;
}

export async function promptHomeOptions(parsed: CliOptions): Promise<CliOptions> {
  const outputDir = await askText({
    message: "Output directory:",
    defaultValue: parsed.outputDir ?? DEFAULTS.home.outputDir,
    validate: (v) => (v && v.trim() ? undefined : "Required"),
  });
  const repositorySearch = await askConfirm(
    "Enable repository search home?",
    parsed.repositorySearch ?? DEFAULTS.repositorySearch,
  );
  const basePath = await askText({
    message: "Base path (e.g. git-page-docs, empty for root):",
    defaultValue: parsed.basePath ?? DEFAULTS.basePath,
  });

  return {
    ...parsed,
    outputDir: outputDir.trim(),
    repositorySearch,
    basePath: basePath?.trim() ?? "",
  };
}

/**
 * Deploy/--push needs a GitHub owner + repo. When they are missing, prompt for
 * them (pre-filled from the git `origin` remote when available) instead of
 * crashing with "`--push` requires owner and repo".
 */
export async function promptDeployOptions(
  parsed: CliOptions,
  detected: { owner: string; repo: string } | null,
): Promise<CliOptions> {
  note(
    "Deploy publishes gitpagedocs to GitHub Pages and needs the target\nrepository (owner/repo). Press Enter to accept a detected value.",
    "GitHub Pages deploy",
  );
  const githubOwner = await askText({
    message: "GitHub owner (user or organization):",
    defaultValue: parsed.githubOwner || detected?.owner || "",
    validate: (v) => (v && v.trim() ? undefined : "Owner is required to deploy."),
  });
  const githubRepo = await askText({
    message: "GitHub repository name:",
    defaultValue: parsed.githubRepo || detected?.repo || "",
    validate: (v) => (v && v.trim() ? undefined : "Repository is required to deploy."),
  });

  return {
    ...parsed,
    githubOwner: githubOwner.trim(),
    githubRepo: githubRepo.trim(),
  };
}

export async function promptConfigOnlyOptions(parsed: CliOptions): Promise<CliOptions> {
  const useLocalLayoutConfig = await askConfirm(
    "Generate local layout templates?",
    parsed.useLocalLayoutConfig ?? false,
  );
  const githubOwner = await askText({
    message: "GitHub owner (optional):",
    defaultValue: parsed.githubOwner ?? "",
  });
  const githubRepo = await askText({
    message: "GitHub repo (optional):",
    defaultValue: parsed.githubRepo ?? "",
  });

  return {
    ...parsed,
    useLocalLayoutConfig,
    githubOwner: githubOwner?.trim() ?? "",
    githubRepo: githubRepo?.trim() ?? "",
  };
}
