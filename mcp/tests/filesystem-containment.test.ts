import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { createServer } from "../src/server";

const FIXTURE_PREFIX = path.join(os.tmpdir(), "gpd-mcp-containment-");
const EXTERNAL_CONTENT = "# External fixture\nOUTSIDE_MARKER\n";
const providerRequest = vi.fn<typeof fetch>(async () => new Response(
  'data: {"choices":[{"delta":{"content":"Generated documentation"}}]}\n\ndata: [DONE]\n\n',
  { status: 200 },
));
let fixture: string;
let root: string;
let outside: string;
let client: Client;
let server: ReturnType<typeof createServer>;

function toolText(result: unknown): string {
  return CallToolResultSchema.parse(result).content.flatMap((block) => block.type === "text" ? [block.text] : []).join("\n");
}

beforeEach(async () => {
  fixture = mkdtempSync(FIXTURE_PREFIX);
  root = path.join(fixture, "root");
  outside = path.join(fixture, "outside");
  mkdirSync(path.join(root, "docs"), { recursive: true });
  mkdirSync(outside);
  writeFileSync(path.join(outside, "secret.md"), EXTERNAL_CONTENT, "utf8");
  symlinkSync(outside, path.join(root, "docs", "linked"), process.platform === "win32" ? "junction" : "dir");
  providerRequest.mockClear();
  vi.stubEnv("OPENAI_API_KEY", "fixture-key");
  vi.stubGlobal("fetch", providerRequest);
  server = createServer(root);
  client = new Client({ name: "filesystem-containment-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
});

afterEach(async () => {
  await client?.close();
  await server?.close();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  if (!path.resolve(fixture).startsWith(FIXTURE_PREFIX)) throw new Error("Unexpected fixture path");
  rmSync(fixture, { recursive: true, force: true });
});

describe("MCP filesystem containment", () => {
  it("rejects documentation updates through an external directory link before contacting the provider", async () => {
    const result = await client.callTool({ name: "update_documentation", arguments: { path: "docs/linked/secret.md" } });
    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^VALIDATION_ERROR: Path escapes the project root/);
    expect(providerRequest).not.toHaveBeenCalled();
    expect(readFileSync(path.join(outside, "secret.md"), "utf8")).toBe(EXTERNAL_CONTENT);
  });

  it("rejects writes through an external directory link without replacing the external file", async () => {
    const result = await client.callTool({
      name: "write_file",
      arguments: { path: "docs/linked/secret.md", content: "# Replacement\n" },
    });
    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^VALIDATION_ERROR: /);
    expect(readFileSync(path.join(outside, "secret.md"), "utf8")).toBe(EXTERNAL_CONTENT);
  });

  it("rejects new documentation beneath an external directory link before contacting the provider", async () => {
    const result = await client.callTool({
      name: "update_documentation",
      arguments: { path: "docs/linked/new/guide.md" },
    });
    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^VALIDATION_ERROR: Path escapes the project root/);
    expect(providerRequest).not.toHaveBeenCalled();
    expect(existsSync(path.join(outside, "new"))).toBe(false);
    expect(readFileSync(path.join(outside, "secret.md"), "utf8")).toBe(EXTERNAL_CONTENT);
  });

  it("rejects reading an external file through a symbolic link", async () => {
    symlinkSync(path.join(outside, "secret.md"), path.join(root, "linked.md"), "file");
    const result = await client.callTool({ name: "read_file", arguments: { path: "linked.md" } });
    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^VALIDATION_ERROR: Path escapes the project root/);
    expect(toolText(result)).not.toContain(EXTERNAL_CONTENT);
  });

  it("rejects listing an external directory through a link", async () => {
    const result = await client.callTool({
      name: "list_files",
      arguments: { path: "docs/linked", recursive: true },
    });
    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^VALIDATION_ERROR: Path escapes the project root/);
    expect(toolText(result)).not.toContain("secret.md");
  });

  it("searches internal files without returning content from external file links", async () => {
    symlinkSync(path.join(outside, "secret.md"), path.join(root, "linked.md"), "file");
    writeFileSync(path.join(root, "docs", "internal.md"), "# Internal\nOUTSIDE_MARKER inside root\n", "utf8");
    const result = await client.callTool({
      name: "search_project",
      arguments: { query: "OUTSIDE_MARKER", extension: ".md" },
    });
    expect(result.isError).not.toBe(true);
    expect(JSON.parse(toolText(result))).toEqual([
      { file: "docs/internal.md", line: 2, text: "OUTSIDE_MARKER inside root" },
    ]);
  });

  it("rejects creating files beneath an external directory link without creating external directories", async () => {
    const result = await client.callTool({
      name: "write_file",
      arguments: { path: "docs/linked/new/guide.md", content: "# New document\n" },
    });
    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^VALIDATION_ERROR: Path escapes the project root/);
    expect(existsSync(path.join(outside, "new"))).toBe(false);
    expect(readFileSync(path.join(outside, "secret.md"), "utf8")).toBe(EXTERNAL_CONTENT);
  });

  it("rejects writing through a file link without replacing the external file", async () => {
    symlinkSync(path.join(outside, "secret.md"), path.join(root, "linked.md"), "file");
    const result = await client.callTool({
      name: "write_file",
      arguments: { path: "linked.md", content: "# Replacement\n" },
    });
    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^VALIDATION_ERROR: /);
    expect(readFileSync(path.join(outside, "secret.md"), "utf8")).toBe(EXTERNAL_CONTENT);
  });

});
