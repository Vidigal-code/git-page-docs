import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { GitPageDocsConfigLoader } from "../src/config/config-loader";
import { ConfigurationError } from "../src/errors/app-error";

describe("GitPageDocsConfigLoader", () => {
  let dir: string;
  const loader = new GitPageDocsConfigLoader();
  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gpd-config-"));
    mkdirSync(path.join(dir, "gitpagedocs"), { recursive: true });
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("resolves and loads a JSON config", async () => {
    writeFileSync(path.join(dir, "gitpagedocs", "config.json"), JSON.stringify({ site: { name: "X" } }), "utf8");
    const resolved = await loader.resolveConfigPath(dir);
    expect(resolved).toContain("config.json");
    const { config, extension } = await loader.loadGitPageDocsConfig<{ site: { name: string } }>(dir);
    expect(extension).toBe(".json");
    expect(config.site.name).toBe("X");
  });

  it("returns undefined when no config exists and throws on load", async () => {
    expect(await loader.resolveConfigPath(dir)).toBeUndefined();
    await expect(loader.loadGitPageDocsConfig(dir)).rejects.toBeInstanceOf(ConfigurationError);
  });
});
