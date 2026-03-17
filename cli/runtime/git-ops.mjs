import { existsSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function tryConfigurePagesToGitHubActions(owner, repo, branch, root) {
  try {
    execSync("gh --version", { cwd: root, stdio: "ignore" });
  } catch {
    console.warn(
      "GitHub CLI (gh) not found. Could not auto-configure Pages source. Set GitHub Pages source to 'GitHub Actions' manually in repository settings.",
    );
    return;
  }

  const candidates = [
    `gh api -X PUT "repos/${owner}/${repo}/pages" -f build_type=workflow`,
    `gh api -X POST "repos/${owner}/${repo}/pages" -f build_type=workflow`,
    `gh api -X POST "repos/${owner}/${repo}/pages" -f source[branch]=${branch} -f source[path]=/`,
    `gh api -X PUT "repos/${owner}/${repo}/pages" -f source[branch]=${branch} -f source[path]=/ -f build_type=workflow`,
  ];

  for (const command of candidates) {
    try {
      execSync(command, { cwd: root, stdio: "ignore" });
      console.log("GitHub Pages source configured for GitHub Actions.");
      return;
    } catch {
      // Try next candidate endpoint.
    }
  }

  console.warn(
    "Could not auto-configure Pages source through GitHub API. Set repository Pages source to 'GitHub Actions' manually.",
  );
}

export function getCurrentGitBranch(root) {
  try {
    const branch = execSync("git branch --show-current", { cwd: root, stdio: "pipe" }).toString().trim();
    return branch || "main";
  } catch {
    return "main";
  }
}

export function runGitPushForGeneratedArtifacts(options, root, sanitizeSegment) {
  const owner = sanitizeSegment(options.githubOwner);
  const repo = sanitizeSegment(options.githubRepo);
  if (!owner || !repo) {
    throw new Error("`--push` requires owner and repo. Use `--owner <owner> --repo <repo>` or `--<owner> --<repo>`.");
  }
  if (!existsSync(path.join(root, ".git"))) {
    throw new Error("Current directory is not a git repository. Initialize git before using --push.");
  }

  const repoUrl = `https://github.com/${owner}/${repo}.git`;
  try {
    execSync("git remote get-url origin", { cwd: root, stdio: "ignore" });
  } catch {
    execSync(`git remote add origin "${repoUrl}"`, { cwd: root, stdio: "inherit" });
  }

  execSync('git add "gitpagedocs" ".github/workflows/gitpagedocs-pages.yml"', { cwd: root, stdio: "inherit" });

  let hasStagedChanges = false;
  try {
    execSync("git diff --cached --quiet", { cwd: root, stdio: "ignore" });
    hasStagedChanges = false;
  } catch {
    hasStagedChanges = true;
  }

  if (!hasStagedChanges) {
    return;
  }

  execSync('git commit -m "chore: setup gitpagedocs pages workflow"', { cwd: root, stdio: "inherit" });

  const currentBranch = getCurrentGitBranch(root);
  try {
    execSync(`git push -u origin ${currentBranch}`, { cwd: root, stdio: "inherit" });
    tryConfigurePagesToGitHubActions(owner, repo, currentBranch, root);
    return;
  } catch {
    console.warn("Initial push failed. Trying automatic rebase with remote branch...");
  }

  try {
    execSync(`git pull --rebase origin ${currentBranch}`, { cwd: root, stdio: "inherit" });
    execSync(`git push -u origin ${currentBranch}`, { cwd: root, stdio: "inherit" });
  } catch {
    throw new Error(
      `Failed to push after automatic rebase on branch '${currentBranch}'. Resolve conflicts and run 'git push -u origin ${currentBranch}' manually.`,
    );
  }

  tryConfigurePagesToGitHubActions(owner, repo, currentBranch, root);
}
