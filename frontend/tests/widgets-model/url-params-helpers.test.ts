// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import type { LoadedDocsData } from "@/entities/docs";
import {
  findPathClickBySlug,
  parseFullscreenParams,
  resolveMenuNavigationTarget,
  resolveMenuSelection,
  resolvePageTarget,
} from "@/widgets/docs-shell/model/use-docs-shell-url-params.helpers";
import { AUDIO_SLUG_KEY, GUIDE, INTRO, LANDING, PAGE_INDEX, VIDEO_PATH, makeDocsData } from "./fixtures";

const params = (search: string) => new URLSearchParams(search);

describe("parseFullscreenParams", () => {
  it("returns null when no fullscreen param is present", () => {
    expect(parseFullscreenParams(params(""))).toBeNull();
    expect(parseFullscreenParams(params("menu=en&id=2&file=x"))).toBeNull();
  });

  it("requires a file for document fullscreens", () => {
    expect(parseFullscreenParams(params("mdfull=en"))).toBeNull();
    expect(parseFullscreenParams(params("htmlfull=en"))).toBeNull();
    expect(parseFullscreenParams(params("mdfull=en&file=docs/a.md"))).toEqual({ type: "md", lang: "en", file: "docs/a.md" });
    expect(parseFullscreenParams(params("htmlfull=pt&file=p.html"))).toEqual({ type: "html", lang: "pt", file: "p.html" });
  });

  it("parses media fullscreens with an optional numeric id and slug", () => {
    expect(parseFullscreenParams(params("videofull=en&id=30&slug=copilot"))).toEqual({
      type: "video",
      lang: "en",
      id: 30,
      slug: "copilot",
    });
    expect(parseFullscreenParams(params("audiofull=pt"))).toEqual({ type: "audio", lang: "pt", id: undefined, slug: undefined });
    expect(parseFullscreenParams(params("audiofull=pt&id=abc"))).toMatchObject({ type: "audio", id: undefined });
  });

  it("picks md, then video, then html, then audio when several are present", () => {
    expect(parseFullscreenParams(params("mdfull=en&videofull=pt&file=f"))?.type).toBe("md");
    expect(parseFullscreenParams(params("videofull=pt&htmlfull=en&file=f"))?.type).toBe("video");
    expect(parseFullscreenParams(params("htmlfull=en&audiofull=pt&file=f"))?.type).toBe("html");
    expect(parseFullscreenParams(params("mdfull=en&audiofull=pt"))?.type).toBe("audio");
  });
});

describe("findPathClickBySlug", () => {
  const data = makeDocsData();

  it("matches the last path segment ignoring case and a md/html extension", () => {
    expect(findPathClickBySlug(data, "Guide")).toBe(GUIDE);
    expect(findPathClickBySlug(data, "guide.md")).toBe(GUIDE);
    expect(findPathClickBySlug(data, "LANDING.HTML")).toBe(LANDING);
    expect(findPathClickBySlug(data, "intro-track")).toBe(AUDIO_SLUG_KEY);
  });

  it("returns null for unknown slugs or without a path map", () => {
    expect(findPathClickBySlug(data, "missing")).toBeNull();
    expect(findPathClickBySlug(makeDocsData({ pathToPageMap: {} }), "guide")).toBeNull();
    const noMap = makeDocsData({ pathToPageMap: undefined as unknown as LoadedDocsData["pathToPageMap"] });
    expect(findPathClickBySlug(noMap, "guide")).toBeNull();
  });
});

describe("resolveMenuSelection", () => {
  const data = makeDocsData();

  it("needs the menu language plus an id or a slug", () => {
    expect(resolveMenuSelection(data, params(""))).toBeNull();
    expect(resolveMenuSelection(data, params("id=2"))).toBeNull();
    expect(resolveMenuSelection(data, params("menu=en"))).toBeNull();
  });

  it("resolves the route id, which wins over a slug", () => {
    expect(resolveMenuSelection(data, params("menu=en&id=2&name=intro"))).toEqual({ lang: "en", pathClick: GUIDE });
    expect(resolveMenuSelection(data, params("menu=en&id=30"))).toEqual({ lang: "en", pathClick: VIDEO_PATH });
    expect(resolveMenuSelection(data, params("menu=en&id=abc"))).toBeNull();
    expect(resolveMenuSelection(data, params("menu=en&id=999"))).toBeNull();
  });

  it("resolves name and nome slugs", () => {
    expect(resolveMenuSelection(data, params("menu=en&name=intro"))).toEqual({ lang: "en", pathClick: INTRO });
    expect(resolveMenuSelection(data, params("menu=pt&nome=landing"))).toEqual({ lang: "pt", pathClick: LANDING });
    expect(resolveMenuSelection(data, params("menu=en&name=missing"))).toBeNull();
  });
});

describe("resolvePageTarget / resolveMenuNavigationTarget", () => {
  const data = makeDocsData();

  it("returns the page index with the ancestors to expand", () => {
    expect(resolvePageTarget(data, "en", GUIDE)).toEqual({ pageIndex: PAGE_INDEX.guide, ancestorKeys: ["Guide-2", "Guide-Install-3"] });
    expect(resolvePageTarget(data, "en", INTRO)).toEqual({ pageIndex: PAGE_INDEX.intro, ancestorKeys: ["Intro-1"] });
    expect(resolvePageTarget(data, "en", VIDEO_PATH)).toEqual({ pageIndex: PAGE_INDEX.video, ancestorKeys: [] });
    expect(resolvePageTarget(data, "en", "docs/missing.md")).toBeNull();
  });

  it("skips the page that is already active", () => {
    const selection = { lang: "en", pathClick: GUIDE };
    expect(resolveMenuNavigationTarget(data, selection, PAGE_INDEX.guide)).toBeNull();
    expect(resolveMenuNavigationTarget(data, selection, PAGE_INDEX.intro)).toEqual({
      pageIndex: PAGE_INDEX.guide,
      ancestorKeys: ["Guide-2", "Guide-Install-3"],
    });
    expect(resolveMenuNavigationTarget(data, { lang: "en", pathClick: "nope" }, 0)).toBeNull();
  });
});
