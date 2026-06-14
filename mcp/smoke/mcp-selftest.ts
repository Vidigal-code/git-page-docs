#!/usr/bin/env node
/**
 * Phase 7 MCP integration self-test. Connects a real MCP Client to the
 * gitpagedocs server over an in-process linked transport and exercises the
 * tool/resource surface that needs no API key (filesystem, AI info, resources).
 * Lives in the mcp package so @modelcontextprotocol/sdk resolves.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server";

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

async function main(): Promise<void> {
  // Run against the repo root (two levels up from mcp/smoke).
  const root = process.cwd();
  const server = createServer(root);
  const client = new Client({ name: "selftest", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  console.log("[smoke:mcp] tool & resource discovery");
  const tools = await client.listTools();
  const toolNames = tools.tools.map((t) => t.name);
  const EXPECTED = [
    "list_files", "read_file", "write_file", "search_project",
    "list_ai_providers", "list_ai_models", "configure_ai_provider", "ask_ai",
    "generate_documentation", "update_documentation", "generate_readme", "generate_api_docs",
    "generate_architecture_docs", "generate_database_docs", "generate_changelog",
    "generate_release_notes", "validate_docs", "analyze_repository", "analyze_project",
    "analyze_source_code",
  ];
  check(`exposes 20 tools (got ${toolNames.length})`, toolNames.length === 20, toolNames.join(","));
  for (const name of EXPECTED) check(`tool: ${name}`, toolNames.includes(name));

  const resources = await client.listResources();
  const resUris = resources.resources.map((r) => r.uri);
  for (const uri of [
    "project://structure", "project://docs", "project://config",
    "project://repository", "project://readme", "project://ai/providers", "project://ai/models",
  ]) {
    check(`resource: ${uri}`, resUris.includes(uri), resUris.join(","));
  }

  console.log("[smoke:mcp] tool calls (no API key needed)");
  const providers = await client.callTool({ name: "list_ai_providers", arguments: {} });
  const provText = textOf(providers as never);
  check("list_ai_providers returns 14", (JSON.parse(provText) as unknown[]).length === 14);
  check("list_ai_providers includes anthropic", provText.includes("anthropic"));

  const files = await client.callTool({ name: "list_files", arguments: { path: "tools/src", recursive: false } });
  check("list_files returns entries", textOf(files as never).includes("ai/"));

  const search = await client.callTool({
    name: "search_project",
    arguments: { query: "PROVIDER_CATALOG", extension: ".ts" },
  });
  check("search_project finds matches", textOf(search as never).includes("catalog.ts"));

  // ask_ai without a key should surface a structured error, not crash.
  const ask = await client.callTool({ name: "ask_ai", arguments: { prompt: "hi", provider: "openai" } });
  check("ask_ai without key returns isError", (ask as { isError?: boolean }).isError === true);

  console.log("[smoke:mcp] resource reads");
  const cfgProviders = await client.readResource({ uri: "project://ai/providers" });
  check("project://ai/providers readable", JSON.stringify(cfgProviders).includes("anthropic"));

  await client.close();
  await server.close();

  if (failures > 0) {
    console.error(`\n[smoke:mcp] FAILED with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log("\n[smoke:mcp] OK - MCP server verified (20 tools, 7 resources).");
}

main().catch((err) => {
  console.error("[smoke:mcp] crashed:", err);
  process.exit(1);
});
