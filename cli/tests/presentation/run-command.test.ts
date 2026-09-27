import { describe, it, expect, beforeEach, vi } from "vitest";

const handlers = vi.hoisted(() => ({
  runVersion: vi.fn(),
  runDoctor: vi.fn(),
  runUpdate: vi.fn(),
  runProvider: vi.fn(),
  runModels: vi.fn(),
  runConfig: vi.fn(),
  runConfigClear: vi.fn(),
  runMcp: vi.fn(),
  runDocs: vi.fn(),
  runPagesActions: vi.fn(),
  runPagesDeploy: vi.fn(),
  runPassword: vi.fn(),
  runChat: vi.fn(),
}));

vi.mock("../../presentation/commands/diagnostics", () => ({
  runVersion: handlers.runVersion,
  runDoctor: handlers.runDoctor,
  runUpdate: handlers.runUpdate,
}));
vi.mock("../../presentation/commands/ai-info", () => ({
  runProvider: handlers.runProvider,
  runModels: handlers.runModels,
}));
vi.mock("../../presentation/commands/config-info", () => ({ runConfig: handlers.runConfig }));
vi.mock("../../presentation/commands/config-clear", () => ({ runConfigClear: handlers.runConfigClear }));
vi.mock("../../presentation/commands/mcp", () => ({ runMcp: handlers.runMcp }));
vi.mock("../../presentation/commands/docs", () => ({ runDocs: handlers.runDocs }));
vi.mock("../../presentation/commands/pages", () => ({
  runPagesActions: handlers.runPagesActions,
  runPagesDeploy: handlers.runPagesDeploy,
}));
vi.mock("../../presentation/commands/password", () => ({ runPassword: handlers.runPassword }));
vi.mock("../../presentation/commands/chat", () => ({ runChat: handlers.runChat }));

import { runNewCommand, NEW_COMMAND_NAMES } from "../../presentation/commands/run-command";

const PKG_ROOT = "/pkg/cli";

function argv(...args: string[]): string[] {
  return ["node", "gitpagedocs", ...args];
}

describe("runNewCommand", () => {
  beforeEach(() => {
    for (const handler of Object.values(handlers)) handler.mockReset();
  });

  it.each([
    ["version", "runVersion"],
    ["--version", "runVersion"],
    ["-v", "runVersion"],
    ["doctor", "runDoctor"],
    ["update", "runUpdate"],
    ["provider", "runProvider"],
    ["providers", "runProvider"],
    ["models", "runModels"],
    ["config", "runConfig"],
    ["mcp", "runMcp"],
    ["docs", "runDocs"],
    ["password", "runPassword"],
    ["chat", "runChat"],
  ] as const)("routes %s to %s with the command context", async (verb, handlerName) => {
    const args = argv(verb, "extra");
    await expect(runNewCommand(args, PKG_ROOT)).resolves.toBe(true);

    const handler = handlers[handlerName];
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      argv: args,
      args: [verb, "extra"],
      pkgRoot: PKG_ROOT,
      cwd: process.cwd(),
    });
    const others = Object.entries(handlers).filter(([name]) => name !== handlerName);
    for (const [, other] of others) expect(other).not.toHaveBeenCalled();
  });

  it("routes --pages-actions and `pages actions` to the Pages configuration handler", async () => {
    await expect(runNewCommand(argv("--build", "--pages-actions"), PKG_ROOT)).resolves.toBe(true);
    await expect(runNewCommand(argv("pages", "actions"), PKG_ROOT)).resolves.toBe(true);
    expect(handlers.runPagesActions).toHaveBeenCalledTimes(2);
    expect(handlers.runPagesDeploy).not.toHaveBeenCalled();
  });

  it("routes `pages deploy` to the deploy handler", async () => {
    await expect(runNewCommand(argv("pages", "deploy", "--owner", "o"), PKG_ROOT)).resolves.toBe(true);
    expect(handlers.runPagesDeploy).toHaveBeenCalledTimes(1);
    expect(handlers.runPagesActions).not.toHaveBeenCalled();
  });

  it("routes `config clear` to the credentials wipe and bare `config` to the summary", async () => {
    await expect(runNewCommand(argv("config", "clear"), PKG_ROOT)).resolves.toBe(true);
    expect(handlers.runConfigClear).toHaveBeenCalledTimes(1);
    expect(handlers.runConfig).not.toHaveBeenCalled();

    await expect(runNewCommand(argv("config"), PKG_ROOT)).resolves.toBe(true);
    expect(handlers.runConfig).toHaveBeenCalledTimes(1);
  });

  it("falls through to the legacy flow for aliases, flags and a bare invocation", async () => {
    for (const args of [argv("init"), argv("pages"), argv("deploy"), argv("--build"), argv()]) {
      await expect(runNewCommand(args, PKG_ROOT)).resolves.toBe(false);
    }
    for (const handler of Object.values(handlers)) expect(handler).not.toHaveBeenCalled();
  });

  it("propagates a handler failure to the caller", async () => {
    handlers.runDoctor.mockRejectedValueOnce(new Error("probe failed"));
    await expect(runNewCommand(argv("doctor"), PKG_ROOT)).rejects.toThrow("probe failed");
  });

  it("lists the verb names without the dashed version aliases", () => {
    expect(NEW_COMMAND_NAMES).toEqual([
      "version",
      "doctor",
      "update",
      "provider",
      "providers",
      "models",
      "config",
      "mcp",
      "docs",
      "password",
      "chat",
    ]);
  });
});
