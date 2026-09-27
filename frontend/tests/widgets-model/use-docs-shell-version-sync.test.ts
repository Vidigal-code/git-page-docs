// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { useDocsShellVersionSync } from "@/widgets/docs-shell/model/use-docs-shell-version-sync";
import { STORAGE_KEYS, makeVersions, stubWindowLocation, type LocationStub } from "./fixtures";

const nav = vi.hoisted(() => ({ searchParams: new URLSearchParams() as URLSearchParams | null }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => nav.searchParams,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/",
}));

type Args = Parameters<typeof useDocsShellVersionSync>[0];

function setup(search: string, overrides: Partial<Args> = {}) {
  nav.searchParams = new URLSearchParams(search);
  const routerReplace = vi.fn();
  renderHook(() =>
    useDocsShellVersionSync({
      showVersionSelector: true,
      isRemoteRepositorySession: false,
      pathname: "/docs",
      versionStorageKey: STORAGE_KEYS.version,
      availableVersions: makeVersions(),
      routerReplace,
      ...overrides,
    }),
  );
  return { routerReplace };
}

afterEach(cleanup);

describe("useDocsShellVersionSync", () => {
  let location: LocationStub;
  let replaceState: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    window.localStorage.clear();
    location = stubWindowLocation("/docs");
    replaceState = vi.spyOn(window.history, "replaceState");
  });

  afterEach(() => {
    location.restore();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("does nothing while the version selector is hidden", () => {
    const { routerReplace } = setup("version=v2", { showVersionSelector: false });
    expect(routerReplace).not.toHaveBeenCalled();
    expect(location.replace).not.toHaveBeenCalled();
  });

  describe("remote repository sessions", () => {
    const remote = { isRemoteRepositorySession: true, pathname: "/r/demo/docs/v/v1" };

    it("hard-navigates to the version path when the URL version differs from the path", () => {
      const { routerReplace } = setup("version=v2&lang=pt", remote);
      expect(location.replace).toHaveBeenCalledWith("/r/demo/docs/v/v2?lang=pt");
      expect(routerReplace).not.toHaveBeenCalled();

      location.replace.mockClear();
      setup("version=v2", { ...remote, pathname: "/r/demo/docs" });
      expect(location.replace).toHaveBeenCalledWith("/r/demo/docs/v/v2");
    });

    it("prefixes the base path on hard navigations", () => {
      vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "/git-page-docs");
      setup("version=v2", remote);
      expect(location.replace).toHaveBeenCalledWith("/git-page-docs/r/demo/docs/v/v2");
    });

    it("stays put when the URL version already matches the path", () => {
      setup("version=v1", remote);
      expect(location.replace).not.toHaveBeenCalled();
      expect(replaceState).not.toHaveBeenCalled();
    });

    it("strips an unknown version from the URL without navigating", () => {
      setup("version=v9&lang=pt", remote);
      expect(replaceState).toHaveBeenCalledWith({}, "", "/r/demo/docs/v/v1?lang=pt");
      expect(location.replace).not.toHaveBeenCalled();

      replaceState.mockClear();
      setup("version=v9", remote);
      expect(replaceState).toHaveBeenCalledWith({}, "", "/r/demo/docs/v/v1");
    });

    it("leaves a URL without a version alone", () => {
      setup("lang=pt", remote);
      expect(replaceState).not.toHaveBeenCalled();
      expect(location.replace).not.toHaveBeenCalled();
    });
  });

  describe("local sessions", () => {
    it("moves a known ?version into the path through the router", () => {
      const plain = setup("version=v2");
      expect(plain.routerReplace).toHaveBeenCalledWith("/docs/v/v2");

      const withQuery = setup("version=v2&lang=pt");
      expect(withQuery.routerReplace).toHaveBeenCalledWith("/docs/v/v2?lang=pt");
    });

    it("ignores ?version when the path already carries a version or the id is unknown", () => {
      const versioned = setup("version=v2", { pathname: "/docs/v/v1" });
      expect(versioned.routerReplace).not.toHaveBeenCalled();

      const unknown = setup("version=v9");
      expect(unknown.routerReplace).not.toHaveBeenCalled();
    });

    it("restores the saved version into the path when the URL has none", () => {
      window.localStorage.setItem(STORAGE_KEYS.version, "v2");
      const saved = setup("lang=pt", { pathname: "/docs/" });
      expect(saved.routerReplace).toHaveBeenCalledWith("/docs/v/v2?lang=pt");

      const alreadyVersioned = setup("", { pathname: "/docs/v/v1" });
      expect(alreadyVersioned.routerReplace).not.toHaveBeenCalled();

      window.localStorage.setItem(STORAGE_KEYS.version, "v9");
      const unknown = setup("");
      expect(unknown.routerReplace).not.toHaveBeenCalled();
    });

    it("treats a missing search params object as an empty query", () => {
      window.localStorage.setItem(STORAGE_KEYS.version, "v2");
      nav.searchParams = null;
      const routerReplace = vi.fn();
      renderHook(() =>
        useDocsShellVersionSync({
          showVersionSelector: true,
          isRemoteRepositorySession: false,
          pathname: "/docs",
          versionStorageKey: STORAGE_KEYS.version,
          availableVersions: makeVersions(),
          routerReplace,
        }),
      );
      expect(routerReplace).toHaveBeenCalledWith("/docs/v/v2");
    });

    it("tolerates blocked storage", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      const { routerReplace } = setup("");
      expect(routerReplace).not.toHaveBeenCalled();
    });
  });
});
