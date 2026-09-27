import { describe, it, expect, afterEach } from "vitest";
import type { ChildProcess, ExecFileSyncOptions, SpawnOptions } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as execRuntime from "../runtime/exec.mjs";

/** Public contract of cli/runtime/exec.mjs, mirrored from its JSDoc. */
interface ExecRuntime {
  resolveExecutable(name: string, options?: { env?: NodeJS.ProcessEnv }): string;
  runExecutable(name: string, args?: readonly string[], options?: ExecFileSyncOptions): Buffer | string;
  runExecutableCapture(name: string, args?: readonly string[], options?: ExecFileSyncOptions): string;
  spawnExecutable(name: string, args?: readonly string[], options?: SpawnOptions): ChildProcess;
}

const { resolveExecutable, runExecutable, runExecutableCapture, spawnExecutable } = execRuntime as ExecRuntime;

const IS_WINDOWS = process.platform === "win32";
const DEFAULT_PATHEXT = ".COM;.EXE;.BAT;.CMD";
const MISSING_PROGRAM = "gitpagedocs-definitely-missing-tool-xyz";

const temporaryRoots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-exec-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

/** Create a file the resolver treats as an executable on the current platform. */
function createExecutable(directory: string, name: string, body = ""): string {
  const file = path.join(directory, IS_WINDOWS ? `${name}.exe` : name);
  writeFileSync(file, body);
  if (!IS_WINDOWS) chmodSync(file, 0o755);
  return file;
}

/** Minimal lookup environment whose PATH lists `directories` in order. */
function lookupEnv(directories: string[]): NodeJS.ProcessEnv {
  const joined = directories.join(path.delimiter);
  return IS_WINDOWS ? { Path: joined, PATHEXT: DEFAULT_PATHEXT } : { PATH: joined };
}

/**
 * `process.env` with every spelling of PATH/PATHEXT removed and replaced by
 * the given values. Keeps SystemRoot/ComSpec etc., which cmd.exe needs.
 */
function launchEnv(directory: string, pathext: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    const upper = key.toUpperCase();
    if (upper !== "PATH" && upper !== "PATHEXT") env[key] = value;
  }
  return { ...env, Path: directory, PATHEXT: pathext };
}

function expectSamePath(actual: string, expected: string): void {
  if (IS_WINDOWS) {
    expect(actual.toLowerCase()).toBe(expected.toLowerCase());
  } else {
    expect(actual).toBe(expected);
  }
}

function waitForClose(child: ChildProcess): Promise<{ code: number | null; stdout: string }> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout }));
  });
}

describe("resolveExecutable", () => {
  it("resolves node to an absolute existing file", () => {
    const resolved = resolveExecutable("node");
    expect(path.isAbsolute(resolved)).toBe(true);
    expect(existsSync(resolved)).toBe(true);
    expect(path.basename(resolved).toLowerCase()).toMatch(/^node(\.exe)?$/);
  });

  it("rejects an empty or non-string program name", () => {
    expect(() => resolveExecutable("")).toThrow(TypeError);
    expect(() => resolveExecutable("   ")).toThrow(TypeError);
    expect(() => resolveExecutable(undefined as unknown as string)).toThrow(TypeError);
    expect(() => resolveExecutable(42 as unknown as string)).toThrow(/non-empty program name/);
  });

  it("throws an actionable error naming the missing program", () => {
    expect(() => resolveExecutable(MISSING_PROGRAM)).toThrow(/was not found on PATH/);
    expect(() => resolveExecutable(MISSING_PROGRAM)).toThrow(MISSING_PROGRAM);
  });

  it("finds nothing when PATH is absent or empty", () => {
    expect(() => resolveExecutable("node", { env: {} })).toThrow(/was not found on PATH/);
    expect(() => resolveExecutable("node", { env: { PATH: "" } })).toThrow(/was not found on PATH/);
  });

  it("resolves an existing path that contains a separator without searching PATH", () => {
    const file = createExecutable(makeRoot(), "direct");
    expect(resolveExecutable(file, { env: {} })).toBe(path.resolve(file));
  });

  it("rejects a missing path that contains a separator", () => {
    const missing = path.join(makeRoot(), "nope", "tool");
    expect(() => resolveExecutable(missing)).toThrow(/is not an executable file/);
    expect(() => resolveExecutable(missing)).toThrow(path.resolve(missing));
    expect(() => resolveExecutable(`.${path.sep}${MISSING_PROGRAM}${path.sep}tool`)).toThrow(/is not an executable file/);
  });

  it("rejects a directory even when its name looks like the program", () => {
    const root = makeRoot();
    const directory = path.join(root, IS_WINDOWS ? "tool.exe" : "tool");
    mkdirSync(directory);
    expect(() => resolveExecutable(directory)).toThrow(/is not an executable file/);
    expect(() => resolveExecutable("tool", { env: lookupEnv([root]) })).toThrow(/was not found on PATH/);
  });

  it("walks PATH directories in order and skips empty entries", () => {
    const first = makeRoot();
    const second = makeRoot();
    createExecutable(first, "tool");
    const winner = createExecutable(second, "tool");

    expectSamePath(resolveExecutable("tool", { env: lookupEnv([second, first]) }), winner);
    expectSamePath(resolveExecutable("tool", { env: lookupEnv(["", second, "", first, ""]) }), winner);
    expectSamePath(resolveExecutable("tool", { env: lookupEnv([makeRoot(), second]) }), winner);
  });

  describe.runIf(IS_WINDOWS)("PATHEXT lookup on Windows", () => {
    function createShims(): { root: string; exe: string; cmd: string } {
      const root = makeRoot();
      const exe = path.join(root, "tool.exe");
      const cmd = path.join(root, "tool.cmd");
      writeFileSync(exe, "");
      writeFileSync(cmd, "@echo off\r\n");
      return { root, exe, cmd };
    }

    it("reads PATH case-insensitively and tries extensions in PATHEXT order", () => {
      const { root, exe, cmd } = createShims();
      expectSamePath(resolveExecutable("tool", { env: { Path: root, PATHEXT: DEFAULT_PATHEXT } }), exe);
      expectSamePath(resolveExecutable("tool", { env: { Path: root, PATHEXT: ".CMD;.EXE" } }), cmd);
      expectSamePath(resolveExecutable("tool", { env: { path: root, pathext: ".cmd;.exe" } }), cmd);
    });

    it("resolves a name that already carries an executable extension directly", () => {
      const { root, exe, cmd } = createShims();
      expectSamePath(resolveExecutable("tool.cmd", { env: { Path: root, PATHEXT: DEFAULT_PATHEXT } }), cmd);
      expectSamePath(resolveExecutable("tool.exe", { env: { Path: root, PATHEXT: DEFAULT_PATHEXT } }), exe);
      expectSamePath(resolveExecutable("TOOL.EXE", { env: { Path: root, PATHEXT: DEFAULT_PATHEXT } }), exe);
    });

    it("only treats extensions listed in PATHEXT as executable", () => {
      const { root } = createShims();
      expect(() => resolveExecutable("tool.cmd", { env: { Path: root, PATHEXT: ".EXE" } })).toThrow(
        /was not found on PATH/,
      );
    });

    it("ignores PATHEXT entries Windows cannot launch and falls back to the defaults", () => {
      const { root, exe } = createShims();
      expectSamePath(resolveExecutable("tool", { env: { Path: root, PATHEXT: ".JS;.VBS" } }), exe);
      expectSamePath(resolveExecutable("tool", { env: { Path: root, PATHEXT: "" } }), exe);
      expectSamePath(resolveExecutable("tool", { env: { Path: root } }), exe);
      expectSamePath(
        resolveExecutable("tool", { env: { Path: root, PATHEXT: " .js ; .cmd " } }),
        path.join(root, "tool.cmd"),
      );
    });

    it("never matches a bare file without an executable extension", () => {
      const root = makeRoot();
      writeFileSync(path.join(root, "tool"), "");
      expect(() => resolveExecutable("tool", { env: { Path: root, PATHEXT: DEFAULT_PATHEXT } })).toThrow(
        /was not found on PATH/,
      );
    });
  });

  describe.runIf(!IS_WINDOWS)("execute-bit lookup on POSIX", () => {
    it("resolves only files that carry an execute bit", () => {
      const root = makeRoot();
      const runnable = path.join(root, "runnable");
      const plain = path.join(root, "plain");
      writeFileSync(runnable, "#!/bin/sh\nexit 0\n");
      chmodSync(runnable, 0o755);
      writeFileSync(plain, "#!/bin/sh\nexit 0\n");
      chmodSync(plain, 0o644);

      expect(resolveExecutable("runnable", { env: { PATH: root } })).toBe(runnable);
      expect(() => resolveExecutable("plain", { env: { PATH: root } })).toThrow(/was not found on PATH/);
      expect(() => resolveExecutable(plain)).toThrow(/is not an executable file/);
    });

    it("does not append Windows extensions", () => {
      const root = makeRoot();
      const file = path.join(root, "tool.exe");
      writeFileSync(file, "#!/bin/sh\nexit 0\n");
      chmodSync(file, 0o755);
      expect(() => resolveExecutable("tool", { env: { PATH: root, PATHEXT: ".EXE" } })).toThrow(/was not found on PATH/);
      expect(resolveExecutable("tool.exe", { env: { PATH: root } })).toBe(file);
    });
  });
});

describe("runExecutable", () => {
  it("returns stdout as a Buffer when piped", () => {
    const output = runExecutable("node", ["-e", "process.stdout.write('hello')"], { stdio: "pipe" });
    expect(Buffer.isBuffer(output)).toBe(true);
    expect(output.toString()).toContain("hello");
  });

  it("returns a string when an encoding is requested", () => {
    const output = runExecutable("node", ["-e", "process.stdout.write('typed')"], { stdio: "pipe", encoding: "utf8" });
    expect(typeof output).toBe("string");
    expect(output).toBe("typed");
  });

  it("passes arguments as discrete argv entries, never through a shell", () => {
    const probes = ["a b", "$HOME", "%PATH%", "'single'", "a&&b", "<>|"];
    const output = runExecutableCapture("node", [
      "-e",
      "process.stdout.write(JSON.stringify(process.argv.slice(1)))",
      ...probes,
    ]);
    expect(JSON.parse(output)).toEqual(probes);
  });

  it("honours cwd and env options", () => {
    const root = makeRoot();
    const cwd = runExecutableCapture("node", ["-e", "process.stdout.write(process.cwd())"], { cwd: root });
    expect(realpathSync(cwd)).toBe(realpathSync(root));

    const marker = runExecutableCapture("node", ["-e", "process.stdout.write(String(process.env.GPD_EXEC_TEST))"], {
      env: { ...process.env, GPD_EXEC_TEST: "marker-value" },
    });
    expect(marker).toBe("marker-value");
  });

  it("throws with the exit status on a non-zero exit", () => {
    let caught: unknown;
    try {
      runExecutable("node", ["-e", "process.exit(3)"], { stdio: "pipe" });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as { status?: number }).status).toBe(3);
  });

  it("throws before spawning when the program is missing", () => {
    expect(() => runExecutable(MISSING_PROGRAM, ["--version"], { stdio: "ignore" })).toThrow(/was not found on PATH/);
  });
});

describe("runExecutableCapture", () => {
  it("returns trimmed stdout", () => {
    expect(runExecutableCapture("node", ["-e", "process.stdout.write('hello')"])).toBe("hello");
    expect(runExecutableCapture("node", ["-e", "process.stdout.write('  padded \\n\\n')"])).toBe("padded");
  });

  it("keeps stderr out of the captured output", () => {
    const captured = runExecutableCapture("node", ["-e", "console.error('noise'); console.log('visible')"]);
    expect(captured).toBe("visible");
  });

  it("merges caller options over the piped default", () => {
    const withStdio = runExecutableCapture("node", ["-e", "console.error('noise'); console.log('visible')"], {
      stdio: ["ignore", "pipe", "ignore"],
    });
    expect(withStdio).toBe("visible");
    // execFileSync surfaces a maxBuffer overflow as ENOBUFS (older Node versions mention maxBuffer).
    expect(() =>
      runExecutableCapture("node", ["-e", "process.stdout.write('x'.repeat(4096))"], { maxBuffer: 16 }),
    ).toThrow(/ENOBUFS|maxBuffer/);
  });

  it("propagates a non-zero exit", () => {
    expect(() => runExecutableCapture("node", ["-e", "process.exit(2)"])).toThrow();
  });
});

describe("spawnExecutable", () => {
  it("spawns the resolved program and exits with the child's code", async () => {
    const child = spawnExecutable("node", ["-e", "process.exit(0)"], { stdio: "ignore" });
    const code = await new Promise<number | null>((resolve) => child.on("exit", resolve));
    expect(code).toBe(0);
  });

  it("reports a non-zero exit code", async () => {
    const child = spawnExecutable("node", ["-e", "process.exit(7)"], { stdio: "ignore" });
    const { code } = await waitForClose(child);
    expect(code).toBe(7);
  });

  it("streams stdout when piped and keeps arguments intact", async () => {
    const child = spawnExecutable("node", ["-e", "process.stdout.write(process.argv[1])", "spawned value"], {
      stdio: "pipe",
    });
    const { code, stdout } = await waitForClose(child);
    expect(code).toBe(0);
    expect(stdout).toBe("spawned value");
  });

  it("throws synchronously when the program is missing", () => {
    expect(() => spawnExecutable(MISSING_PROGRAM)).toThrow(/was not found on PATH/);
  });
});

describe.runIf(IS_WINDOWS)(".cmd launchers on Windows", () => {
  function createEchoLauncher(): { root: string; env: NodeJS.ProcessEnv } {
    const root = makeRoot();
    writeFileSync(path.join(root, "echoargs.cmd"), "@echo off\r\necho %1 %2\r\n");
    return { root, env: launchEnv(root, ".CMD") };
  }

  it("runs a .cmd through cmd.exe with each argument quoted", () => {
    const { env } = createEchoLauncher();
    const output = runExecutableCapture("echoargs", ["alpha", "beta gamma"], { env });
    expect(output).toContain("alpha");
    expect(output).toContain("beta gamma");
  });

  it("resolves the launcher through the case-insensitive Path entry", () => {
    const { root, env } = createEchoLauncher();
    expectSamePath(resolveExecutable("echoargs", { env }), path.join(root, "echoargs.cmd"));
  });

  it("refuses arguments that cmd.exe could not carry safely", () => {
    const { env } = createEchoLauncher();
    expect(() => runExecutableCapture("echoargs", ['say "hi"'], { env })).toThrow(/Cannot pass/);
    expect(() => runExecutableCapture("echoargs", ["line\nbreak"], { env })).toThrow(/Cannot pass/);
    expect(() => runExecutableCapture("echoargs", ["carriage\rreturn"], { env })).toThrow(/Cannot pass/);
    expect(() => spawnExecutable("echoargs", ['"quoted"'], { env, stdio: "ignore" })).toThrow(/Cannot pass/);
  });

  it("spawns a .cmd asynchronously", async () => {
    const { env } = createEchoLauncher();
    const child = spawnExecutable("echoargs", ["one", "two"], { env, stdio: "pipe" });
    const { code, stdout } = await waitForClose(child);
    expect(code).toBe(0);
    expect(stdout).toContain("one");
    expect(stdout).toContain("two");
  });
});
