#!/usr/bin/env node
/**
 * MCP integration self-test. Connects a real MCP Client to the gitpagedocs
 * server over an in-process linked transport and exercises the FULL tool and
 * resource surface:
 *
 * 1. Against the repo root (API keys stripped): discovery, every resource,
 *    key-free tools, and the structured-error contract of AI tools.
 * 2. Against a temp project with an injected deterministic provider: every
 *    AI documentation tool on its happy path, provider selection round-trip,
 *    filesystem write/read, managed-region updates, and root-bounding.
 */
import os from "node:os";
import path from "node:path";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { AIProvider, AiProviderId, ProviderConfig } from "@gitpagedocs/tools";
import { createServer } from "../src/server";
import { ServerContext, PROVIDER_ENV_KEYS } from "../src/context";

const FAKE_MARK = "FAKE-DOC";

let failures = 0;
function check(label: string, cond: boolean, detail = ""): void {
  if (cond) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function textOf(result: { content?: Array<{ type: string; text?: string }> }): string {
  return (result.content ?? []).map((c) => c.text ?? "").join("");
}

type ToolResult = { isError?: boolean; content?: Array<{ type: string; text?: string }> };

/** Deterministic provider: echoes the effective model so the selection
 * round-trip (configure_ai_provider -> loadSelection) is observable. */
class FakeProviderContext extends ServerContext {
  override async resolveProvider(
    providerId?: AiProviderId,
    model?: string,
  ): Promise<{ provider: AIProvider; config: ProviderConfig }> {
    const selection = await this.loadSelection();
    const provider: AIProvider = {
      id: "openai",
      capabilities: { streaming: false, vision: false, audio: false },
      async generate(request, config) {
        const last = request.messages[request.messages.length - 1]?.content ?? "";
        return { text: `${FAKE_MARK}[${config.model}] context-bytes=${last.length}`, model: config.model };
      },
      async *stream(): AsyncIterable<string> {
        throw new Error("streaming is not exercised by this self-test");
      },
    };
    return {
      provider,
      config: {
        providerId: providerId ?? selection.provider,
        model: model ?? selection.model ?? "fake-default-model",
      },
    };
  }
}

function stripProviderKeysFromEnv(): void {
  for (const names of Object.values(PROVIDER_ENV_KEYS)) {
    for (const name of names) delete process.env[name];
  }
}

async function connect(server: ReturnType<typeof createServer>): Promise<Client> {
  const client = new Client({ name: "selftest", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

const EXPECTED_TOOLS = [
  "list_files", "read_file", "write_file", "search_project",
  "list_ai_providers", "list_ai_models", "configure_ai_provider", "ask_ai",
  "generate_documentation", "update_documentation", "generate_readme", "generate_api_docs",
  "generate_architecture_docs", "generate_database_docs", "generate_changelog",
  "generate_release_notes", "validate_docs", "analyze_repository", "analyze_project",
  "analyze_source_code",
];
const EXPECTED_RESOURCES = [
  "project://structure", "project://docs", "project://config",
  "project://repository", "project://readme", "project://ai/providers", "project://ai/models",
];

async function testDiscoveryAndKeyFreeSurface(root: string): Promise<void> {
  const server = createServer(root);
  const client = await connect(server);

  console.log("[smoke:mcp] tool & resource discovery");
  const tools = await client.listTools();
  const toolNames = tools.tools.map((t) => t.name);
  check(`exposes ${EXPECTED_TOOLS.length} tools (got ${toolNames.length})`, toolNames.length === EXPECTED_TOOLS.length, toolNames.join(","));
  for (const name of EXPECTED_TOOLS) check(`tool: ${name}`, toolNames.includes(name));

  const resources = await client.listResources();
  const resUris = resources.resources.map((r) => r.uri);
  for (const uri of EXPECTED_RESOURCES) check(`resource: ${uri}`, resUris.includes(uri), resUris.join(","));

  console.log("[smoke:mcp] every resource is readable");
  for (const uri of EXPECTED_RESOURCES) {
    const read = await client.readResource({ uri });
    const body = JSON.stringify(read);
    check(`read ${uri}`, body.length > 2, body.slice(0, 120));
  }

  console.log("[smoke:mcp] key-free tool calls");
  const providers = await client.callTool({ name: "list_ai_providers", arguments: {} });
  const provText = textOf(providers as ToolResult);
  check("list_ai_providers returns 14", (JSON.parse(provText) as unknown[]).length === 14);
  check("list_ai_providers includes anthropic", provText.includes("anthropic"));

  const allModels = await client.callTool({ name: "list_ai_models", arguments: {} });
  check("list_ai_models (all) covers 14 providers", (JSON.parse(textOf(allModels as ToolResult)) as unknown[]).length === 14);
  const oneModels = await client.callTool({ name: "list_ai_models", arguments: { provider: "anthropic" } });
  check("list_ai_models (anthropic) returns models", textOf(oneModels as ToolResult).includes("claude"));

  const files = await client.callTool({ name: "list_files", arguments: { path: "tools/src", recursive: false } });
  check("list_files returns entries", textOf(files as ToolResult).includes("ai/"));

  const search = await client.callTool({
    name: "search_project",
    arguments: { query: "PROVIDER_CATALOG", extension: ".ts" },
  });
  check("search_project finds matches", textOf(search as ToolResult).includes("catalog.ts"));

  console.log("[smoke:mcp] structured errors without API keys");
  const ask = await client.callTool({ name: "ask_ai", arguments: { prompt: "hi", provider: "openai" } });
  check("ask_ai without key returns isError", (ask as ToolResult).isError === true);
  check("ask_ai error names the env var", textOf(ask as ToolResult).includes("OPENAI_API_KEY"));
  const gen = await client.callTool({ name: "generate_documentation", arguments: { path: "package.json" } });
  check("generate_documentation without key returns isError", (gen as ToolResult).isError === true);

  await client.close();
  await server.close();
}

async function testFullAiSurfaceWithFakeProvider(): Promise<void> {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-mcp-"));
  try {
    mkdirSync(path.join(root, "src"), { recursive: true });
    writeFileSync(path.join(root, "src", "sample.ts"), "export const answer = 42;\n", "utf8");
    writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "sample", version: "1.0.0" }), "utf8");
    writeFileSync(path.join(root, "README.md"), "# Sample\n", "utf8");

    const server = createServer(root, new FakeProviderContext(root));
    const client = await connect(server);

    console.log("[smoke:mcp] filesystem round-trip and root-bounding");
    const wrote = await client.callTool({ name: "write_file", arguments: { path: "notes/todo.md", content: "- item\n" } });
    check("write_file creates nested file", textOf(wrote as ToolResult).includes("todo.md"));
    const readBack = await client.callTool({ name: "read_file", arguments: { path: "notes/todo.md" } });
    check("read_file round-trips content", textOf(readBack as ToolResult) === "- item\n");
    const escape = await client.callTool({ name: "read_file", arguments: { path: "../outside.txt" } });
    check("read_file blocks path traversal", (escape as ToolResult).isError === true);

    console.log("[smoke:mcp] provider selection round-trip");
    const configured = await client.callTool({
      name: "configure_ai_provider",
      arguments: { provider: "openai", model: "selected-model" },
    });
    check("configure_ai_provider persists", textOf(configured as ToolResult).includes("selected-model"));
    check("selection file written", existsSync(path.join(root, ".gitpagedocs-mcp.json")));
    const askDefault = await client.callTool({ name: "ask_ai", arguments: { prompt: "hello" } });
    check("ask_ai uses the persisted selection", textOf(askDefault as ToolResult).includes(`${FAKE_MARK}[selected-model]`));
    const askOverride = await client.callTool({ name: "ask_ai", arguments: { prompt: "hello", model: "override-model" } });
    check("ask_ai honors a model override", textOf(askOverride as ToolResult).includes(`${FAKE_MARK}[override-model]`));

    console.log("[smoke:mcp] AI documentation generation (deterministic provider)");
    const FILE_TOOLS = ["generate_documentation", "generate_api_docs", "generate_database_docs", "analyze_source_code"];
    for (const name of FILE_TOOLS) {
      const result = await client.callTool({ name, arguments: { path: "src/sample.ts" } });
      check(`${name} generates`, (result as ToolResult).isError !== true && textOf(result as ToolResult).includes(FAKE_MARK), textOf(result as ToolResult).slice(0, 120));
    }
    const REPO_TOOLS = [
      "generate_readme", "generate_architecture_docs", "analyze_repository",
      "analyze_project", "generate_changelog", "generate_release_notes", "validate_docs",
    ];
    for (const name of REPO_TOOLS) {
      const result = await client.callTool({ name, arguments: {} });
      check(`${name} generates`, (result as ToolResult).isError !== true && textOf(result as ToolResult).includes(FAKE_MARK), textOf(result as ToolResult).slice(0, 120));
    }

    console.log("[smoke:mcp] managed-region documentation update");
    const firstUpdate = await client.callTool({ name: "update_documentation", arguments: { path: "docs/generated.md" } });
    check("update_documentation appends on a new file", textOf(firstUpdate as ToolResult).includes("appended"));
    const secondUpdate = await client.callTool({ name: "update_documentation", arguments: { path: "docs/generated.md" } });
    check("update_documentation replaces the managed region", textOf(secondUpdate as ToolResult).includes("replaced"));
    const updated = await client.callTool({ name: "read_file", arguments: { path: "docs/generated.md" } });
    check("updated file holds the generated content", textOf(updated as ToolResult).includes(FAKE_MARK));

    await client.close();
    await server.close();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  stripProviderKeysFromEnv();
  await testDiscoveryAndKeyFreeSurface(process.cwd());
  await testFullAiSurfaceWithFakeProvider();

  if (failures > 0) {
    console.error(`\n[smoke:mcp] FAILED with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log("\n[smoke:mcp] OK - MCP server verified (20 tools, 7 resources, full AI surface).");
}

main().catch((err) => {
  console.error("[smoke:mcp] crashed:", err);
  process.exit(1);
});
