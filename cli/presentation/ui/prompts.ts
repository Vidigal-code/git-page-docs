import { existsSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
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
export async function askOwnerRepo(
  detected: { owner: string; repo: string } | null,
  defaults?: { owner?: string; repo?: string },
): Promise<{ owner: string; repo: string }> {
  const owner = await askText({
    message: "GitHub owner (user or organization):",
    defaultValue: defaults?.owner || detected?.owner || "",
    validate: (v) => (v && v.trim() ? undefined : "Owner is required."),
  });
  const repo = await askText({
    message: "GitHub repository name:",
    defaultValue: defaults?.repo || detected?.repo || "",
    validate: (v) => (v && v.trim() ? undefined : "Repository is required."),
  });
  return { owner: owner.trim(), repo: repo.trim() };
}

export async function promptDeployOptions(
  parsed: CliOptions,
  detected: { owner: string; repo: string } | null,
): Promise<CliOptions> {
  note(
    "Deploy publishes gitpagedocs to GitHub Pages and needs the target\nrepository (owner/repo). Press Enter to accept a detected value.",
    "GitHub Pages deploy",
  );
  const { owner, repo } = await askOwnerRepo(detected, {
    owner: parsed.githubOwner,
    repo: parsed.githubRepo,
  });

  return {
    ...parsed,
    githubOwner: owner,
    githubRepo: repo,
  };
}

/**
 * Deploy/--push needs a git repository in the current folder. When there isn't
 * one, offer to run `git init` instead of crashing with "not a git repository".
 * In CI/non-TTY this is a no-op so the downstream guard still reports clearly.
 */
export async function ensureGitRepoInteractive(root: string): Promise<void> {
  if (existsSync(path.join(root, ".git"))) return;
  if (!interactivePromptsAvailable()) return;
  const init = await askConfirm(
    "This folder is not a git repository yet. Initialize one here (git init)?",
    true,
  );
  if (!init) {
    note("Deploy needs a git repository. Run `git init`, then retry.", "Heads up");
    return;
  }
  try {
    execSync("git init", { cwd: root, stdio: "ignore" });
    note("Initialized an empty git repository.", "git");
  } catch {
    note("Could not run `git init`. Initialize git manually, then retry.", "git");
  }
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
