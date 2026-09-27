import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CliOptions } from "../../domain/models/cli-options";
import type { CliCommandContext, CliCommandRunner, CliRuntimeParams } from "../../application/ports/cli-runtime-ports";

const mocks = vi.hoisted(() => ({
  printBanner: vi.fn(),
  printCredits: vi.fn(),
  runNewCommand: vi.fn<(argv: string[], pkgRoot: string) => Promise<boolean>>(),
  resolveOptions: vi.fn<(argv: string[], env: NodeJS.ProcessEnv) => Promise<CliOptions>>(),
  dispatchMode: vi.fn<(options: CliOptions, params: CliRuntimeParams, runner: CliCommandRunner) => Promise<void>>(),
  executeConfigOnly: vi.fn(),
  executeHome: vi.fn(),
  runAiCliCommand: vi.fn(),
  buildConfigArtifacts: vi.fn(),
  createThemeTemplate: vi.fn(),
}));

vi.mock("../../presentation/ui/banner", () => ({ printBanner: mocks.printBanner, printCredits: mocks.printCredits }));
vi.mock("../../presentation/options/resolver", () => ({ resolveOptions: mocks.resolveOptions }));
vi.mock("../../presentation/commands/run-command", () => ({ runNewCommand: mocks.runNewCommand }));
vi.mock("../../application/use-cases/dispatch-mode", () => ({ dispatchMode: mocks.dispatchMode }));
vi.mock("../../builders/config-orchestrator.mjs", () => ({ buildConfigArtifacts: mocks.buildConfigArtifacts }));
vi.mock("../../builders/theme-template.mjs", () => ({ createThemeTemplate: mocks.createThemeTemplate }));
vi.mock("../../data/layouts.mjs", () => ({ LAYOUTS: [{ file: "dark.json" }] }));
vi.mock("../../application/config-only/handler.mjs", () => ({ executeConfigOnly: mocks.executeConfigOnly }));
vi.mock("../../application/home/handler.mjs", () => ({ executeHome: mocks.executeHome }));
vi.mock("../../infrastructure/config-only/runtime.mjs", () => ({ createConfigOnlyRuntime: () => ({ kind: "config-only" }) }));
vi.mock("../../infrastructure/home/runtime.mjs", () => ({ createHomeRuntime: () => ({ kind: "home" }) }));
vi.mock("../../ai/application/run-ai-cli-command", () => ({ runAiCliCommand: mocks.runAiCliCommand }));

const CLI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const originalArgv = process.argv;

function options(overrides: Partial<CliOptions> = {}): CliOptions {
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

/** Routes dispatchMode straight to the runner handler for the options' mode. */
function dispatchToRunner(contextOverrides: Partial<CliCommandContext> = {}): void {
  mocks.dispatchMode.mockImplementation(async (opts, params, runner) => {
    const context: CliCommandContext = { ...params, options: opts, ...contextOverrides };
    if (opts.mode === "ai") return runner.runAi(context);
    if (opts.mode === "home") return runner.runHome(context);
    return runner.runConfigOnly(context);
  });
}

/** main() has settled once credits were printed, the run failed, or (banner-less verbs) the command ran. */
function mainSettled(): boolean {
  return mocks.printCredits.mock.calls.length > 0 || process.exitCode === 1;
}

/** Loads the entry point fresh with the given user args and waits for main() to settle. */
async function runEntry(...args: string[]): Promise<void> {
  process.argv = ["node", path.join(CLI_ROOT, "index.mjs"), ...args];
  vi.resetModules();
  await import("../../presentation/index");
  const stdoutOwnedByCommand = args[0] === "mcp" || args[0] === "chat";
  await vi.waitFor(() => {
    const finished = stdoutOwnedByCommand ? mocks.runNewCommand.mock.calls.length > 0 : mainSettled();
    expect(finished).toBe(true);
  });
  // Let the remaining microtasks of main() run before asserting.
  await new Promise((resolve) => setImmediate(resolve));
}

let logged: string[];
let errors: unknown[][];

beforeEach(() => {
  logged = [];
  errors = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.map(String).join(" "));
  });
  vi.spyOn(console, "error").mockImplementation((...parts: unknown[]) => {
    errors.push(parts);
  });
  for (const mock of Object.values(mocks)) mock.mockReset();
  mocks.runNewCommand.mockResolvedValue(false);
  mocks.resolveOptions.mockResolvedValue(options());
  mocks.dispatchMode.mockResolvedValue(undefined);
  process.exitCode = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  process.argv = originalArgv;
  process.exitCode = undefined;
});

describe("cli entry point", () => {
  it("prints the banner and credits around a new-verb command", async () => {
    mocks.runNewCommand.mockResolvedValue(true);

    await runEntry("version");

    expect(mocks.printBanner).toHaveBeenCalledTimes(1);
    expect(mocks.runNewCommand).toHaveBeenCalledWith(process.argv, CLI_ROOT);
    expect(mocks.printCredits).toHaveBeenCalledTimes(1);
    expect(mocks.resolveOptions).not.toHaveBeenCalled();
  });

  it.each(["mcp", "chat"])("keeps stdout clean for %s", async (verb) => {
    mocks.runNewCommand.mockResolvedValue(true);

    await runEntry(verb, "start");

    expect(mocks.printBanner).not.toHaveBeenCalled();
    expect(mocks.printCredits).not.toHaveBeenCalled();
    expect(mocks.runNewCommand).toHaveBeenCalledTimes(1);
  });

  it("runs the config-only flow with the packaged prebuilt dir", async () => {
    dispatchToRunner();

    await runEntry("--build");

    expect(mocks.resolveOptions).toHaveBeenCalledWith(process.argv, process.env);
    const [opts, params] = mocks.dispatchMode.mock.calls[0];
    expect(opts).toEqual(options());
    expect(params).toMatchObject({
      root: process.cwd(),
      pkgRoot: CLI_ROOT,
      prebuiltDir: path.join(CLI_ROOT, "prebuilt"),
      layouts: [{ file: "dark.json" }],
    });
    expect(mocks.executeConfigOnly).toHaveBeenCalledWith(
      expect.objectContaining({ prebuiltDir: path.join(CLI_ROOT, "prebuilt"), options: options() }),
      { kind: "config-only" },
    );
    expect(mocks.printCredits).toHaveBeenCalledTimes(1);
  });

  it("derives the prebuilt dir from pkgRoot when the context lacks one", async () => {
    dispatchToRunner({ prebuiltDir: undefined as unknown as string });

    await runEntry();

    expect(mocks.executeConfigOnly.mock.calls[0][0].prebuiltDir).toBe(path.join(CLI_ROOT, "prebuilt"));
  });

  it("runs the home flow", async () => {
    mocks.resolveOptions.mockResolvedValue(options({ mode: "home" }));
    dispatchToRunner();

    await runEntry("--home");

    expect(mocks.executeHome).toHaveBeenCalledWith(expect.objectContaining({ options: options({ mode: "home" }) }), {
      kind: "home",
    });
  });

  it("runs the AI flow, scaffolding on demand and summarizing the generated pages", async () => {
    mocks.resolveOptions.mockResolvedValue(options({ mode: "ai" }));
    dispatchToRunner();
    mocks.runAiCliCommand.mockImplementation(async (input: { onInfo: (m: string) => void; onScaffold: () => Promise<void> }) => {
      input.onInfo("info line");
      await input.onScaffold();
      return {
        summary: { scannedDirectories: ["src"], skippedDirectories: [], scannedFilesCount: 3, outputs: ["a", "b"], pages: ["overview", "usage"] },
        runConfigScaffold: true,
      };
    });

    await runEntry("ai");

    expect(mocks.runAiCliCommand).toHaveBeenCalledWith(expect.objectContaining({ cwd: process.cwd() }));
    expect(mocks.executeConfigOnly).toHaveBeenCalledWith(
      expect.objectContaining({ prebuiltDir: path.join(CLI_ROOT, "prebuilt") }),
      { kind: "config-only" },
    );
    expect(logged).toContain("[gitpagedocs] Iniciando Módulo de IA na CLI...");
    expect(logged).toContain("info line");
    expect(logged.join("\n")).toContain("Páginas no padrão gitpagedocs: overview, usage");
    expect(logged.join("\n")).toContain("2 arquivos markdown gerados");
    expect(mocks.printCredits).toHaveBeenCalledTimes(1);
  });

  it("explains an empty AI scan and falls back to the pkgRoot prebuilt dir", async () => {
    mocks.resolveOptions.mockResolvedValue(options({ mode: "ai" }));
    dispatchToRunner({ prebuiltDir: undefined as unknown as string });
    mocks.runAiCliCommand.mockResolvedValue({
      summary: { scannedDirectories: [], skippedDirectories: ["src"], scannedFilesCount: 0, outputs: [] },
      runConfigScaffold: false,
    });

    await runEntry("ai");

    expect(logged).toContain("[gitpagedocs:ai] Nenhum arquivo elegível foi encontrado nos paths informados.");
    expect(logged.join("\n")).not.toContain("Processo completo");
    expect(mocks.printCredits).toHaveBeenCalledTimes(1);
  });

  it("prints a summary even when the AI run wired no pages", async () => {
    mocks.resolveOptions.mockResolvedValue(options({ mode: "ai" }));
    dispatchToRunner();
    mocks.runAiCliCommand.mockResolvedValue({
      summary: { scannedDirectories: ["src"], skippedDirectories: [], scannedFilesCount: 1, outputs: [] },
      runConfigScaffold: false,
    });

    await runEntry("ai");

    expect(logged.join("\n")).toContain("Páginas no padrão gitpagedocs: (nenhuma)");
  });

  it("reports a failure and sets a non-zero exit code", async () => {
    mocks.runNewCommand.mockRejectedValue(new Error("exploded"));

    await runEntry("doctor");

    expect(process.exitCode).toBe(1);
    expect(errors[0][0]).toBe("Failed to create Git Page Docs scaffold.");
    expect(String(errors[0][1])).toContain("exploded");
    expect(mocks.printCredits).not.toHaveBeenCalled();
  });
});
