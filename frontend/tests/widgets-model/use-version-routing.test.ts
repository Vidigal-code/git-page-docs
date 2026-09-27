// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import { useVersionRouting } from "@/widgets/docs-shell/model/use-version-routing";
import { makeVersions, stubWindowLocation, type LocationStub } from "./fixtures";

type Args = Parameters<typeof useVersionRouting>[0];

function setup(overrides: Partial<Args> = {}) {
  const routerReplace = vi.fn();
  const hook = renderHook(() =>
    useVersionRouting({
      pathname: "/docs",
      versionFromQuery: null,
      activeVersionId: undefined,
      availableVersions: makeVersions(),
      isLanguageSelectVisible: true,
      isRemoteRepositorySession: false,
      language: "pt",
      getCurrentSearchParams: () => new URLSearchParams("fallback=1"),
      routerReplace,
      ...overrides,
    }),
  );
  return { ...hook, routerReplace };
}

afterEach(cleanup);

describe("useVersionRouting", () => {
  let location: LocationStub;

  beforeEach(() => {
    location = stubWindowLocation("/docs?lang=en&version=v1&x=1");
  });

  afterEach(() => {
    location.restore();
    vi.unstubAllEnvs();
  });

  it("parses the version segment only at the end of the path", () => {
    expect(setup({ pathname: "/docs/v/v2" }).result.current.versionFromPath).toBe("v2");
    expect(setup({ pathname: "/docs/v/v2/" }).result.current.versionFromPath).toBe("v2");
    expect(setup({ pathname: "/docs" }).result.current.versionFromPath).toBeUndefined();
    expect(setup({ pathname: "/docs/v/v2/extra" }).result.current.versionFromPath).toBeUndefined();
  });

  it("selects the version by precedence: path, query, active id, first available", () => {
    expect(setup({ pathname: "/docs/v/v2", versionFromQuery: "v1", activeVersionId: "v1" }).result.current.selectedVersionValue).toBe("v2");
    expect(setup({ pathname: "/docs/v/v9", versionFromQuery: "v2", activeVersionId: "v1" }).result.current.selectedVersionValue).toBe("v2");
    expect(setup({ versionFromQuery: "v9", activeVersionId: "v2" }).result.current.selectedVersionValue).toBe("v2");
    expect(setup({ activeVersionId: "v9" }).result.current.selectedVersionValue).toBe("v1");
    expect(setup({ availableVersions: [] }).result.current.selectedVersionValue).toBe("");
  });

  it("navigates to the new version path keeping the query and syncing the language", () => {
    const { result, routerReplace } = setup();
    act(() => result.current.onVersionChange("v2"));
    expect(location.assign).toHaveBeenCalledWith("/docs/v/v2?lang=pt&x=1");
    expect(routerReplace).not.toHaveBeenCalled();

    const versioned = setup({ pathname: "/docs/v/v1/" });
    act(() => versioned.result.current.onVersionChange("v2"));
    expect(location.assign).toHaveBeenLastCalledWith("/docs/v/v2?lang=pt&x=1");
  });

  it("drops the lang param when the language selector is hidden", () => {
    const { result } = setup({ isLanguageSelectVisible: false });
    act(() => result.current.onVersionChange("v2"));
    expect(location.assign).toHaveBeenCalledWith("/docs/v/v2?x=1");

    location.restore();
    location = stubWindowLocation("/docs");
    const bare = setup({ isLanguageSelectVisible: false });
    act(() => bare.result.current.onVersionChange("v2"));
    expect(location.assign).toHaveBeenCalledWith("/docs/v/v2");
  });

  it("always carries the language for remote repository sessions", () => {
    const { result } = setup({ isRemoteRepositorySession: true, isLanguageSelectVisible: false, pathname: "/r/demo/docs/v/v1" });
    act(() => result.current.onVersionChange("v2"));
    expect(location.assign).toHaveBeenCalledWith("/r/demo/docs/v/v2?lang=pt&x=1");
  });

  it("prefixes the base path on navigation", () => {
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "/git-page-docs");
    const local = setup();
    act(() => local.result.current.onVersionChange("v2"));
    expect(location.assign).toHaveBeenLastCalledWith("/git-page-docs/docs/v/v2?lang=pt&x=1");

    const remote = setup({ isRemoteRepositorySession: true });
    act(() => remote.result.current.onVersionChange("v2"));
    expect(location.assign).toHaveBeenLastCalledWith("/git-page-docs/docs/v/v2?lang=pt&x=1");
  });
});
