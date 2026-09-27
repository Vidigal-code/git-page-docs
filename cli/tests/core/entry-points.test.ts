import { describe, it, expect, vi, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import path from "node:path";

/**
 * Both entry points act at import time (they launch a child process), so the
 * process helpers are mocked and each test imports a fresh module instance.
 */
const mocks = vi.hoisted(() => ({
  spawnExecutable: vi.fn(),
  spawnSync: vi.fn(),
}));

vi.mock("../../runtime/exec.mjs", () => ({ spawnExecutable: mocks.spawnExecutable }));
vi.mock("node:child_process", async (importOriginal) => ({
  ...(await importOriginal<typeof import("node:child_process")>()),
  spawnSync: mocks.spawnSync,
}));

const previousExitCode = process.exitCode;

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  mocks.spawnExecutable.mockReset();
  mocks.spawnSync.mockReset();
  process.exitCode = previousExitCode;
});

async function importStart(): Promise<void> {
  // @ts-expect-error .mjs entry point is type-less in this package.
  await import("../../start.mjs");
}

async function importIndex(): Promise<void> {
  // @ts-expect-error .mjs entry point is type-less in this package.
  await import("../../index.mjs");
}

describe("cli/start.mjs", () => {
  it("starts `next start` for the frontend with repository search on and mirrors the child's exit code", async () => {
    const child = new EventEmitter();
    mocks.spawnExecutable.mockReturnValue(child);
    const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as unknown as typeof process.exit);

    await importStart();

    expect(mocks.spawnExecutable).toHaveBeenCalledTimes(1);
    expect(mocks.spawnExecutable).toHaveBeenCalledWith(
      "npx",
      ["next", "start", "frontend"],
      expect.objectContaining({ stdio: "inherit", env: expect.objectContaining({ GITPAGEDOCS_REPOSITORY_SEARCH: "true" }) }),
    );
    expect(exit).not.toHaveBeenCalled();

    child.emit("exit", 4);
    expect(exit).toHaveBeenLastCalledWith(4);
    child.emit("exit", null);
    expect(exit).toHaveBeenLastCalledWith(0);
  });

  it("prints the resolver error and exits with 1 when npx cannot be launched", async () => {
    mocks.spawnExecutable.mockImplementation(() => {
      throw new Error("`npx` was not found on PATH.");
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit(1)");
    }) as unknown as typeof process.exit);

    await expect(importStart()).rejects.toThrow("process.exit(1)");

    expect(error).toHaveBeenCalledWith("[gitpagedocs] `npx` was not found on PATH.");
    expect(exit).toHaveBeenCalledWith(1);
  });
});

describe("cli/index.mjs", () => {
  it("re-launches the TypeScript CLI through tsx with the caller's arguments and working directory", async () => {
    mocks.spawnSync.mockReturnValue({ status: 0 });

    await importIndex();

    expect(mocks.spawnSync).toHaveBeenCalledTimes(1);
    const [file, args, options] = mocks.spawnSync.mock.calls[0] as [string, string[], Record<string, unknown>];
    expect(file).toBe(process.execPath);
    expect(args[0]).toBe("--import");
    expect(args[1]).toMatch(/tsx/);
    expect(path.basename(args[2])).toBe("index.ts");
    expect(path.basename(path.dirname(args[2]))).toBe("presentation");
    expect(args.slice(3)).toEqual(process.argv.slice(2));
    expect(options).toMatchObject({ stdio: "inherit", cwd: process.cwd() });
    expect(process.exitCode).toBe(previousExitCode);
  });

  it("propagates a non-zero child status", async () => {
    mocks.spawnSync.mockReturnValue({ status: 3 });
    await importIndex();
    expect(process.exitCode).toBe(3);
  });

  it("reports a launch failure and exits with 1", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.spawnSync.mockReturnValue({ error: new Error("spawn failed"), status: null });

    await importIndex();

    expect(error).toHaveBeenCalledWith(expect.stringContaining("Failed to run TypeScript CLI runtime"), expect.any(Error));
    expect(process.exitCode).toBe(1);
  });
});
