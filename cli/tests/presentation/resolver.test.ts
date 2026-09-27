import { describe, it, expect, beforeEach, vi } from "vitest";
import type { CliOptions } from "../../domain/models/cli-options";

const prompts = vi.hoisted(() => ({
  shouldRunInteractive: vi.fn<(argv: string[]) => boolean>(),
  promptConfigOnlyOptions: vi.fn<(parsed: CliOptions) => Promise<CliOptions>>(),
  promptHomeOptions: vi.fn<(parsed: CliOptions) => Promise<CliOptions>>(),
  promptDeployOptions: vi.fn<(parsed: CliOptions, detected: unknown) => Promise<CliOptions>>(),
  ensureGitRepoInteractive: vi.fn<(root: string) => Promise<void>>(),
  interactivePromptsAvailable: vi.fn<() => boolean>(),
}));
vi.mock("../../presentation/ui/prompts", () => prompts);

const gitOps = vi.hoisted(() => ({
  detectRepoFromGit: vi.fn<(root: string) => { owner: string; repo: string } | null>(),
}));
vi.mock("../../runtime/git-ops.mjs", () => gitOps);

import { resolveOptions } from "../../presentation/options/resolver";
import { DEFAULTS } from "../../presentation/options/schema";

const NO_ENV = {} as NodeJS.ProcessEnv;

function argv(...args: string[]): string[] {
  return ["node", "gitpagedocs", ...args];
}

beforeEach(() => {
  for (const mock of [...Object.values(prompts), gitOps.detectRepoFromGit]) mock.mockReset();
  prompts.interactivePromptsAvailable.mockReturnValue(false);
  prompts.shouldRunInteractive.mockReturnValue(false);
  prompts.ensureGitRepoInteractive.mockResolvedValue(undefined);
});

describe("resolveOptions", () => {
  it("returns the parsed options untouched in a non-interactive run", async () => {
    const options = await resolveOptions(argv("--build", "--owner", "acme"), NO_ENV);
    expect(options).toMatchObject({ mode: "config-only", isBuild: true, githubOwner: "acme" });
    expect(prompts.promptConfigOnlyOptions).not.toHaveBeenCalled();
  });

  it("fills the home defaults from the parsed path", async () => {
    const options = await resolveOptions(argv("--home", "--path", "/site/"), NO_ENV);
    expect(options.repositorySearch).toBe(DEFAULTS.home.repositorySearch);
    expect(options.basePath).toBe("/site/");

    const bare = await resolveOptions(argv("--home"), NO_ENV);
    expect(bare.basePath).toBe(DEFAULTS.home.basePath);
  });

  it("prompts for a missing owner/repo on deploy, pre-filled from git, then ensures a repo", async () => {
    prompts.interactivePromptsAvailable.mockReturnValue(true);
    gitOps.detectRepoFromGit.mockReturnValue({ owner: "detected", repo: "remote" });
    prompts.promptDeployOptions.mockImplementation(async (parsed) => ({
      ...parsed,
      githubOwner: "acme",
      githubRepo: "docs",
    }));

    const options = await resolveOptions(argv("deploy"), NO_ENV);

    expect(gitOps.detectRepoFromGit).toHaveBeenCalledWith(process.cwd());
    expect(prompts.promptDeployOptions).toHaveBeenCalledWith(
      expect.objectContaining({ shouldPush: true }),
      { owner: "detected", repo: "remote" },
    );
    expect(prompts.ensureGitRepoInteractive).toHaveBeenCalledWith(process.cwd());
    expect(options).toMatchObject({ shouldPush: true, githubOwner: "acme", githubRepo: "docs" });
    expect(prompts.shouldRunInteractive).not.toHaveBeenCalled();
  });

  it("skips the owner/repo prompt when both were given on the command line", async () => {
    prompts.interactivePromptsAvailable.mockReturnValue(true);

    const options = await resolveOptions(argv("--push", "--owner", "acme", "--repo", "docs"), NO_ENV);

    expect(gitOps.detectRepoFromGit).not.toHaveBeenCalled();
    expect(prompts.promptDeployOptions).not.toHaveBeenCalled();
    expect(prompts.ensureGitRepoInteractive).toHaveBeenCalledTimes(1);
    expect(options).toMatchObject({ githubOwner: "acme", githubRepo: "docs" });
  });

  it("falls through to the legacy guards for a non-interactive deploy", async () => {
    const options = await resolveOptions(argv("--push"), NO_ENV);
    expect(prompts.ensureGitRepoInteractive).not.toHaveBeenCalled();
    expect(options).toMatchObject({ shouldPush: true, githubOwner: "" });
  });

  it("runs the home prompt for an interactive --home", async () => {
    prompts.shouldRunInteractive.mockReturnValue(true);
    prompts.promptHomeOptions.mockImplementation(async (parsed) => ({ ...parsed, outputDir: "answered" }));

    const options = await resolveOptions(argv("--home"), NO_ENV);

    expect(prompts.shouldRunInteractive).toHaveBeenCalledWith(argv("--home"));
    expect(options.outputDir).toBe("answered");
    expect(prompts.promptConfigOnlyOptions).not.toHaveBeenCalled();
  });

  it("runs the config-only prompt for an interactive bare invocation", async () => {
    prompts.shouldRunInteractive.mockReturnValue(true);
    prompts.promptConfigOnlyOptions.mockImplementation(async (parsed) => ({ ...parsed, githubOwner: "asked" }));

    const options = await resolveOptions(argv(), NO_ENV);

    expect(options.githubOwner).toBe("asked");
    expect(prompts.promptHomeOptions).not.toHaveBeenCalled();
  });

  it("leaves other interactive modes to their own flows", async () => {
    prompts.shouldRunInteractive.mockReturnValue(true);

    const options = await resolveOptions(argv("ai"), NO_ENV);

    expect(options.mode).toBe("ai");
    expect(prompts.promptHomeOptions).not.toHaveBeenCalled();
    expect(prompts.promptConfigOnlyOptions).not.toHaveBeenCalled();
  });
});
