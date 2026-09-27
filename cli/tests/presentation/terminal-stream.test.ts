import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  ElapsedSpinner,
  accent,
  danger,
  isInteractiveOutput,
  supportsColor,
  writeChrome,
  writeContent,
} from "../../presentation/ui/terminal-stream";

const originalStdoutTty = process.stdout.isTTY;
const originalStderrTty = process.stderr.isTTY;

let stdoutWrites: string[];
let stderrWrites: string[];

function setTty(stream: NodeJS.WriteStream, isTTY: boolean): void {
  Object.defineProperty(stream, "isTTY", { value: isTTY, configurable: true, writable: true });
}

beforeEach(() => {
  stdoutWrites = [];
  stderrWrites = [];
  vi.spyOn(process.stdout, "write").mockImplementation(((chunk: unknown) => {
    stdoutWrites.push(String(chunk));
    return true;
  }) as typeof process.stdout.write);
  vi.spyOn(process.stderr, "write").mockImplementation(((chunk: unknown) => {
    stderrWrites.push(String(chunk));
    return true;
  }) as typeof process.stderr.write);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  setTty(process.stdout, originalStdoutTty);
  setTty(process.stderr, originalStderrTty);
});

describe("content and chrome streams", () => {
  it("writes model content verbatim to stdout", () => {
    writeContent("hello ");
    writeContent("world");
    expect(stdoutWrites).toEqual(["hello ", "world"]);
    expect(stderrWrites).toEqual([]);
  });

  it("writes plain chrome lines to stderr on a pipe", () => {
    setTty(process.stderr, false);
    writeChrome("status");
    expect(stderrWrites).toEqual(["status\n"]);
    expect(accent("x")).toBe("x");
    expect(danger("y")).toBe("y");
    expect(supportsColor()).toBe(false);
  });

  it("dims chrome and colours helpers on a TTY", () => {
    setTty(process.stderr, true);
    writeChrome("status");
    expect(stderrWrites).toEqual(["\x1b[2mstatus\x1b[0m\n"]);
    expect(accent("x")).toBe("\x1b[36mx\x1b[0m");
    expect(danger("y")).toBe("\x1b[31my\x1b[0m");
    expect(supportsColor()).toBe(true);
  });

  it("reports whether stdout is interactive", () => {
    setTty(process.stdout, true);
    expect(isInteractiveOutput()).toBe(true);
    setTty(process.stdout, false);
    expect(isInteractiveOutput()).toBe(false);
  });
});

describe("ElapsedSpinner", () => {
  it("prints a single static line on a pipe and stays silent on stop", () => {
    setTty(process.stderr, false);
    const spinner = new ElapsedSpinner("Thinking");
    spinner.start();
    spinner.stop();
    spinner.stop();
    expect(stderrWrites).toEqual(["Thinking...\n"]);
    expect(spinner.elapsedSeconds()).toBeGreaterThanOrEqual(0);
  });

  it("animates frames with the elapsed time on a TTY and clears the line on stop", () => {
    vi.useFakeTimers();
    setTty(process.stderr, true);
    const spinner = new ElapsedSpinner("Thinking");

    spinner.start();
    expect(stderrWrites).toHaveLength(1);
    expect(stderrWrites[0]).toContain("⠋");
    expect(stderrWrites[0]).toContain("Thinking 0.0s");

    vi.advanceTimersByTime(80);
    expect(stderrWrites).toHaveLength(2);
    expect(stderrWrites[1]).toContain("⠙");
    expect(stderrWrites[1]).toContain("Thinking 0.1s");

    vi.advanceTimersByTime(80 * 9);
    expect(stderrWrites).toHaveLength(11);
    expect(stderrWrites[10]).toContain("⠋");

    spinner.stop();
    expect(stderrWrites.at(-1)).toBe("\r\x1b[K");
    const writesAfterStop = stderrWrites.length;
    vi.advanceTimersByTime(800);
    expect(stderrWrites).toHaveLength(writesAfterStop);
    // 80ms + 9 x 80ms of frames, then 800ms after stop.
    expect(spinner.elapsedSeconds()).toBeCloseTo(1.6, 1);
  });
});
