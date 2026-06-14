import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync, readdirSync } from "node:fs";
import { FileService } from "../../src/filesystem/file-service";
import { DocumentationService } from "../../src/documentation/doc-generator";
import { DocUpdater } from "../../src/documentation/doc-updater";
import { GitPageDocsConfigLoader } from "../../src/config/config-loader";
import { NodeCryptoService } from "../../src/crypto/node-crypto-service";
import { EncryptedCredentialVault } from "../../src/security/credential-vault";
import { FileVaultStorage } from "../../src/security/file-vault-storage";
import { SessionPasswordGate } from "../../src/security/password-gate";
import { createDefaultFactory } from "../../src/ai/bootstrap";
import type { FetchLike } from "../../src/ai/http/streaming";
import type { AIProvider, GenerateRequest, GenerateResponse, ProviderConfig } from "../../src/ports/ai";

/** A deterministic provider that records the request and returns canned docs. */
function fakeDocProvider(): { provider: AIProvider; lastReq: () => GenerateRequest | undefined } {
  let last: GenerateRequest | undefined;
  const provider: AIProvider = {
    id: "openai",
    capabilities: { streaming: true, vision: false, audio: false },
    async generate(req: GenerateRequest): Promise<GenerateResponse> {
      last = req;
      return { text: "## Generated Docs\n\nDescribes the input.", model: "test" };
    },
    stream() {
      return (async function* () {
        yield "## Generated Docs";
      })();
    },
  };
  return { provider, lastReq: () => last };
}

describe("E2E: core/tools full pipelines", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gpd-e2e-core-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("Config → AI → Docs → Markdown → Output, preserving manual content", async () => {
    const files = new FileService(dir);
    writeFileSync(path.join(dir, "src.ts"), "export const add = (a:number,b:number)=>a+b;\n", "utf8");
    writeFileSync(path.join(dir, "README.md"), "# My Project\n\nManually written intro.\n", "utf8");

    const source = await files.read("src.ts");
    const { provider, lastReq } = fakeDocProvider();
    const service = new DocumentationService(provider, { providerId: "openai", model: "test" });
    const generated = await service.generate({ kind: "documentation", context: source });
    expect(lastReq()?.messages[0].content).toContain("add");

    const updater = new DocUpdater(files);
    const r1 = await updater.updateManagedFile("README.md", generated);
    expect(r1.changed).toBe(true);
    const out = readFileSync(path.join(dir, "README.md"), "utf8");
    expect(out).toContain("Manually written intro."); // manual preserved
    expect(out).toContain("Generated Docs"); // generated injected

    const r2 = await updater.updateManagedFile("README.md", generated);
    expect(r2.changed).toBe(false); // idempotent
  });

  it("Config contract: loads .json, .js and .ts config end-to-end", async () => {
    const loader = new GitPageDocsConfigLoader();
    const gpd = path.join(dir, "gitpagedocs");

    // .json
    mkdirSync(gpd, { recursive: true });
    writeFileSync(path.join(gpd, "config.json"), JSON.stringify({ site: { name: "JSON" } }), "utf8");
    expect((await loader.loadGitPageDocsConfig<{ site: { name: string } }>(dir)).config.site.name).toBe("JSON");

    // .js (CommonJS module.exports) — remove json so .js resolves
    rmSync(path.join(gpd, "config.json"));
    writeFileSync(path.join(gpd, "config.js"), "module.exports = { site: { name: 'JS' } };\n", "utf8");
    expect((await loader.loadGitPageDocsConfig<{ site: { name: string } }>(dir)).config.site.name).toBe("JS");

    // .ts (default export) — remove js so .ts resolves
    rmSync(path.join(gpd, "config.js"));
    writeFileSync(path.join(gpd, "config.ts"), "export default { site: { name: 'TS' } };\n", "utf8");
    expect((await loader.loadGitPageDocsConfig<{ site: { name: string } }>(dir)).config.site.name).toBe("TS");
  });

  it("Secure-credential flow: gate → vault → provider call, no plaintext on disk", async () => {
    const crypto = new NodeCryptoService(20_000);
    const vaultFile = path.join(dir, ".vault.json");
    const vault = new EncryptedCredentialVault(new FileVaultStorage(vaultFile), crypto);

    const gate = new SessionPasswordGate({ vault, prompt: async () => "local-pass" });
    const password = await gate.authorize("run-ai");
    await vault.setCredential(password, "openai", "sk-live-secret-123");

    // disk has no plaintext key
    expect(readFileSync(vaultFile, "utf8")).not.toContain("sk-live-secret-123");

    // retrieve and use the key in a real provider call (fake fetch)
    const apiKey = await vault.getCredential(password, "openai");
    const fetchImpl = (async (_u: string | URL | Request, init?: RequestInit) => {
      expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer sk-live-secret-123");
      return new Response('data: {"choices":[{"delta":{"content":"hi"}}]}\n\n', { status: 200 });
    }) as FetchLike;
    const config: ProviderConfig = { providerId: "openai", model: "gpt-4o-mini", apiKey };
    const res = await createDefaultFactory(fetchImpl).create("openai").generate(
      { messages: [{ role: "user", content: "yo" }] },
      config,
    );
    expect(res.text).toBe("hi");
  });

  it("source-viewer-independent: list/search still reach generated dirs", async () => {
    const files = new FileService(dir);
    mkdirSync(path.join(dir, "docs"), { recursive: true });
    writeFileSync(path.join(dir, "docs", "a.md"), "needle here\n", "utf8");
    const found = await files.search("needle");
    expect(found.some((m) => m.file === "docs/a.md")).toBe(true);
    expect(readdirSync(path.join(dir, "docs"))).toContain("a.md");
  });
});
