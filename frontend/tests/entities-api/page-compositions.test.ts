import { afterEach, expect, it, vi } from "vitest";
import { loadDocsData } from "@/entities/docs/api/load-docs-data";
import { loadRemoteDocsData } from "@/entities/docs/api/load-remote-docs-data-client";
import { getPathClickByRouteId } from "@/entities/docs/model/menu-utils";
import { resolveRouteAuthorizationTarget } from "@/features/route-authorization/model/resolve-route-authorization";
import { evaluateRouteAccess } from "@/features/route-authorization/model/access-policy";
import { createTempWorkspace, stubRepoFetch, type TempWorkspace } from "./test-helpers";

let workspace: TempWorkspace | undefined;
afterEach(() => { workspace?.cleanup(); workspace = undefined; vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("loads ordered repeated content blocks from the active version while preserving original page paths", async () => {
  vi.stubEnv("GITHUB_ACTIONS", "");
  vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "");
  vi.stubEnv("GITHUB_REPOSITORY", "");
  workspace = createTempWorkspace();
  stubRepoFetch({});
  workspace.write("gitpagedocs/config.json", {
    site: { name: "Blocks", defaultLanguage: "en", docsVersion: "v1" }, routes: [], "menus-header": [],
    VersionControl: { versions: [{ id: "v1", path: "docs/v1/config.json" }] },
  });
  workspace.write("docs/v1/config.json", {
    "routes-md": [{ id: 1, path: { en: "one.md" } }, { id: 2, path: { en: "two.md" } }],
    "routes-html": [{ id: 3, path: { en: "one.html" } }],
    "routes-video": [{ id: 4, video: { videoType: { en: "mp4" }, pathVideo: { en: "https://example.com/video.mp4" } } }],
    "routes-audio": [{ id: 5, audio: { audioType: { en: "mp3" }, pathAudio: { en: "https://example.com/audio.mp3" } } }],
    "routes-pdf": [{ id: 6, pdf: { pathPdf: { en: "manual.pdf" }, downloadEnabled: false } }],
    pages: [{ id: 39, blocks: [
      { id: "intro", type: "md", routeId: 1 }, { id: "first-html", type: "html", routeId: 3 },
      { id: "first-pdf", type: "pdf", routeId: 6 }, { id: "first-video", type: "video", routeId: 4 },
      { id: "first-audio", type: "audio", routeId: 5 }, { id: "guide", type: "md", routeId: 2 },
      { id: "second-html", type: "html", routeId: 3 }, { id: "second-video", type: "video", routeId: 4 },
      { id: "second-audio", type: "audio", routeId: 5 }, { id: "second-pdf", type: "pdf", routeId: 6 },
      { id: "third-pdf", type: "pdf", routeId: 6 },
    ] }],
    "menus-header-md": [{ id: 39, en: { title: "All content", "path-click": "page:39" } }],
  });
  workspace.write("one.md", "# One");
  workspace.write("two.md", "# Two");
  workspace.write("one.html", "<h1>HTML</h1>");
  const data = await loadDocsData(undefined);
  const page = data.pages.find((candidate) => candidate.id === 39);
  expect(page?.blocks?.map((block) => block.type)).toEqual(["md", "html", "pdf", "video", "audio", "md", "html", "video", "audio", "pdf", "pdf"]);
  expect(page?.blocks?.map((block) => block.id)).toEqual(["intro", "first-html", "first-pdf", "first-video", "first-audio", "guide", "second-html", "second-video", "second-audio", "second-pdf", "third-pdf"]);
  expect(data.pathToPageMap["page:39"]?.pageIndex).toBe(data.pages.indexOf(page!));
  expect(data.pages[data.pathToPageMap["one.md"].pageIndex].id).toBe(1);
  expect(data.pages[data.pathToPageMap["page:6"].pageIndex].id).toBe(6);
});

it("loads remote version blocks in declared order without fetching PDFs as text or changing source destinations", async () => {
  const fetchSpy = stubRepoFetch({
    "owner/repo/gitpagedocs/config.json": {
      site: { name: "Blocks", defaultLanguage: "en", docsVersion: "v1" }, routes: [], "menus-header": [],
      VersionControl: { versions: [{ id: "v1", path: "docs/v1/config.json" }] },
    },
    "owner/repo/docs/v1/config.json": {
      "routes-md": [{ id: 2, path: { en: "one.md" } }],
      "routes-pdf": [{ id: 3, pdf: { pathPdf: { en: "manual.pdf" } } }],
      pages: [{ id: 1, blocks: [{ id: "pdf", type: "pdf", routeId: 3 }, { id: "md-one", type: "md", routeId: 2 }, { id: "md-two", type: "md", routeId: 2 }] }],
    },
    "owner/repo/one.md": "# Original source",
  });
  const data = await loadRemoteDocsData("owner", "repo");
  expect(data?.pages.map((page) => page.id)).toEqual([1, 2, 3]);
  expect(data?.pages[0].blocks?.map((block) => block.type)).toEqual(["pdf", "md", "md"]);
  const markdown = data?.pages[0].blocks?.find((block) => block.type === "md");
  expect(markdown?.content.sourceByLanguage?.en).toBe("# Original source");
  expect(data?.pathToPageMap["one.md"]).toEqual({ pageIndex: 1, contentType: "md" });
  expect(data?.pathToPageMap["page:1"]).toEqual({ pageIndex: 0, contentType: "pdf" });
  expect(fetchSpy.mock.calls.some(([url]) => String(url).endsWith("manual.pdf"))).toBe(false);
});

it("resolves a composed page URL and its authorization independently from protected block content", async () => {
  stubRepoFetch({
    "owner/repo/gitpagedocs/config.json": {
      site: { name: "Blocks", defaultLanguage: "en" }, routes: [], "menus-header": [],
      "routes-md": [{ id: 1, path: { en: "private.md" }, authorization: { requiredRoles: ["editor"] } }],
      pages: [{ id: 39, authorization: { requiredRoles: ["reader"] }, blocks: [{ id: "private", type: "md", routeId: 1 }] }],
    },
    "owner/repo/private.md": "# Protected block",
  });
  const data = await loadRemoteDocsData("owner", "repo");
  if (!data) throw new Error("Remote fixture should load");
  expect(getPathClickByRouteId(data, 39, "en")).toBe("page:39");
  const target = resolveRouteAuthorizationTarget(data, "page:39", "en");
  expect(target?.authorization).toEqual({ requiredRoles: ["reader"] });
  const guest = { roles: [], unlockedKeyIds: [], authenticatedProviders: [] };
  expect(evaluateRouteAccess(target?.authorization, undefined, guest).allowed).toBe(false);
  expect(evaluateRouteAccess(target?.authorization, undefined, { ...guest, roles: ["reader"] }).allowed).toBe(true);
  const block = data.pages.find((page) => page.id === 39)?.blocks?.[0];
  expect(block?.content.config).toMatchObject({ authorization: { requiredRoles: ["editor"] } });
});

it("ignores malformed definitions, duplicate IDs and missing references while retaining valid blocks and legacy pages", async () => {
  stubRepoFetch({
    "owner/repo/gitpagedocs/config.json": {
      site: { name: "Blocks", defaultLanguage: "en" }, routes: [], "menus-header": [],
      "routes-md": [{ id: 1, path: { en: "one.md" } }],
      pages: [null, [], { id: "39", blocks: [] }, { id: 2, blocks: null },
        { id: 1, blocks: [{ id: "collision", type: "md", routeId: 1 }] },
        { id: 39, blocks: [null, { id: "bad-type", type: "unknown", routeId: 1 }, { id: "bad-route", type: "md", routeId: "1" },
          { id: "missing-route", type: "md", routeId: 99 }, { id: "", type: "md", routeId: 1 },
          { id: "valid", type: "md", routeId: 1 }, { id: "valid", type: "md", routeId: 1 }] },
        { id: 39, blocks: [] }, { id: 40, blocks: [] }, { id: 41, authorization: { requiredRoles: "admin" }, blocks: [] }],
    },
    "owner/repo/one.md": "# One",
  });
  const data = await loadRemoteDocsData("owner", "repo");
  expect(data?.pages.map((page) => page.id)).toEqual([1, 39, 40]);
  expect(data?.pages[0].md?.sourceByLanguage?.en).toBe("# One");
  expect(data?.pages[0].blocks).toBeUndefined();
  expect(data?.pages[1].blocks?.map((block) => block.id)).toEqual(["valid"]);
  expect(data?.pages[2].blocks).toEqual([]);
});

it.each(["local", "remote"] as const)("lets an active version clear inherited page compositions (%s)", async (source) => {
  const config = {
    site: { name: "Blocks", defaultLanguage: "en", docsVersion: "v1" }, routes: [], "menus-header": [],
    "routes-md": [{ id: 1, path: { en: "one.md" } }],
    pages: [{ id: 39, blocks: [{ id: "intro", type: "md", routeId: 1 }] }],
    VersionControl: { versions: [{ id: "v1", path: "docs/v1/config.json" }] },
  };
  const version = { pages: [] };
  stubRepoFetch({ "owner/repo/gitpagedocs/config.json": config, "owner/repo/docs/v1/config.json": version, "owner/repo/one.md": "# One" });
  if (source === "local") {
    vi.stubEnv("GITHUB_ACTIONS", "");
    vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "");
    vi.stubEnv("GITHUB_REPOSITORY", "");
    workspace = createTempWorkspace();
    workspace.write("gitpagedocs/config.json", config);
    workspace.write("docs/v1/config.json", version);
    workspace.write("one.md", "# One");
  }
  const data = source === "local" ? await loadDocsData(undefined) : await loadRemoteDocsData("owner", "repo");
  expect(data?.pages.map((page) => page.id)).toEqual([1]);
  expect(data?.config.pages).toEqual([]);
});
