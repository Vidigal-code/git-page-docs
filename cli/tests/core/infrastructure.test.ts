import { describe, it, expect, afterEach, vi } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ConfigOnlyRuntimePort, HomeRuntimePort } from "../../application/ports/cli-runtime-ports";
import { GitPageDocsConfigRepository } from "../../infrastructure/gitpagedocs-config-file";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as configOnlyRuntime from "../../infrastructure/config-only/runtime.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as homeRuntime from "../../infrastructure/home/runtime.mjs";

const { createConfigOnlyRuntime } = configOnlyRuntime as { createConfigOnlyRuntime(): ConfigOnlyRuntimePort };
const { createHomeRuntime } = homeRuntime as { createHomeRuntime(): HomeRuntimePort };

const temporaryRoots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-infra-"));
  temporaryRoots.push(root);
  return root;
}

function seed(root: string, relative: string, content = ""): string {
  const absolute = path.join(root, ...relative.split("/"));
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, content);
  return absolute;
}

afterEach(() => {
  vi.restoreAllMocks();
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

describe("createConfigOnlyRuntime", () => {
  it("wires filesystem, git and logging ports", async () => {
    const root = makeRoot();
    const runtime = createConfigOnlyRuntime();

    expect(runtime.hasPath(root)).toBe(true);
    expect(runtime.hasPath(path.join(root, "missing"))).toBe(false);

    await runtime.writeText(root, "nested/hello.txt", "hi");
    expect(readFileSync(path.join(root, "nested", "hello.txt"), "utf8")).toBe("hi");

    expect(runtime.getCurrentGitBranch(root)).toBe("main");

    const writeText = vi.fn(async () => {});
    await runtime.ensureGitHubPagesWorkflow(() => "release", writeText, "docs");
    expect(writeText).toHaveBeenCalledTimes(1);
    const [target, content] = (writeText.mock.calls[0] as unknown as [string, string]);
    expect(target).toBe(".github/workflows/gitpagedocs-pages.yml");
    expect(content).toContain('branches: ["release"]');
    expect(content).toContain('GITPAGEDOCS_PATH: "docs"');

    expect(() =>
      runtime.runGitPushForGeneratedArtifacts(
        { githubOwner: "", githubRepo: "" } as Parameters<ConfigOnlyRuntimePort["runGitPushForGeneratedArtifacts"]>[0],
        root,
        (value) => value ?? "",
      ),
    ).toThrow(/--push/);

    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    runtime.logInfo("hello");
    expect(log).toHaveBeenCalledWith("  hello");
  });

  it("delegates the config output writer to the runtime output module", async () => {
    const root = makeRoot();
    const runtime = createConfigOnlyRuntime();
    const artifacts = {
      rootConfig: { site: {} },
      languageBundles: { en: { langmenu: {}, translations: {} } },
      layoutsConfig: {},
      fallbackLayoutsConfig: {},
      versionConfigs: {},
    };

    await runtime.writeConfigOnlyOutput({
      root,
      pkgRoot: root,
      outputDir: "out",
      layoutsDir: "gitpagelayouts",
      artifacts,
      useLocalLayoutConfig: false,
      layouts: [],
      createThemeTemplate: () => ({}),
    });

    expect(JSON.parse(readFileSync(path.join(root, "out", "config.json"), "utf8"))).toEqual({ site: {} });
    expect(JSON.parse(readFileSync(path.join(root, "out", "langs", "en.json"), "utf8"))).toEqual(artifacts.languageBundles.en);
    expect(existsSync(path.join(root, "out", "icon.svg"))).toBe(true);
  });
});

describe("createHomeRuntime", () => {
  it("joins paths, probes, lists and copies through the real filesystem", () => {
    const root = makeRoot();
    const runtime = createHomeRuntime();

    expect(runtime.joinPath(root, "a", "b")).toBe(path.join(root, "a", "b"));
    expect(runtime.existsPath(root)).toBe(true);
    expect(runtime.existsPath(path.join(root, "nope"))).toBe(false);

    seed(root, "src/index.html", "<html>");
    seed(root, "src/assets/app.js", "js");
    expect(runtime.readDirNames(path.join(root, "src"))).toEqual(["assets", "index.html"]);

    runtime.copyRecursive(path.join(root, "src"), path.join(root, "dest"));
    expect(readFileSync(path.join(root, "dest", "assets", "app.js"), "utf8")).toBe("js");
    expect(readFileSync(path.join(root, "dest", "index.html"), "utf8")).toBe("<html>");
  });

  it("empties an existing output folder and ignores a missing one", () => {
    const root = makeRoot();
    const runtime = createHomeRuntime();
    seed(root, "gitpagedocshome/old.txt", "old");

    runtime.ensureDirEmpty(root, "gitpagedocshome");
    expect(existsSync(path.join(root, "gitpagedocshome"))).toBe(false);

    expect(() => runtime.ensureDirEmpty(root, "never-existed")).not.toThrow();
  });

  it("resolves the next build launcher from the given environment before spawning", () => {
    const runtime = createHomeRuntime();
    // An empty PATH means `npx` cannot be resolved, so nothing is spawned.
    expect(() => runtime.runNextBuild(makeRoot(), { PATH: "" })).toThrow(/`npx` was not found on PATH/);
  });

  it("writes the home files and text through the shared writers", async () => {
    const root = makeRoot();
    const runtime = createHomeRuntime();

    await runtime.writeHomeFiles(root, "dist", { repositorySearch: true, basePath: "docs" });
    expect(readFileSync(path.join(root, "dist", ".env"), "utf8")).toContain("GITPAGEDOCS_PATH=docs");
    await runtime.writeText(root, "dist/.nojekyll", "");
    expect(existsSync(path.join(root, "dist", ".nojekyll"))).toBe(true);

    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    runtime.logSuccess("done");
    runtime.logInfo("next");
    expect(log.mock.calls.map((call) => call[0])).toEqual(["  [ok] done", "  next"]);
  });
});

describe("GitPageDocsConfigRepository", () => {
  it("patches site.docsAccess in place and preserves every other key", async () => {
    const root = makeRoot();
    const file = seed(root, "gitpagedocs/config.json", JSON.stringify({ site: { name: "X", other: 1 }, VersionControl: { versions: [] } }));
    const repository = new GitPageDocsConfigRepository(root);

    const written = await repository.patchDocsAccess("pk-1");
    expect(written).toBe(file);
    const text = readFileSync(file, "utf8");
    expect(text.endsWith("\n")).toBe(true);
    expect(JSON.parse(text)).toEqual({
      site: { name: "X", other: 1, docsAccess: { enabled: true, publicKey: "pk-1" } },
      VersionControl: { versions: [] },
    });

    await repository.patchDocsAccess("pk-2", false);
    expect(JSON.parse(readFileSync(file, "utf8")).site.docsAccess).toEqual({ enabled: false, publicKey: "pk-2" });
  });

  it("replaces a malformed site section instead of failing", async () => {
    const root = makeRoot();
    const file = seed(root, "gitpagedocs/config.json", JSON.stringify({ site: "oops" }));

    await new GitPageDocsConfigRepository(root).patchDocsAccess("pk");
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual({ site: { docsAccess: { enabled: true, publicKey: "pk" } } });
  });

  it("explains how to create a missing config", async () => {
    const repository = new GitPageDocsConfigRepository(makeRoot());
    await expect(repository.resolvePath()).rejects.toThrow(/Run `gitpagedocs` first/);
    await expect(repository.patchDocsAccess("pk")).rejects.toThrow(/config\.json not found/);
  });

  it("refuses to patch a JS or TS config", async () => {
    const root = makeRoot();
    seed(root, "gitpagedocs/config.js", "export default {};");
    await expect(new GitPageDocsConfigRepository(root).patchDocsAccess("pk")).rejects.toThrow(/Expected a JSON config to patch/);
  });

  it("defaults to the current working directory", async () => {
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(makeRoot());
    await expect(new GitPageDocsConfigRepository().resolvePath()).rejects.toThrow(/not found/);
    expect(cwd).toHaveBeenCalled();
  });
});
