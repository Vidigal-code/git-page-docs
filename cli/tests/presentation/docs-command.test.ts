import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { runDocs } from "../../presentation/commands/docs";
import type { CommandContext } from "../../presentation/commands/run-command";

const START_MARKER = "<!-- gitpagedocs:start -->";
const END_MARKER = "<!-- gitpagedocs:end -->";

let cwd: string;
let logged: string[];

function context(): CommandContext {
  return { argv: [], args: ["docs"], pkgRoot: cwd, cwd };
}

function output(): string {
  return logged.join("\n");
}

beforeEach(() => {
  cwd = mkdtempSync(path.join(os.tmpdir(), "gpd-docs-cmd-"));
  logged = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.map(String).join(" "));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(cwd, { recursive: true, force: true });
});

describe("runDocs", () => {
  it("creates the three managed docs files and reports them as added", async () => {
    await runDocs(context());

    for (const file of ["README.md", "CONTRIBUTING.md", "SECURITY.md"]) {
      expect(existsSync(path.join(cwd, file)), file).toBe(true);
      expect(output()).toContain(`  ${file}: managed region added.`);
      const content = readFileSync(path.join(cwd, file), "utf-8");
      expect(content).toContain(START_MARKER);
      expect(content).toContain(END_MARKER);
    }
  });

  it("is idempotent: a second run leaves every file untouched", async () => {
    await runDocs(context());
    const before = readFileSync(path.join(cwd, "README.md"), "utf-8");
    logged = [];

    await runDocs(context());

    expect(readFileSync(path.join(cwd, "README.md"), "utf-8")).toBe(before);
    expect(output()).toContain("  README.md: already up to date.");
    expect(output()).toContain("  CONTRIBUTING.md: already up to date.");
    expect(output()).toContain("  SECURITY.md: already up to date.");
  });

  it("replaces a stale managed region while preserving manual content around it", async () => {
    writeFileSync(
      path.join(cwd, "README.md"),
      `# My project\n\n${START_MARKER}\nold generated text\n${END_MARKER}\n\nManual footer.\n`,
      "utf-8",
    );

    await runDocs(context());

    const readme = readFileSync(path.join(cwd, "README.md"), "utf-8");
    expect(output()).toContain("  README.md: managed region updated.");
    expect(readme).toContain("# My project");
    expect(readme).toContain("Manual footer.");
    expect(readme).not.toContain("old generated text");
  });
});
