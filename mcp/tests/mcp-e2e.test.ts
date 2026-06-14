import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server";

/** Canned OpenAI-compatible SSE completion for any chat request. */
function mockFetch(text: string) {
  return vi.fn(async () => new Response(`data: {"choices":[{"delta":{"content":${JSON.stringify(text)}}}]}\n\ndata: [DONE]\n\n`, { status: 200 }));
}

function textOf(r: { content?: Array<{ type: string; text?: string }> }): string {
  return (r.content ?? []).map((c) => c.text ?? "").join("");
}

describe("E2E: MCP server with mocked AI", () => {
  let dir: string;
  let client: Client;
  let realFetch: typeof globalThis.fetch;
  let serverClose: () => Promise<void>;

  beforeEach(async () => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gpd-e2e-mcp-"));
    writeFileSync(path.join(dir, "index.ts"), "export const x = 1;\n", "utf8");
    realFetch = globalThis.fetch;
    process.env.OPENAI_API_KEY = "sk-test-e2e";
    globalThis.fetch = mockFetch("AI OUTPUT") as unknown as typeof globalThis.fetch;

    const server = createServer(dir);
    serverClose = () => server.close();
    client = new Client({ name: "e2e", version: "0.0.0" });
    const [ct, st] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(st), client.connect(ct)]);
  });

  afterEach(async () => {
    await client.close();
    await serverClose();
    globalThis.fetch = realFetch;
    delete process.env.OPENAI_API_KEY;
    rmSync(dir, { recursive: true, force: true });
  });

  it("ask_ai returns the AI completion", async () => {
    const r = await client.callTool({ name: "ask_ai", arguments: { prompt: "hello", provider: "openai" } });
    expect(textOf(r as never)).toContain("AI OUTPUT");
    expect((r as { isError?: boolean }).isError).toBeFalsy();
  });

  it("generate_readme produces text via the AI provider", async () => {
    const r = await client.callTool({ name: "generate_readme", arguments: {} });
    expect(textOf(r as never)).toContain("AI OUTPUT");
  });

  it("write_file → read_file round-trips", async () => {
    await client.callTool({ name: "write_file", arguments: { path: "notes/x.md", content: "hello world" } });
    const read = await client.callTool({ name: "read_file", arguments: { path: "notes/x.md" } });
    expect(textOf(read as never)).toBe("hello world");
    expect(readFileSync(path.join(dir, "notes", "x.md"), "utf8")).toBe("hello world");
  });

  it("update_documentation patches a file's managed region and persists it", async () => {
    writeFileSync(path.join(dir, "DOC.md"), "# Doc\n\nmanual text\n", "utf8");
    const r = await client.callTool({ name: "update_documentation", arguments: { path: "DOC.md" } });
    expect((r as { isError?: boolean }).isError).toBeFalsy();
    const doc = readFileSync(path.join(dir, "DOC.md"), "utf8");
    expect(doc).toContain("manual text"); // preserved
    expect(doc).toContain("gitpagedocs:start"); // managed region added
  });

  it("analyze_repository returns an AI summary of the listing", async () => {
    const r = await client.callTool({ name: "analyze_repository", arguments: {} });
    expect(textOf(r as never)).toContain("AI OUTPUT");
  });
}, 60_000);
