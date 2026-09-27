import { describe, it, expect, vi } from "vitest";
import type { CliOptions } from "../../domain/models/cli-options";
import type {
  CliCommandContext,
  CliCommandRunner,
  CliRuntimeParams,
  ConfigOnlyRuntimePort,
  HomeRuntimePort,
} from "../../application/ports/cli-runtime-ports";
import { dispatchMode } from "../../application/use-cases/dispatch-mode";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as homeHandler from "../../application/home/handler.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as configOnlyHandler from "../../application/config-only/handler.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as reporter from "../../application/report/config-only-reporter.mjs";

const { executeHome } = homeHandler as {
  executeHome(params: CliCommandContext, runtime?: HomeRuntimePort): Promise<void>;
};
const { executeConfigOnly } = configOnlyHandler as {
  executeConfigOnly(params: CliCommandContext, runtime?: ConfigOnlyRuntimePort): Promise<void>;
};
const { reportAll, reportRenderingUrl, reportLayoutConfig } = reporter as {
  reportAll(options: CliOptions, prebuiltDetected: boolean): string[];
  reportRenderingUrl(options: CliOptions): string[];
  reportLayoutConfig(options: CliOptions): string[];
};

const ROOT = "/repo";
const PKG_ROOT = "/pkg";
const PREBUILT = "/pkg/prebuilt";

function makeOptions(overrides: Partial<CliOptions> = {}): CliOptions {
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

const ARTIFACTS: CliRuntimeParams["buildConfigArtifacts"] extends (input: never) => infer R ? R : never = {
  rootConfig: { site: {} },
  languageBundles: {},
  layoutsConfig: { layouts: [] },
  fallbackLayoutsConfig: { layouts: [] },
  versionConfigs: {},
};

function makeParams(options: CliOptions): CliCommandContext & { buildConfigArtifacts: ReturnType<typeof vi.fn> } {
  const buildConfigArtifacts = vi.fn(() => ARTIFACTS);
  return {
    options,
    root: ROOT,
    pkgRoot: PKG_ROOT,
    prebuiltDir: PREBUILT,
    buildConfigArtifacts,
    createThemeTemplate: vi.fn(() => ({})),
    layouts: [{ file: "templates/a.json" }],
  };
}

function makeHomeRuntime(overrides: Partial<HomeRuntimePort> = {}): HomeRuntimePort {
  return {
    joinPath: (...parts: string[]) => parts.join("/"),
    ensureDirEmpty: vi.fn(),
    copyRecursive: vi.fn(),
    readDirNames: vi.fn(() => ["index.html", "_next"]),
    existsPath: vi.fn(() => true),
    runNextBuild: vi.fn(),
    writeConfigOnlyOutput: vi.fn(async () => {}),
    writeHomeFiles: vi.fn(async () => {}),
    writeText: vi.fn(async () => {}),
    logSuccess: vi.fn(),
    logInfo: vi.fn(),
    ...overrides,
  };
}

function makeConfigOnlyRuntime(overrides: Partial<ConfigOnlyRuntimePort> = {}): ConfigOnlyRuntimePort {
  return {
    hasPath: vi.fn(() => false),
    writeConfigOnlyOutput: vi.fn(async () => {}),
    writeText: vi.fn(async () => {}),
    ensureGitHubPagesWorkflow: vi.fn(async () => {}),
    getCurrentGitBranch: vi.fn(() => "main"),
    runGitPushForGeneratedArtifacts: vi.fn(),
    logInfo: vi.fn(),
    ...overrides,
  };
}

function callsOf(fn: unknown): unknown[][] {
  return (fn as ReturnType<typeof vi.fn>).mock.calls;
}

function orderOf(fn: unknown): number {
  return (fn as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
}

describe("executeHome", () => {
  it("requires a runtime", async () => {
    await expect(executeHome(makeParams(makeOptions({ mode: "home" })))).rejects.toThrow("Home runtime is required.");
  });

  it("builds the static site into a fresh gitpagedocshome folder by default", async () => {
    const options = makeOptions({ mode: "home", outputDir: "" });
    const params = makeParams(options);
    const runtime = makeHomeRuntime();

    await executeHome(params, runtime);

    expect(runtime.ensureDirEmpty).toHaveBeenCalledWith(ROOT, "gitpagedocshome");
    expect(params.buildConfigArtifacts).toHaveBeenCalledWith({
      useLocalLayoutConfig: false,
      layoutsDir: "gitpagelayouts",
      githubOwner: "",
      githubRepo: "",
      root: ROOT,
    });
    expect(runtime.writeConfigOnlyOutput).toHaveBeenCalledWith({
      root: ROOT,
      pkgRoot: PKG_ROOT,
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      artifacts: ARTIFACTS,
      useLocalLayoutConfig: false,
      layouts: params.layouts,
      createThemeTemplate: params.createThemeTemplate,
    });
    expect(runtime.runNextBuild).toHaveBeenCalledWith(
      ROOT,
      expect.objectContaining({
        GITHUB_ACTIONS: "true",
        GITPAGEDOCS_REPOSITORY_SEARCH: "false",
        GITPAGEDOCS_BASE_PATH: "/",
        GITPAGEDOCS_PATH: "",
      }),
    );
    expect(orderOf(runtime.writeConfigOnlyOutput)).toBeLessThan(orderOf(runtime.runNextBuild));
    expect(runtime.existsPath).toHaveBeenCalledWith(`${ROOT}/frontend/out`);
    expect(callsOf(runtime.copyRecursive)).toEqual([
      [`${ROOT}/frontend/out`, `${ROOT}/gitpagedocshome`],
      [`${ROOT}/gitpagedocs`, `${ROOT}/gitpagedocshome/gitpagedocs`],
    ]);
    expect(runtime.readDirNames).not.toHaveBeenCalled();
    expect(runtime.writeHomeFiles).toHaveBeenCalledWith(ROOT, "gitpagedocshome", { repositorySearch: false, basePath: "" });
    expect(runtime.writeText).toHaveBeenCalledWith(ROOT, "gitpagedocshome/.nojekyll", "");
    expect(runtime.logSuccess).toHaveBeenCalledWith(expect.stringContaining("Generated: gitpagedocshome/"));
    expect(callsOf(runtime.logInfo).map((call) => call[0])).toEqual([
      "Serve: cd gitpagedocshome && npx serve .",
      "Docker: cd gitpagedocshome && docker build -t gitpagedocshome . && docker run -p 3000:80 gitpagedocshome",
    ]);
  });

  it.each([".", "./"])("copies the export into the project root for output dir %j without wiping it", async (outputDir) => {
    const options = makeOptions({ mode: "home", outputDir, basePath: "/docs/", repositorySearch: true });
    const runtime = makeHomeRuntime();

    await executeHome(makeParams(options), runtime);

    expect(runtime.ensureDirEmpty).not.toHaveBeenCalled();
    expect(runtime.runNextBuild).toHaveBeenCalledWith(
      ROOT,
      expect.objectContaining({ GITPAGEDOCS_REPOSITORY_SEARCH: "true", GITPAGEDOCS_BASE_PATH: "/docs", GITPAGEDOCS_PATH: "docs" }),
    );
    expect(runtime.readDirNames).toHaveBeenCalledWith(`${ROOT}/frontend/out`);
    expect(callsOf(runtime.copyRecursive)).toEqual([
      [`${ROOT}/frontend/out/index.html`, `${ROOT}/index.html`],
      [`${ROOT}/frontend/out/_next`, `${ROOT}/_next`],
      [`${ROOT}/gitpagedocs`, `${ROOT}/gitpagedocs`],
    ]);
    expect(runtime.writeHomeFiles).toHaveBeenCalledWith(ROOT, ".", { repositorySearch: true, basePath: "/docs/" });
    expect(runtime.writeText).toHaveBeenCalledWith(ROOT, ".nojekyll", "");
    expect(runtime.logSuccess).toHaveBeenCalledWith(expect.stringContaining("Generated: ./"));
    expect(runtime.logInfo).toHaveBeenCalledWith("Serve: cd . && npx serve .");
  });

  it("fails before copying when the static export is missing", async () => {
    const runtime = makeHomeRuntime({ existsPath: vi.fn(() => false) });

    await expect(executeHome(makeParams(makeOptions({ mode: "home" })), runtime)).rejects.toThrow(
      /Static export not found at frontend\/out\//,
    );

    expect(runtime.runNextBuild).toHaveBeenCalledTimes(1);
    expect(runtime.copyRecursive).not.toHaveBeenCalled();
    expect(runtime.writeHomeFiles).not.toHaveBeenCalled();
  });
});

describe("executeConfigOnly", () => {
  it("requires a runtime", async () => {
    await expect(executeConfigOnly(makeParams(makeOptions()))).rejects.toThrow("Config-only runtime is required.");
  });

  it("builds with sanitized owner/repo, writes the output and reports without pushing", async () => {
    const options = makeOptions({ githubOwner: "acme corp", githubRepo: " docs ", useLocalLayoutConfig: true, layoutsDir: "themes" });
    const params = makeParams(options);
    const runtime = makeConfigOnlyRuntime();

    await executeConfigOnly(params, runtime);

    expect(params.buildConfigArtifacts).toHaveBeenCalledWith({
      useLocalLayoutConfig: true,
      layoutsDir: "themes",
      githubOwner: "",
      githubRepo: "docs",
      root: ROOT,
    });
    expect(runtime.writeConfigOnlyOutput).toHaveBeenCalledWith({
      root: ROOT,
      pkgRoot: PKG_ROOT,
      outputDir: "gitpagedocs",
      layoutsDir: "themes",
      artifacts: ARTIFACTS,
      useLocalLayoutConfig: true,
      layouts: params.layouts,
      createThemeTemplate: params.createThemeTemplate,
    });
    expect(runtime.ensureGitHubPagesWorkflow).not.toHaveBeenCalled();
    expect(runtime.runGitPushForGeneratedArtifacts).not.toHaveBeenCalled();
    expect(runtime.hasPath).toHaveBeenCalledWith(PREBUILT);

    const lines = callsOf(runtime.logInfo).map((call) => call[0]);
    expect(lines[0]).toBe("Generated: gitpagedocs/ (config-only)");
    expect(lines).toContain("Local layouts generated in themes/ (--layoutconfig).");
    expect(lines.some((line) => String(line).includes("Push mode enabled"))).toBe(false);
    // The report echoes the options as given; only the build input is sanitized.
    expect(lines).toContain("Configured rendering URL: https://acme corp.github.io/ docs /");
  });

  it("writes the Pages workflow through the runtime and pushes when --push is set", async () => {
    const options = makeOptions({ githubOwner: "acme", githubRepo: "docs", shouldPush: true, docsPath: "docs" });
    const runtime = makeConfigOnlyRuntime({ hasPath: vi.fn(() => true) });

    await executeConfigOnly(makeParams(options), runtime);

    expect(runtime.ensureGitHubPagesWorkflow).toHaveBeenCalledTimes(1);
    const [getBranch, writeText, docsPath] = callsOf(runtime.ensureGitHubPagesWorkflow)[0] as [
      () => string,
      (relativePath: string, content: string) => Promise<void>,
      string,
    ];
    expect(docsPath).toBe("docs");
    expect(getBranch()).toBe("main");
    expect(runtime.getCurrentGitBranch).toHaveBeenCalledWith(ROOT);
    await writeText("wf.yml", "content");
    expect(runtime.writeText).toHaveBeenCalledWith(ROOT, "wf.yml", "content");

    expect(runtime.runGitPushForGeneratedArtifacts).toHaveBeenCalledTimes(1);
    const [pushOptions, pushRoot, sanitize] = callsOf(runtime.runGitPushForGeneratedArtifacts)[0] as [
      CliOptions,
      string,
      (value: string) => string,
    ];
    expect(pushOptions).toBe(options);
    expect(pushRoot).toBe(ROOT);
    expect(sanitize(" acme ")).toBe("acme");
    expect(sanitize("bad owner")).toBe("");
    expect(orderOf(runtime.ensureGitHubPagesWorkflow)).toBeLessThan(orderOf(runtime.runGitPushForGeneratedArtifacts));

    const lines = callsOf(runtime.logInfo).map((call) => String(call[0]));
    expect(lines).toContain("Configured rendering URL: https://acme.github.io/docs/");
    expect(lines).toContain("Push mode enabled: committed and pushed gitpagedocs/ + workflow to origin.");
    expect(lines).toContain("`prebuilt/` detected, but ignored by config-only generator.");
  });

  it("passes an empty docs path to the workflow when none was given", async () => {
    const runtime = makeConfigOnlyRuntime();
    await executeConfigOnly(makeParams(makeOptions({ githubOwner: "acme", githubRepo: "docs", shouldPush: true })), runtime);
    expect(callsOf(runtime.ensureGitHubPagesWorkflow)[0][2]).toBe("");
  });
});

describe("config-only reporter", () => {
  it("reports every optional section only when its flag is set", () => {
    const quiet = reportAll(makeOptions(), false);
    expect(quiet).toEqual([
      "Generated: gitpagedocs/ (config-only)",
      "UI strings: gitpagedocs/langs/{en,pt,es}.json (enable/disable each language in gitpagedocs/config.json -> site.languages)",
      "No index.html/index.js generated.",
      "Using official remote layouts config by default (no local gitpagelayouts/ generated).",
    ]);

    const verbose = reportAll(
      makeOptions({ shouldPush: true, isBuild: true, mode: "full", githubOwner: "acme", githubRepo: "docs", useLocalLayoutConfig: true }),
      true,
    );
    expect(verbose).toEqual([
      "Generated: gitpagedocs/ (config-only)",
      "UI strings: gitpagedocs/langs/{en,pt,es}.json (enable/disable each language in gitpagedocs/config.json -> site.languages)",
      "No index.html/index.js generated.",
      "Local layouts generated in gitpagelayouts/ (--layoutconfig).",
      "Configured rendering URL: https://acme.github.io/docs/",
      "Official viewer remains available: https://vidigal-code.github.io/git-page-docs/acme/docs?modetheme=light&lang=pt",
      "Generated: .github/workflows/gitpagedocs-pages.yml",
      "Push mode enabled: committed and pushed gitpagedocs/ + workflow to origin.",
      "`--build` keeps compatibility flag but output remains gitpagedocs/.",
      "External commands were skipped (no prebuilt copy and no local serve spawn).",
      "`prebuilt/` detected, but ignored by config-only generator.",
    ]);
  });

  it("mentions the skipped external commands for --serve too", () => {
    expect(reportAll(makeOptions({ isServe: true }), false)).toContain(
      "External commands were skipped (no prebuilt copy and no local serve spawn).",
    );
  });

  it("only reports a rendering URL when owner and repo are both present", () => {
    expect(reportRenderingUrl(makeOptions({ githubOwner: "acme" }))).toEqual([]);
    expect(reportRenderingUrl(makeOptions({ githubRepo: "docs" }))).toEqual([]);
    expect(reportRenderingUrl(makeOptions({ githubOwner: "acme", githubRepo: "docs" }))[0]).toContain("https://acme.github.io/docs/");
  });

  it("normalizes the layouts folder it reports", () => {
    expect(reportLayoutConfig(makeOptions({ useLocalLayoutConfig: true, layoutsDir: "/my/themes/" }))).toEqual([
      "Local layouts generated in my/themes/ (--layoutconfig).",
    ]);
    expect(reportLayoutConfig(makeOptions({ layoutsDir: "" }))).toEqual([
      "Using official remote layouts config by default (no local gitpagelayouts/ generated).",
    ]);
  });
});

describe("dispatchMode", () => {
  function makeRunner(): CliCommandRunner {
    return { runConfigOnly: vi.fn(async () => {}), runHome: vi.fn(async () => {}), runAi: vi.fn(async () => {}) };
  }

  const params: CliRuntimeParams = {
    root: ROOT,
    pkgRoot: PKG_ROOT,
    prebuiltDir: PREBUILT,
    buildConfigArtifacts: () => ARTIFACTS,
    createThemeTemplate: () => ({}),
    layouts: [],
  };

  it("routes the ai mode to the ai runner with the options merged in", async () => {
    const runner = makeRunner();
    const options = makeOptions({ mode: "ai", aiCommand: "docs" });
    await dispatchMode(options, params, runner);
    expect(runner.runAi).toHaveBeenCalledWith({ ...params, options });
    expect(runner.runHome).not.toHaveBeenCalled();
    expect(runner.runConfigOnly).not.toHaveBeenCalled();
  });

  it("routes the home mode to the home runner", async () => {
    const runner = makeRunner();
    const options = makeOptions({ mode: "home" });
    await dispatchMode(options, params, runner);
    expect(runner.runHome).toHaveBeenCalledWith({ ...params, options });
    expect(runner.runAi).not.toHaveBeenCalled();
    expect(runner.runConfigOnly).not.toHaveBeenCalled();
  });

  it.each(["config-only", "full"] as const)("routes the %s mode to the config-only runner", async (mode) => {
    const runner = makeRunner();
    const options = makeOptions({ mode });
    await dispatchMode(options, params, runner);
    expect(runner.runConfigOnly).toHaveBeenCalledWith({ ...params, options });
    expect(runner.runAi).not.toHaveBeenCalled();
    expect(runner.runHome).not.toHaveBeenCalled();
  });
});
