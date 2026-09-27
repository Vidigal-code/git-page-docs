import { describe, it, expect, afterEach, vi } from "vitest";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { ALL_PROVIDER_IDS, PROVIDER_CATALOG, ConfigurationError, ProviderError, ValidationError } from "@gitpagedocs/tools";
import { ServerContext, PROVIDER_ENV_KEYS } from "../src/context";
import { clamp, docsContext, fileContext, gitLog, packageContext, repoListing } from "../src/gather";
import { errorResult, json, safe, text } from "../src/result";

const temporaryDirs: string[] = [];

function makeDir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "gpd-mcp-unit-"));
  temporaryDirs.push(dir);
  return dir;
}

afterEach(() => {
  vi.unstubAllEnvs();
  while (temporaryDirs.length > 0) {
    rmSync(temporaryDirs.pop() as string, { recursive: true, force: true });
  }
});

/** Remove every provider key so resolution depends only on what a test stubs. */
function clearProviderKeys(): void {
  for (const names of Object.values(PROVIDER_ENV_KEYS)) {
    for (const name of names) vi.stubEnv(name, "");
  }
}

describe("ServerContext selection", () => {
  it("defaults to openai when no selection file exists or it is corrupt", async () => {
    const dir = makeDir();
    expect(await new ServerContext(dir).loadSelection()).toEqual({ provider: "openai" });
    writeFileSync(path.join(dir, ".gitpagedocs-mcp.json"), "{not json", "utf8");
    expect(await new ServerContext(dir).loadSelection()).toEqual({ provider: "openai" });
  });

  it("round-trips a saved selection as pretty JSON", async () => {
    const dir = makeDir();
    const ctx = new ServerContext(dir);
    await ctx.saveSelection({ provider: "mistral", model: "m-large" });
    expect(readFileSync(path.join(dir, ".gitpagedocs-mcp.json"), "utf8")).toBe('{\n  "provider": "mistral",\n  "model": "m-large"\n}');
    expect(await ctx.loadSelection()).toEqual({ provider: "mistral", model: "m-large" });
  });

  it("defaults the root to the current working directory", () => {
    expect(new ServerContext().root).toBe(process.cwd());
  });
});

describe("ServerContext.resolveProvider", () => {
  it("knows an env variable for every catalog provider", () => {
    expect(Object.keys(PROVIDER_ENV_KEYS).sort()).toEqual([...ALL_PROVIDER_IDS].sort());
    expect(PROVIDER_ENV_KEYS.ollama).toEqual([]);
  });

  it("rejects an unknown provider id", async () => {
    await expect(new ServerContext(makeDir()).resolveProvider("nope" as never)).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("names every accepted env variable when the key is missing", async () => {
    clearProviderKeys();
    const attempt = new ServerContext(makeDir()).resolveProvider("anthropic");
    await expect(attempt).rejects.toBeInstanceOf(ProviderError);
    await expect(attempt).rejects.toThrow("ANTHROPIC_API_KEY or CLAUDE_API_KEY");
  });

  it("takes the first env variable that holds a value and the catalog default model", async () => {
    clearProviderKeys();
    vi.stubEnv("CLAUDE_API_KEY", "claude-key");
    const { provider, config } = await new ServerContext(makeDir()).resolveProvider("anthropic");
    expect(provider.id).toBe("anthropic");
    expect(config).toEqual({
      providerId: "anthropic",
      model: PROVIDER_CATALOG.anthropic.defaultModel,
      apiKey: "claude-key",
      baseUrl: undefined,
    });
  });

  it("needs no key for ollama and reads its base URL from the environment", async () => {
    clearProviderKeys();
    vi.stubEnv("OLLAMA_BASE_URL", "http://localhost:11434");
    const { config } = await new ServerContext(makeDir()).resolveProvider("ollama", "llama3");
    expect(config).toEqual({ providerId: "ollama", model: "llama3", apiKey: undefined, baseUrl: "http://localhost:11434" });
  });

  it("reads the Azure OpenAI base URL from the environment", async () => {
    clearProviderKeys();
    vi.stubEnv("AZURE_OPENAI_API_KEY", "azure-key");
    vi.stubEnv("AZURE_OPENAI_BASE_URL", "https://example.openai.azure.com");
    const { config } = await new ServerContext(makeDir()).resolveProvider("azure-openai");
    expect(config.apiKey).toBe("azure-key");
    expect(config.baseUrl).toBe("https://example.openai.azure.com");
  });

  it("prefers an explicit model, then the saved selection, then the catalog default", async () => {
    clearProviderKeys();
    vi.stubEnv("GROQ_API_KEY", "groq-key");
    const ctx = new ServerContext(makeDir());
    await ctx.saveSelection({ provider: "groq", model: "saved-model" });

    expect((await ctx.resolveProvider()).config).toMatchObject({ providerId: "groq", model: "saved-model" });
    expect((await ctx.resolveProvider(undefined, "explicit-model")).config.model).toBe("explicit-model");

    await ctx.saveSelection({ provider: "groq" });
    expect((await ctx.resolveProvider()).config.model).toBe(PROVIDER_CATALOG.groq.defaultModel);
  });
});

describe("gather helpers", () => {
  it("clamps long context and leaves short context alone", () => {
    expect(clamp("short")).toBe("short");
    const long = "x".repeat(30_000);
    const clamped = clamp(long);
    expect(clamped.startsWith("x".repeat(24_000))).toBe(true);
    expect(clamped.endsWith("\n…[truncated]")).toBe(true);
    expect(clamped).toHaveLength(24_000 + "\n…[truncated]".length);
  });

  it("lists the repository and reads a file with its header", async () => {
    const dir = makeDir();
    writeFileSync(path.join(dir, "a.ts"), "const a = 1;\n", "utf8");
    const ctx = new ServerContext(dir);
    expect(await repoListing(ctx)).toBe("Project files:\na.ts");
    expect(await fileContext(ctx, "a.ts")).toBe("File: a.ts\n\nconst a = 1;\n");
    await expect(fileContext(ctx, "missing.ts")).rejects.toThrow(/File not found/);
  });

  it("returns an empty package context and git log when they are unavailable", async () => {
    const ctx = new ServerContext(makeDir());
    expect(await packageContext(ctx)).toBe("");
    expect(gitLog(ctx)).toBe("");
  });

  it("returns the recent commits of a repository", () => {
    const dir = makeDir();
    writeFileSync(path.join(dir, "file.txt"), "one\n", "utf8");
    const git = (...args: string[]) =>
      execFileSync("git", ["-c", "user.email=t@example.com", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args], {
        cwd: dir,
        stdio: "ignore",
      });
    git("init", "-q", "-b", "main");
    git("add", ".");
    git("commit", "-q", "-m", "first commit");
    writeFileSync(path.join(dir, "file.txt"), "two\n", "utf8");
    git("commit", "-q", "-am", "second commit");

    const log = gitLog(new ServerContext(dir), 1);
    expect(log.startsWith("Recent commits:\n")).toBe(true);
    expect(log).toContain("second commit");
    expect(log).not.toContain("first commit");
  });

  it("concatenates markdown files only and skips ones it cannot read", async () => {
    const dir = makeDir();
    writeFileSync(path.join(dir, "README.md"), "# Readme\n", "utf8");
    writeFileSync(path.join(dir, "notes.txt"), "not docs", "utf8");
    writeFileSync(path.join(dir, "big.markdown"), "y".repeat(50_000), "utf8");
    const context = await docsContext(new ServerContext(dir));
    expect(context).toContain("### README.md\n# Readme");
    expect(context).not.toContain("not docs");
    // big.markdown exceeds the 40 kB per-file limit, so it is skipped.
    expect(context).not.toContain("### big.markdown");
  });
});

describe("result helpers", () => {
  it("wraps text and JSON payloads", () => {
    expect(text("hi")).toEqual({ content: [{ type: "text", text: "hi" }] });
    expect(json({ a: 1 })).toEqual({ content: [{ type: "text", text: '{\n  "a": 1\n}' }] });
  });

  it("prefixes application errors with their code and stringifies anything else", () => {
    expect(errorResult(new ValidationError("bad input"))).toEqual({
      content: [{ type: "text", text: "VALIDATION_ERROR: bad input" }],
      isError: true,
    });
    expect(errorResult(new Error("plain"))).toEqual({ content: [{ type: "text", text: "Error: plain" }], isError: true });
    expect(errorResult("oops").content[0].text).toBe("oops");
  });

  it("turns thrown errors into error results and passes successes through", async () => {
    const ok = safe(async (value: number) => text(String(value * 2)));
    expect(await ok(21)).toEqual(text("42"));
    const failing = safe(async () => {
      throw new ValidationError("nope");
    });
    expect(await failing(undefined)).toEqual(errorResult(new ValidationError("nope")));
  });
});
