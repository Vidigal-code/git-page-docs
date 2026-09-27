import { afterEach, describe, expect, it, vi } from "vitest";
import { loadVersionConfig, resolveActiveVersionId } from "@/entities/docs/api/version/resolve-version";
import type { VersionEntry } from "@/entities/docs/model/types";
import { createTempWorkspace, requestedUrls, stubFetch, type TempWorkspace } from "./test-helpers";

const versions: VersionEntry[] = [
  { id: "v3", path: "docs/v3/config.json" },
  { id: "v2", path: "docs/v2/config.json" },
  { id: "v1", path: "docs/v1/config.json" },
];

describe("resolveActiveVersionId", () => {
  it("returns undefined when there are no versions", () => {
    expect(resolveActiveVersionId([], "v1", "v1")).toBeUndefined();
  });

  it("honours the selected version when it exists", () => {
    expect(resolveActiveVersionId(versions, "v1", "v2")).toBe("v1");
  });

  it("falls back to the default version when the selected one is unknown", () => {
    expect(resolveActiveVersionId(versions, "v9", "v2")).toBe("v2");
  });

  it("falls back to the first version when neither selected nor default exist", () => {
    expect(resolveActiveVersionId(versions, "v9", "v8")).toBe("v3");
    expect(resolveActiveVersionId(versions, undefined, undefined)).toBe("v3");
  });
});

describe("loadVersionConfig", () => {
  let workspace: TempWorkspace | undefined;

  afterEach(() => {
    workspace?.cleanup();
    workspace = undefined;
    vi.unstubAllGlobals();
  });

  const routesOnly = { routes: [{ id: 1, path: { en: "docs/v1/en/a.md" } }] };

  it("returns undefined when the entry has neither PathConfig nor path", async () => {
    await expect(loadVersionConfig({ versionEntry: { id: "v1", path: "" }, source: "local" })).resolves.toBeUndefined();
  });

  it("reads an absolute http(s) version config through the raw GitHub URL", async () => {
    const fetchSpy = stubFetch([["raw.githubusercontent.com/o/r/main/gitpagedocs/docs/v1/config.json", routesOnly]]);

    const result = await loadVersionConfig({
      versionEntry: { id: "v1", path: "https://github.com/o/r/blob/main/gitpagedocs/docs/v1/config.json" },
      source: "local",
    });

    expect(result).toEqual(routesOnly);
    expect(requestedUrls(fetchSpy)).toEqual(["https://raw.githubusercontent.com/o/r/main/gitpagedocs/docs/v1/config.json"]);
  });

  it("expands routeDefaults stored in the version config into every route", async () => {
    stubFetch([
      [
        "example.com/compact.json",
        { routeDefaults: { blockLink: true, marginTop: "" }, "routes-md": [{ id: 1, marginTop: "4px" }, { id: 2 }] },
      ],
    ]);

    const result = await loadVersionConfig({ versionEntry: { id: "v1", path: "https://example.com/compact.json" }, source: "local" });

    expect(result).not.toHaveProperty("routeDefaults");
    expect(result?.["routes-md"]).toEqual([
      { id: 1, blockLink: true, marginTop: "4px" },
      { id: 2, blockLink: true, marginTop: "" },
    ]);
  });

  it("prefers PathConfig over path", async () => {
    const fetchSpy = stubFetch([["from-path-config.json", routesOnly]]);

    const result = await loadVersionConfig({
      versionEntry: { id: "v1", path: "https://example.com/from-path.json", PathConfig: "https://example.com/from-path-config.json" },
      source: "local",
    });

    expect(result).toEqual(routesOnly);
    expect(requestedUrls(fetchSpy)).toEqual(["https://example.com/from-path-config.json"]);
  });

  it("walks the repo-relative candidates in order for a remote repository", async () => {
    // Only the gitpagedocs-prefixed location exists in the repository.
    const fetchSpy = stubFetch([["/gitpagedocs/docs/v1/config.json", routesOnly]]);

    const result = await loadVersionConfig({
      versionEntry: { id: "v1", path: "docs/v1/config.json" },
      source: "remote",
      owner: "o",
      repo: "r",
    });

    expect(result).toEqual(routesOnly);
    const urls = requestedUrls(fetchSpy);
    // First candidate (docs/v1/config.json) is tried across every raw mirror before the prefixed one.
    expect(urls.slice(0, 6).every((url) => url.endsWith("/docs/v1/config.json") && !url.includes("gitpagedocs"))).toBe(true);
    expect(urls[6]).toBe("https://raw.githubusercontent.com/o/r/HEAD/gitpagedocs/docs/v1/config.json");
  });

  it("strips the gitpagedocs/ prefix as a remote fallback candidate", async () => {
    const fetchSpy = stubFetch([[/\/HEAD\/docs\/v2\/config\.json$/, routesOnly]]);

    const result = await loadVersionConfig({
      versionEntry: { id: "v2", path: "gitpagedocs/docs/v2/config.json" },
      source: "remote",
      owner: "o",
      repo: "r",
    });

    expect(result).toEqual(routesOnly);
    expect(requestedUrls(fetchSpy)[0]).toBe("https://raw.githubusercontent.com/o/r/HEAD/gitpagedocs/docs/v2/config.json");
  });

  it("returns undefined for a remote repository that has no matching file", async () => {
    stubFetch([]);
    await expect(
      loadVersionConfig({ versionEntry: { id: "v1", path: "docs/v1/config.json" }, source: "remote", owner: "o", repo: "r" }),
    ).resolves.toBeUndefined();
  });

  it("reads a local version config from the workspace, trying the prefixed candidate", async () => {
    workspace = createTempWorkspace();
    workspace.write("gitpagedocs/docs/v2/config.json", routesOnly);

    await expect(
      loadVersionConfig({ versionEntry: { id: "v2", path: "docs/v2/config.json" }, source: "local" }),
    ).resolves.toEqual(routesOnly);
  });

  it("treats a remote source without owner/repo as local", async () => {
    workspace = createTempWorkspace();
    workspace.write("docs/v2/config.json", routesOnly);
    const fetchSpy = stubFetch([]);

    await expect(
      loadVersionConfig({ versionEntry: { id: "v2", path: "docs/v2/config.json" }, source: "remote" }),
    ).resolves.toEqual(routesOnly);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns undefined for a local file that is not valid JSON", async () => {
    workspace = createTempWorkspace();
    workspace.write("docs/v1/config.json", "{ not json");

    await expect(
      loadVersionConfig({ versionEntry: { id: "v1", path: "docs/v1/config.json" }, source: "local" }),
    ).resolves.toBeUndefined();
  });

  it("discards a config that carries no routes, menus or auth", async () => {
    workspace = createTempWorkspace();
    workspace.write("docs/v1/config.json", { routes: [], "menus-header": [], hierarchyPage: { md: 0, html: 1, video: 2 } });

    await expect(
      loadVersionConfig({ versionEntry: { id: "v1", path: "docs/v1/config.json" }, source: "local" }),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["routes-md", { "routes-md": [{ id: 1, path: { en: "a.md" } }] }],
    ["routes-source-viewer", { "routes-source-viewer": [{ id: 1 }] }],
    ["routes-html", { "routes-html": [{ id: 1 }] }],
    ["routes-video", { "routes-video": [{ id: 1 }] }],
    ["routes-audio", { "routes-audio": [{ id: 1 }] }],
    ["menus-header", { "menus-header": [{ id: 1 }] }],
    ["menus-header-md", { "menus-header-md": [{ id: 1 }] }],
    ["menus-header-source-viewer", { "menus-header-source-viewer": [{ id: 1 }] }],
    ["menus-header-html", { "menus-header-html": [{ id: 1 }] }],
    ["menus-header-video", { "menus-header-video": [{ id: 1 }] }],
    ["menus-header-audio", { "menus-header-audio": [{ id: 1 }] }],
    ["auth", { auth: { accessKeys: {} } }],
  ])("keeps a config that only carries %s", async (_label, config) => {
    workspace = createTempWorkspace();
    workspace.write("docs/v1/config.json", config);

    await expect(
      loadVersionConfig({ versionEntry: { id: "v1", path: "docs/v1/config.json" }, source: "local" }),
    ).resolves.toEqual(config);
  });

  it("does not treat a non-object auth as content", async () => {
    workspace = createTempWorkspace();
    workspace.write("docs/v1/config.json", { auth: "nope" });

    await expect(
      loadVersionConfig({ versionEntry: { id: "v1", path: "docs/v1/config.json" }, source: "local" }),
    ).resolves.toBeUndefined();
  });
});
