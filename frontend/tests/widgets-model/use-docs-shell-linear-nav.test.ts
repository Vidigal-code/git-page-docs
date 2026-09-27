// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { useDocsShellLinearNav } from "@/widgets/docs-shell/model/use-docs-shell-linear-nav";
import { GUIDE, INTRO, LANDING, PAGE_INDEX, makeConfig, makeDocsData } from "./fixtures";

afterEach(cleanup);

describe("useDocsShellLinearNav", () => {
  it("builds the sectioned tree and a de-duplicated linear entry list", () => {
    const { result } = renderHook(() => useDocsShellLinearNav(makeDocsData(), "en", PAGE_INDEX.guide));
    expect(result.current.headerMenuTree.map((node) => node.key)).toEqual(["section-md", "Intro-1", "Guide-2", "section-html", "Landing-20"]);
    expect(result.current.headerMenuEntries.map((entry) => entry.key)).toEqual([
      "section-md",
      "Intro-1",
      "Guide-2",
      "Guide-Install-3",
      "section-html",
      "Landing-20",
    ]);
    // Section headers and path-less groups are not navigation stops.
    expect(result.current.linearNavigationEntries.map((entry) => entry.pathClick)).toEqual([INTRO, GUIDE, LANDING]);
    expect(result.current.currentLinearNavigationIndex).toBe(1);
    expect(result.current.canGoPrevious).toBe(true);
    expect(result.current.canGoNext).toBe(true);
  });

  it("reports the edges of the linear list and pages outside it", () => {
    const first = renderHook(() => useDocsShellLinearNav(makeDocsData(), "en", PAGE_INDEX.intro)).result.current;
    expect(first.currentLinearNavigationIndex).toBe(0);
    expect(first.canGoPrevious).toBe(false);
    expect(first.canGoNext).toBe(true);

    const last = renderHook(() => useDocsShellLinearNav(makeDocsData(), "en", PAGE_INDEX.landing)).result.current;
    expect(last.currentLinearNavigationIndex).toBe(2);
    expect(last.canGoNext).toBe(false);

    const outside = renderHook(() => useDocsShellLinearNav(makeDocsData(), "en", PAGE_INDEX.video)).result.current;
    expect(outside.currentLinearNavigationIndex).toBe(-1);
    expect(outside.canGoPrevious).toBe(false);
    expect(outside.canGoNext).toBe(false);
  });

  it("keeps only the first menu entry that points at a given page", () => {
    const data = makeDocsData({
      config: makeConfig({
        "menus-header-md": [
          { id: 1, en: { title: "Intro", "path-click": INTRO } },
          { id: 5, en: { title: "Intro again", "path-click": INTRO } },
          { id: 2, en: { title: "Guide", "path-click": GUIDE } },
        ],
        "menus-header-html": undefined,
      }),
    });
    const { result } = renderHook(() => useDocsShellLinearNav(data, "en", 0));
    expect(result.current.linearNavigationEntries.map((entry) => entry.key)).toEqual(["Intro-1", "Guide-2"]);
  });

  it("applies the path filter to the tree, the entries and the linear list", () => {
    const isPathAllowed = (pathClick: string) => pathClick !== LANDING;
    const { result } = renderHook(() => useDocsShellLinearNav(makeDocsData(), "en", 0, isPathAllowed));
    expect(result.current.headerMenuTree.map((node) => node.key)).toEqual(["section-md", "Intro-1", "Guide-2"]);
    expect(result.current.linearNavigationEntries.map((entry) => entry.pathClick)).toEqual([INTRO, GUIDE]);
  });

  it("memoises its derived structures across identical renders", () => {
    const data = makeDocsData();
    const { result, rerender } = renderHook(({ page }) => useDocsShellLinearNav(data, "en", page), {
      initialProps: { page: 0 },
    });
    const first = result.current;
    rerender({ page: 0 });
    expect(result.current.headerMenuTree).toBe(first.headerMenuTree);
    expect(result.current.linearNavigationEntries).toBe(first.linearNavigationEntries);
    rerender({ page: 1 });
    expect(result.current.headerMenuTree).not.toBe(first.headerMenuTree);
  });
});
