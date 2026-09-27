// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import { getCurrentHeadingHash, scrollToHeadingId } from "@/features/route-guide";
import {
  useDocsShellUrlParams,
  type FullscreenParams,
  type UrlParamsAction,
} from "@/widgets/docs-shell/model/use-docs-shell-url-params";
import { INTRO, LANDING, PAGE_INDEX, makeDocsData, setWindowUrl } from "./fixtures";

vi.mock("@/features/route-guide", () => ({
  getCurrentHeadingHash: vi.fn(() => ""),
  scrollToHeadingId: vi.fn(),
}));

const headingHash = vi.mocked(getCurrentHeadingHash);
const scrollTo = vi.mocked(scrollToHeadingId);

interface SetupOptions {
  /** Query handed to the hook (menu navigation params). */
  search?: string;
  /** Query on the window (fullscreen params are read from the live URL). */
  windowSearch?: string;
  pageIndex?: number;
  canNavigate?: (pathClick: string) => boolean;
  withFullscreen?: boolean;
}

function setup({ search = "", windowSearch = search, pageIndex = 0, canNavigate, withFullscreen = true }: SetupOptions = {}) {
  setWindowUrl(`/docs${windowSearch}`);
  const setPageIndex = vi.fn();
  const expandAncestors = vi.fn();
  const onParamsProcessed = vi.fn<(action: UrlParamsAction | null) => void>();
  const onFullscreenRequest = vi.fn<(params: FullscreenParams) => void>();
  const data = makeDocsData();
  const searchParams = new URLSearchParams(search);
  const hook = renderHook(
    ({ page }) =>
      useDocsShellUrlParams({
        searchParams,
        data,
        language: "en",
        pageIndex: page,
        setPageIndex,
        expandAncestors,
        canNavigateToPathClick: canNavigate,
        onParamsProcessed,
        onFullscreenRequest: withFullscreen ? onFullscreenRequest : undefined,
      }),
    { initialProps: { page: pageIndex } },
  );
  return { ...hook, setPageIndex, expandAncestors, onParamsProcessed, onFullscreenRequest };
}

afterEach(cleanup);

describe("useDocsShellUrlParams", () => {
  beforeEach(() => {
    headingHash.mockReturnValue("");
    scrollTo.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("navigates to the route id from ?menu&id and expands the breadcrumb ancestors", () => {
    const { setPageIndex, expandAncestors, onParamsProcessed } = setup({ search: "?menu=en&id=2" });
    expect(setPageIndex).toHaveBeenCalledWith(PAGE_INDEX.guide);
    expect(expandAncestors).toHaveBeenCalledWith(["Guide-2", "Guide-Install-3"]);
    expect(onParamsProcessed.mock.calls.map((call) => call[0])).toEqual([
      { type: "navigate", pageIndex: PAGE_INDEX.guide, ancestorKeys: ["Guide-2", "Guide-Install-3"] },
      null,
    ]);
  });

  it("resolves ?name / ?nome slugs case-insensitively, with or without the extension", () => {
    const byName = setup({ search: "?menu=en&name=GUIDE.md" });
    expect(byName.setPageIndex).toHaveBeenCalledWith(PAGE_INDEX.guide);

    const byNome = setup({ search: "?menu=en&nome=landing" });
    expect(byNome.setPageIndex).toHaveBeenCalledWith(PAGE_INDEX.landing);
    expect(byNome.expandAncestors).toHaveBeenCalledWith(["Landing-20"]);

    const unknown = setup({ search: "?menu=en&name=missing" });
    expect(unknown.setPageIndex).not.toHaveBeenCalled();
    expect(unknown.onParamsProcessed).toHaveBeenCalledTimes(1);
    expect(unknown.onParamsProcessed).toHaveBeenCalledWith(null);
  });

  it("does nothing for the current page, malformed ids, unknown ids or incomplete params", () => {
    for (const search of ["?menu=en&id=1", "?menu=en&id=abc", "?menu=en&id=999", "?menu=en", "?id=2"]) {
      const { setPageIndex, onParamsProcessed } = setup({ search });
      expect(setPageIndex, search).not.toHaveBeenCalled();
      expect(onParamsProcessed.mock.calls, search).toEqual([[null]]);
    }
  });

  it("re-evaluates when the page index changes", () => {
    const { rerender, setPageIndex, onParamsProcessed } = setup({ search: "?menu=en&id=2" });
    rerender({ page: PAGE_INDEX.guide });
    expect(setPageIndex).toHaveBeenCalledTimes(1);
    expect(onParamsProcessed.mock.calls.at(-1)).toEqual([null]);
  });

  it("stops before navigating or scrolling when the guard denies the path", () => {
    vi.useFakeTimers();
    headingHash.mockReturnValue("install");
    const canNavigate = vi.fn(() => false);
    const { setPageIndex, onParamsProcessed } = setup({ search: "?menu=en&id=2", canNavigate });
    expect(canNavigate).toHaveBeenCalledWith("docs/guide.md");
    expect(setPageIndex).not.toHaveBeenCalled();
    expect(onParamsProcessed.mock.calls).toEqual([[null]]);
    vi.runAllTimers();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("hands fullscreen requests over and skips menu processing", () => {
    const md = setup({ windowSearch: "?mdfull=en&file=docs/intro.md", search: "?menu=en&id=2" });
    expect(md.onFullscreenRequest).toHaveBeenCalledWith({ type: "md", lang: "en", file: INTRO });
    expect(md.setPageIndex).not.toHaveBeenCalled();
    expect(md.onParamsProcessed).not.toHaveBeenCalled();

    const html = setup({ windowSearch: "?htmlfull=pt&file=pages/landing.html" });
    expect(html.onFullscreenRequest).toHaveBeenCalledWith({ type: "html", lang: "pt", file: LANDING });

    const video = setup({ windowSearch: "?videofull=pt&id=30&slug=copilot" });
    expect(video.onFullscreenRequest).toHaveBeenCalledWith({ type: "video", lang: "pt", id: 30, slug: "copilot" });

    const videoNoId = setup({ windowSearch: "?videofull=pt&id=nope" });
    expect(videoNoId.onFullscreenRequest).toHaveBeenCalledWith({ type: "video", lang: "pt", id: undefined, slug: undefined });

    const audio = setup({ windowSearch: "?audiofull=en&id=40" });
    expect(audio.onFullscreenRequest).toHaveBeenCalledWith({ type: "audio", lang: "en", id: 40, slug: undefined });
  });

  it("ignores incomplete fullscreen params and requests without a handler", () => {
    const noFile = setup({ windowSearch: "?htmlfull=en" });
    expect(noFile.onFullscreenRequest).not.toHaveBeenCalled();
    expect(noFile.onParamsProcessed.mock.calls).toEqual([[null]]);

    const noHandler = setup({ windowSearch: "?mdfull=en&file=docs/intro.md", withFullscreen: false });
    expect(noHandler.onFullscreenRequest).not.toHaveBeenCalled();
    expect(noHandler.onParamsProcessed.mock.calls).toEqual([[null]]);
  });

  it("scrolls to the current heading after a short delay and again on hashchange", () => {
    vi.useFakeTimers();
    headingHash.mockReturnValue("install");
    const { unmount } = setup();
    expect(scrollTo).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(scrollTo).toHaveBeenCalledWith("install");

    act(() => {
      window.dispatchEvent(new Event("hashchange"));
    });
    vi.advanceTimersByTime(0);
    expect(scrollTo).toHaveBeenCalledTimes(2);

    unmount();
    act(() => {
      window.dispatchEvent(new Event("hashchange"));
    });
    vi.runAllTimers();
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });

  it("does not schedule a scroll without a hash", () => {
    vi.useFakeTimers();
    setup();
    vi.runAllTimers();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
