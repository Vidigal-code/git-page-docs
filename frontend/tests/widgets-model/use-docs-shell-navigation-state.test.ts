// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import { useDocsShellNavigationState } from "@/widgets/docs-shell/model/use-docs-shell-navigation-state";
import { GUIDE, INTRO, PAGE_INDEX, makeDocsData } from "./fixtures";

type Args = Parameters<typeof useDocsShellNavigationState>[0];

function setup(overrides: Partial<Args> = {}) {
  const setSidebarOpen = vi.fn();
  const setMenuOpen = vi.fn();
  const data = makeDocsData();
  const hook = renderHook(() =>
    useDocsShellNavigationState({ data, language: "en", setSidebarOpen, setMenuOpen, ...overrides }),
  );
  return { ...hook, setSidebarOpen, setMenuOpen };
}

afterEach(cleanup);

describe("useDocsShellNavigationState", () => {
  it("groups pages by content type, keeping their page indices", () => {
    const { result } = setup();
    const { browse } = result.current;
    expect(browse.mdItems.map((item) => item.pageIndex)).toEqual([PAGE_INDEX.intro, PAGE_INDEX.guide]);
    expect(browse.htmlItems.map((item) => item.pageIndex)).toEqual([PAGE_INDEX.landing]);
    expect(browse.videoItems.map((item) => item.pageIndex)).toEqual([PAGE_INDEX.video]);
    expect(browse.audioItems.map((item) => item.pageIndex)).toEqual([PAGE_INDEX.audio]);
    expect(result.current.sourceViewerItems).toEqual([]);
    expect(browse.mdItems[1].content.routeId).toBe(2);
    expect(result.current.pageIndex).toBe(0);
    expect(result.current.routeIndex).toBe(0);
  });

  it("keeps each browse index pointed at the active page, or at the first item otherwise", () => {
    const { result } = setup();
    expect(result.current.browse.mdBrowseIndex).toBe(0);
    expect(result.current.browse.htmlBrowseIndex).toBe(0);

    act(() => result.current.setPageIndex(PAGE_INDEX.guide));
    expect(result.current.browse.mdBrowseIndex).toBe(1);
    expect(result.current.browse.htmlBrowseIndex).toBe(0);

    act(() => result.current.setPageIndex(PAGE_INDEX.audio));
    expect(result.current.browse.mdBrowseIndex).toBe(0);
    expect(result.current.browse.audioBrowseIndex).toBe(0);
    expect(result.current.browse.videoBrowseIndex).toBe(0);

    act(() => result.current.browse.setHtmlBrowseIndex(4));
    expect(result.current.browse.htmlBrowseIndex).toBe(4);
  });

  it("navigates on menu click, expanding ancestors and toggling the drawers", () => {
    const { result, setSidebarOpen, setMenuOpen } = setup();
    act(() => result.current.onMenuClick(GUIDE, ["Guide-2"]));
    expect(result.current.pageIndex).toBe(PAGE_INDEX.guide);
    expect(result.current.expandedMenuMap).toEqual({ "Guide-2": true });
    expect(setSidebarOpen).toHaveBeenCalledWith(true);
    expect(setMenuOpen).toHaveBeenCalledWith(false);

    // An unknown path leaves the page untouched but still closes the menu.
    act(() => result.current.onMenuClick("docs/missing.md"));
    expect(result.current.pageIndex).toBe(PAGE_INDEX.guide);
    expect(setMenuOpen).toHaveBeenCalledTimes(2);
  });

  it("only closes the menu when the target path is not navigable", () => {
    const canNavigateToPathClick = vi.fn((pathClick: string) => pathClick !== GUIDE);
    const { result, setSidebarOpen, setMenuOpen } = setup({ canNavigateToPathClick });
    act(() => result.current.onMenuClick(GUIDE, ["Guide-2"]));
    expect(result.current.pageIndex).toBe(0);
    expect(result.current.expandedMenuMap).toEqual({});
    expect(setSidebarOpen).not.toHaveBeenCalled();
    expect(setMenuOpen).toHaveBeenCalledWith(false);

    // Group rows have no path and bypass the guard.
    act(() => result.current.onMenuClick("", ["Guide-2"]));
    expect(canNavigateToPathClick).toHaveBeenCalledTimes(1);
    expect(result.current.expandedMenuMap).toEqual({ "Guide-2": true });
    expect(setSidebarOpen).toHaveBeenCalledWith(true);
  });

  it("keeps the sidebar closed for linear and quick navigation when blocking is on", () => {
    const { result, setSidebarOpen } = setup({ blockSidebarOpenOnNav: true });
    act(() => result.current.onMenuClick(GUIDE, [], { fromLinearNav: true }));
    act(() => result.current.onMenuClick(INTRO, [], { fromQuickNav: true }));
    expect(setSidebarOpen).not.toHaveBeenCalled();

    act(() => result.current.onMenuClick(GUIDE));
    expect(setSidebarOpen).toHaveBeenCalledWith(true);
  });

  it("treats nodes as expanded by default and toggles or expands them explicitly", () => {
    const { result } = setup();
    expect(result.current.isNodeExpanded("Guide-2")).toBe(true);

    // An untouched node has no map entry, so the first toggle records `!undefined`
    // (still expanded); only from then on does it alternate.
    act(() => result.current.toggleNode("Guide-2"));
    expect(result.current.expandedMenuMap).toEqual({ "Guide-2": true });
    act(() => result.current.toggleNode("Guide-2"));
    expect(result.current.isNodeExpanded("Guide-2")).toBe(false);
    act(() => result.current.toggleNode("Guide-2"));
    expect(result.current.isNodeExpanded("Guide-2")).toBe(true);

    const before = result.current.expandedMenuMap;
    act(() => result.current.expandAncestors([]));
    expect(result.current.expandedMenuMap).toBe(before);

    act(() => result.current.toggleNode("A"));
    act(() => result.current.expandAncestors(["A", "B"]));
    expect(result.current.expandedMenuMap).toMatchObject({ A: true, B: true });
  });
});
