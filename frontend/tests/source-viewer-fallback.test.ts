import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { SOURCE_VIEWER_FALLBACK_PARAM, redirectSourceViewerDeepLink } from "@/shared/lib/source-viewer-fallback";

const BASE_PATH_ENV = "NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH";

function stubLocation(pathname: string) {
  const replace = vi.fn();
  vi.stubGlobal("window", { location: { pathname, replace } });
  return replace;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("redirectSourceViewerDeepLink", () => {
  it("exposes the query param that carries the deep route", () => {
    expect(SOURCE_VIEWER_FALLBACK_PARAM).toBe("src");
  });

  it("returns false without a window (server side)", () => {
    vi.stubEnv(BASE_PATH_ENV, "");
    expect(typeof window).toBe("undefined");
    expect(redirectSourceViewerDeepLink()).toBe(false);
  });

  describe("without a base path", () => {
    beforeEach(() => vi.stubEnv(BASE_PATH_ENV, ""));

    it.each(["/", "/docs", "/source-viewer-extra", "/sourceviewer", "/x/source-viewer/", "/docs/source-viewer"])(
      "ignores %j and does not redirect",
      (pathname) => {
        const replace = stubLocation(pathname);
        expect(redirectSourceViewerDeepLink()).toBe(false);
        expect(replace).not.toHaveBeenCalled();
      },
    );

    it("redirects a deep link to the exported page carrying the route in ?src=", () => {
      const replace = stubLocation("/source-viewer/owner/repo/tree/main/src");
      expect(redirectSourceViewerDeepLink()).toBe(true);
      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith("/source-viewer/?src=owner%2Frepo%2Ftree%2Fmain%2Fsrc");
    });

    it.each(["/source-viewer", "/source-viewer/", "/source-viewer///"])(
      "redirects the bare entry %j to /source-viewer/ without a query",
      (pathname) => {
        const replace = stubLocation(pathname);
        expect(redirectSourceViewerDeepLink()).toBe(true);
        expect(replace).toHaveBeenCalledTimes(1);
        expect(replace).toHaveBeenCalledWith("/source-viewer/");
      },
    );

    it("drops the trailing slash from the deep route", () => {
      const replace = stubLocation("/source-viewer/x/");
      expect(redirectSourceViewerDeepLink()).toBe(true);
      expect(replace).toHaveBeenCalledWith("/source-viewer/?src=x");
    });

    it("percent-encodes the deep route", () => {
      const replace = stubLocation("/source-viewer/o/r/tree/feat%2Fx/a b.ts");
      expect(redirectSourceViewerDeepLink()).toBe(true);
      expect(replace).toHaveBeenCalledWith("/source-viewer/?src=o%2Fr%2Ftree%2Ffeat%252Fx%2Fa%20b.ts");
    });
  });

  describe("with base path /git-page-docs", () => {
    beforeEach(() => vi.stubEnv(BASE_PATH_ENV, "/git-page-docs"));

    it("strips the base before matching and prefixes it on the redirect", () => {
      const replace = stubLocation("/git-page-docs/source-viewer/x/");
      expect(redirectSourceViewerDeepLink()).toBe(true);
      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith("/git-page-docs/source-viewer/?src=x");
    });

    it("redirects the bare entry under the base without a query", () => {
      const replace = stubLocation("/git-page-docs/source-viewer");
      expect(redirectSourceViewerDeepLink()).toBe(true);
      expect(replace).toHaveBeenCalledWith("/git-page-docs/source-viewer/");
    });

    it("ignores routes outside the source viewer under the base", () => {
      const replace = stubLocation("/git-page-docs/docs");
      expect(redirectSourceViewerDeepLink()).toBe(false);
      expect(replace).not.toHaveBeenCalled();
    });

    it("still matches a base-less pathname and prefixes the base on the redirect", () => {
      const replace = stubLocation("/source-viewer/x");
      expect(redirectSourceViewerDeepLink()).toBe(true);
      expect(replace).toHaveBeenCalledWith("/git-page-docs/source-viewer/?src=x");
    });
  });
});
