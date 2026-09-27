import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPages } from "@/entities/docs/api/content/load-pages";
import type { ContentTypeRouteConfig, RouteConfig } from "@/entities/docs/model/types";
import { createTempWorkspace, stubFetch, type TempWorkspace } from "./test-helpers";

type LoadOptions = Parameters<typeof loadPages>[0];

function options(overrides: Partial<LoadOptions>): LoadOptions {
  return {
    sortedIds: [],
    routesMd: [],
    routesSourceViewer: [],
    routesHtml: [],
    routesVideo: [],
    routesAudio: [],
    languages: ["en", "pt"],
    source: "local",
    ...overrides,
  };
}

describe("loadPages", () => {
  let workspace: TempWorkspace | undefined;

  afterEach(() => {
    workspace?.cleanup();
    workspace = undefined;
    vi.unstubAllGlobals();
  });

  it("returns a bare page for an id no route claims", async () => {
    const { pages, pathToPageMap } = await loadPages(options({ sortedIds: [4] }));
    expect(pages).toEqual([{ id: 4 }]);
    expect(pathToPageMap).toEqual({});
  });

  describe("markdown routes", () => {
    it("renders local markdown per language and indexes each path", async () => {
      workspace = createTempWorkspace();
      workspace.write("docs/en/a.md", "---\ntitle: x\n---\n# Hello World\n\ntext");
      workspace.write("docs/pt/a.md", "# Ola");
      const route: RouteConfig = { id: 1, path: { en: "docs/en/a.md", pt: "docs/pt/a.md" } };

      const { pages, pathToPageMap } = await loadPages(options({ sortedIds: [1], routesMd: [route] }));

      expect(pages[0].md?.routeId).toBe(1);
      expect(pages[0].md?.config).toBe(route);
      expect(pages[0].md?.fullscreenEnabled).toBe(true);
      expect(pages[0].md?.markdownByLanguage.en).toContain('<h1 id="hello-world">Hello World</h1>');
      expect(pages[0].md?.markdownByLanguage.en).not.toContain("title: x");
      expect(pages[0].md?.markdownByLanguage.pt).toContain('<h1 id="ola">Ola</h1>');
      expect(pathToPageMap).toEqual({
        "docs/en/a.md": { pageIndex: 0, contentType: "md" },
        "docs/pt/a.md": { pageIndex: 0, contentType: "md" },
      });
    });

    it("reports a missing language path and an unreadable local file distinctly", async () => {
      workspace = createTempWorkspace();
      const route: ContentTypeRouteConfig = { id: 1, path: { en: "docs/en/missing.md" }, fullscreenEnabled: false };

      const { pages, pathToPageMap } = await loadPages(options({ sortedIds: [1], routesMd: [route] }));

      expect(pages[0].md?.markdownByLanguage).toEqual({
        en: "<p>Unable to load local markdown file.</p>",
        pt: "<p>Missing language file path in config.</p>",
      });
      expect(pages[0].md?.fullscreenEnabled).toBe(false);
      expect(pathToPageMap).toEqual({ "docs/en/missing.md": { pageIndex: 0, contentType: "md" } });
    });

    it("fetches remote markdown from the repository mirrors", async () => {
      stubFetch([["/o/r/HEAD/docs/en/a.md", "# Remote"]]);
      const route: RouteConfig = { id: 1, path: { en: "docs/en/a.md", pt: "docs/pt/a.md" } };

      const { pages } = await loadPages(options({ sortedIds: [1], routesMd: [route], source: "remote", owner: "o", repo: "r" }));

      expect(pages[0].md?.markdownByLanguage).toEqual({
        en: '<h1 id="remote">Remote</h1>\n',
        pt: "<p>Unable to load remote markdown file.</p>",
      });
    });

    it("skips md routes that have no path object", async () => {
      const { pages } = await loadPages(options({ sortedIds: [1], routesMd: [{ id: 1 } as ContentTypeRouteConfig] }));
      expect(pages[0].md).toBeUndefined();
    });
  });

  describe("source viewer routes", () => {
    it("requires source-viewer: true", async () => {
      const { pages } = await loadPages(
        options({ sortedIds: [2], routesSourceViewer: [{ id: 2, "source-viewer-path": "src" }] }),
      );
      expect(pages[0].sourceViewer).toBeUndefined();
    });

    it("uses a string source-viewer-path as is and indexes both keys", async () => {
      const route: ContentTypeRouteConfig = { id: 2, "source-viewer": true, "source-viewer-path": "src/app" };
      const { pages, pathToPageMap } = await loadPages(options({ sortedIds: [2], routesSourceViewer: [route] }));

      expect(pages[0].sourceViewer).toEqual({ routeId: 2, config: route, sourceViewerPath: "src/app", fullscreenEnabled: false });
      expect(pathToPageMap).toEqual({
        "page:2": { pageIndex: 0, contentType: "source-viewer" },
        "source-viewer:src/app": { pageIndex: 0, contentType: "source-viewer" },
      });
    });

    it("picks the localized path for the first language, then en, then any", async () => {
      const first = await loadPages(
        options({
          sortedIds: [2],
          languages: ["pt", "en"],
          routesSourceViewer: [{ id: 2, "source-viewer": true, "source-viewer-path": { en: "en-src", pt: "pt-src" }, fullscreenEnabled: true }],
        }),
      );
      expect(first.pages[0].sourceViewer?.sourceViewerPath).toBe("pt-src");
      expect(first.pages[0].sourceViewer?.fullscreenEnabled).toBe(true);

      const en = await loadPages(
        options({ sortedIds: [2], languages: ["pt"], routesSourceViewer: [{ id: 2, "source-viewer": true, "source-viewer-path": { en: "en-src", es: "es-src" } }] }),
      );
      expect(en.pages[0].sourceViewer?.sourceViewerPath).toBe("en-src");

      const any = await loadPages(
        options({ sortedIds: [2], languages: ["pt"], routesSourceViewer: [{ id: 2, "source-viewer": true, "source-viewer-path": { es: "es-src" } }] }),
      );
      expect(any.pages[0].sourceViewer?.sourceViewerPath).toBe("es-src");

      const none = await loadPages(options({ sortedIds: [2], routesSourceViewer: [{ id: 2, "source-viewer": true }] }));
      expect(none.pages[0].sourceViewer?.sourceViewerPath).toBe("");
      expect(none.pathToPageMap).toEqual({ "page:2": { pageIndex: 0, contentType: "source-viewer" } });
    });
  });

  describe("html routes", () => {
    it("loads local html per language and indexes each path", async () => {
      workspace = createTempWorkspace();
      workspace.write("html/en.html", "<b>en</b>");
      const route: ContentTypeRouteConfig = { id: 3, path: { en: "html/en.html", pt: "html/pt.html" } };

      const { pages, pathToPageMap } = await loadPages(options({ sortedIds: [3], routesHtml: [route] }));

      expect(pages[0].html).toEqual({
        routeId: 3,
        config: route,
        htmlByLanguage: { en: "<b>en</b>", pt: "<p>Unable to load local HTML file.</p>" },
        fullscreenEnabled: true,
      });
      expect(pathToPageMap).toEqual({
        "html/en.html": { pageIndex: 0, contentType: "html" },
        "html/pt.html": { pageIndex: 0, contentType: "html" },
      });
    });

    it("reports a missing html path per language", async () => {
      workspace = createTempWorkspace();
      const { pages } = await loadPages(
        options({ sortedIds: [3], routesHtml: [{ id: 3, path: { en: "" }, fullscreenEnabled: false }], languages: ["en"] }),
      );
      // path: { en: "" } is truthy as an object but the language entry is empty.
      expect(pages[0].html?.htmlByLanguage).toEqual({ en: "<p>Missing HTML path.</p>" });
      expect(pages[0].html?.fullscreenEnabled).toBe(false);
    });

    it("fetches remote html and falls back per language", async () => {
      stubFetch([["/o/r/HEAD/html/en.html", "<i>remote</i>"]]);

      const { pages } = await loadPages(
        options({ sortedIds: [3], routesHtml: [{ id: 3, path: { en: "html/en.html", pt: "html/pt.html" } }], source: "remote", owner: "o", repo: "r" }),
      );

      expect(pages[0].html?.htmlByLanguage).toEqual({ en: "<i>remote</i>", pt: "<p>Unable to load remote HTML.</p>" });
    });

    it("indexes url routes under url: and leaves html empty", async () => {
      const route: ContentTypeRouteConfig = { id: 3, url: { pt: "https://pt.example", en: "https://en.example" } };
      const { pages, pathToPageMap } = await loadPages(options({ sortedIds: [3], routesHtml: [route] }));

      expect(pages[0].html?.htmlByLanguage).toEqual({ en: "", pt: "" });
      expect(pathToPageMap).toEqual({ "url:https://en.example": { pageIndex: 0, contentType: "html" } });

      const firstUrl = await loadPages(options({ sortedIds: [3], routesHtml: [{ id: 3, url: { es: "https://es.example" } }] }));
      expect(firstUrl.pathToPageMap).toEqual({ "url:https://es.example": { pageIndex: 0, contentType: "html" } });
    });

    it("ignores html routes without path or url", async () => {
      const { pages } = await loadPages(options({ sortedIds: [3], routesHtml: [{ id: 3 }] }));
      expect(pages[0].html).toBeUndefined();
    });
  });

  describe("video and audio routes", () => {
    it("maps video type and path per language with en fallbacks", async () => {
      const route: ContentTypeRouteConfig = {
        id: 5,
        video: { videoType: { en: "youtube", pt: "mp4" }, pathVideo: { en: "https://v/en", pt: "https://v/pt" } },
      };
      const { pages, pathToPageMap } = await loadPages(options({ sortedIds: [5], routesVideo: [route], languages: ["en", "pt", "es"] }));

      expect(pages[0].video).toEqual({
        routeId: 5,
        config: route,
        videoTypeByLanguage: { en: "youtube", pt: "mp4", es: "youtube" },
        pathVideoByLanguage: { en: "https://v/en", pt: "https://v/pt", es: "https://v/en" },
        fullscreenEnabled: true,
      });
      expect(pathToPageMap).toEqual({
        "page:5": { pageIndex: 0, contentType: "video" },
        "https://v/en": { pageIndex: 0, contentType: "video" },
        "https://v/pt": { pageIndex: 0, contentType: "video" },
      });
    });

    it("defaults to youtube and an empty path when no language matches", async () => {
      const route: ContentTypeRouteConfig = { id: 5, video: { videoType: { es: "vimeo" }, pathVideo: { es: "https://v/es" } }, fullscreenEnabled: false };
      const { pages, pathToPageMap } = await loadPages(options({ sortedIds: [5], routesVideo: [route], languages: ["en"] }));

      expect(pages[0].video?.videoTypeByLanguage).toEqual({ en: "youtube" });
      expect(pages[0].video?.pathVideoByLanguage).toEqual({ en: "" });
      expect(pages[0].video?.fullscreenEnabled).toBe(false);
      expect(pathToPageMap).toEqual({ "page:5": { pageIndex: 0, contentType: "video" } });
    });

    it("skips video routes without a complete video block", async () => {
      const incomplete = { id: 5, video: { videoType: { en: "youtube" } } } as unknown as ContentTypeRouteConfig;
      const { pages } = await loadPages(options({ sortedIds: [5], routesVideo: [incomplete] }));
      expect(pages[0].video).toBeUndefined();
    });

    it("maps audio type and path per language with en fallbacks", async () => {
      const route: ContentTypeRouteConfig = {
        id: 6,
        audio: { audioType: { en: "mp3" }, pathAudio: { en: "https://a/en" } },
      };
      const { pages, pathToPageMap } = await loadPages(options({ sortedIds: [6], routesAudio: [route], languages: ["en", "pt"] }));

      expect(pages[0].audio).toEqual({
        routeId: 6,
        config: route,
        audioTypeByLanguage: { en: "mp3", pt: "mp3" },
        pathAudioByLanguage: { en: "https://a/en", pt: "https://a/en" },
        fullscreenEnabled: true,
      });
      expect(pathToPageMap).toEqual({
        "page:6": { pageIndex: 0, contentType: "audio" },
        "https://a/en": { pageIndex: 0, contentType: "audio" },
      });
    });

    it("does not treat a background-music audio block (tracks) as an audio route", async () => {
      const { pages } = await loadPages(
        options({ sortedIds: [6], routesAudio: [{ id: 6, audio: { tracks: [{ url: "x", type: "mp3" }] } }] }),
      );
      expect(pages[0].audio).toBeUndefined();
    });
  });

  it("assembles multiple content types on one page and increments pageIndex per id", async () => {
    workspace = createTempWorkspace();
    workspace.write("docs/en/a.md", "# A");
    workspace.write("docs/en/b.md", "# B");

    const { pages, pathToPageMap } = await loadPages(
      options({
        sortedIds: [1, 2],
        languages: ["en"],
        routesMd: [
          { id: 1, path: { en: "docs/en/a.md" } },
          { id: 2, path: { en: "docs/en/b.md" } },
        ],
        routesSourceViewer: [{ id: 2, "source-viewer": true, "source-viewer-path": "src" }],
        routesHtml: [{ id: 2, url: { en: "https://h" } }],
        routesVideo: [{ id: 1, video: { videoType: { en: "youtube" }, pathVideo: { en: "https://v" } } }],
        routesAudio: [{ id: 1, audio: { audioType: { en: "mp3" }, pathAudio: { en: "https://a" } } }],
      }),
    );

    expect(pages.map((p) => p.id)).toEqual([1, 2]);
    expect(pages[0].md && pages[0].video && pages[0].audio).toBeTruthy();
    expect(pages[0].sourceViewer ?? pages[0].html).toBeUndefined();
    expect(pages[1].md && pages[1].sourceViewer && pages[1].html).toBeTruthy();
    expect(pathToPageMap["docs/en/b.md"]).toEqual({ pageIndex: 1, contentType: "md" });
    expect(pathToPageMap["page:2"]).toEqual({ pageIndex: 1, contentType: "source-viewer" });
    // Audio is resolved after video, so it owns the shared page:<id> key.
    expect(pathToPageMap["page:1"]).toEqual({ pageIndex: 0, contentType: "audio" });
    expect(pathToPageMap["url:https://h"]).toEqual({ pageIndex: 1, contentType: "html" });
  });
});
