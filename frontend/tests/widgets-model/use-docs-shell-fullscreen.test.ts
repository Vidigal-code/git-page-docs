// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import { useDocsShellFullscreen } from "@/widgets/docs-shell/model/use-docs-shell-fullscreen";
import type { FullscreenParams } from "@/widgets/docs-shell/model/use-docs-shell-url-params";
import { INTRO, LANDING, PAGE_INDEX, makeDocsData, setWindowUrl } from "./fixtures";

function setup(pathname: string | null = "/docs", windowUrl = "/docs") {
  setWindowUrl(windowUrl);
  const setPageIndex = vi.fn();
  const expandAncestors = vi.fn();
  const routerReplace = vi.fn();
  const replaceUrlWithoutNavigation = vi.fn((path: string, params: URLSearchParams) => {
    const qs = params.toString();
    setWindowUrl(qs ? `${path}?${qs}` : path);
  });
  const data = makeDocsData();
  const hook = renderHook(() =>
    useDocsShellFullscreen({
      data,
      language: "en",
      pathname,
      getCurrentSearchParams: () => new URLSearchParams(window.location.search),
      replaceUrlWithoutNavigation,
      setPageIndex,
      expandAncestors,
      routerReplace,
    }),
  );
  return { ...hook, setPageIndex, expandAncestors, routerReplace, replaceUrlWithoutNavigation };
}

const md = (file?: string): FullscreenParams => ({ type: "md", lang: "en", file });

afterEach(cleanup);

describe("useDocsShellFullscreen", () => {
  it("selects the page for md and html file requests and expands its breadcrumb", () => {
    const { result, setPageIndex, expandAncestors } = setup();
    expect(result.current.urlFullscreenParams).toBeNull();

    act(() => result.current.onFullscreenRequest(md(INTRO)));
    expect(setPageIndex).toHaveBeenCalledWith(PAGE_INDEX.intro);
    expect(expandAncestors).toHaveBeenCalledWith(["Intro-1"]);
    expect(result.current.urlFullscreenParams).toEqual(md(INTRO));

    act(() => result.current.onFullscreenRequest({ type: "html", lang: "en", file: LANDING }));
    expect(setPageIndex).toHaveBeenLastCalledWith(PAGE_INDEX.landing);
    expect(expandAncestors).toHaveBeenLastCalledWith(["Landing-20"]);

    // The breadcrumb is built for the requested language; menus without a pt entry yield no ancestors.
    act(() => result.current.onFullscreenRequest({ type: "html", lang: "pt", file: LANDING }));
    expect(setPageIndex).toHaveBeenLastCalledWith(PAGE_INDEX.landing);
    expect(expandAncestors).toHaveBeenLastCalledWith([]);
  });

  it("resolves video and audio pages by id or by slug", () => {
    const { result, setPageIndex, expandAncestors } = setup();
    act(() => result.current.onFullscreenRequest({ type: "video", lang: "en", id: 30 }));
    expect(setPageIndex).toHaveBeenLastCalledWith(PAGE_INDEX.video);
    // Media routes are not in the header menus, so there is nothing to expand.
    expect(expandAncestors).toHaveBeenLastCalledWith([]);

    act(() => result.current.onFullscreenRequest({ type: "video", lang: "en", slug: "COPILOT" }));
    expect(setPageIndex).toHaveBeenLastCalledWith(PAGE_INDEX.video);

    act(() => result.current.onFullscreenRequest({ type: "audio", lang: "en", id: 40 }));
    expect(setPageIndex).toHaveBeenLastCalledWith(PAGE_INDEX.audio);

    act(() => result.current.onFullscreenRequest({ type: "audio", lang: "en", slug: "intro-track" }));
    expect(setPageIndex).toHaveBeenLastCalledWith(PAGE_INDEX.audio);
    expect(setPageIndex).toHaveBeenCalledTimes(4);
  });

  it("still records the request when no page can be resolved", () => {
    const { result, setPageIndex } = setup();
    act(() => result.current.onFullscreenRequest(md()));
    act(() => result.current.onFullscreenRequest({ type: "video", lang: "en", slug: "ghost" }));
    act(() => result.current.onFullscreenRequest({ type: "audio", lang: "en" }));
    act(() => result.current.onFullscreenRequest({ type: null, lang: "en" }));
    expect(setPageIndex).not.toHaveBeenCalled();
    expect(result.current.urlFullscreenParams).toEqual({ type: null, lang: "en" });
  });

  it("ignores URL requests while an inline fullscreen is open", () => {
    const { result, setPageIndex, replaceUrlWithoutNavigation } = setup();
    act(() => result.current.handleInlineFullscreenOpen(md(INTRO)));
    expect(replaceUrlWithoutNavigation).toHaveBeenCalledWith("/docs", expect.any(URLSearchParams));
    expect(window.location.search).toBe("?mdfull=en&file=docs%2Fintro.md");

    act(() => result.current.onFullscreenRequest(md(INTRO)));
    expect(setPageIndex).not.toHaveBeenCalled();
    expect(result.current.urlFullscreenParams).toBeNull();

    act(() => result.current.handleInlineFullscreenClose());
    expect(window.location.search).toBe("");
    act(() => result.current.onFullscreenRequest(md(INTRO)));
    expect(setPageIndex).toHaveBeenCalledWith(PAGE_INDEX.intro);
  });

  it("closes a URL fullscreen by stripping its params in place", () => {
    const { result, routerReplace } = setup("/docs", "/docs?mdfull=en&file=x&id=3&slug=y&theme=aurora-dark");
    act(() => result.current.onFullscreenRequest(md("x")));
    act(() => result.current.closeUrlFullscreen());
    expect(window.location.pathname).toBe("/docs");
    expect(window.location.search).toBe("?theme=aurora-dark");
    expect(result.current.urlFullscreenParams).toBeNull();
    expect(routerReplace).not.toHaveBeenCalled();

    const rootless = setup(null, "/anything?videofull=en&id=30");
    act(() => rootless.result.current.closeUrlFullscreen());
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("");
  });

  it("writes the params of every content type when an inline fullscreen opens", () => {
    const { result } = setup();
    act(() => result.current.handleInlineFullscreenOpen({ type: "html", lang: "pt", file: LANDING }));
    expect(window.location.search).toBe("?htmlfull=pt&file=pages%2Flanding.html");

    setWindowUrl("/docs");
    act(() => result.current.handleInlineFullscreenOpen({ type: "video", lang: "en", id: 30, slug: "copilot" }));
    expect(window.location.search).toBe("?videofull=en&id=30&slug=copilot");

    setWindowUrl("/docs");
    act(() => result.current.handleInlineFullscreenOpen({ type: "audio", lang: "en", slug: "intro" }));
    expect(window.location.search).toBe("?audiofull=en&slug=intro");

    setWindowUrl("/docs");
    act(() => result.current.handleInlineFullscreenOpen({ type: "audio", lang: "en", id: 40 }));
    expect(window.location.search).toBe("?audiofull=en&id=40");

    setWindowUrl("/docs?keep=1");
    act(() => result.current.handleInlineFullscreenOpen({ type: null, lang: "en" }));
    expect(window.location.search).toBe("?keep=1");
  });

  it("drops the id on inline close only when a media fullscreen was open", () => {
    const media = setup("/docs", "/docs?videofull=en&id=30&slug=x&theme=t");
    act(() => media.result.current.handleInlineFullscreenClose());
    expect(window.location.search).toBe("?theme=t");

    const document = setup("/docs", "/docs?mdfull=en&file=f&id=7");
    act(() => document.result.current.handleInlineFullscreenClose());
    expect(window.location.search).toBe("?id=7");
    expect(document.result.current.urlFullscreenParams).toBeNull();

    const rootless = setup(null, "/x?audiofull=en&id=40");
    act(() => rootless.result.current.handleInlineFullscreenClose());
    expect(rootless.replaceUrlWithoutNavigation).toHaveBeenCalledWith("/", expect.any(URLSearchParams));
  });
});
