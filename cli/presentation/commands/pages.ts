import path from "node:path";
import { spawnSync } from "node:child_process";
import type { CommandContext } from "./run-command";
import { askConfirm } from "../ui/clack";
import { askOwnerRepo, interactivePromptsAvailable } from "../ui/prompts";
// @ts-expect-error .mjs runtime module
import { detectRepoFromGit, getCurrentGitBranch, tryConfigurePagesToGitHubActions } from "../../runtime/git-ops.mjs";

/** Read `--name value` (or `--name=value`) from a raw arg list. */
function readFlag(args: string[], name: string): string {
  const eq = args.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1).trim();
  const i = args.indexOf(name);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith("--")) return args[i + 1].trim();
  return "";
}

/**
 * `gitpagedocs pages actions` / `--pages-actions` — switch the repository's
 * GitHub Pages source to GitHub Actions. Detects owner/repo/branch from git,
 * validates the gh CLI, and confirms before changing anything (no silent
 * overwrite). Does NOT generate docs or push (that is `pages deploy`).
 */
export async function runPagesActions(ctx: CommandContext): Promise<void> {
  let repo = detectRepoFromGit(ctx.cwd) as { owner: string; repo: string } | null;
  if (!repo) {
    if (!interactivePromptsAvailable()) {
      // eslint-disable-next-line no-console
      console.log("\n  Could not detect a GitHub repo from the git 'origin' remote.\n  Add a remote or use `--push --owner <o> --repo <r>`.\n");
      return;
    }
    repo = await askOwnerRepo(null);
  }
  const branch = getCurrentGitBranch(ctx.cwd) as string;
  // eslint-disable-next-line no-console
  console.log(`\n  Detected ${repo.owner}/${repo.repo} (branch ${branch}).`);
  const ok = await askConfirm(`Switch GitHub Pages source to GitHub Actions for ${repo.owner}/${repo.repo}?`, false);
  if (!ok) {
    // eslint-disable-next-line no-console
    console.log("  Aborted. No changes made.\n");
    return;
  }
  tryConfigurePagesToGitHubActions(repo.owner, repo.repo, branch, ctx.cwd);
}

/**
 * `gitpagedocs pages deploy` — the full documented deploy flow: resolve
 * owner/repo (from --owner/--repo or the git remote), confirm, then run the
 * proven `--push` path (generate docs + workflow → commit → push → configure
 * Pages→Actions) and print the final site URL. Reuses the legacy push verbatim
 * (spawned), so `--push` behavior stays byte-identical.
 */
export async function runPagesDeploy(ctx: CommandContext): Promise<void> {
  let owner = readFlag(ctx.args, "--owner");
  let repo = readFlag(ctx.args, "--repo");
  const docsPath = readFlag(ctx.args, "--path");

  if (!owner || !repo) {
    const detected = detectRepoFromGit(ctx.cwd) as { owner: string; repo: string } | null;
    if (detected) {
      owner = owner || detected.owner;
      repo = repo || detected.repo;
    }
  }
  if (!owner || !repo) {
    if (!interactivePromptsAvailable()) {
      // eslint-disable-next-line no-console
      console.log("\n  Could not determine owner/repo. Pass `--owner <o> --repo <r>` or add a git 'origin' remote.\n");
      return;
    }
    const answered = await askOwnerRepo(null, { owner, repo });
    owner = answered.owner;
    repo = answered.repo;
  }

  // eslint-disable-next-line no-console
  console.log(`\n  Deploy ${owner}/${repo} to GitHub Pages via Actions${docsPath ? ` (path: ${docsPath})` : ""}.`);
  const ok = await askConfirm(
    `Generate docs + workflow, commit, push, and switch Pages to Actions for ${owner}/${repo}?`,
    false,
  );
  if (!ok) {
    // eslint-disable-next-line no-console
    console.log("  Aborted. No changes made.\n");
    return;
  }

  // pkgRoot is the cli package root (cli/), where the bin lives as index.mjs.
  const bin = path.join(ctx.pkgRoot, "index.mjs");
  const pushArgs = ["--push", "--owner", owner, "--repo", repo, ...(docsPath ? ["--path", docsPath] : [])];
  const result = spawnSync(process.execPath, [bin, ...pushArgs], { stdio: "inherit", cwd: ctx.cwd, env: process.env });

  if (result.status === 0) {
    const seg = docsPath ? `/${docsPath.replace(/^\/+|\/+$/g, "")}` : "";
    // eslint-disable-next-line no-console
    console.log(`\n  Deployed. Final URL: https://${owner}.github.io/${repo}${seg}/\n`);
  } else {
    // eslint-disable-next-line no-console
    console.log("\n  Deploy did not complete (push step failed). See output above.\n");
  }
}
