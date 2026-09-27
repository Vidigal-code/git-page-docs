import { existsSync } from "node:fs";
import path from "node:path";
import { runExecutable, runExecutableCapture } from "./exec.mjs";

/** Detect { owner, repo } from the git `origin` remote URL, or null. */
export function detectRepoFromGit(root) {
  try {
    const url = runExecutableCapture("git", ["remote", "get-url", "origin"], { cwd: root });
    const match = url.match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?$/);
    if (match) return { owner: match[1], repo: match[2] };
  } catch {
    // no remote / not a repo / git not installed
  }
  return null;
}

export function tryConfigurePagesToGitHubActions(owner, repo, branch, root) {
  try {
    runExecutable("gh", ["--version"], { cwd: root, stdio: "ignore" });
  } catch {
    console.warn(
      "GitHub CLI (gh) not found. Could not auto-configure Pages source. Set GitHub Pages source to 'GitHub Actions' manually in repository settings.",
    );
    return;
  }

  // Each candidate is an argv array: owner/repo/branch travel as discrete
  // arguments, never through a shell string.
  const pagesEndpoint = `repos/${owner}/${repo}/pages`;
  const candidates = [
    ["api", "-X", "PUT", pagesEndpoint, "-f", "build_type=workflow"],
    ["api", "-X", "POST", pagesEndpoint, "-f", "build_type=workflow"],
    ["api", "-X", "POST", pagesEndpoint, "-f", `source[branch]=${branch}`, "-f", "source[path]=/"],
    ["api", "-X", "PUT", pagesEndpoint, "-f", `source[branch]=${branch}`, "-f", "source[path]=/", "-f", "build_type=workflow"],
  ];

  for (const args of candidates) {
    try {
      runExecutable("gh", args, { cwd: root, stdio: "ignore" });
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
    const branch = runExecutableCapture("git", ["branch", "--show-current"], { cwd: root });
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
    runExecutable("git", ["remote", "get-url", "origin"], { cwd: root, stdio: "ignore" });
  } catch {
    runExecutable("git", ["remote", "add", "origin", repoUrl], { cwd: root, stdio: "inherit" });
  }

  runExecutable("git", ["add", "gitpagedocs", ".github/workflows/gitpagedocs-pages.yml"], { cwd: root, stdio: "inherit" });

  let hasStagedChanges = false;
  try {
    runExecutable("git", ["diff", "--cached", "--quiet"], { cwd: root, stdio: "ignore" });
  } catch {
    hasStagedChanges = true;
  }

  if (!hasStagedChanges) {
    return;
  }

  runExecutable("git", ["commit", "-m", "chore: setup gitpagedocs pages workflow"], { cwd: root, stdio: "inherit" });

  const currentBranch = getCurrentGitBranch(root);
  try {
    runExecutable("git", ["push", "-u", "origin", currentBranch], { cwd: root, stdio: "inherit" });
    tryConfigurePagesToGitHubActions(owner, repo, currentBranch, root);
    return;
  } catch {
    console.warn("Initial push failed. Trying automatic rebase with remote branch...");
  }

  try {
    runExecutable("git", ["pull", "--rebase", "origin", currentBranch], { cwd: root, stdio: "inherit" });
    runExecutable("git", ["push", "-u", "origin", currentBranch], { cwd: root, stdio: "inherit" });
  } catch {
    throw new Error(
      `Failed to push after automatic rebase on branch '${currentBranch}'. Resolve conflicts and run 'git push -u origin ${currentBranch}' manually.`,
    );
  }

  tryConfigurePagesToGitHubActions(owner, repo, currentBranch, root);
}
