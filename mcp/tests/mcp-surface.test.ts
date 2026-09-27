import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ALL_PROVIDER_IDS, PROVIDER_CATALOG } from "@gitpagedocs/tools";
import { createServer, SERVER_INFO } from "../src/server";
import { ServerContext, PROVIDER_ENV_KEYS } from "../src/context";

/**
 * Full tool/resource surface of the MCP server against a temp project, with
 * the AI provider answered by a canned OpenAI-compatible SSE response. Covers
 * what mcp-e2e.test.ts leaves out: discovery, catalog tools, provider
 * selection, every resource, the structured error contract and each
 * documentation generator.
 */

type ToolResult = { isError?: boolean; content?: Array<{ type: string; text?: string }> };

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

function textOf(result: unknown): string {
  return ((result as ToolResult).content ?? []).map((c) => c.text ?? "").join("");
}

function isError(result: unknown): boolean {
  return (result as ToolResult).isError === true;
}

function git(cwd: string, ...args: string[]): void {
  execFileSync("git", ["-c", "user.email=tests@example.com", "-c", "user.name=tests", "-c", "commit.gpgsign=false", ...args], {
    cwd,
    stdio: "ignore",
  });
}

/** Temp project with sources, docs, a gitpagedocs config and one commit. */
function makeProject(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "gpd-mcp-surface-"));
  mkdirSync(path.join(dir, "src"), { recursive: true });
  mkdirSync(path.join(dir, "docs"), { recursive: true });
  mkdirSync(path.join(dir, "gitpagedocs"), { recursive: true });
  writeFileSync(path.join(dir, "src", "index.ts"), "export const answer = 42;\nexport const ANSWER_TWICE = answer * 2;\n", "utf8");
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "sample", version: "1.0.0" }), "utf8");
  writeFileSync(path.join(dir, "README.md"), "# Sample project\n", "utf8");
  writeFileSync(path.join(dir, "docs", "guide.md"), "# Guide\n\nThe answer lives in src.\n", "utf8");
  writeFileSync(path.join(dir, "gitpagedocs", "config.json"), JSON.stringify({ site: { name: "Sample docs" } }), "utf8");
  git(dir, "init", "-q", "-b", "main");
  git(dir, "add", ".");
  git(dir, "commit", "-q", "-m", "initial import");
  return dir;
}

/** Canned streaming completion; records every request body it answered. */
function mockFetch(text: string, bodies: string[]) {
  return vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    bodies.push(String(init?.body ?? ""));
    return new Response(`data: {"choices":[{"delta":{"content":${JSON.stringify(text)}}}]}\n\ndata: [DONE]\n\n`, { status: 200 });
  });
}

interface Session {
  client: Client;
  close(): Promise<void>;
}

async function connect(root: string, ctx?: ServerContext): Promise<Session> {
  const server = createServer(root, ctx);
  const client = new Client({ name: "surface", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    client,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}

const savedEnv: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
let dir: string;
let session: Session;

beforeAll(async () => {
  for (const names of Object.values(PROVIDER_ENV_KEYS)) {
    for (const name of names) {
      savedEnv[name] = process.env[name];
      delete process.env[name];
    }
  }
  dir = makeProject();
  session = await connect(dir);
});

afterAll(async () => {
  await session.close();
  rmSync(dir, { recursive: true, force: true });
  for (const [name, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.OPENAI_API_KEY;
});

describe("discovery", () => {
  it("exposes every tool and resource under the server name", async () => {
    expect(SERVER_INFO.name).toBe("gitpagedocs-mcp");
    const tools = (await session.client.listTools()).tools.map((tool) => tool.name);
    expect(tools).toHaveLength(EXPECTED_TOOLS.length);
    for (const name of EXPECTED_TOOLS) expect(tools).toContain(name);

    const resources = (await session.client.listResources()).resources.map((resource) => resource.uri);
    expect(resources).toHaveLength(EXPECTED_RESOURCES.length);
    for (const uri of EXPECTED_RESOURCES) expect(resources).toContain(uri);
  });
});

describe("AI catalog tools", () => {
  it("lists every provider with its label, default model and capabilities", async () => {
    const result = await session.client.callTool({ name: "list_ai_providers", arguments: {} });
    const providers = JSON.parse(textOf(result)) as Array<{ id: string; label: string; defaultModel: string; capabilities: unknown }>;
    expect(providers.map((provider) => provider.id)).toEqual([...ALL_PROVIDER_IDS]);
    expect(providers[0]).toEqual({
      id: ALL_PROVIDER_IDS[0],
      label: PROVIDER_CATALOG[ALL_PROVIDER_IDS[0]].label,
      defaultModel: PROVIDER_CATALOG[ALL_PROVIDER_IDS[0]].defaultModel,
      capabilities: PROVIDER_CATALOG[ALL_PROVIDER_IDS[0]].capabilities,
    });
  });

  it("lists catalog models for one provider or all of them", async () => {
    const one = JSON.parse(textOf(await session.client.callTool({ name: "list_ai_models", arguments: { provider: "anthropic" } }))) as Array<{
      provider: string;
      models: string[];
    }>;
    expect(one).toHaveLength(1);
    expect(one[0].provider).toBe("anthropic");
    expect(one[0].models.some((model) => model.includes("claude"))).toBe(true);

    const all = JSON.parse(textOf(await session.client.callTool({ name: "list_ai_models", arguments: {} }))) as Array<{ provider: string }>;
    expect(all.map((entry) => entry.provider)).toEqual([...ALL_PROVIDER_IDS]);
  });

  it("persists the provider selection with and without a model", async () => {
    const withModel = await session.client.callTool({ name: "configure_ai_provider", arguments: { provider: "gemini", model: "gemini-x" } });
    expect(textOf(withModel)).toBe("Default provider set to gemini (gemini-x).");
    expect(await new ServerContext(dir).loadSelection()).toEqual({ provider: "gemini", model: "gemini-x" });

    const withoutModel = await session.client.callTool({ name: "configure_ai_provider", arguments: { provider: "openai" } });
    expect(textOf(withoutModel)).toBe("Default provider set to openai.");
    expect(await new ServerContext(dir).loadSelection()).toEqual({ provider: "openai" });
    expect(existsSync(path.join(dir, ".gitpagedocs-mcp.json"))).toBe(true);
  });

  it("returns a structured provider error when no API key is configured", async () => {
    const result = await session.client.callTool({ name: "ask_ai", arguments: { prompt: "hi", provider: "openai" } });
    expect(isError(result)).toBe(true);
    expect(textOf(result)).toMatch(/^PROVIDER_ERROR: /);
    expect(textOf(result)).toContain("OPENAI_API_KEY");
  });

  it("answers through the provider once a key is present", async () => {
    const bodies: string[] = [];
    process.env.OPENAI_API_KEY = "sk-test";
    globalThis.fetch = mockFetch("AI OUTPUT", bodies) as unknown as typeof globalThis.fetch;

    const result = await session.client.callTool({ name: "ask_ai", arguments: { prompt: "what is the answer?", system: "be brief" } });
    expect(isError(result)).toBe(false);
    expect(textOf(result)).toBe("AI OUTPUT");
    expect(bodies[0]).toContain("what is the answer?");
    expect(bodies[0]).toContain("be brief");
  });
});

describe("filesystem tools", () => {
  it("lists, searches and reads inside the project root", async () => {
    const top = JSON.parse(textOf(await session.client.callTool({ name: "list_files", arguments: {} }))) as string[];
    expect(top).toContain("src/");
    expect(top).not.toContain("src/index.ts");

    const recursive = JSON.parse(textOf(await session.client.callTool({ name: "list_files", arguments: { path: ".", recursive: true } }))) as string[];
    expect(recursive).toContain("src/index.ts");
    expect(recursive.some((entry) => entry === ".git/" || entry.startsWith(".git/"))).toBe(false);

    const matches = JSON.parse(
      textOf(await session.client.callTool({ name: "search_project", arguments: { query: "ANSWER_TWICE", extension: ".ts" } })),
    ) as Array<{ file: string; line: number; text: string }>;
    expect(matches).toEqual([{ file: "src/index.ts", line: 2, text: "export const ANSWER_TWICE = answer * 2;" }]);

    expect(textOf(await session.client.callTool({ name: "read_file", arguments: { path: "README.md" } }))).toBe("# Sample project\n");
  });

  it("reports validation and repository errors with their codes", async () => {
    const escape = await session.client.callTool({ name: "read_file", arguments: { path: "../outside.txt" } });
    expect(isError(escape)).toBe(true);
    expect(textOf(escape)).toMatch(/^VALIDATION_ERROR: Path escapes the project root/);

    const missing = await session.client.callTool({ name: "read_file", arguments: { path: "missing.ts" } });
    expect(isError(missing)).toBe(true);
    expect(textOf(missing)).toMatch(/^REPOSITORY_ERROR: File not found/);

    const blank = await session.client.callTool({ name: "search_project", arguments: { query: "   " } });
    expect(isError(blank)).toBe(true);
    expect(textOf(blank)).toMatch(/^VALIDATION_ERROR: /);
  });
});

describe("resources", () => {
  async function read(uri: string): Promise<string> {
    const result = await session.client.readResource({ uri });
    const [content] = result.contents;
    expect(content.uri).toBe(uri);
    return String(content.text);
  }

  it("serves the project structure, docs, config, package, readme and AI catalog", async () => {
    expect(await read("project://structure")).toContain("Project files:\n");
    expect(await read("project://structure")).toContain("src/index.ts");

    const docs = await read("project://docs");
    expect(docs).toContain("### README.md\n# Sample project");
    expect(docs).toContain("### docs/guide.md\n# Guide");

    const config = JSON.parse(await read("project://config")) as { sourcePath: string; config: { site: { name: string } } };
    expect(config.sourcePath.endsWith("config.json")).toBe(true);
    expect(config.config.site.name).toBe("Sample docs");

    expect(await read("project://repository")).toContain('package.json:\n{"name":"sample"');
    expect(await read("project://readme")).toBe("# Sample project\n");

    const providers = JSON.parse(await read("project://ai/providers")) as Array<{ id: string; label: string; defaultModel: string }>;
    expect(providers.map((provider) => provider.id)).toEqual([...ALL_PROVIDER_IDS]);
    const models = JSON.parse(await read("project://ai/models")) as Array<{ provider: string; models: string[] }>;
    expect(models.map((entry) => entry.provider)).toEqual([...ALL_PROVIDER_IDS]);
    expect(models.every((entry) => Array.isArray(entry.models))).toBe(true);
  });

  it("degrades to an Unavailable message instead of failing the read", async () => {
    const empty = mkdtempSync(path.join(os.tmpdir(), "gpd-mcp-empty-"));
    const other = await connect(empty);
    try {
      const config = await other.client.readResource({ uri: "project://config" });
      expect(String(config.contents[0].text)).toMatch(/^Unavailable: /);
      const readme = await other.client.readResource({ uri: "project://readme" });
      expect(String(readme.contents[0].text)).toMatch(/^Unavailable: .*README\.md/);
      const repository = await other.client.readResource({ uri: "project://repository" });
      expect(String(repository.contents[0].text)).toBe("");
    } finally {
      await other.close();
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe("documentation tools", () => {
  it("gathers the right context for each generator and returns the provider output", async () => {
    const bodies: string[] = [];
    process.env.OPENAI_API_KEY = "sk-test";
    globalThis.fetch = mockFetch("GENERATED", bodies) as unknown as typeof globalThis.fetch;

    const fileTools = ["generate_documentation", "generate_api_docs", "generate_database_docs", "analyze_source_code"];
    for (const name of fileTools) {
      bodies.length = 0;
      const result = await session.client.callTool({ name, arguments: { path: "src/index.ts" } });
      expect(isError(result), name).toBe(false);
      expect(textOf(result)).toBe("GENERATED");
      expect(bodies[0]).toContain("File: src/index.ts");
      expect(bodies[0]).toContain("ANSWER_TWICE");
    }

    const listingTools = ["generate_readme", "generate_architecture_docs", "analyze_repository", "analyze_project"];
    for (const name of listingTools) {
      bodies.length = 0;
      const result = await session.client.callTool({ name, arguments: {} });
      expect(isError(result), name).toBe(false);
      expect(textOf(result)).toBe("GENERATED");
      expect(bodies[0]).toContain("Project files:");
    }
    expect(bodies[0]).toContain("package.json:");

    for (const name of ["generate_changelog", "generate_release_notes"]) {
      bodies.length = 0;
      const result = await session.client.callTool({ name, arguments: {} });
      expect(isError(result), name).toBe(false);
      expect(bodies[0]).toContain("Recent commits:");
      expect(bodies[0]).toContain("initial import");
    }

    bodies.length = 0;
    const validate = await session.client.callTool({ name: "validate_docs", arguments: {} });
    expect(isError(validate)).toBe(false);
    expect(bodies[0]).toContain("### docs/guide.md");
  });

  it("falls back to the file listing for a changelog when there is no git history", async () => {
    const plain = mkdtempSync(path.join(os.tmpdir(), "gpd-mcp-nogit-"));
    writeFileSync(path.join(plain, "notes.md"), "# Notes\n", "utf8");
    const bodies: string[] = [];
    process.env.OPENAI_API_KEY = "sk-test";
    globalThis.fetch = mockFetch("GENERATED", bodies) as unknown as typeof globalThis.fetch;
    const other = await connect(plain);
    try {
      const result = await other.client.callTool({ name: "generate_changelog", arguments: {} });
      expect(isError(result)).toBe(false);
      expect(bodies[0]).toContain("Project files:");
      expect(bodies[0]).toContain("notes.md");
      expect(bodies[0]).not.toContain("Recent commits:");
    } finally {
      await other.close();
      rmSync(plain, { recursive: true, force: true });
    }
  });

  it("creates the managed region when updating a file that does not exist yet", async () => {
    const bodies: string[] = [];
    process.env.OPENAI_API_KEY = "sk-test";
    globalThis.fetch = mockFetch("FRESH CONTENT", bodies) as unknown as typeof globalThis.fetch;

    const result = await session.client.callTool({
      name: "update_documentation",
      arguments: { path: "docs/new.md", instructions: "start from scratch" },
    });
    expect(isError(result)).toBe(false);
    expect(textOf(result)).toBe("Updated docs/new.md (appended managed region).");
    expect(bodies[0]).toContain("start from scratch");
    const written = readFileSync(path.join(dir, "docs", "new.md"), "utf8");
    expect(written).toContain("FRESH CONTENT");
    expect(written).toContain("gitpagedocs:start");
  });

  it("surfaces the provider error for generators when no key is configured", async () => {
    const result = await session.client.callTool({ name: "generate_readme", arguments: {} });
    expect(isError(result)).toBe(true);
    expect(textOf(result)).toMatch(/^PROVIDER_ERROR: /);
  });
});
