import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import path from "node:path";

const gitOps = vi.hoisted(() => ({
  detectRepoFromGit: vi.fn<(root: string) => { owner: string; repo: string } | null>(),
  getCurrentGitBranch: vi.fn<(root: string) => string>(),
  tryConfigurePagesToGitHubActions: vi.fn(),
}));
vi.mock("../../runtime/git-ops.mjs", () => gitOps);

const clack = vi.hoisted(() => ({ askConfirm: vi.fn<(message: string, initial?: boolean) => Promise<boolean>>() }));
vi.mock("../../presentation/ui/clack", () => clack);

const prompts = vi.hoisted(() => ({
  askOwnerRepo: vi.fn<() => Promise<{ owner: string; repo: string }>>(),
  interactivePromptsAvailable: vi.fn<() => boolean>(),
}));
vi.mock("../../presentation/ui/prompts", () => prompts);

const childProcess = vi.hoisted(() => ({ spawnSync: vi.fn() }));
vi.mock("node:child_process", async (importOriginal) => ({
  ...(await importOriginal<typeof import("node:child_process")>()),
  spawnSync: childProcess.spawnSync,
}));

import { runPagesActions, runPagesDeploy } from "../../presentation/commands/pages";
import type { CommandContext } from "../../presentation/commands/run-command";

const CWD = path.join("/", "work", "site");
const PKG_ROOT = path.join("/", "pkg", "cli");
let logged: string[];

function context(args: string[]): CommandContext {
  return { argv: ["node", "gitpagedocs", ...args], args, pkgRoot: PKG_ROOT, cwd: CWD };
}

function output(): string {
  return logged.join("\n");
}

beforeEach(() => {
  logged = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.map(String).join(" "));
  });
  for (const mock of [...Object.values(gitOps), ...Object.values(clack), ...Object.values(prompts), childProcess.spawnSync]) {
    mock.mockReset();
  }
  gitOps.getCurrentGitBranch.mockReturnValue("main");
  prompts.interactivePromptsAvailable.mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runPagesActions", () => {
  it("configures Pages for the detected repository after confirmation", async () => {
    gitOps.detectRepoFromGit.mockReturnValue({ owner: "acme", repo: "docs" });
    clack.askConfirm.mockResolvedValue(true);

    await runPagesActions(context(["pages", "actions"]));

    expect(gitOps.detectRepoFromGit).toHaveBeenCalledWith(CWD);
    expect(output()).toContain("Detected acme/docs (branch main).");
    expect(clack.askConfirm).toHaveBeenCalledWith(
      "Switch GitHub Pages source to GitHub Actions for acme/docs?",
      false,
    );
    expect(gitOps.tryConfigurePagesToGitHubActions).toHaveBeenCalledWith("acme", "docs", "main", CWD);
    expect(prompts.askOwnerRepo).not.toHaveBeenCalled();
  });

  it("aborts without changes when the user declines", async () => {
    gitOps.detectRepoFromGit.mockReturnValue({ owner: "acme", repo: "docs" });
    clack.askConfirm.mockResolvedValue(false);

    await runPagesActions(context(["--pages-actions"]));

    expect(output()).toContain("Aborted. No changes made.");
    expect(gitOps.tryConfigurePagesToGitHubActions).not.toHaveBeenCalled();
  });

  it("explains how to proceed when no remote is detected outside a terminal", async () => {
    gitOps.detectRepoFromGit.mockReturnValue(null);
    prompts.interactivePromptsAvailable.mockReturnValue(false);

    await runPagesActions(context(["--pages-actions"]));

    expect(output()).toContain("Could not detect a GitHub repo from the git 'origin' remote.");
    expect(clack.askConfirm).not.toHaveBeenCalled();
    expect(gitOps.tryConfigurePagesToGitHubActions).not.toHaveBeenCalled();
  });

  it("asks for owner/repo when no remote is detected in a terminal", async () => {
    gitOps.detectRepoFromGit.mockReturnValue(null);
    prompts.askOwnerRepo.mockResolvedValue({ owner: "typed", repo: "byhand" });
    clack.askConfirm.mockResolvedValue(true);

    await runPagesActions(context(["--pages-actions"]));

    expect(prompts.askOwnerRepo).toHaveBeenCalledWith(null);
    expect(gitOps.tryConfigurePagesToGitHubActions).toHaveBeenCalledWith("typed", "byhand", "main", CWD);
  });
});

describe("runPagesDeploy", () => {
  it("runs the legacy push flow with explicit flags and prints the final URL", async () => {
    clack.askConfirm.mockResolvedValue(true);
    childProcess.spawnSync.mockReturnValue({ status: 0 });

    await runPagesDeploy(context(["pages", "deploy", "--owner", "acme", "--repo=docs", "--path", "/guide/"]));

    expect(gitOps.detectRepoFromGit).not.toHaveBeenCalled();
    expect(output()).toContain("Deploy acme/docs to GitHub Pages via Actions (path: /guide/).");
    expect(clack.askConfirm).toHaveBeenCalledWith(
      "Generate docs + workflow, commit, push, and switch Pages to Actions for acme/docs?",
      false,
    );
    expect(childProcess.spawnSync).toHaveBeenCalledWith(
      process.execPath,
      [path.join(PKG_ROOT, "index.mjs"), "--push", "--owner", "acme", "--repo", "docs", "--path", "/guide/"],
      { stdio: "inherit", cwd: CWD, env: process.env },
    );
    expect(output()).toContain("Deployed. Final URL: https://acme.github.io/docs/guide/");
  });

  it("fills missing owner/repo from the git remote and omits the path when absent", async () => {
    gitOps.detectRepoFromGit.mockReturnValue({ owner: "detected", repo: "remote" });
    clack.askConfirm.mockResolvedValue(true);
    childProcess.spawnSync.mockReturnValue({ status: 0 });

    await runPagesDeploy(context(["pages", "deploy", "--owner", "given"]));

    expect(output()).toContain("Deploy given/remote to GitHub Pages via Actions.");
    expect(childProcess.spawnSync.mock.calls[0][1]).toEqual([
      path.join(PKG_ROOT, "index.mjs"),
      "--push",
      "--owner",
      "given",
      "--repo",
      "remote",
    ]);
    expect(output()).toContain("Deployed. Final URL: https://given.github.io/remote/");
  });

  it("reports a failed push step", async () => {
    gitOps.detectRepoFromGit.mockReturnValue({ owner: "acme", repo: "docs" });
    clack.askConfirm.mockResolvedValue(true);
    childProcess.spawnSync.mockReturnValue({ status: 1 });

    await runPagesDeploy(context(["pages", "deploy"]));

    expect(output()).toContain("Deploy did not complete (push step failed).");
    expect(output()).not.toContain("Deployed.");
  });

  it("aborts before spawning anything when the user declines", async () => {
    gitOps.detectRepoFromGit.mockReturnValue({ owner: "acme", repo: "docs" });
    clack.askConfirm.mockResolvedValue(false);

    await runPagesDeploy(context(["pages", "deploy"]));

    expect(output()).toContain("Aborted. No changes made.");
    expect(childProcess.spawnSync).not.toHaveBeenCalled();
  });

  it("stops with guidance when owner/repo are unknown outside a terminal", async () => {
    gitOps.detectRepoFromGit.mockReturnValue(null);
    prompts.interactivePromptsAvailable.mockReturnValue(false);

    await runPagesDeploy(context(["pages", "deploy", "--repo", "only-repo"]));

    expect(output()).toContain("Could not determine owner/repo.");
    expect(clack.askConfirm).not.toHaveBeenCalled();
    expect(childProcess.spawnSync).not.toHaveBeenCalled();
  });

  it("prompts for the missing owner/repo in a terminal, pre-filling what was given", async () => {
    gitOps.detectRepoFromGit.mockReturnValue(null);
    prompts.askOwnerRepo.mockResolvedValue({ owner: "typed", repo: "only-repo" });
    clack.askConfirm.mockResolvedValue(true);
    childProcess.spawnSync.mockReturnValue({ status: 0 });

    await runPagesDeploy(context(["pages", "deploy", "--repo", "only-repo"]));

    expect(prompts.askOwnerRepo).toHaveBeenCalledWith(null, { owner: "", repo: "only-repo" });
    expect(output()).toContain("Deployed. Final URL: https://typed.github.io/only-repo/");
  });
});
