import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  NON_INTERACTIVE_FLAGS,
  interactivePromptsAvailable,
  promptingEnabled,
  promptingOptedOut,
} from "../../presentation/ui/tty";
import { printBanner, printCredits } from "../../presentation/ui/banner";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as loggerRuntime from "../../ui/logger.mjs";

const { logSuccess, logInfo } = loggerRuntime as { logSuccess(msg: string): void; logInfo(msg: string): void };

const originalStdinTty = process.stdin.isTTY;

function setStdinTty(isTTY: boolean | undefined): void {
  Object.defineProperty(process.stdin, "isTTY", { value: isTTY, configurable: true, writable: true });
}

let logged: string[];

beforeEach(() => {
  logged = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.map(String).join(" "));
  });
  vi.stubEnv("CI", "");
  vi.stubEnv("GITHUB_ACTIONS", "");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  setStdinTty(originalStdinTty);
});

describe("terminal capability detection", () => {
  it("allows prompts on an interactive stdin outside CI", () => {
    setStdinTty(true);
    expect(interactivePromptsAvailable()).toBe(true);
    expect(promptingEnabled([])).toBe(true);
  });

  it("refuses prompts when stdin is not a TTY", () => {
    setStdinTty(undefined);
    expect(interactivePromptsAvailable()).toBe(false);
    expect(promptingEnabled([])).toBe(false);
  });

  it.each(["CI", "GITHUB_ACTIONS"])("refuses prompts when %s=true", (flag) => {
    setStdinTty(true);
    vi.stubEnv(flag, "true");
    expect(interactivePromptsAvailable()).toBe(false);
  });

  it("ignores CI flags that are not exactly true", () => {
    setStdinTty(true);
    vi.stubEnv("CI", "1");
    expect(interactivePromptsAvailable()).toBe(true);
  });

  it.each([...NON_INTERACTIVE_FLAGS])("treats %s as an explicit opt-out", (flag) => {
    setStdinTty(true);
    expect(promptingOptedOut(["--build", flag])).toBe(true);
    expect(promptingEnabled(["--build", flag])).toBe(false);
  });

  it("does not treat other flags as an opt-out", () => {
    expect(promptingOptedOut(["--interactive", "-i", "--build"])).toBe(false);
  });
});

describe("banner", () => {
  it("prints the banner block", () => {
    printBanner();
    expect(logged).toEqual([
      "",
      "  Git Page Docs",
      "  by Vidigal-code",
      "  https://github.com/Vidigal-code/git-page-docs",
      "",
    ]);
  });

  it("prints the credits block", () => {
    printCredits();
    expect(logged).toEqual(["", "  Powered by Vidigal-code - git-page-docs", ""]);
  });
});

describe("logger", () => {
  it("formats success and info lines consistently", () => {
    logSuccess("done");
    logInfo("note");
    expect(logged).toEqual(["  [ok] done", "  note"]);
  });
});
