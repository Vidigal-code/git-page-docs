import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { patchManagedRegion, START_MARKER, END_MARKER } from "../src/documentation/marker-patcher";
import { DocUpdater } from "../src/documentation/doc-updater";
import {
  providersSection,
  cliCommandsSection,
  devWorkflowSection,
  securityNoteSection,
  CLI_COMMANDS,
} from "../src/documentation/sections";
import { DocumentationService } from "../src/documentation/doc-generator";
import { FileService } from "../src/filesystem/file-service";
import type { AIProvider, GenerateRequest, GenerateResponse, ProviderConfig } from "../src/ports/ai";

describe("patchManagedRegion", () => {
  it("appends when no markers and preserves manual content", () => {
    const r = patchManagedRegion("# Title\n\nmanual\n", "GEN");
    expect(r.replaced).toBe(false);
    expect(r.content).toContain("# Title");
    expect(r.content).toContain(START_MARKER);
    expect(r.content).toContain(END_MARKER);
  });

  it("is idempotent and replaces existing region", () => {
    const first = patchManagedRegion("intro\n", "A");
    const again = patchManagedRegion(first.content, "A");
    expect(again.content).toBe(first.content);
    expect(again.replaced).toBe(true);
    const replaced = patchManagedRegion(first.content, "B");
    expect(replaced.content).toContain("B");
    expect(replaced.content).not.toContain(">A<");
  });

  it("preserves content after the end marker", () => {
    const src = `top\n${START_MARKER}\nold\n${END_MARKER}\nfooter\n`;
    expect(patchManagedRegion(src, "new").content).toContain("footer");
  });
});

describe("DocUpdater", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gpd-doc-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("updates idempotently and creates missing files", async () => {
    writeFileSync(path.join(dir, "README.md"), "# T\n\nmanual\n", "utf8");
    const updater = new DocUpdater(new FileService(dir));
    const r1 = await updater.updateManagedFile("README.md", "GEN");
    expect(r1.changed).toBe(true);
    const after = readFileSync(path.join(dir, "README.md"), "utf8");
    expect(after).toContain("manual");
    const r2 = await updater.updateManagedFile("README.md", "GEN");
    expect(r2.changed).toBe(false);
    const r3 = await updater.updateManagedFiles([{ path: "NEW.md", generated: "X" }]);
    expect(r3[0].changed).toBe(true);
  });
});

describe("sections", () => {
  it("produce deterministic, complete content", () => {
    expect(providersSection()).toBe(providersSection());
    expect((providersSection().match(/\| `/g) ?? []).length).toBeGreaterThanOrEqual(14);
    expect(cliCommandsSection(CLI_COMMANDS)).toContain("gitpagedocs init");
  });

  it("devWorkflowSection + securityNoteSection are deterministic and accurate", () => {
    expect(devWorkflowSection()).toBe(devWorkflowSection());
    expect(devWorkflowSection()).toContain("pnpm run test:e2e");
    expect(securityNoteSection()).toBe(securityNoteSection());
    expect(securityNoteSection()).toContain("AES-256-GCM");
    expect(securityNoteSection()).toContain("never logged");
  });
});

describe("DocumentationService", () => {
  it("builds a kind-specific request and delegates to the provider", async () => {
    let seen: GenerateRequest | undefined;
    const provider: AIProvider = {
      id: "openai",
      capabilities: { streaming: true, vision: false, audio: false },
      async generate(req: GenerateRequest): Promise<GenerateResponse> {
        seen = req;
        return { text: "DOC", model: "m" };
      },
      stream() {
        return (async function* () {})();
      },
    };
    const config: ProviderConfig = { providerId: "openai", model: "m" };
    const service = new DocumentationService(provider, config);
    const out = await service.generate({ kind: "readme", context: "ctx", instructions: "do it" });
    expect(out).toBe("DOC");
    expect(seen?.system).toContain("README");
    expect(seen?.messages[0].content).toContain("ctx");
    expect(seen?.messages[0].content).toContain("do it");
  });
});
