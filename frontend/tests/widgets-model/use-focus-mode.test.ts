// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import { useFocusMode } from "@/widgets/docs-shell/model/use-focus-mode";

const INTRO = "<p>Welcome to the guide.</p>";
const H1 = "<h1 id=\"install\">Install</h1><p>Run the installer.</p>";
const H2 = "<h2 id=\"configure\">Configure</h2><p>Edit config.json.</p>";
const THREE_PAGES = `${INTRO}\n${H1}\n${H2}`;

afterEach(cleanup);

describe("useFocusMode", () => {
  it("yields no pages for empty markdown and falls back to the raw html", () => {
    const { result } = renderHook(() => useFocusMode("   "));
    expect(result.current.focusModePages).toEqual([]);
    expect(result.current.focusModeCurrentHtml).toBe("   ");
    expect(result.current.safeFocusModePageIndex).toBe(0);
    expect(result.current.canFocusModeGoPrevious).toBe(false);
    expect(result.current.canFocusModeGoNext).toBe(false);
  });

  it("keeps heading-less markdown as a single trimmed page", () => {
    const { result } = renderHook(() => useFocusMode("  <p>Only text</p>  "));
    expect(result.current.focusModePages).toEqual(["<p>Only text</p>"]);
    expect(result.current.focusModeCurrentHtml).toBe("<p>Only text</p>");
  });

  it("splits the intro and every heading section into its own page", () => {
    const { result } = renderHook(() => useFocusMode(THREE_PAGES));
    expect(result.current.focusModePages).toEqual([INTRO, H1, H2]);
    expect(result.current.focusModeCurrentHtml).toBe(INTRO);
    expect(result.current.canFocusModeGoNext).toBe(true);
  });

  it("omits the intro page when the markdown starts with a heading", () => {
    const { result } = renderHook(() => useFocusMode(`${H1}${H2}`));
    expect(result.current.focusModePages).toEqual([H1, H2]);
  });

  it("navigates within bounds and ignores offsets past either edge", () => {
    const { result } = renderHook(() => useFocusMode(THREE_PAGES));

    act(() => result.current.onFocusModeNavigate(-1));
    expect(result.current.safeFocusModePageIndex).toBe(0);

    act(() => result.current.onFocusModeNavigate(1));
    expect(result.current.safeFocusModePageIndex).toBe(1);
    expect(result.current.focusModeCurrentHtml).toBe(H1);
    expect(result.current.canFocusModeGoPrevious).toBe(true);
    expect(result.current.canFocusModeGoNext).toBe(true);

    act(() => result.current.onFocusModeNavigate(1));
    expect(result.current.safeFocusModePageIndex).toBe(2);
    expect(result.current.canFocusModeGoNext).toBe(false);

    act(() => result.current.onFocusModeNavigate(1));
    expect(result.current.safeFocusModePageIndex).toBe(2);
  });

  it("opens on the first page, closes, and exposes the raw setter", () => {
    const { result } = renderHook(() => useFocusMode(THREE_PAGES));
    act(() => result.current.onFocusModeNavigate(1));
    expect(result.current.focusModeOpen).toBe(false);

    act(() => result.current.openFocusMode());
    expect(result.current.focusModeOpen).toBe(true);
    expect(result.current.safeFocusModePageIndex).toBe(0);

    act(() => result.current.closeFocusMode());
    expect(result.current.focusModeOpen).toBe(false);

    act(() => result.current.setFocusModeOpen(true));
    expect(result.current.focusModeOpen).toBe(true);
  });

  it("clamps a stale page index when the markdown shrinks", () => {
    const { result, rerender } = renderHook(({ html }) => useFocusMode(html), {
      initialProps: { html: THREE_PAGES },
    });
    act(() => result.current.onFocusModeNavigate(1));
    act(() => result.current.onFocusModeNavigate(1));
    expect(result.current.safeFocusModePageIndex).toBe(2);

    rerender({ html: H1 });
    expect(result.current.focusModePages).toEqual([H1]);
    expect(result.current.safeFocusModePageIndex).toBe(0);
    expect(result.current.focusModeCurrentHtml).toBe(H1);
  });
});
