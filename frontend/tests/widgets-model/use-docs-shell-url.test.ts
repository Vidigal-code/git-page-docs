// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import { useDocsShellUrl } from "@/widgets/docs-shell/model/use-docs-shell-url";
import { setWindowUrl } from "./fixtures";

const nav = vi.hoisted(() => ({
  pathname: "/docs" as string | null,
  searchParams: new URLSearchParams("from=next") as URLSearchParams | null,
  router: { replace: vi.fn(), push: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => nav.router,
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams,
}));

afterEach(cleanup);

describe("useDocsShellUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    nav.pathname = "/docs";
  });

  it("reads the live window query and exposes the Next.js primitives", () => {
    setWindowUrl("/docs?lang=pt&theme=aurora-dark");
    const { result } = renderHook(() => useDocsShellUrl());
    expect(result.current.getCurrentSearchParams().toString()).toBe("lang=pt&theme=aurora-dark");
    expect(result.current.pathname).toBe("/docs");
    expect(result.current.searchParams).toBe(nav.searchParams);
    expect(result.current.router).toBe(nav.router);
  });

  it("rewrites the URL in place without going through the router", () => {
    setWindowUrl("/docs?stale=1");
    const { result } = renderHook(() => useDocsShellUrl());
    act(() => result.current.replaceUrlWithoutNavigation("/docs/guide", new URLSearchParams("lang=pt")));
    expect(window.location.pathname).toBe("/docs/guide");
    expect(window.location.search).toBe("?lang=pt");
    expect(nav.router.replace).not.toHaveBeenCalled();

    act(() => result.current.replaceUrlWithoutNavigation("/docs/guide", new URLSearchParams()));
    expect(window.location.search).toBe("");
  });

  it("falls back to the current pathname, then to the root, when no path is given", () => {
    setWindowUrl("/docs");
    const withPathname = renderHook(() => useDocsShellUrl());
    act(() => withPathname.result.current.replaceUrlWithoutNavigation("", new URLSearchParams("a=1")));
    expect(window.location.pathname).toBe("/docs");
    expect(window.location.search).toBe("?a=1");

    nav.pathname = null;
    const withoutPathname = renderHook(() => useDocsShellUrl());
    act(() => withoutPathname.result.current.replaceUrlWithoutNavigation("", new URLSearchParams()));
    expect(window.location.pathname).toBe("/");
  });

  it("prefixes the configured base path", () => {
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "/git-page-docs");
    setWindowUrl("/git-page-docs/docs");
    const { result } = renderHook(() => useDocsShellUrl());
    act(() => result.current.replaceUrlWithoutNavigation("/docs/guide/", new URLSearchParams("x=1")));
    expect(window.location.pathname).toBe("/git-page-docs/docs/guide");
    expect(window.location.search).toBe("?x=1");
  });
});
