import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkRepositoryHasGitPageDocs,
  fetchOfficialSiteConfig,
  loadLayoutsAndThemes,
  loadRemoteDocsData,
  loadStandaloneLayoutsAndThemes,
  parseSupportedLanguage,
} from "@/entities/docs/api/load-remote-docs-data-client";
import type { GitPageDocsConfig } from "@/entities/docs/model/types";
import { minimalConfig, requestedUrls, stubFetch, stubRepoFetch } from "./test-helpers";

const FALLBACK_ID = "gitpagedocs-fallback-dark";
const OFFICIAL = "Vidigal-code/git-page-docs";

const layoutItem = (id: string) => ({
  id,
  name: id,
  author: "t",
  file: `templates/${id}.json`,
  preview: "",
  supportsLightAndDarkModes: false,
  mode: "dark" as const,
});

const template = (id: string, background: string) => ({
  id,
  name: id,
  author: "t",
  version: "1",
  mode: "dark",
  supportsLightAndDarkModes: false,
  colors: { background },
  typography: { fontFamily: "x", fontSize: { base: "1rem" } },
  components: {},
  animations: {},
});

const INDEX = { layouts: [layoutItem("alpha")] };

afterEach(() => vi.unstubAllGlobals());

describe("parseSupportedLanguage", () => {
  it.each([
    ["pt", "pt"],
    ["es", "es"],
    ["en", "en"],
    ["fr", "en"],
    ["", "en"],
    [null, "en"],
    [undefined, "en"],
  ])("maps %s to %s", (input, expected) => {
    expect(parseSupportedLanguage(input)).toBe(expected);
  });
});

describe("checkRepositoryHasGitPageDocs", () => {
  it("is true as soon as a branch candidate serves parseable JSON", async () => {
    const fetchSpy = stubFetch([["/o/r/master/gitpagedocs/config.json", { site: {} }]]);

    await expect(checkRepositoryHasGitPageDocs("o", "r")).resolves.toBe(true);
    expect(requestedUrls(fetchSpy)).toEqual([
      "https://raw.githubusercontent.com/o/r/HEAD/gitpagedocs/config.json",
      "https://raw.githubusercontent.com/o/r/main/gitpagedocs/config.json",
      "https://raw.githubusercontent.com/o/r/master/gitpagedocs/config.json",
    ]);
  });

  it("is false when every candidate is missing, broken or unreachable", async () => {
    stubFetch([]);
    await expect(checkRepositoryHasGitPageDocs("o", "r")).resolves.toBe(false);

    stubFetch([["gitpagedocs/config.json", "{ not json"]]);
    await expect(checkRepositoryHasGitPageDocs("o", "r")).resolves.toBe(false);

    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    await expect(checkRepositoryHasGitPageDocs("o", "r")).resolves.toBe(false);
  });
});

describe("fetchOfficialSiteConfig", () => {
  it("returns the official site section with its language bundles folded in", async () => {
    stubRepoFetch({
      [`${OFFICIAL}/gitpagedocs/config.json`]: { site: { SiteHeaderName: "Official", languages: { en: true } } },
      [`${OFFICIAL}/gitpagedocs/langs/en.json`]: { langmenu: { menuOpen: "Official EN" } },
    });

    const site = await fetchOfficialSiteConfig();

    expect(site?.SiteHeaderName).toBe("Official");
    expect(site?.langmenu?.en.menuOpen).toBe("Official EN");
  });

  it("is null when the official config cannot be read", async () => {
    stubRepoFetch({});
    await expect(fetchOfficialSiteConfig()).resolves.toBeNull();
  });
});

describe("loadStandaloneLayoutsAndThemes", () => {
  it("loads the official index and its templates from the canonical folder", async () => {
    stubRepoFetch({
      [`${OFFICIAL}/gitpagelayouts/layoutsConfig.json`]: INDEX,
      [`${OFFICIAL}/gitpagelayouts/templates/alpha.json`]: template("alpha", "#official"),
    });

    const { layoutsConfig, themes } = await loadStandaloneLayoutsAndThemes();

    expect(layoutsConfig).toEqual(INDEX);
    expect(themes.alpha.colors.background).toBe("#official");
  });

  it("ships the built-in fallback when there is no index or no template at all", async () => {
    stubRepoFetch({});
    expect((await loadStandaloneLayoutsAndThemes()).layoutsConfig.layouts[0].id).toBe(FALLBACK_ID);

    stubRepoFetch({ [`${OFFICIAL}/gitpagelayouts/layoutsConfig.json`]: INDEX });
    const { layoutsConfig, themes } = await loadStandaloneLayoutsAndThemes();
    expect(layoutsConfig.layouts[0].id).toBe(FALLBACK_ID);
    expect(themes[FALLBACK_ID]).toBeDefined();
  });
});

describe("loadLayoutsAndThemes for a remote repository", () => {
  const siteConfig = (site: Record<string, unknown>) => minimalConfig({}, site);

  it("reads the configured index and looks templates up next to it, then in the repository", async () => {
    stubRepoFetch(
      { "o/r/gitpagelayouts/templates/beta.json": template("beta", "#repo") },
      [
        ["cfg.example/layouts/layoutsConfig.json", { layouts: [layoutItem("alpha"), layoutItem("beta")] }],
        ["cfg.example/layouts/templates/alpha.json", template("alpha", "#cfg")],
      ],
    );

    const { themes } = await loadLayoutsAndThemes(siteConfig({ layoutsConfigPath: "https://cfg.example/layouts/layoutsConfig.json" }), "o", "r");

    expect(themes.alpha.colors.background).toBe("#cfg");
    expect(themes.beta.colors.background).toBe("#repo");
  });

  it("honours a templates override next to a configured index", async () => {
    stubRepoFetch({}, [
      ["cfg.example/layoutsConfig.json", INDEX],
      ["tpl.example/templates/alpha.json", template("alpha", "#tpl")],
    ]);

    const { themes } = await loadLayoutsAndThemes(
      siteConfig({ layoutsConfigPath: "https://cfg.example/layoutsConfig.json", layoutsConfigPathTemplates: "https://tpl.example" }),
      "o",
      "r",
    );

    expect(themes.alpha.colors.background).toBe("#tpl");
  });

  it("uses the repository's own layouts folder when nothing is configured", async () => {
    stubRepoFetch({
      "o/r/gitpagelayouts/layoutsConfig.json": INDEX,
      "o/r/gitpagelayouts/templates/alpha.json": template("alpha", "#repo"),
    });

    const { layoutsConfig, themes } = await loadLayoutsAndThemes(siteConfig({}), "o", "r");

    expect(layoutsConfig).toEqual(INDEX);
    expect(themes.alpha.colors.background).toBe("#repo");
  });

  it("defaults official layouts to the canonical official index and templates", async () => {
    const fetchSpy = stubRepoFetch({
      [`${OFFICIAL}/gitpagelayouts/layoutsConfig.json`]: INDEX,
      [`${OFFICIAL}/gitpagelayouts/templates/alpha.json`]: template("alpha", "#official"),
    });

    const { themes } = await loadLayoutsAndThemes(siteConfig({ layoutsConfigPathOficial: true }), "o", "r");

    expect(themes.alpha.colors.background).toBe("#official");
    expect(requestedUrls(fetchSpy).some((url) => url.includes("/o/r/"))).toBe(false);
  });

  it("recovers through the official candidates when the configured official index is stale", async () => {
    stubRepoFetch({
      [`${OFFICIAL}/gitpagelayouts/layoutsConfig.json`]: INDEX,
      [`${OFFICIAL}/gitpagelayouts/templates/alpha.json`]: template("alpha", "#official"),
    });

    const { themes } = await loadLayoutsAndThemes(
      siteConfig({
        layoutsConfigPathOficial: true,
        layoutsConfigPathOficialUrl: "https://stale.example/layoutsConfig.json",
        layoutsConfigPathTemplatesOficial: "https://stale.example/templates",
      }),
      "o",
      "r",
    );

    expect(themes.alpha.colors.background).toBe("#official");
  });

  it("skips a layout whose template is missing next to the index and in every repository folder", async () => {
    const fetchSpy = stubRepoFetch({}, [
      ["cfg.example/layouts/layoutsConfig.json", { layouts: [layoutItem("alpha"), layoutItem("beta")] }],
      ["cfg.example/layouts/templates/alpha.json", template("alpha", "#cfg")],
    ]);

    const { layoutsConfig, themes } = await loadLayoutsAndThemes(siteConfig({ layoutsConfigPath: "https://cfg.example/layouts/layoutsConfig.json" }), "o", "r");

    expect(layoutsConfig.layouts.map((layout) => layout.id)).toEqual(["alpha", "beta"]);
    expect(Object.keys(themes)).toEqual(["alpha"]);
    const betaRequests = requestedUrls(fetchSpy).filter((url) => url.endsWith("templates/beta.json"));
    expect(betaRequests[0]).toContain("cfg.example/layouts/templates/beta.json");
    expect(betaRequests.some((url) => url.includes("/o/r/"))).toBe(true);
  });

  it("throws when no index can be found anywhere", async () => {
    stubRepoFetch({});
    await expect(loadLayoutsAndThemes(siteConfig({ layoutsConfigPath: "https://cfg.example/x.json" }), "o", "r")).rejects.toThrow(
      "Could not load layouts configuration.",
    );
  });
});

describe("loadRemoteDocsData", () => {
  const remoteSite = (overrides: Record<string, unknown> = {}) => ({
    name: "Remote",
    defaultLanguage: "en",
    rendering: "",
    ThemeDefault: "alpha",
    HideThemeSelector: false,
    ...overrides,
  });

  const VERSION_V1 = {
    auth: { accessKeys: { k: "v" } },
    "routes-md": [{ id: 2, path: { en: "docs/v1/en/b.md", pt: "docs/v1/pt/b.md", es: "docs/v1/es/b.md" } }],
    "routes-source-viewer": [{ id: 3, "source-viewer": true, "source-viewer-path": { en: "src/en", pt: "src/pt" } }],
    "routes-html": [
      { id: 4, path: { en: "html/en.html" } },
      { id: 5, url: { en: "https://u/en", pt: "https://u/pt" } },
    ],
    "routes-video": [{ id: 6, video: { videoType: { en: "youtube" }, pathVideo: { en: "https://v/en" } } }],
    "routes-audio": [{ id: 7, audio: { audioType: { en: "mp3" }, pathAudio: { en: "https://a/en" } } }],
    "menus-header": [{ id: 2 }],
    hierarchyPage: { md: 4, html: 3, video: 2, audio: 1, "source-viewer": 0 },
  };

  const REPO = {
    "o/r/gitpagedocs/config.json": {
      site: remoteSite({ docsVersion: "v1", languages: { en: true, pt: true, es: false } }),
      routes: [],
      "menus-header": [{ id: 1 }],
      "routes-md": [{ id: 1, path: { en: "docs/en/root.md" } }],
      VersionControl: {
        versions: [
          { id: "v1", path: "docs/v1/config.json" },
          { id: "v2", path: "https://example.com/v2.json" },
          { id: "v3", path: "docs/v3/config.json" },
          { id: "v4", path: "" },
        ],
      },
    },
    "o/r/gitpagedocs/langs/en.json": { langmenu: { menuOpen: "EN" } },
    "o/r/docs/en/root.md": "# Root",
    "o/r/gitpagedocs/docs/v1/config.json": VERSION_V1,
    "o/r/docs/v1/en/b.md": "# B en",
    "o/r/docs/v1/pt/b.md": "# B pt",
    "o/r/html/en.html": "<b>en</b>",
    "o/r/docs/v3/config.json": { "routes-md": [], "menus-header": [] },
  };

  const V2_URL: [string, unknown] = [
    "example.com/v2.json",
    { routes: [{ id: 9, path: { en: "docs/v2/en/c.md" } }], "menus-header-md": [{ id: 9 }], hierarchyMenu: { md: 1, html: 0, video: 2 } },
  ];

  it("is null for a repository without gitpagedocs", async () => {
    stubRepoFetch({});
    await expect(loadRemoteDocsData("o", "r")).resolves.toBeNull();
  });

  it("assembles every content type of the default version in the selected language", async () => {
    stubRepoFetch(REPO, [V2_URL]);

    const data = await loadRemoteDocsData("o", "r", undefined, "pt");
    expect(data).not.toBeNull();
    if (!data) return;

    expect(data.availableVersions.map((v) => v.id)).toEqual(["v1", "v2", "v3", "v4"]);
    expect(data.activeVersionId).toBe("v1");
    expect(data.availableLanguages).toEqual(["en", "pt"]);
    expect(data.config.site.defaultLanguage).toBe("pt");
    expect(data.config.site.langmenu.en.menuOpen).toBe("EN");
    expect(data.config.auth).toEqual({ accessKeys: { k: "v" } });
    expect(data.config.routes).toEqual([{ id: 2, path: VERSION_V1["routes-md"][0].path }]);
    expect(data.config["menus-header"]).toEqual([{ id: 2 }]);
    expect(data.config.hierarchyPage).toEqual(VERSION_V1.hierarchyPage);
    expect(data.config.hierarchyMenu).toEqual({ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4 });

    expect(data.pages.map((p) => p.id)).toEqual([2, 3, 4, 5, 6, 7]);
    expect(data.docs).toEqual([{ routeId: 2, markdownByLanguage: { en: '<h1 id="b-en">B en</h1>\n', pt: '<h1 id="b-pt">B pt</h1>\n' } }]);
    expect(data.pages[0].md?.fullscreenEnabled).toBe(true);
    expect(data.pages[1].sourceViewer).toMatchObject({ routeId: 3, sourceViewerPath: "src/pt", fullscreenEnabled: false });
    expect(data.pages[2].html?.htmlByLanguage).toEqual({ en: "<b>en</b>", pt: "<p>Missing HTML path.</p>" });
    expect(data.pages[3].html?.htmlByLanguage).toEqual({ en: "", pt: "" });
    expect(data.pages[4].video).toMatchObject({
      videoTypeByLanguage: { en: "youtube", pt: "youtube" },
      pathVideoByLanguage: { en: "https://v/en", pt: "https://v/en" },
      fullscreenEnabled: true,
    });
    expect(data.pages[5].audio).toMatchObject({
      audioTypeByLanguage: { en: "mp3", pt: "mp3" },
      pathAudioByLanguage: { en: "https://a/en", pt: "https://a/en" },
    });
    expect(data.pathToPageMap).toMatchObject({
      "docs/v1/en/b.md": { pageIndex: 0, contentType: "md" },
      "docs/v1/pt/b.md": { pageIndex: 0, contentType: "md" },
      "page:3": { pageIndex: 1, contentType: "source-viewer" },
      "source-viewer:src/pt": { pageIndex: 1, contentType: "source-viewer" },
      "html/en.html": { pageIndex: 2, contentType: "html" },
      "url:https://u/en": { pageIndex: 3, contentType: "html" },
      "url:https://u/pt": { pageIndex: 3, contentType: "html" },
      "page:6": { pageIndex: 4, contentType: "video" },
      "https://v/en": { pageIndex: 4, contentType: "video" },
      "page:7": { pageIndex: 5, contentType: "audio" },
      "https://a/en": { pageIndex: 5, contentType: "audio" },
    });

    expect(data.showRepositorySearchHome).toBe(false);
    expect(data.activeRepository).toEqual({ owner: "o", repo: "r", requested: true, hasGitPageDocs: true, source: "remote" });
    // No layouts anywhere: the loader's failure degrades to the built-in fallback.
    expect(data.layoutsConfig.layouts[0].id).toBe(FALLBACK_ID);
    expect(data.themes[FALLBACK_ID]).toBeDefined();
  });

  it("loads an http version config, using its legacy routes and menus and the default language when the selection is unavailable", async () => {
    stubRepoFetch(REPO, [V2_URL]);

    const data = await loadRemoteDocsData("o", "r", "v2", "es");
    expect(data).not.toBeNull();
    if (!data) return;

    expect(data.activeVersionId).toBe("v2");
    expect(data.pages.map((p) => p.id)).toEqual([9]);
    expect(data.config["menus-header"]).toEqual([{ id: 9 }]);
    expect(data.config.hierarchyMenu).toEqual({ md: 1, html: 0, video: 2 });
    expect(data.config.site.defaultLanguage).toBe("en");
    expect(data.docs[0].markdownByLanguage.en).toBe("<p>Unable to load remote markdown file.</p>");
    expect(data.config.auth).toBeUndefined();
  });

  it("keeps the root routes when the selected version is empty or has no path", async () => {
    stubRepoFetch(REPO, [V2_URL]);

    const v3 = await loadRemoteDocsData("o", "r", "v3");
    expect(v3?.pages.map((p) => p.id)).toEqual([1]);
    expect(v3?.docs[0].markdownByLanguage.en).toBe('<h1 id="root">Root</h1>\n');
    expect(v3?.config["menus-header"]).toEqual([{ id: 1 }]);

    const v4 = await loadRemoteDocsData("o", "r", "v4");
    expect(v4?.activeVersionId).toBe("v4");
    expect(v4?.pages.map((p) => p.id)).toEqual([1]);
  });

  it("falls back to the first version when neither the selection nor docsVersion match", async () => {
    stubRepoFetch({
      "o/r/gitpagedocs/config.json": {
        site: remoteSite(),
        routes: [],
        "menus-header": [],
        VersionControl: { versions: [{ id: "a", path: "" }, { id: "b", path: "" }] },
      },
    });

    const data = await loadRemoteDocsData("o", "r", "zzz");
    expect(data?.activeVersionId).toBe("a");
  });

  it("derives languages from the first content type that carries them and picks the first available one", async () => {
    const config = (routes: Record<string, unknown>) => ({
      "o/r/gitpagedocs/config.json": { site: remoteSite({ defaultLanguage: "de" }), routes: [], "menus-header": [], ...routes },
    });

    stubRepoFetch(config({ "routes-source-viewer": [{ id: 1, title: { fr: "T" } }] }));
    let data = await loadRemoteDocsData("o", "r");
    expect(data?.availableLanguages).toEqual(["fr"]);
    expect(data?.config.site.defaultLanguage).toBe("fr");

    stubRepoFetch(config({ "routes-html": [{ id: 1, url: { it: "https://x" } }] }));
    data = await loadRemoteDocsData("o", "r");
    expect(data?.availableLanguages).toEqual(["it"]);
    expect(data?.pathToPageMap["url:https://x"]).toEqual({ pageIndex: 0, contentType: "html" });

    stubRepoFetch(config({ "routes-html": [{ id: 1, path: { nl: "h.html" } }] }));
    data = await loadRemoteDocsData("o", "r");
    expect(data?.availableLanguages).toEqual(["nl"]);

    stubRepoFetch(config({ "routes-video": [{ id: 1, video: { videoType: { ja: "youtube" }, pathVideo: { ja: "https://v" } } }] }));
    data = await loadRemoteDocsData("o", "r");
    expect(data?.availableLanguages).toEqual(["ja"]);

    stubRepoFetch(config({ "routes-audio": [{ id: 1, audio: { audioType: { ko: "mp3" }, pathAudio: { ko: "https://a" } } }] }));
    data = await loadRemoteDocsData("o", "r");
    expect(data?.availableLanguages).toEqual(["ko"]);

    stubRepoFetch(config({}));
    data = await loadRemoteDocsData("o", "r");
    expect(data?.availableLanguages).toEqual(["de"]);
    expect(data?.pages).toEqual([]);
  });

  it("uses the source-viewer path of the preferred language, then en, then any", async () => {
    const withSourceViewer = (sourceViewerPath: unknown): GitPageDocsConfig =>
      ({
        site: remoteSite(),
        routes: [],
        "menus-header": [],
        "routes-md": [{ id: 1, path: { en: "a.md", pt: "b.md" } }],
        "routes-source-viewer": [{ id: 2, "source-viewer": true, "source-viewer-path": sourceViewerPath }],
      }) as unknown as GitPageDocsConfig;

    stubRepoFetch({ "o/r/gitpagedocs/config.json": withSourceViewer({ pt: "pt-src", en: "en-src" }) });
    expect((await loadRemoteDocsData("o", "r", undefined, "pt"))?.pages[1].sourceViewer?.sourceViewerPath).toBe("pt-src");

    stubRepoFetch({ "o/r/gitpagedocs/config.json": withSourceViewer({ es: "es-src", en: "en-src" }) });
    expect((await loadRemoteDocsData("o", "r", undefined, "pt"))?.pages[1].sourceViewer?.sourceViewerPath).toBe("en-src");

    stubRepoFetch({ "o/r/gitpagedocs/config.json": withSourceViewer({ es: "es-src" }) });
    expect((await loadRemoteDocsData("o", "r", undefined, "pt"))?.pages[1].sourceViewer?.sourceViewerPath).toBe("es-src");

    stubRepoFetch({ "o/r/gitpagedocs/config.json": withSourceViewer("plain") });
    expect((await loadRemoteDocsData("o", "r"))?.pages[1].sourceViewer?.sourceViewerPath).toBe("plain");
  });
});

describe("remote markdown pages keep the original file text", () => {
  it("exposes sourceByLanguage next to the rendered HTML (copy/download need it)", async () => {
    stubRepoFetch({
      "o/r/gitpagedocs/config.json": minimalConfig(
        {
          "routes-md": [{ id: 1, path: { en: "docs/en/a.md", pt: "docs/pt/a.md" } }],
          "menus-header-md": [{ id: 1 }],
        },
        { supportedLanguages: ["en", "pt"] },
      ),
      "o/r/docs/en/a.md": "---\ntitle: x\n---\n# Hello",
      "o/r/docs/pt/a.md": "# Ola",
    });

    const data = await loadRemoteDocsData("o", "r", undefined, "en");

    const md = data?.pages[0]?.md;
    expect(md?.markdownByLanguage.en).toContain("Hello");
    expect(md?.sourceByLanguage).toEqual({ en: "---\ntitle: x\n---\n# Hello", pt: "# Ola" });
  });

  it("leaves unreadable files out of sourceByLanguage", async () => {
    stubRepoFetch({
      "o/r/gitpagedocs/config.json": minimalConfig({ "routes-md": [{ id: 1, path: { en: "docs/en/missing.md" } }], "menus-header-md": [{ id: 1 }] }),
    });

    const data = await loadRemoteDocsData("o", "r", undefined, "en");

    expect(data?.pages[0]?.md?.markdownByLanguage.en).toBe("<p>Unable to load remote markdown file.</p>");
    expect(data?.pages[0]?.md?.sourceByLanguage).toEqual({});
  });
});
