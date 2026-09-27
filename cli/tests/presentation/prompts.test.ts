import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { CliOptions } from "../../domain/models/cli-options";

interface AskTextOptions {
  message: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
}

const clack = vi.hoisted(() => ({
  askText: vi.fn<(options: { message: string; defaultValue?: string; validate?: (v: string) => string | undefined }) => Promise<string>>(),
  askConfirm: vi.fn<(message: string, initial?: boolean) => Promise<boolean>>(),
  note: vi.fn<(message: string, title?: string) => void>(),
}));
vi.mock("../../presentation/ui/clack", () => clack);

const tty = vi.hoisted(() => ({
  interactivePromptsAvailable: vi.fn<() => boolean>(),
  promptingEnabled: vi.fn<(args: readonly string[]) => boolean>(),
}));
vi.mock("../../presentation/ui/tty", () => tty);

const layouts = vi.hoisted(() => ({
  askLayoutsSource: vi.fn<(useLocal: boolean) => Promise<boolean>>(),
  askLayoutsDir: vi.fn<(current: string) => Promise<string>>(),
}));
vi.mock("../../presentation/ui/layouts-prompts", () => layouts);

const exec = vi.hoisted(() => ({ runExecutable: vi.fn() }));
vi.mock("../../runtime/exec.mjs", () => exec);

import {
  askOwnerRepo,
  ensureGitRepoInteractive,
  interactivePromptsAvailable,
  promptConfigOnlyOptions,
  promptDeployOptions,
  promptHomeOptions,
  shouldRunInteractive,
} from "../../presentation/ui/prompts";
import { DEFAULTS } from "../../presentation/options/schema";

function parsed(overrides: Partial<CliOptions> = {}): CliOptions {
  return {
    isBuild: false,
    isServe: false,
    mode: "config-only",
    outputDir: "gitpagedocs",
    layoutsDir: "gitpagelayouts",
    useLocalLayoutConfig: false,
    shouldPush: false,
    githubOwner: "",
    githubRepo: "",
    docsPath: "",
    basePath: "",
    isInteractive: false,
    hasArgs: false,
    explicit: { useLocalLayoutConfig: false, layoutsDir: false, githubOwner: false, githubRepo: false, outputDir: false },
    ...overrides,
  };
}

function askTextCall(index: number): AskTextOptions {
  return clack.askText.mock.calls[index][0];
}

const temporaryRoots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-prompts-"));
  temporaryRoots.push(root);
  return root;
}

beforeEach(() => {
  for (const mock of [...Object.values(clack), ...Object.values(tty), ...Object.values(layouts), exec.runExecutable]) {
    mock.mockReset();
  }
  tty.interactivePromptsAvailable.mockReturnValue(true);
});

afterEach(() => {
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

describe("shouldRunInteractive", () => {
  it("re-exports the TTY gate and delegates to promptingEnabled with the user args", () => {
    expect(interactivePromptsAvailable).toBe(tty.interactivePromptsAvailable);
    tty.promptingEnabled.mockReturnValue(true);
    expect(shouldRunInteractive(["node", "cli", "--build", "--yes"])).toBe(true);
    expect(tty.promptingEnabled).toHaveBeenCalledWith(["--build", "--yes"]);
  });
});

describe("promptHomeOptions", () => {
  it("asks for output dir, search and base path, trimming the answers", async () => {
    clack.askText.mockResolvedValueOnce("  site  ").mockResolvedValueOnce(" base ");
    clack.askConfirm.mockResolvedValue(true);

    const result = await promptHomeOptions(parsed({ mode: "home", outputDir: "gitpagedocshome", basePath: "x" }));

    expect(result).toMatchObject({ outputDir: "site", repositorySearch: true, basePath: "base" });
    expect(askTextCall(0)).toMatchObject({ message: "Output directory:", defaultValue: "gitpagedocshome" });
    expect(askTextCall(0).validate?.("")).toBe("Required");
    expect(askTextCall(0).validate?.("  ")).toBe("Required");
    expect(askTextCall(0).validate?.("ok")).toBeUndefined();
    expect(clack.askConfirm).toHaveBeenCalledWith("Enable repository search home?", DEFAULTS.repositorySearch);
    expect(askTextCall(1)).toMatchObject({ defaultValue: "x" });
  });

  it("uses the parsed repository search as the confirm default and tolerates an empty base path", async () => {
    clack.askText.mockResolvedValueOnce("site").mockResolvedValueOnce(undefined as unknown as string);
    clack.askConfirm.mockResolvedValue(false);

    const result = await promptHomeOptions(parsed({ mode: "home", repositorySearch: true }));

    expect(clack.askConfirm).toHaveBeenCalledWith("Enable repository search home?", true);
    expect(result.basePath).toBe("");
    expect(result.repositorySearch).toBe(false);
  });
});

describe("askOwnerRepo", () => {
  it("prefers explicit defaults over detected values and trims the answers", async () => {
    clack.askText.mockResolvedValueOnce(" acme ").mockResolvedValueOnce(" docs ");

    const result = await askOwnerRepo({ owner: "detected", repo: "remote" }, { owner: "given", repo: "" });

    expect(result).toEqual({ owner: "acme", repo: "docs" });
    expect(askTextCall(0).defaultValue).toBe("given");
    expect(askTextCall(1).defaultValue).toBe("remote");
    expect(askTextCall(0).validate?.(" ")).toBe("Owner is required.");
    expect(askTextCall(0).validate?.("a")).toBeUndefined();
    expect(askTextCall(1).validate?.("")).toBe("Repository is required.");
    expect(askTextCall(1).validate?.("r")).toBeUndefined();
  });

  it("falls back to empty defaults without detection", async () => {
    clack.askText.mockResolvedValueOnce("a").mockResolvedValueOnce("b");
    await askOwnerRepo(null);
    expect(askTextCall(0).defaultValue).toBe("");
    expect(askTextCall(1).defaultValue).toBe("");
  });
});

describe("promptDeployOptions", () => {
  it("explains the deploy, then fills owner and repo", async () => {
    clack.askText.mockResolvedValueOnce("acme").mockResolvedValueOnce("docs");

    const result = await promptDeployOptions(parsed({ shouldPush: true, githubOwner: "pre" }), null);

    expect(clack.note).toHaveBeenCalledWith(expect.stringContaining("Deploy publishes gitpagedocs"), "GitHub Pages deploy");
    expect(askTextCall(0).defaultValue).toBe("pre");
    expect(result).toMatchObject({ shouldPush: true, githubOwner: "acme", githubRepo: "docs" });
  });
});

describe("ensureGitRepoInteractive", () => {
  it("does nothing when a .git folder exists", async () => {
    const root = makeRoot();
    mkdirSync(path.join(root, ".git"));
    await ensureGitRepoInteractive(root);
    expect(clack.askConfirm).not.toHaveBeenCalled();
  });

  it("does nothing outside a terminal", async () => {
    tty.interactivePromptsAvailable.mockReturnValue(false);
    await ensureGitRepoInteractive(makeRoot());
    expect(clack.askConfirm).not.toHaveBeenCalled();
  });

  it("warns when the user declines to initialize", async () => {
    clack.askConfirm.mockResolvedValue(false);
    await ensureGitRepoInteractive(makeRoot());
    expect(clack.note).toHaveBeenCalledWith("Deploy needs a git repository. Run `git init`, then retry.", "Heads up");
    expect(exec.runExecutable).not.toHaveBeenCalled();
  });

  it("runs git init through the exec helper when accepted", async () => {
    const root = makeRoot();
    clack.askConfirm.mockResolvedValue(true);
    await ensureGitRepoInteractive(root);
    expect(exec.runExecutable).toHaveBeenCalledWith("git", ["init"], { cwd: root, stdio: "ignore" });
    expect(clack.note).toHaveBeenCalledWith("Initialized an empty git repository.", "git");
  });

  it("reports a failed git init", async () => {
    clack.askConfirm.mockResolvedValue(true);
    exec.runExecutable.mockImplementation(() => {
      throw new Error("git missing");
    });
    await ensureGitRepoInteractive(makeRoot());
    expect(clack.note).toHaveBeenCalledWith("Could not run `git init`. Initialize git manually, then retry.", "git");
  });
});

describe("promptConfigOnlyOptions", () => {
  it("asks only for what the command line left unanswered", async () => {
    layouts.askLayoutsSource.mockResolvedValue(true);
    layouts.askLayoutsDir.mockResolvedValue("temas");
    clack.askText.mockResolvedValueOnce(" acme ").mockResolvedValueOnce(" docs ");

    const result = await promptConfigOnlyOptions(parsed());

    expect(layouts.askLayoutsSource).toHaveBeenCalledWith(false);
    expect(layouts.askLayoutsDir).toHaveBeenCalledWith("gitpagelayouts");
    expect(askTextCall(0)).toMatchObject({ message: "GitHub owner (optional):", defaultValue: "" });
    expect(askTextCall(1)).toMatchObject({ message: "GitHub repo (optional):", defaultValue: "" });
    expect(result).toMatchObject({
      useLocalLayoutConfig: true,
      layoutsDir: "temas",
      githubOwner: "acme",
      githubRepo: "docs",
    });
  });

  it("never re-asks explicit flags", async () => {
    const result = await promptConfigOnlyOptions(
      parsed({
        useLocalLayoutConfig: true,
        layoutsDir: "given",
        githubOwner: "o",
        githubRepo: "r",
        explicit: { useLocalLayoutConfig: true, layoutsDir: true, githubOwner: true, githubRepo: true, outputDir: false },
      }),
    );

    expect(layouts.askLayoutsSource).not.toHaveBeenCalled();
    expect(layouts.askLayoutsDir).not.toHaveBeenCalled();
    expect(clack.askText).not.toHaveBeenCalled();
    expect(result).toMatchObject({ useLocalLayoutConfig: true, layoutsDir: "given", githubOwner: "o", githubRepo: "r" });
  });

  it("skips the layouts folder question when official layouts are chosen", async () => {
    layouts.askLayoutsSource.mockResolvedValue(false);
    clack.askText.mockResolvedValueOnce(undefined as unknown as string).mockResolvedValueOnce(undefined as unknown as string);

    const result = await promptConfigOnlyOptions(parsed({ layoutsDir: "keep" }));

    expect(layouts.askLayoutsDir).not.toHaveBeenCalled();
    expect(result).toMatchObject({ useLocalLayoutConfig: false, layoutsDir: "keep", githubOwner: "", githubRepo: "" });
  });
});
