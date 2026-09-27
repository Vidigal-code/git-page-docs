import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NodeCryptoService, deriveDocAccessKeys } from "@gitpagedocs/tools";

interface AskPasswordOptions {
  message: string;
  validate?: (value: string) => string | undefined;
}

const clack = vi.hoisted(() => ({
  askPassword: vi.fn<(options: { message: string; validate?: (value: string) => string | undefined }) => Promise<string>>(),
  note: vi.fn<(message: string, title?: string) => void>(),
  outro: vi.fn<(message: string) => void>(),
}));
vi.mock("../../presentation/ui/clack", () => clack);

const prompts = vi.hoisted(() => ({ interactivePromptsAvailable: vi.fn<() => boolean>() }));
vi.mock("../../presentation/ui/prompts", () => prompts);

import { runPassword } from "../../presentation/commands/password";
import type { CommandContext } from "../../presentation/commands/run-command";

let cwd: string;
let logged: string[];

function context(): CommandContext {
  return { argv: ["node", "gitpagedocs", "password"], args: ["password"], pkgRoot: cwd, cwd };
}

function writeConfig(): string {
  mkdirSync(path.join(cwd, "gitpagedocs"), { recursive: true });
  const configPath = path.join(cwd, "gitpagedocs", "config.json");
  writeFileSync(configPath, JSON.stringify({ site: { name: "Docs" }, other: 1 }), "utf-8");
  return configPath;
}

function output(): string {
  return logged.join("\n");
}

beforeEach(() => {
  cwd = mkdtempSync(path.join(os.tmpdir(), "gpd-password-"));
  logged = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.map(String).join(" "));
  });
  clack.askPassword.mockReset();
  clack.note.mockReset();
  clack.outro.mockReset();
  prompts.interactivePromptsAvailable.mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(cwd, { recursive: true, force: true });
});

describe("runPassword", () => {
  it("refuses to run outside a terminal", async () => {
    prompts.interactivePromptsAvailable.mockReturnValue(false);

    await runPassword(context());

    expect(output()).toContain("`gitpagedocs password` is interactive");
    expect(clack.askPassword).not.toHaveBeenCalled();
  });

  it("stores the public key in config.json and prints the private key", async () => {
    const configPath = writeConfig();
    clack.askPassword.mockResolvedValueOnce("hunter22").mockResolvedValueOnce("hunter22");
    const expected = await deriveDocAccessKeys("hunter22", new NodeCryptoService());

    await runPassword(context());

    const config = JSON.parse(readFileSync(configPath, "utf-8")) as {
      site: { name: string; docsAccess: { enabled: boolean; publicKey: string } };
      other: number;
    };
    expect(config.site.docsAccess).toEqual({ enabled: true, publicKey: expected.publicKey });
    expect(config.site.name).toBe("Docs");
    expect(config.other).toBe(1);
    expect(clack.note).toHaveBeenCalledWith(expect.stringContaining(`Public key saved to ${configPath}`), "Saved");
    expect(output()).toContain("PRIVATE KEY");
    expect(output()).toContain(`    ${expected.privateKey}`);
    expect(output()).not.toContain("hunter22");
    expect(clack.outro).toHaveBeenCalledWith("Done.");
  });

  it("validates the password length and requires a confirmation", async () => {
    writeConfig();
    clack.askPassword.mockResolvedValueOnce("abcd").mockResolvedValueOnce("abcd");

    await runPassword(context());

    const [first, second] = clack.askPassword.mock.calls.map((call) => call[0] as AskPasswordOptions);
    expect(first.message).toBe("Documentation password:");
    expect(first.validate?.("abc")).toBe("Use at least 4 characters.");
    expect(first.validate?.("   a")).toBe("Use at least 4 characters.");
    expect(first.validate?.("abcd")).toBeUndefined();
    expect(second.message).toBe("Confirm password:");
    expect(second.validate?.("")).toBe("Required.");
    expect(second.validate?.("x")).toBeUndefined();
  });

  it("aborts when the confirmation does not match", async () => {
    const configPath = writeConfig();
    const before = readFileSync(configPath, "utf-8");
    clack.askPassword.mockResolvedValueOnce("hunter22").mockResolvedValueOnce("hunter23");

    await runPassword(context());

    expect(clack.note).toHaveBeenCalledWith("Passwords do not match. Nothing was changed.", "Aborted");
    expect(readFileSync(configPath, "utf-8")).toBe(before);
    expect(output()).not.toContain("PRIVATE KEY");
  });

  it("reports when there is no config.json to patch", async () => {
    clack.askPassword.mockResolvedValueOnce("hunter22").mockResolvedValueOnce("hunter22");

    await runPassword(context());

    expect(clack.note).toHaveBeenCalledWith(expect.stringContaining("config.json not found"), "Could not save");
    expect(output()).not.toContain("PRIVATE KEY");
    expect(clack.outro).not.toHaveBeenCalled();
  });
});
