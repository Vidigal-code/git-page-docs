// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNavMenuBlockPreference } from "@/features/nav-menu-block-preference/model/use-nav-menu-block-preference";

const KEY = "git-page-docs:block-menu-on-nav:my-docs-site";

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useNavMenuBlockPreference", () => {
  it("defaults to not blocking when nothing is stored", () => {
    const { result } = renderHook(() => useNavMenuBlockPreference("My Docs Site"));
    expect(result.current.blockMenuOnNav).toBe(false);
  });

  it("restores a stored preference scoped to the normalized site name", () => {
    window.localStorage.setItem(KEY, "true");
    const { result } = renderHook(() => useNavMenuBlockPreference("My Docs Site"));
    expect(result.current.blockMenuOnNav).toBe(true);
  });

  it("ignores stored values that are not a boolean literal", () => {
    window.localStorage.setItem(KEY, "maybe");
    const { result } = renderHook(() => useNavMenuBlockPreference("My Docs Site"));
    expect(result.current.blockMenuOnNav).toBe(false);
  });

  it("updates state and persists the new value", () => {
    const { result } = renderHook(() => useNavMenuBlockPreference("My Docs Site"));
    act(() => result.current.setBlockMenuOnNav(true));
    expect(result.current.blockMenuOnNav).toBe(true);
    expect(window.localStorage.getItem(KEY)).toBe("true");

    act(() => result.current.setBlockMenuOnNav(false));
    expect(result.current.blockMenuOnNav).toBe(false);
    expect(window.localStorage.getItem(KEY)).toBe("false");
  });

  it("re-reads the preference when the site changes", () => {
    window.localStorage.setItem("git-page-docs:block-menu-on-nav:other", "true");
    const { result, rerender } = renderHook(({ site }) => useNavMenuBlockPreference(site), {
      initialProps: { site: "My Docs Site" },
    });
    expect(result.current.blockMenuOnNav).toBe(false);
    rerender({ site: "Other" });
    expect(result.current.blockMenuOnNav).toBe(true);
  });

  it("survives blocked storage on read and write", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useNavMenuBlockPreference("My Docs Site"));
    expect(result.current.blockMenuOnNav).toBe(false);
    act(() => result.current.setBlockMenuOnNav(true));
    expect(result.current.blockMenuOnNav).toBe(true);
  });
});
