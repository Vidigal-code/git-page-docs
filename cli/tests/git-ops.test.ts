import { describe, it, expect, afterEach, vi } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as execRuntime from "../runtime/exec.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as gitOpsRuntime from "../runtime/git-ops.mjs";

interface GitPushOptions {
  githubOwner?: string;
  githubRepo?: string;
}

/** Public contract of cli/runtime/git-ops.mjs. */
interface GitOpsRuntime {
  detectRepoFromGit(root: string): { owner: string; repo: string } | null;
  tryConfigurePagesToGitHubActions(owner: string, repo: string, branch: string, root: string): void;
  getCurrentGitBranch(root: string): string;
  runGitPushForGeneratedArtifacts(
    options: GitPushOptions,
    root: string,
    sanitizeSegment: (value: string | undefined) => string,
  ): void;
}

const { resolveExecutable, runExecutableCapture } = execRuntime as {
  resolveExecutable(name: string, options?: { env?: NodeJS.ProcessEnv }): string;
  runExecutableCapture(name: string, args?: readonly string[], options?: Record<string, unknown>): string;
};
const { detectRepoFromGit, getCurrentGitBranch, runGitPushForGeneratedArtifacts, tryConfigurePagesToGitHubActions } =
  gitOpsRuntime as GitOpsRuntime;

/** Root of this monorepo checkout (cli/tests -> cli -> repo root). */
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const identity = (value: string | undefined): string => value ?? "";
const temporaryRoots: string[] = [];

/** A fresh directory outside any git repository. */
function makeNonGitDir(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-git-ops-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

describe("detectRepoFromGit", () => {
  it("reads owner and repo from the origin remote of this checkout", () => {
    expect(detectRepoFromGit(REPO_ROOT)).toEqual({ owner: "Vidigal-code", repo: "git-page-docs" });
  });

  it("returns null outside a git repository", () => {
    expect(detectRepoFromGit(makeNonGitDir())).toBeNull();
  });

  it("returns null when the directory does not exist", () => {
    expect(detectRepoFromGit(path.join(makeNonGitDir(), "missing", "nested"))).toBeNull();
  });
});

describe("getCurrentGitBranch", () => {
  it("reports the checked-out branch of this repository", () => {
    const branch = getCurrentGitBranch(REPO_ROOT);
    expect(typeof branch).toBe("string");
    expect(branch.length).toBeGreaterThan(0);
    expect(branch).not.toMatch(/\s/);
  });

  it("falls back to main outside a git repository", () => {
    expect(getCurrentGitBranch(makeNonGitDir())).toBe("main");
  });

  it("falls back to main when the directory does not exist", () => {
    expect(getCurrentGitBranch(path.join(makeNonGitDir(), "missing"))).toBe("main");
  });
});

describe("runGitPushForGeneratedArtifacts", () => {
  it("requires both owner and repo before touching git", () => {
    expect(() => runGitPushForGeneratedArtifacts({}, REPO_ROOT, identity)).toThrow(/--push/);
    expect(() => runGitPushForGeneratedArtifacts({ githubOwner: "owner" }, REPO_ROOT, identity)).toThrow(/--push/);
    expect(() => runGitPushForGeneratedArtifacts({ githubRepo: "repo" }, REPO_ROOT, identity)).toThrow(/--push/);
  });

  it("uses the sanitizer verdict, not the raw option, to decide whether owner and repo are present", () => {
    const rejectEverything = vi.fn(() => "");
    expect(() =>
      runGitPushForGeneratedArtifacts({ githubOwner: "owner", githubRepo: "repo" }, REPO_ROOT, rejectEverything),
    ).toThrow(/--push/);
    expect(rejectEverything).toHaveBeenCalledWith("owner");
    expect(rejectEverything).toHaveBeenCalledWith("repo");
  });

  it("refuses to run outside a git repository", () => {
    expect(() =>
      runGitPushForGeneratedArtifacts({ githubOwner: "owner", githubRepo: "repo" }, makeNonGitDir(), identity),
    ).toThrow(/not a git repository/);
  });
});

describe("tryConfigurePagesToGitHubActions", () => {
  it("warns and returns when the GitHub CLI is not on PATH", () => {
    // Empty PATH so `gh` cannot be resolved: the function must bail out before
    // it would otherwise call the GitHub API. Node's process.env is
    // case-insensitive on Windows, so stubbing "PATH" also covers "Path".
    vi.stubEnv("PATH", "");
    expect(() => resolveExecutable("gh")).toThrow(/was not found on PATH/);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    expect(() => tryConfigurePagesToGitHubActions("owner", "repo", "main", REPO_ROOT)).not.toThrow();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("GitHub CLI (gh) not found");
    expect(warn.mock.calls[0][0]).toContain("Set GitHub Pages source to 'GitHub Actions' manually");
    expect(log).not.toHaveBeenCalled();
  });
});

describe("runGitPushForGeneratedArtifacts against a local bare origin", { timeout: 30_000 }, () => {
  const COMMIT_MESSAGE = "chore: setup gitpagedocs pages workflow";
  const WORKFLOW_FILE = ".github/workflows/gitpagedocs-pages.yml";

  /**
   * Prepend a shim directory whose `gh` always fails, so the Pages
   * auto-configuration degrades to its warning without ever reaching the
   * GitHub API. The rest of PATH stays intact: Git for Windows needs its
   * usr/bin helpers next to git.exe or `git push` crashes.
   */
  function isolatePath(base: string): void {
    const shimDir = path.join(base, "shim");
    mkdirSync(shimDir, { recursive: true });
    if (process.platform === "win32") {
      writeFileSync(path.join(shimDir, "gh.cmd"), "@exit /b 1\r\n");
    } else {
      writeFileSync(path.join(shimDir, "gh"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    }
    vi.stubEnv("PATH", `${shimDir}${path.delimiter}${process.env.PATH ?? ""}`);
  }

  function git(cwd: string, ...args: string[]): string {
    return runExecutableCapture("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"] });
  }

  function initWorkRepo(dir: string): void {
    git(dir, "init", "-b", "main");
    git(dir, "config", "user.email", "tests@example.com");
    git(dir, "config", "user.name", "gitpagedocs tests");
    git(dir, "config", "commit.gpgsign", "false");
  }

  function writeArtifacts(dir: string, marker: string): void {
    mkdirSync(path.join(dir, "gitpagedocs"), { recursive: true });
    mkdirSync(path.dirname(path.join(dir, WORKFLOW_FILE)), { recursive: true });
    writeFileSync(path.join(dir, "gitpagedocs", "config.json"), `{"marker":"${marker}"}\n`);
    writeFileSync(path.join(dir, WORKFLOW_FILE), `name: Deploy GitPageDocs # ${marker}\n`);
  }

  /** Work repo + bare origin wired together, artifacts written but not committed. */
  function makeRepoWithBareOrigin(): { base: string; work: string; origin: string } {
    const base = makeNonGitDir();
    const origin = path.join(base, "origin.git");
    const work = path.join(base, "work");
    mkdirSync(work, { recursive: true });
    git(base, "init", "--bare", "-b", "main", origin);
    initWorkRepo(work);
    git(work, "remote", "add", "origin", origin);
    writeArtifacts(work, "v1");
    isolatePath(base);
    return { base, work, origin };
  }

  function originLog(origin: string): string[] {
    try {
      return git(origin, "log", "--format=%s", "main").split(/\r?\n/).filter(Boolean);
    } catch {
      return [];
    }
  }

  it("commits the generated artifacts, pushes them and falls back to the Pages warning when gh is unavailable", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { work, origin } = makeRepoWithBareOrigin();

    runGitPushForGeneratedArtifacts({ githubOwner: "owner", githubRepo: "repo" }, work, identity);

    expect(originLog(origin)).toEqual([COMMIT_MESSAGE]);
    expect(git(work, "rev-parse", "--abbrev-ref", "main@{upstream}")).toBe("origin/main");
    expect(git(work, "remote", "get-url", "origin")).toBe(origin);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("GitHub CLI (gh) not found"));
  });

  it("returns early without a new commit when the artifacts are already committed", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { work, origin } = makeRepoWithBareOrigin();
    runGitPushForGeneratedArtifacts({ githubOwner: "owner", githubRepo: "repo" }, work, identity);
    warn.mockClear();

    runGitPushForGeneratedArtifacts({ githubOwner: "owner", githubRepo: "repo" }, work, identity);

    expect(originLog(origin)).toEqual([COMMIT_MESSAGE]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("adds a github.com origin when the repository has no remote yet", () => {
    const base = makeNonGitDir();
    const work = path.join(base, "work");
    mkdirSync(work, { recursive: true });
    initWorkRepo(work);
    writeArtifacts(work, "v1");
    git(work, "add", "gitpagedocs", WORKFLOW_FILE);
    git(work, "commit", "-m", "already committed");
    isolatePath(base);

    // Nothing left to stage, so the flow stops right after wiring the remote (no network push).
    runGitPushForGeneratedArtifacts({ githubOwner: "acme", githubRepo: "docs" }, work, identity);

    expect(git(work, "remote", "get-url", "origin")).toBe("https://github.com/acme/docs.git");
    expect(originLog(work)).toEqual(["already committed"]);
  });

  it("rebases onto a remote branch that moved ahead and pushes again", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { base, work, origin } = makeRepoWithBareOrigin();
    runGitPushForGeneratedArtifacts({ githubOwner: "owner", githubRepo: "repo" }, work, identity);

    // Someone else lands an unrelated commit on origin/main.
    const other = path.join(base, "other");
    git(base, "clone", "-b", "main", origin, other);
    git(other, "config", "user.email", "other@example.com");
    git(other, "config", "user.name", "other");
    git(other, "config", "commit.gpgsign", "false");
    writeFileSync(path.join(other, "README.md"), "hello\n");
    git(other, "add", "README.md");
    git(other, "commit", "-m", "unrelated change");
    git(other, "push", "origin", "main");

    writeArtifacts(work, "v2");
    warn.mockClear();
    runGitPushForGeneratedArtifacts({ githubOwner: "owner", githubRepo: "repo" }, work, identity);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Initial push failed"));
    expect(originLog(origin)).toEqual([COMMIT_MESSAGE, "unrelated change", COMMIT_MESSAGE]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("GitHub CLI (gh) not found"));
  });

  it("throws an actionable error when the automatic rebase hits a conflict", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { base, work, origin } = makeRepoWithBareOrigin();
    runGitPushForGeneratedArtifacts({ githubOwner: "owner", githubRepo: "repo" }, work, identity);

    // The same artifact changes on origin and locally with different content.
    const other = path.join(base, "other");
    git(base, "clone", "-b", "main", origin, other);
    git(other, "config", "user.email", "other@example.com");
    git(other, "config", "user.name", "other");
    git(other, "config", "commit.gpgsign", "false");
    writeArtifacts(other, "remote-edit");
    git(other, "add", "gitpagedocs", WORKFLOW_FILE);
    git(other, "commit", "-m", "remote edit");
    git(other, "push", "origin", "main");
    writeArtifacts(work, "local-edit");

    expect(() => runGitPushForGeneratedArtifacts({ githubOwner: "owner", githubRepo: "repo" }, work, identity)).toThrow(
      /Failed to push after automatic rebase on branch 'main'/,
    );
  });
});

describe("tryConfigurePagesToGitHubActions with a gh shim", () => {
  /** Put a fake `gh` first on PATH; it never talks to GitHub. */
  function installGhShim(versionExit: number, apiExit: number): string {
    const base = makeNonGitDir();
    const shimDir = path.join(base, "shim");
    mkdirSync(shimDir, { recursive: true });
    if (process.platform === "win32") {
      writeFileSync(
        path.join(shimDir, "gh.cmd"),
        `@echo off\r\nif "%~1"=="--version" exit /b ${versionExit}\r\nexit /b ${apiExit}\r\n`,
      );
    } else {
      writeFileSync(
        path.join(shimDir, "gh"),
        `#!/bin/sh\n[ "$1" = "--version" ] && exit ${versionExit}\nexit ${apiExit}\n`,
        { mode: 0o755 },
      );
    }
    vi.stubEnv("PATH", `${shimDir}${path.delimiter}${process.env.PATH ?? ""}`);
    return base;
  }

  it("reports success as soon as one Pages API candidate succeeds", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const root = installGhShim(0, 0);

    tryConfigurePagesToGitHubActions("owner", "repo", "main", root);

    expect(log).toHaveBeenCalledWith("GitHub Pages source configured for GitHub Actions.");
    expect(warn).not.toHaveBeenCalled();
  });

  it("tries every candidate and warns when the API keeps failing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const root = installGhShim(0, 1);

    tryConfigurePagesToGitHubActions("owner", "repo", "main", root);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Could not auto-configure Pages source through GitHub API"));
    expect(log).not.toHaveBeenCalled();
  });
});
