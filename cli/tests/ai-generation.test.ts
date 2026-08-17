import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { executeAiRunPlan } from "../ai/application/run-ai-cli-command";
import type { AiCliRunPlan } from "../ai/core/models/ai-cli-config";
import type { ILLMProvider } from "../ai/core/ports/illm-provider";
// @ts-expect-error .mjs runtime module is type-less in this package.
import { DOC_VERSIONS } from "../contracts/doc-versions.mjs";

const VERSION_ID = DOC_VERSIONS[DOC_VERSIONS.length - 1] as string;

/** Deterministic provider speaking the gitpagedocs page protocol. */
class FakeLlmProvider implements ILLMProvider {
  readonly prompts: string[] = [];

  async generateDocumentation(_fileContent: string, contextPrompt?: string): Promise<string> {
    this.prompts.push(contextPrompt ?? "");
    const language = /Output language: .*? in (\w+)/.exec(contextPrompt ?? "")?.[1] ?? "English";
    return [
      "=== PAGE: overview | Overview (" + language + ") ===",
      `# Overview\n\nGenerated for ${language}.`,
      "=== PAGE: getting-started | Getting Started (" + language + ") ===",
      `# Getting Started\n\nSteps in ${language}.`,
    ].join("\n");
  }

  async chat(): Promise<string> {
    return "chat-response";
  }
}

function buildPlan(languages: AiCliRunPlan["config"]["ai"]["languages"]): AiCliRunPlan {
  return {
    config: {
      version: 1,
      ai: {
        provider: "openai",
        model: "fake-model",
        apiKey: "fake-key",
        paths: ["src"],
        languages,
        outputDir: "gitpagedocs/docs",
        filePrefix: "ai",
        contextPrompt: "Document the sample project.",
      },
    },
    saveConfig: false,
    runConfigScaffold: false,
  };
}

describe("executeAiRunPlan (full generation pipeline)", () => {
  let cwd: string;
  let provider: FakeLlmProvider;
  const versionConfigPath = () => path.join(cwd, "gitpagedocs", "docs", "versions", VERSION_ID, "config.json");

  beforeEach(() => {
    cwd = mkdtempSync(path.join(os.tmpdir(), "gpd-ai-gen-"));
    mkdirSync(path.join(cwd, "src"), { recursive: true });
    writeFileSync(path.join(cwd, "src", "hello.ts"), "export const hello = () => \"world\";\n", "utf-8");
    mkdirSync(path.dirname(versionConfigPath()), { recursive: true });
    writeFileSync(
      versionConfigPath(),
      JSON.stringify({ "routes-md": [], "menus-header-md": [] }, null, 2),
      "utf-8",
    );
    provider = new FakeLlmProvider();
  });

  afterEach(() => rmSync(cwd, { recursive: true, force: true }));

  it("scans sources, generates per language, writes docs and wires the version config", async () => {
    const summary = await executeAiRunPlan(buildPlan(["en", "pt"]), cwd, () => provider);

    expect(summary.scannedFilesCount).toBe(1);
    expect(summary.skippedDirectories).toEqual([]);
    expect(summary.pages).toEqual(["overview", "getting-started"]);
    // One generation call per selected language, each with its own language prompt.
    expect(provider.prompts).toHaveLength(2);
    expect(provider.prompts[0]).toContain("English");
    expect(provider.prompts[1]).toContain("Portuguese");

    // Markdown written for ALL canonical languages (es reuses a translation).
    for (const lang of ["en", "pt", "es"]) {
      for (const slug of ["overview", "getting-started"]) {
        const file = path.join(cwd, "gitpagedocs", "docs", "versions", VERSION_ID, lang, `${slug}.md`);
        expect(existsSync(file), file).toBe(true);
      }
    }
    expect(readFileSync(path.join(cwd, "gitpagedocs", "docs", "versions", VERSION_ID, "pt", "overview.md"), "utf-8"))
      .toContain("Portuguese");

    // Version config wired with aiGenerated routes + menus in the dedicated id range.
    const config = JSON.parse(readFileSync(versionConfigPath(), "utf-8")) as {
      "routes-md": Array<{ id: number; aiGenerated?: boolean; title: Record<string, string> }>;
      "menus-header-md": Array<{ id: number; aiGenerated?: boolean }>;
    };
    expect(config["routes-md"].map((route) => route.id)).toEqual([1001, 1002]);
    expect(config["routes-md"].every((route) => route.aiGenerated)).toBe(true);
    expect(config["routes-md"][0].title.pt).toBe("Overview (Portuguese)");
    expect(config["menus-header-md"].map((menu) => menu.id)).toEqual([1001, 1002]);
  });

  it("is idempotent: re-running replaces aiGenerated routes instead of duplicating", async () => {
    await executeAiRunPlan(buildPlan(["en"]), cwd, () => provider);
    await executeAiRunPlan(buildPlan(["en"]), cwd, () => provider);

    const config = JSON.parse(readFileSync(versionConfigPath(), "utf-8")) as {
      "routes-md": Array<{ id: number }>;
    };
    expect(config["routes-md"].map((route) => route.id)).toEqual([1001, 1002]);
  });

  it("preserves deterministic base routes while wiring AI routes", async () => {
    const baseRoute = { id: 1, title: { en: "Base" }, path: { en: "x.md" } };
    writeFileSync(
      versionConfigPath(),
      JSON.stringify({ "routes-md": [baseRoute], "menus-header-md": [] }, null, 2),
      "utf-8",
    );

    await executeAiRunPlan(buildPlan(["en"]), cwd, () => provider);

    const config = JSON.parse(readFileSync(versionConfigPath(), "utf-8")) as {
      "routes-md": Array<{ id: number }>;
    };
    expect(config["routes-md"].map((route) => route.id)).toEqual([1, 1001, 1002]);
  });

  it("returns an empty summary when no files match the scanned paths", async () => {
    rmSync(path.join(cwd, "src"), { recursive: true, force: true });
    mkdirSync(path.join(cwd, "src"));

    const summary = await executeAiRunPlan(buildPlan(["en"]), cwd, () => provider);

    expect(summary.scannedFilesCount).toBe(0);
    expect(summary.outputs).toEqual([]);
    expect(provider.prompts).toHaveLength(0);
  });
});
