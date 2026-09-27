import { describe, expect, it } from "vitest";
import { resolvePageHierarchy } from "@/entities/docs/lib/hierarchy/resolve-page-hierarchy";
import type { GitPageDocsConfig, LoadedPage } from "@/entities/docs/model/types";
import { makeDocsData } from "./fixtures/docs-data";

const page: LoadedPage = {
  id: 1,
  md: { routeId: 1, config: { id: 1 }, markdownByLanguage: {} },
  html: { routeId: 1, config: { id: 1 }, htmlByLanguage: {} },
  sourceViewer: { routeId: 1, config: { id: 1 }, sourceViewerPath: "" },
  audio: { routeId: 1, config: { id: 1 }, audioTypeByLanguage: {}, pathAudioByLanguage: {} },
};

function globalConfig(overrides: Partial<GitPageDocsConfig> = {}): GitPageDocsConfig {
  return makeDocsData(overrides).config;
}

describe("resolvePageHierarchy", () => {
  it("returns nothing without a page", () => {
    expect(resolvePageHierarchy(undefined, globalConfig())).toEqual([]);
  });

  it("lists the content the page has, in the default order", () => {
    expect(resolvePageHierarchy(page, globalConfig())).toEqual(["md", "source-viewer", "html", "audio"]);
  });

  it("orders by the global hierarchyPage, with unlisted types last", () => {
    expect(resolvePageHierarchy(page, globalConfig({ hierarchyPage: { html: 0, md: 1, video: 2 } }))).toEqual([
      "html",
      "md",
      "source-viewer",
      "audio",
    ]);
  });

  it("lets a route-level hierarchyPage override the global one, read from the first content that declares it", () => {
    const local: LoadedPage = {
      ...page,
      html: { routeId: 1, config: { id: 1, hierarchyPage: { audio: 0, html: 1, md: 2, video: 3 } }, htmlByLanguage: {} },
    };
    expect(resolvePageHierarchy(local, globalConfig({ hierarchyPage: { html: 0, md: 1, video: 2 } }))).toEqual([
      "audio",
      "html",
      "md",
      "source-viewer",
    ]);
  });

  it("narrows to the requested content type only when the page has it", () => {
    expect(resolvePageHierarchy(page, globalConfig(), "html")).toEqual(["html"]);
    expect(resolvePageHierarchy(page, globalConfig(), "video")).toEqual([]);
  });
});
