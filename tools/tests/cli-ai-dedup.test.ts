import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ToolsLlmProvider } from "../../src/cli/infrastructure/llm/tools-llm-provider";
// @ts-expect-error .mjs runtime module
import { detectRepoFromGit } from "../../cli/runtime/git-ops.mjs";

describe("ToolsLlmProvider (CLI AI dedup)", () => {
  let realFetch: typeof globalThis.fetch;
  let lastUrl = "";
  let lastInit: RequestInit | undefined;

  beforeEach(() => {
    realFetch = globalThis.fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  function mock(sse: string): void {
    globalThis.fetch = vi.fn(async (u: string | URL | Request, init?: RequestInit) => {
      lastUrl = String(u);
      lastInit = init;
      return new Response(sse, { status: 200 });
    }) as unknown as typeof globalThis.fetch;
  }

  it("openai: generateDocumentation delegates to the shared core with the doc prompt", async () => {
    mock('data: {"choices":[{"delta":{"content":"DOC"}}]}\n\ndata: [DONE]\n\n');
    const provider = new ToolsLlmProvider("openai", { model: "gpt-4o-mini", apiKey: "sk-x" });
    const out = await provider.generateDocumentation("const x=1;", "Custom writer prompt");
    expect(out).toBe("DOC");
    expect(lastUrl).toContain("openai.com");
    expect(String(lastInit?.body)).toContain("Custom writer prompt");
    expect((lastInit?.headers as Record<string, string>).Authorization).toBe("Bearer sk-x");
  });

  it("claude maps to anthropic (endpoint + x-api-key)", async () => {
    mock('data: {"type":"content_block_delta","delta":{"text":"HI"}}\n\n');
    const provider = new ToolsLlmProvider("claude", { model: "claude-sonnet-4-6", apiKey: "sk-ant" });
    const out = await provider.chat([{ role: "user", content: "hello" }]);
    expect(out).toBe("HI");
    expect(lastUrl).toContain("anthropic.com");
    expect((lastInit?.headers as Record<string, string>)["x-api-key"]).toBe("sk-ant");
  });
});

describe("detectRepoFromGit", () => {
  it("parses the current repo's origin remote", () => {
    // The repo has origin → github.com/Vidigal-code/git-page-docs(.git)
    const repo = detectRepoFromGit(process.cwd()) as { owner: string; repo: string } | null;
    expect(repo).toBeTruthy();
    expect(repo?.repo).toBe("git-page-docs");
  });
});
