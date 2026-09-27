import { afterEach, describe, expect, it, vi } from "vitest";
import path from "node:path";
import { defaultConfigLoader, loadRootConfig, resolveConfigPath } from "@/entities/docs/api/io/config-loader";
import { defaultFileReader, readJsonFile, readLocalText, tryReadJsonFile } from "@/entities/docs/api/io/file-reader";
import {
  buildRepoRawBase,
  defaultRemoteFetcher,
  readRemoteJson,
  readRemoteJsonFromRepo,
  readRemoteText,
  tryFetchText,
} from "@/entities/docs/api/io/remote-fetcher";
import { createTempWorkspace, requestedUrls, stubFetch, type TempWorkspace } from "./test-helpers";

let workspace: TempWorkspace | undefined;

afterEach(() => {
  workspace?.cleanup();
  workspace = undefined;
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("config-loader", () => {
  it("resolves nothing when no gitpagedocs/config.* exists", () => {
    workspace = createTempWorkspace();
    expect(resolveConfigPath(workspace.root)).toBeNull();
    expect(resolveConfigPath()).toBeNull();
  });

  it("prefers config.json, then config.js, then config.ts", () => {
    workspace = createTempWorkspace();
    const ts = workspace.write("gitpagedocs/config.ts", "export default {};");
    expect(resolveConfigPath(workspace.root)).toBe(ts);
    const js = workspace.write("gitpagedocs/config.js", "module.exports = {};");
    expect(resolveConfigPath(workspace.root)).toBe(js);
    const json = workspace.write("gitpagedocs/config.json", "{}");
    expect(resolveConfigPath(workspace.root)).toBe(json);
    expect(resolveConfigPath(workspace.root)).toBe(path.join(workspace.root, "gitpagedocs", "config.json"));
  });

  it("throws a descriptive error when no config file is found", async () => {
    workspace = createTempWorkspace();
    await expect(loadRootConfig(workspace.root)).rejects.toThrow(
      "No config file found. Expected one of: gitpagedocs/config.json, gitpagedocs/config.js, gitpagedocs/config.ts",
    );
  });

  it("parses a JSON config from the current working directory by default", async () => {
    workspace = createTempWorkspace();
    workspace.write("gitpagedocs/config.json", { site: { name: "json" } });
    await expect(loadRootConfig<{ site: { name: string } }>()).resolves.toEqual({ site: { name: "json" } });
  });

  it("rejects a JSON config that does not parse", async () => {
    workspace = createTempWorkspace();
    workspace.write("gitpagedocs/config.json", "{ nope");
    await expect(loadRootConfig(workspace.root)).rejects.toThrow(SyntaxError);
  });

  it("imports a CommonJS config.js through its default export", async () => {
    workspace = createTempWorkspace();
    workspace.write("gitpagedocs/config.js", "module.exports = { site: { name: 'cjs' } };");
    await expect(loadRootConfig<{ site: { name: string } }>(workspace.root)).resolves.toEqual({ site: { name: "cjs" } });
  });

  it("exposes the loader and resolver through defaultConfigLoader", () => {
    expect(defaultConfigLoader.loadRootConfig).toBe(loadRootConfig);
    expect(defaultConfigLoader.resolveConfigPath).toBe(resolveConfigPath);
  });
});

describe("file-reader on node", () => {
  it("reads text relative to the working directory and yields null when missing", async () => {
    workspace = createTempWorkspace();
    workspace.write("docs/a.txt", "hello");
    await expect(readLocalText("docs/a.txt")).resolves.toBe("hello");
    await expect(readLocalText("docs/missing.txt")).resolves.toBeNull();
  });

  it("parses JSON files and fails loudly when they cannot be read", async () => {
    workspace = createTempWorkspace();
    workspace.write("data.json", { ok: true });
    workspace.write("broken.json", "{");
    await expect(readJsonFile<{ ok: boolean }>("data.json")).resolves.toEqual({ ok: true });
    await expect(readJsonFile("missing.json")).rejects.toThrow("Failed to read local file: missing.json");
    await expect(readJsonFile("broken.json")).rejects.toThrow(SyntaxError);
  });

  it("tryReadJsonFile swallows both missing files and invalid JSON", async () => {
    workspace = createTempWorkspace();
    workspace.write("data.json", { ok: true });
    workspace.write("broken.json", "{");
    await expect(tryReadJsonFile("data.json")).resolves.toEqual({ ok: true });
    await expect(tryReadJsonFile("missing.json")).resolves.toBeNull();
    await expect(tryReadJsonFile("broken.json")).resolves.toBeNull();
  });

  it("exposes readLocalText through defaultFileReader", () => {
    expect(defaultFileReader.readLocalText).toBe(readLocalText);
  });
});

describe("file-reader in a browser", () => {
  function stubBrowser(pathname: string): void {
    vi.stubGlobal("window", { location: { origin: "https://site.test", pathname } });
  }

  it("fetches from the site origin under the configured base path", async () => {
    stubBrowser("/git-page-docs/docs/intro");
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", " /git-page-docs ");
    const fetchSpy = stubFetch([["site.test", "browser text"]]);

    await expect(readLocalText("/docs/en/a.md")).resolves.toBe("browser text");
    expect(requestedUrls(fetchSpy)).toEqual(["https://site.test/git-page-docs/docs/en/a.md"]);
  });

  it("drops the base path when the current page is not under it", async () => {
    stubBrowser("/elsewhere");
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "/git-page-docs");
    const fetchSpy = stubFetch([["site.test", "x"]]);

    await readLocalText("docs/en/a.md");
    expect(requestedUrls(fetchSpy)).toEqual(["https://site.test/docs/en/a.md"]);
  });

  it("uses no prefix when no base path is configured", async () => {
    stubBrowser("/docs");
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", undefined);
    const fetchSpy = stubFetch([["site.test", "x"]]);

    await readLocalText("docs/en/a.md");
    expect(requestedUrls(fetchSpy)).toEqual(["https://site.test/docs/en/a.md"]);
  });

  it("returns null on a failed response or a network error", async () => {
    stubBrowser("/");
    stubFetch([]);
    await expect(readLocalText("docs/en/a.md")).resolves.toBeNull();

    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    await expect(readLocalText("docs/en/a.md")).resolves.toBeNull();
  });
});

describe("remote-fetcher", () => {
  it("tryFetchText identifies itself and yields the body only for ok responses", async () => {
    const fetchSpy = stubFetch([["ok.example", "body"]]);

    await expect(tryFetchText("https://ok.example/x")).resolves.toBe("body");
    await expect(tryFetchText("https://missing.example/x")).resolves.toBeNull();
    expect(fetchSpy).toHaveBeenCalledWith("https://ok.example/x", { headers: { "User-Agent": "git-page-docs" } });

    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    await expect(tryFetchText("https://ok.example/x")).resolves.toBeNull();
  });

  it("readRemoteJson converts github.com blob urls to raw and parses JSON", async () => {
    const fetchSpy = stubFetch([
      ["raw.githubusercontent.com/o/r/main/dir/good.json", { a: 1 }],
      ["bad.json", "{ nope"],
    ]);

    await expect(readRemoteJson("https://github.com/o/r/blob/main/dir/good.json")).resolves.toEqual({ a: 1 });
    expect(requestedUrls(fetchSpy)[0]).toBe("https://raw.githubusercontent.com/o/r/main/dir/good.json");
    await expect(readRemoteJson("https://example.com/bad.json")).resolves.toBeNull();
    await expect(readRemoteJson("https://example.com/missing.json")).resolves.toBeNull();
  });

  it("buildRepoRawBase points at HEAD and always ends with a slash", () => {
    expect(buildRepoRawBase("o", "r", "gitpagelayouts")).toBe("https://raw.githubusercontent.com/o/r/HEAD/gitpagelayouts/");
    expect(buildRepoRawBase("o", "r", "gitpagelayouts/")).toBe("https://raw.githubusercontent.com/o/r/HEAD/gitpagelayouts/");
  });

  it("readRemoteText walks raw HEAD/main/master then the jsDelivr mirrors and stops at the first hit", async () => {
    const fetchSpy = stubFetch([["cdn.jsdelivr.net/gh/o/r@main/docs/a.md", "from cdn"]]);

    await expect(readRemoteText("o", "r", "/docs/a.md")).resolves.toBe("from cdn");
    expect(requestedUrls(fetchSpy)).toEqual([
      "https://raw.githubusercontent.com/o/r/HEAD/docs/a.md",
      "https://raw.githubusercontent.com/o/r/main/docs/a.md",
      "https://raw.githubusercontent.com/o/r/master/docs/a.md",
      "https://cdn.jsdelivr.net/gh/o/r@HEAD/docs/a.md",
      "https://cdn.jsdelivr.net/gh/o/r@main/docs/a.md",
    ]);
  });

  it("readRemoteText yields null after exhausting every mirror", async () => {
    const fetchSpy = stubFetch([]);
    await expect(readRemoteText("o", "r", "docs/a.md")).resolves.toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(6);
  });

  it("readRemoteJsonFromRepo parses repository JSON and tolerates broken files", async () => {
    stubFetch([
      ["/o/r/HEAD/good.json", { b: 2 }],
      ["/o/r/HEAD/bad.json", "not json"],
    ]);
    await expect(readRemoteJsonFromRepo("o", "r", "good.json")).resolves.toEqual({ b: 2 });
    await expect(readRemoteJsonFromRepo("o", "r", "bad.json")).resolves.toBeNull();
    await expect(readRemoteJsonFromRepo("o", "r", "missing.json")).resolves.toBeNull();
  });

  it("exposes the repo readers through defaultRemoteFetcher", () => {
    expect(defaultRemoteFetcher).toEqual({ readRemoteText, readRemoteJsonFromRepo });
  });
});
