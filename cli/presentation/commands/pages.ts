import type { CommandContext } from "./run-command";
import { askConfirm } from "../ui/clack";
// @ts-expect-error .mjs runtime module
import { detectRepoFromGit, getCurrentGitBranch, tryConfigurePagesToGitHubActions } from "../../runtime/git-ops.mjs";

/**
 * `gitpagedocs pages actions` / `--pages-actions` — switch the repository's
 * GitHub Pages source to GitHub Actions. Detects owner/repo/branch from git,
 * validates the gh CLI, and confirms before changing anything (no silent
 * overwrite). Does NOT generate docs or push (that is `pages deploy`).
 */
export async function runPagesActions(ctx: CommandContext): Promise<void> {
  const repo = detectRepoFromGit(ctx.cwd) as { owner: string; repo: string } | null;
  if (!repo) {
    // eslint-disable-next-line no-console
    console.log("\n  Could not detect a GitHub repo from the git 'origin' remote.\n  Add a remote or use `--push --owner <o> --repo <r>`.\n");
    return;
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
