// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { useLayoutEffect } from "react";
import type { CSSProperties } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { useDocumentThemeVars } from "@/shared/lib/use-document-theme-vars";
import { useIsomorphicLayoutEffect } from "@/shared/lib/use-isomorphic-layout-effect";

type ChangeListener = () => void;

function stubMatchMedia(initialMatches: boolean) {
  const listeners = new Set<ChangeListener>();
  const mql = {
    matches: initialMatches,
    media: "",
    addEventListener: vi.fn((_type: string, listener: ChangeListener) => listeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: ChangeListener) => listeners.delete(listener)),
  };
  const matchMedia = vi.fn(() => mql);
  vi.stubGlobal("matchMedia", matchMedia);
  return {
    matchMedia,
    mql,
    listeners,
    flip(next: boolean) {
      mql.matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("style");
});

describe("useMediaQuery", () => {
  it("reflects the query after mount and follows change events", () => {
    const media = stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(max-width: 640px)"));
    expect(media.matchMedia).toHaveBeenCalledWith("(max-width: 640px)");
    expect(result.current).toBe(true);

    act(() => media.flip(false));
    expect(result.current).toBe(false);
    act(() => media.flip(true));
    expect(result.current).toBe(true);
  });

  it("unsubscribes on unmount and re-subscribes when the query changes", () => {
    const media = stubMatchMedia(false);
    const { result, rerender, unmount } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: "(max-width: 640px)" },
    });
    expect(result.current).toBe(false);
    expect(media.listeners.size).toBe(1);

    rerender({ query: "(hover: hover)" });
    expect(media.matchMedia).toHaveBeenLastCalledWith("(hover: hover)");
    expect(media.listeners.size).toBe(1);

    unmount();
    expect(media.mql.removeEventListener).toHaveBeenCalled();
    expect(media.listeners.size).toBe(0);
  });
});

describe("useDocumentThemeVars", () => {
  it("mirrors custom properties onto <html> and skips everything else", () => {
    const vars = { "--primary": "#123456", "--empty": "", color: "red", "--count": 3 } as unknown as CSSProperties;
    renderHook(() => useDocumentThemeVars(vars));
    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue("--primary")).toBe("#123456");
    expect(rootStyle.getPropertyValue("--empty")).toBe("");
    expect(rootStyle.getPropertyValue("--count")).toBe("");
    expect(rootStyle.getPropertyValue("color")).toBe("");
  });

  it("keeps the previous palette when the next shell has no vars yet", () => {
    const { rerender } = renderHook(({ vars }) => useDocumentThemeVars(vars), {
      initialProps: { vars: { "--background": "#000" } as CSSProperties | undefined },
    });
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("#000");
    rerender({ vars: undefined });
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("#000");
    rerender({ vars: { "--background": "#fff" } as CSSProperties });
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("#fff");
  });
});

describe("useIsomorphicLayoutEffect", () => {
  it("is useLayoutEffect in the browser", () => {
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });
});
