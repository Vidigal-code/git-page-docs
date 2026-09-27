import { describe, expect, it } from "vitest";
import { mergeVersionConfig } from "@/entities/docs/api/config/merge-version-config";
import { buildEffectiveConfig } from "@/entities/docs/api/config/build-effective-config";
import type { VersionRoutesConfig } from "@/entities/docs/api/version/resolve-version";
import { DEFAULT_HIERARCHY } from "@/shared/config/constants";
import type { ContentTypeRouteConfig, HeaderMenuItem, RouteConfig } from "@/entities/docs/model/types";
import { minimalConfig } from "./test-helpers";

const baseRoutes: RouteConfig[] = [{ id: 1, path: { en: "docs/en/a.md" } }];
const baseRoutesMd: ContentTypeRouteConfig[] = [{ id: 2, path: { en: "docs/en/b.md" } }];
const baseMenus: HeaderMenuItem[] = [{ id: 1 }];
const baseMenusMd: HeaderMenuItem[] = [{ id: 2 }];
const versionRoutes: RouteConfig[] = [{ id: 10, path: { en: "v/en/a.md" } }];
const versionRoutesMd: ContentTypeRouteConfig[] = [{ id: 20, path: { en: "v/en/b.md" } }];
const versionMenus: HeaderMenuItem[] = [{ id: 10 }];
const versionMenusMd: HeaderMenuItem[] = [{ id: 20 }];

describe("mergeVersionConfig without a version config", () => {
  it("falls back to empty lists and the default hierarchies for a bare config", () => {
    const merged = mergeVersionConfig(minimalConfig(), undefined);

    expect(merged.auth).toBeUndefined();
    expect(merged.routesMd).toEqual([]);
    expect(merged.routesSourceViewer).toEqual([]);
    expect(merged.routesHtml).toEqual([]);
    expect(merged.routesVideo).toEqual([]);
    expect(merged.routesAudio).toEqual([]);
    expect(merged.menusHeaderMd).toEqual([]);
    expect(merged.menusHeaderSourceViewer).toEqual([]);
    expect(merged.menusHeaderHtml).toEqual([]);
    expect(merged.menusHeaderVideo).toEqual([]);
    expect(merged.menusHeaderAudio).toEqual([]);
    expect(merged.hierarchyPage).toEqual(DEFAULT_HIERARCHY);
    expect(merged.hierarchyMenu).toEqual(DEFAULT_HIERARCHY);
  });

  it("prefers routes-md / menus-header-md over the legacy routes / menus-header keys", () => {
    const merged = mergeVersionConfig(
      minimalConfig({ routes: baseRoutes, "routes-md": baseRoutesMd, "menus-header": baseMenus, "menus-header-md": baseMenusMd }),
      undefined,
    );
    expect(merged.routesMd).toBe(baseRoutesMd);
    expect(merged.menusHeaderMd).toBe(baseMenusMd);
  });

  it("uses the legacy routes / menus-header keys when the md-specific ones are absent", () => {
    const merged = mergeVersionConfig(minimalConfig({ routes: baseRoutes, "menus-header": baseMenus }), undefined);
    expect(merged.routesMd).toBe(baseRoutes);
    expect(merged.menusHeaderMd).toBe(baseMenus);
  });

  it("carries every base list, auth and hierarchy through untouched", () => {
    const auth = { accessKeys: { admin: "secret" } };
    const hierarchyPage = { md: 1, html: 0, video: 2 };
    const hierarchyMenu = { md: 2, html: 1, video: 0 };
    const sv = [{ id: 3, "source-viewer": true }];
    const html = [{ id: 4, url: { en: "https://example.com" } }];
    const video = [{ id: 5 }];
    const audio = [{ id: 6 }];
    const merged = mergeVersionConfig(
      minimalConfig({
        auth,
        "routes-source-viewer": sv,
        "routes-html": html,
        "routes-video": video,
        "routes-audio": audio,
        "menus-header-source-viewer": [{ id: 3 }],
        "menus-header-html": [{ id: 4 }],
        "menus-header-video": [{ id: 5 }],
        "menus-header-audio": [{ id: 6 }],
        hierarchyPage,
        hierarchyMenu,
      }),
      undefined,
    );
    expect(merged.auth).toBe(auth);
    expect(merged.routesSourceViewer).toBe(sv);
    expect(merged.routesHtml).toBe(html);
    expect(merged.routesVideo).toBe(video);
    expect(merged.routesAudio).toBe(audio);
    expect(merged.menusHeaderSourceViewer).toEqual([{ id: 3 }]);
    expect(merged.menusHeaderHtml).toEqual([{ id: 4 }]);
    expect(merged.menusHeaderVideo).toEqual([{ id: 5 }]);
    expect(merged.menusHeaderAudio).toEqual([{ id: 6 }]);
    expect(merged.hierarchyPage).toBe(hierarchyPage);
    expect(merged.hierarchyMenu).toBe(hierarchyMenu);
  });
});

describe("mergeVersionConfig with a version config", () => {
  const base = minimalConfig({
    auth: { accessKeys: { base: "b" } },
    routes: baseRoutes,
    "menus-header": baseMenus,
    "routes-source-viewer": [{ id: 3 }],
    "routes-html": [{ id: 4 }],
    "routes-video": [{ id: 5 }],
    "routes-audio": [{ id: 6 }],
    "menus-header-source-viewer": [{ id: 3 }],
    "menus-header-html": [{ id: 4 }],
    "menus-header-video": [{ id: 5 }],
    "menus-header-audio": [{ id: 6 }],
    hierarchyPage: { md: 1, html: 0, video: 2 },
    hierarchyMenu: { md: 2, html: 1, video: 0 },
  });

  it("an empty version config changes nothing", () => {
    expect(mergeVersionConfig(base, {})).toEqual(mergeVersionConfig(base, undefined));
  });

  it("empty version lists never override the base lists", () => {
    const version: VersionRoutesConfig = {
      routes: [],
      "routes-md": [],
      "menus-header": [],
      "menus-header-md": [],
      "routes-source-viewer": [],
      "routes-html": [],
      "routes-video": [],
      "routes-audio": [],
      "menus-header-source-viewer": [],
      "menus-header-html": [],
      "menus-header-video": [],
      "menus-header-audio": [],
    };
    expect(mergeVersionConfig(base, version)).toEqual(mergeVersionConfig(base, undefined));
  });

  it("version routes-md wins over version routes, which wins over the base", () => {
    expect(mergeVersionConfig(base, { routes: versionRoutes, "routes-md": versionRoutesMd }).routesMd).toBe(versionRoutesMd);
    expect(mergeVersionConfig(base, { routes: versionRoutes, "routes-md": [] }).routesMd).toBe(versionRoutes);
    expect(mergeVersionConfig(base, { routes: versionRoutes }).routesMd).toBe(versionRoutes);
  });

  it("version menus-header-md wins over version menus-header, which wins over the base", () => {
    expect(mergeVersionConfig(base, { "menus-header": versionMenus, "menus-header-md": versionMenusMd }).menusHeaderMd).toBe(versionMenusMd);
    expect(mergeVersionConfig(base, { "menus-header": versionMenus, "menus-header-md": [] }).menusHeaderMd).toBe(versionMenus);
    expect(mergeVersionConfig(base, { "menus-header": versionMenus }).menusHeaderMd).toBe(versionMenus);
  });

  it("every non-empty version list, auth and hierarchy overrides the base", () => {
    const version: VersionRoutesConfig = {
      auth: { accessKeys: { v: "v" } },
      "routes-source-viewer": [{ id: 30 }],
      "routes-html": [{ id: 40 }],
      "routes-video": [{ id: 50 }],
      "routes-audio": [{ id: 60 }],
      "menus-header-source-viewer": [{ id: 30 }],
      "menus-header-html": [{ id: 40 }],
      "menus-header-video": [{ id: 50 }],
      "menus-header-audio": [{ id: 60 }],
      hierarchyPage: { md: 0, html: 1, video: 2, audio: 3 },
      hierarchyMenu: { md: 3, html: 2, video: 1, audio: 0 },
    };
    const merged = mergeVersionConfig(base, version);
    expect(merged.auth).toBe(version.auth);
    expect(merged.routesSourceViewer).toBe(version["routes-source-viewer"]);
    expect(merged.routesHtml).toBe(version["routes-html"]);
    expect(merged.routesVideo).toBe(version["routes-video"]);
    expect(merged.routesAudio).toBe(version["routes-audio"]);
    expect(merged.menusHeaderSourceViewer).toBe(version["menus-header-source-viewer"]);
    expect(merged.menusHeaderHtml).toBe(version["menus-header-html"]);
    expect(merged.menusHeaderVideo).toBe(version["menus-header-video"]);
    expect(merged.menusHeaderAudio).toBe(version["menus-header-audio"]);
    expect(merged.hierarchyPage).toBe(version.hierarchyPage);
    expect(merged.hierarchyMenu).toBe(version.hierarchyMenu);
    // Lists the version did not touch stay on the base values.
    expect(merged.routesMd).toBe(baseRoutes);
    expect(merged.menusHeaderMd).toBe(baseMenus);
  });
});

describe("buildEffectiveConfig", () => {
  it("derives routes from md routes that have a path and unions all ids in ascending order", () => {
    const base = minimalConfig({}, { name: "Site" });
    const merged = mergeVersionConfig(
      minimalConfig({
        auth: { accessKeys: { k: "v" } },
        "routes-md": [
          { id: 7, path: { en: "docs/en/seven.md" } },
          { id: 3, "source-viewer": true } as ContentTypeRouteConfig,
        ],
        "routes-source-viewer": [{ id: 3, "source-viewer": true }],
        "routes-html": [{ id: 9, url: { en: "https://e.com" } }],
        "routes-video": [{ id: 1 }],
        "routes-audio": [{ id: 7 }],
        "menus-header-md": [{ id: 7 }],
        "menus-header-html": [{ id: 9 }],
      }),
      undefined,
    );

    const { effectiveConfig, sortedIds } = buildEffectiveConfig(base, merged);

    expect(sortedIds).toEqual([1, 3, 7, 9]);
    expect(effectiveConfig.routes).toEqual([{ id: 7, path: { en: "docs/en/seven.md" } }]);
    expect(effectiveConfig.site.name).toBe("Site");
    expect(effectiveConfig.auth).toEqual({ accessKeys: { k: "v" } });
    expect(effectiveConfig["menus-header"]).toEqual([{ id: 7 }]);
    expect(effectiveConfig["menus-header-md"]).toEqual([{ id: 7 }]);
    expect(effectiveConfig["menus-header-html"]).toEqual([{ id: 9 }]);
    expect(effectiveConfig["menus-header-source-viewer"]).toEqual([]);
    expect(effectiveConfig["menus-header-video"]).toEqual([]);
    expect(effectiveConfig["menus-header-audio"]).toEqual([]);
    expect(effectiveConfig["routes-md"]).toBe(merged.routesMd);
    expect(effectiveConfig["routes-source-viewer"]).toBe(merged.routesSourceViewer);
    expect(effectiveConfig["routes-html"]).toBe(merged.routesHtml);
    expect(effectiveConfig["routes-video"]).toBe(merged.routesVideo);
    expect(effectiveConfig["routes-audio"]).toBe(merged.routesAudio);
    expect(effectiveConfig.hierarchyPage).toEqual(DEFAULT_HIERARCHY);
    expect(effectiveConfig.hierarchyMenu).toEqual(DEFAULT_HIERARCHY);
  });

  it("yields no ids and no routes for an empty merge", () => {
    const { effectiveConfig, sortedIds } = buildEffectiveConfig(minimalConfig(), mergeVersionConfig(minimalConfig(), undefined));
    expect(sortedIds).toEqual([]);
    expect(effectiveConfig.routes).toEqual([]);
  });
});
