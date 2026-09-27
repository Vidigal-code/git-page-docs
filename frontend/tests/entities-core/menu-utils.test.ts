import { describe, expect, it } from "vitest";
import {
  getPageIndexByPathClick,
  getPathClickByRouteId,
  getRouteIndexByPath,
  getUrlParamsForPathClick,
} from "@/entities/docs/model/menu-utils";
import { getBreadcrumbTrail, type MenuNode } from "@/entities/docs/model/menu";
import type { ContentTypeRouteConfig, LoadedPage } from "@/entities/docs/model/types";
import { makeDocsData } from "./fixtures/docs-data";

const INTRO_EN = "docs/intro.md";
const INTRO_PT = "docs/pt/intro.md";
const LANDING = "pages/landing.html";
const LANDING_URL = "https://example.com/landing";
const SOURCE_PATH = "/source-viewer/o/r/tree/main";
const VIDEO_URL = "https://youtu.be/dQw4w9WgXcQ";
const AUDIO_PATH = "audio/track.mp3";

const mdRoute: ContentTypeRouteConfig = { id: 1, path: { en: INTRO_EN, pt: INTRO_PT } };
const htmlRoute: ContentTypeRouteConfig = { id: 1, path: { en: LANDING } };
const htmlUrlRoute: ContentTypeRouteConfig = { id: 1, url: { en: LANDING_URL } };

/** A page carrying every content type, so the hierarchy decides which one wins. */
function fullPage(id = 1): Required<LoadedPage> {
  return {
    id,
    md: { routeId: id, config: mdRoute, markdownByLanguage: { en: "<p>hi</p>" } },
    html: { routeId: id, config: htmlRoute, htmlByLanguage: { en: "<div></div>" } },
    sourceViewer: { routeId: id, config: { id }, sourceViewerPath: SOURCE_PATH },
    video: { routeId: id, config: { id }, videoTypeByLanguage: { en: "youtube" }, pathVideoByLanguage: { en: VIDEO_URL } },
    audio: { routeId: id, config: { id }, audioTypeByLanguage: { en: "mp3" }, pathAudioByLanguage: { en: AUDIO_PATH } },
  };
}

describe("getRouteIndexByPath", () => {
  it("finds the route whose path for that language matches, else -1", () => {
    const data = makeDocsData({ routes: [{ id: 1, path: { en: INTRO_EN, pt: INTRO_PT } }, { id: 2, path: { en: "docs/b.md" } }] });
    expect(getRouteIndexByPath(data, "pt", INTRO_PT)).toBe(0);
    expect(getRouteIndexByPath(data, "en", "docs/b.md")).toBe(1);
    expect(getRouteIndexByPath(data, "en", INTRO_PT)).toBe(-1);
  });
});

describe("getPathClickByRouteId", () => {
  describe("when the route id belongs to a loaded page", () => {
    it("prefers markdown under the default hierarchy and localizes the path", () => {
      const data = makeDocsData({}, { pages: [fullPage()] });
      expect(getPathClickByRouteId(data, 1, "pt")).toBe(INTRO_PT);
      expect(getPathClickByRouteId(data, 1, "en")).toBe(INTRO_EN);
    });

    it("falls back to English, then the first declared language, when the path is not localized", () => {
      const enOnly: LoadedPage = { id: 1, md: { routeId: 1, config: { id: 1, path: { en: INTRO_EN } }, markdownByLanguage: {} } };
      expect(getPathClickByRouteId(makeDocsData({}, { pages: [enOnly] }), 1, "es")).toBe(INTRO_EN);
      const ptOnly: LoadedPage = { id: 1, md: { routeId: 1, config: { id: 1, path: { pt: INTRO_PT } }, markdownByLanguage: {} } };
      expect(getPathClickByRouteId(makeDocsData({}, { pages: [ptOnly] }), 1, "es")).toBe(INTRO_PT);
    });

    it("follows a custom hierarchyPage order", () => {
      const data = makeDocsData({ hierarchyPage: { video: 0, md: 1, html: 2 } }, { pages: [fullPage()] });
      expect(getPathClickByRouteId(data, 1, "en")).toBe("page:1");
    });

    it("resolves each content type to its path click shape", () => {
      const base = fullPage();
      const cases: Array<[LoadedPage, string]> = [
        [{ id: 1, html: base.html }, LANDING],
        [{ id: 1, sourceViewer: base.sourceViewer }, "page:1"],
        [{ id: 1, video: base.video }, "page:1"],
        [{ id: 1, audio: base.audio }, "page:1"],
      ];
      for (const [page, expected] of cases) {
        expect(getPathClickByRouteId(makeDocsData({}, { pages: [page] }), 1, "en")).toBe(expected);
      }
    });

    it("uses the url: form for html pages that only have an external url", () => {
      const page: LoadedPage = { id: 1, html: { routeId: 1, config: htmlUrlRoute, htmlByLanguage: {} } };
      expect(getPathClickByRouteId(makeDocsData({}, { pages: [page] }), 1, "en")).toBe(`url:${LANDING_URL}`);
    });

    it("falls through to the config routes when the page carries no resolvable content", () => {
      const page: LoadedPage = { id: 1, html: { routeId: 1, config: { id: 1 }, htmlByLanguage: {} } };
      const data = makeDocsData({ "routes-video": [{ id: 1 }] }, { pages: [page] });
      expect(getPathClickByRouteId(data, 1, "en")).toBe("page:1");
    });
  });

  describe("when the route id only exists in the config", () => {
    it("reads routes-md, falling back to routes", () => {
      expect(getPathClickByRouteId(makeDocsData({ "routes-md": [mdRoute] }), 1, "pt")).toBe(INTRO_PT);
      expect(getPathClickByRouteId(makeDocsData({ routes: [{ id: 1, path: { en: INTRO_EN } }] }), 1, "en")).toBe(INTRO_EN);
    });

    it("reads routes-html by path, then by external url", () => {
      expect(getPathClickByRouteId(makeDocsData({ "routes-html": [htmlRoute] }), 1, "en")).toBe(LANDING);
      expect(getPathClickByRouteId(makeDocsData({ "routes-html": [htmlUrlRoute] }), 1, "en")).toBe(`url:${LANDING_URL}`);
      expect(getPathClickByRouteId(makeDocsData({ "routes-html": [{ id: 1 }] }), 1, "en")).toBeNull();
    });

    it("returns page:<id> for source-viewer, video and audio routes", () => {
      expect(getPathClickByRouteId(makeDocsData({ "routes-source-viewer": [{ id: 7 }] }), 7, "en")).toBe("page:7");
      expect(getPathClickByRouteId(makeDocsData({ "routes-video": [{ id: 8 }] }), 8, "en")).toBe("page:8");
      expect(getPathClickByRouteId(makeDocsData({ "routes-audio": [{ id: 9 }] }), 9, "en")).toBe("page:9");
    });

    it("honours hierarchyPage when the id exists in several sections", () => {
      const data = makeDocsData({
        "routes-md": [mdRoute],
        "routes-audio": [{ id: 1 }],
        hierarchyPage: { audio: 0, md: 1, html: 2, video: 3 },
      });
      expect(getPathClickByRouteId(data, 1, "en")).toBe("page:1");
    });

    it("returns null for an unknown id", () => {
      const data = makeDocsData({ routes: [{ id: 2, path: { en: INTRO_EN } }], "routes-html": [htmlRoute] });
      expect(getPathClickByRouteId(data, 3, "en")).toBeNull();
    });
  });
});

describe("getPageIndexByPathClick", () => {
  it("uses pathToPageMap when the path click is indexed", () => {
    const data = makeDocsData({}, { pathToPageMap: { [INTRO_EN]: { pageIndex: 4, contentType: "md" } } });
    expect(getPageIndexByPathClick(data, INTRO_EN)).toBe(4);
  });

  it("maps a config route to the loaded page with the same id", () => {
    const data = makeDocsData(
      { routes: [{ id: 10, path: { en: "a.md" } }, { id: 20, path: { en: "b.md", pt: "b-pt.md" } }] },
      { pages: [{ id: 20 }, { id: 10 }] },
    );
    expect(getPageIndexByPathClick(data, "b-pt.md")).toBe(0);
    expect(getPageIndexByPathClick(data, "a.md")).toBe(1);
  });

  it("returns the route index when no pages are loaded or the page id is missing", () => {
    const routes = [{ id: 10, path: { en: "a.md" } }, { id: 20, path: { en: "b.md" } }];
    expect(getPageIndexByPathClick(makeDocsData({ routes }), "b.md")).toBe(1);
    expect(getPageIndexByPathClick(makeDocsData({ routes }, { pages: [{ id: 99 }] }), "b.md")).toBe(1);
  });

  it("scans loaded page content for every path click shape", () => {
    const data = makeDocsData({}, { pages: [{ id: 5 }, fullPage(6)] });
    expect(getPageIndexByPathClick(data, INTRO_PT)).toBe(1);
    expect(getPageIndexByPathClick(data, LANDING)).toBe(1);
    expect(getPageIndexByPathClick(data, SOURCE_PATH)).toBe(1);
    expect(getPageIndexByPathClick(data, "page:6")).toBe(1);
    expect(getPageIndexByPathClick(data, VIDEO_URL)).toBe(1);
    expect(getPageIndexByPathClick(data, AUDIO_PATH)).toBe(1);
  });

  it("strips the url: prefix when matching html pages by external url", () => {
    const page: LoadedPage = { id: 3, html: { routeId: 3, config: htmlUrlRoute, htmlByLanguage: {} } };
    const data = makeDocsData({}, { pages: [page] });
    expect(getPageIndexByPathClick(data, `url:${LANDING_URL}`)).toBe(0);
    expect(getPageIndexByPathClick(data, LANDING_URL)).toBe(0);
  });

  it("returns -1 when nothing matches", () => {
    const data = makeDocsData({ routes: [{ id: 1, path: { en: "a.md" } }] }, { pages: [fullPage()] });
    expect(getPageIndexByPathClick(data, "nope.md")).toBe(-1);
  });
});

describe("getUrlParamsForPathClick", () => {
  it("sets the menu language and the page id when the path click is indexed, dropping name params", () => {
    const data = makeDocsData({}, { pages: [{ id: 42 }], pathToPageMap: { [INTRO_EN]: { pageIndex: 0, contentType: "md" } } });
    const params = getUrlParamsForPathClick(data, INTRO_EN, "pt", new URLSearchParams("name=old&nome=velho&x=1"));
    expect(params.toString()).toBe("x=1&menu=pt&id=42");
  });

  it("falls back to a slug from the file name, dropping the id param", () => {
    const params = getUrlParamsForPathClick(makeDocsData(), "docs/Getting Started.MD", "en", new URLSearchParams("id=7"));
    expect(params.get("id")).toBeNull();
    expect(params.get("name")).toBe("getting started");
    expect(getUrlParamsForPathClick(makeDocsData(), "pages/Landing.html", "en", new URLSearchParams()).get("name")).toBe("landing");
  });

  it("uses the slug when the indexed page is not loaded", () => {
    const data = makeDocsData({}, { pathToPageMap: { [INTRO_EN]: { pageIndex: 3, contentType: "md" } } });
    expect(getUrlParamsForPathClick(data, INTRO_EN, "en", new URLSearchParams()).toString()).toBe("menu=en&name=intro");
  });

  it("keeps existing params when the path click yields no slug", () => {
    const params = getUrlParamsForPathClick(makeDocsData(), "", "en", new URLSearchParams("id=7"));
    expect(params.toString()).toBe("id=7&menu=en");
  });

  it("starts from empty params when none are given outside a browser", () => {
    expect(getUrlParamsForPathClick(makeDocsData(), "docs/a.md", "en").toString()).toBe("menu=en&name=a");
  });
});

describe("getBreadcrumbTrail", () => {
  const leaf: MenuNode = { key: "b", id: 2, title: "B", pathClick: "b.md", active: false, level: 1, searchLabel: "A / B", ancestorKeys: ["a"], children: [] };
  const tree: MenuNode[] = [{ key: "a", id: 1, title: "A", pathClick: "", active: false, level: 0, searchLabel: "A", ancestorKeys: [], children: [leaf] }];

  it("returns an empty trail for an empty or unknown path click", () => {
    expect(getBreadcrumbTrail(tree, "")).toEqual([]);
    expect(getBreadcrumbTrail(tree, "missing.md")).toEqual([]);
  });

  it("returns the ancestors and the node itself with cumulative ancestor keys", () => {
    expect(getBreadcrumbTrail(tree, "b.md")).toEqual([
      { title: "A", pathClick: "", ancestorKeys: ["a"] },
      { title: "B", pathClick: "b.md", ancestorKeys: ["a", "b"] },
    ]);
  });
});
