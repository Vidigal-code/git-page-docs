// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import { useQuickNavigation } from "@/widgets/docs-shell/model/use-quick-navigation";

const ENTRIES = [
  { searchLabel: "Getting started / Install" },
  { searchLabel: "Getting started / Configure" },
  { searchLabel: "API / Tokens" },
];

afterEach(cleanup);

describe("useQuickNavigation", () => {
  it("starts closed with the full entry list", () => {
    const { result } = renderHook(() => useQuickNavigation(ENTRIES));
    expect(result.current.quickNavOpen).toBe(false);
    expect(result.current.quickNavQuery).toBe("");
    expect(result.current.quickNavActiveIndex).toBe(0);
    expect(result.current.filteredQuickNavEntries).toBe(ENTRIES);
  });

  it("filters entries case-insensitively on the trimmed query", () => {
    const { result } = renderHook(() => useQuickNavigation(ENTRIES));
    act(() => result.current.setQuickNavQuery("  getting STARTED  "));
    expect(result.current.filteredQuickNavEntries.map((entry) => entry.searchLabel)).toEqual([
      "Getting started / Install",
      "Getting started / Configure",
    ]);

    act(() => result.current.setQuickNavQuery("tokens"));
    expect(result.current.filteredQuickNavEntries).toEqual([{ searchLabel: "API / Tokens" }]);

    act(() => result.current.setQuickNavQuery("nope"));
    expect(result.current.filteredQuickNavEntries).toEqual([]);
  });

  it("resets the query and active index when opening and closing", () => {
    const { result } = renderHook(() => useQuickNavigation(ENTRIES));
    act(() => {
      result.current.setQuickNavQuery("api");
      result.current.setQuickNavActiveIndex(2);
    });

    act(() => result.current.openQuickNavigation());
    expect(result.current.quickNavOpen).toBe(true);
    expect(result.current.quickNavQuery).toBe("");
    expect(result.current.quickNavActiveIndex).toBe(0);

    act(() => {
      result.current.setQuickNavQuery("api");
      result.current.setQuickNavActiveIndex(1);
    });
    act(() => result.current.closeQuickNavigation());
    expect(result.current.quickNavOpen).toBe(false);
    expect(result.current.quickNavQuery).toBe("");
    expect(result.current.quickNavActiveIndex).toBe(0);
  });

  it("scrolls the active item into view and the list to the top while open", () => {
    const { result } = renderHook(() => useQuickNavigation(ENTRIES));
    const list = document.createElement("div");
    const scrollTo = vi.fn();
    Object.defineProperty(list, "scrollTo", { value: scrollTo });
    const first = document.createElement("button");
    const second = document.createElement("button");
    const scrollFirst = vi.fn();
    const scrollSecond = vi.fn();
    Object.defineProperty(first, "scrollIntoView", { value: scrollFirst });
    Object.defineProperty(second, "scrollIntoView", { value: scrollSecond });
    result.current.quickNavListRef.current = list;
    result.current.quickNavItemRefs.current = [first, second];

    act(() => result.current.setQuickNavOpen(true));
    expect(scrollFirst).toHaveBeenCalledWith({ block: "nearest" });
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });

    act(() => result.current.setQuickNavActiveIndex(1));
    expect(scrollSecond).toHaveBeenCalledWith({ block: "nearest" });

    // A missing item ref (index past the list) is tolerated.
    act(() => result.current.setQuickNavActiveIndex(5));
    expect(scrollSecond).toHaveBeenCalledTimes(1);
  });

  it("does not touch the DOM while closed or when the list ref is unset", () => {
    const { result } = renderHook(() => useQuickNavigation(ENTRIES));
    const button = document.createElement("button");
    const scrollIntoView = vi.fn();
    Object.defineProperty(button, "scrollIntoView", { value: scrollIntoView });
    result.current.quickNavItemRefs.current = [button];

    act(() => result.current.setQuickNavActiveIndex(0));
    expect(scrollIntoView).not.toHaveBeenCalled();

    // Open with no list element: the effect bails out before scrolling.
    act(() => result.current.setQuickNavOpen(true));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
