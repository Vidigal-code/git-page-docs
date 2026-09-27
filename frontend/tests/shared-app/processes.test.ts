import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/entities/docs/server", () => ({
  loadRootConfig: vi.fn(),
  loadDocsData: vi.fn(),
}));
vi.mock("@/shared/config/repo-from-package", () => ({
  getRepoFromPackage: vi.fn(),
}));

import { loadDocsData, loadRootConfig } from "@/entities/docs/server";
import { getRepoFromPackage } from "@/shared/config/repo-from-package";
import { generateDocsStaticParams } from "@/processes/docs-routing";
import { loadDocsRouteData } from "@/processes/docs-loading";
import { loadSiteMetadata, loadSiteName } from "@/processes/site-metadata";
import { FALLBACK_HEADER_NAME } from "@/shared/lib/resolve-site-assets";

const loadRootConfigMock = vi.mocked(loadRootConfig);
const loadDocsDataMock = vi.mocked(loadDocsData);
const getRepoFromPackageMock = vi.mocked(getRepoFromPackage);

const SEMVER = /^\d+\.\d+\.\d+$/;

beforeEach(() => {
  vi.stubEnv("GITHUB_ACTIONS", "false");
  vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "false");
  vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe("generateDocsStaticParams", () => {
  it("only prerenders the root in repository-search mode", async () => {
    vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "true");
    expect(await generateDocsStaticParams()).toEqual([{ repo: [] }]);
    expect(loadRootConfigMock).not.toHaveBeenCalled();
  });

  it("emits version paths and owner/repo paths from the config and package.json without duplicates", async () => {
    loadRootConfigMock.mockResolvedValue({
      VersionControl: { versions: [{ id: "2.0.0" }, { id: "1.0.0" }] },
      site: { ProjectLink: "https://github.com/acme/site" },
    });
    getRepoFromPackageMock.mockResolvedValue({
      fromRepository: { owner: "acme", repo: "site" },
      fromHomepage: { owner: "other", repo: "pages" },
    });

    expect(await generateDocsStaticParams()).toEqual([
      { repo: [] },
      { repo: ["v", "2.0.0"] },
      { repo: ["v", "1.0.0"] },
      { repo: ["acme", "site"] },
      { repo: ["acme", "site", "v", "2.0.0"] },
      { repo: ["acme", "site", "v", "1.0.0"] },
      { repo: ["other", "pages"] },
      { repo: ["other", "pages", "v", "2.0.0"] },
      { repo: ["other", "pages", "v", "1.0.0"] },
    ]);
  });

  it("falls back to the built-in version when the config lists none and no repository is known", async () => {
    loadRootConfigMock.mockResolvedValue({ site: { ProjectLink: "not a url" } });
    getRepoFromPackageMock.mockResolvedValue(null);

    const params = await generateDocsStaticParams();
    expect(params).toHaveLength(2);
    expect(params[0]).toEqual({ repo: [] });
    expect(params[1].repo[0]).toBe("v");
    expect(params[1].repo[1]).toMatch(SEMVER);
  });

  it("still prerenders package.json repositories when the config cannot be loaded", async () => {
    loadRootConfigMock.mockRejectedValue(new Error("no config"));
    getRepoFromPackageMock.mockResolvedValue({
      fromRepository: { owner: "acme", repo: "site" },
      fromHomepage: { owner: "acme", repo: "home" },
    });

    const params = await generateDocsStaticParams();
    const version = params[1].repo[1];
    expect(version).toMatch(SEMVER);
    expect(params).toEqual([
      { repo: [] },
      { repo: ["v", version] },
      { repo: ["acme", "site"] },
      { repo: ["acme", "site", "v", version] },
      { repo: ["acme", "home"] },
      { repo: ["acme", "home", "v", version] },
    ]);
  });

  it("uses the project's own repository when neither the config nor package.json can be read", async () => {
    loadRootConfigMock.mockRejectedValue(new Error("no config"));
    getRepoFromPackageMock.mockRejectedValue(new Error("no package"));

    const params = await generateDocsStaticParams();
    const version = params[1].repo[1];
    expect(params).toEqual([
      { repo: [] },
      { repo: ["v", version] },
      { repo: ["Vidigal-code", "git-page-docs"] },
      { repo: ["Vidigal-code", "git-page-docs", "v", version] },
    ]);
  });
});

describe("loadDocsRouteData", () => {
  type Data = Awaited<ReturnType<typeof loadDocsData>>;

  function docsData(overrides: {
    routes?: unknown[];
    showRepositorySearchHome?: boolean;
    activeRepository?: Partial<Data["activeRepository"]>;
  } = {}): Data {
    return {
      config: { routes: overrides.routes ?? [{ id: "intro" }] },
      showRepositorySearchHome: overrides.showRepositorySearchHome,
      activeRepository: { source: "local", ...overrides.activeRepository },
    } as unknown as Data;
  }

  it.each([
    [undefined, undefined, undefined],
    [["v", "2.0.0"], undefined, "2.0.0"],
    [["owner", "repo"], ["owner", "repo"], undefined],
    [["owner", "repo", "v", "1.0.0"], ["owner", "repo"], "1.0.0"],
  ])("maps the slug %j to loadDocsData(%j, %j)", async (slug, expectedSlug, expectedVersion) => {
    loadDocsDataMock.mockResolvedValue(docsData());
    await loadDocsRouteData(slug);
    expect(loadDocsDataMock).toHaveBeenCalledWith(expectedSlug, expectedVersion);
  });

  it("renders the docs shell for a repository with routes", async () => {
    const data = docsData();
    loadDocsDataMock.mockResolvedValue(data);
    expect(await loadDocsRouteData(["owner", "repo"])).toEqual({
      data,
      repositoryNotUsingGitPageDocs: false,
      shouldShowRepositorySearch: false,
    });
  });

  it("shows the search home when the data asks for it", async () => {
    loadDocsDataMock.mockResolvedValue(docsData({ showRepositorySearchHome: true }));
    expect(await loadDocsRouteData(undefined)).toMatchObject({
      repositoryNotUsingGitPageDocs: false,
      shouldShowRepositorySearch: true,
    });
  });

  it("flags a requested repository that does not ship gitpagedocs", async () => {
    loadDocsDataMock.mockResolvedValue(docsData({ activeRepository: { requested: true, hasGitPageDocs: false } }));
    expect(await loadDocsRouteData(["owner", "repo"])).toMatchObject({
      repositoryNotUsingGitPageDocs: true,
      shouldShowRepositorySearch: true,
    });
  });

  it("falls back to the search screen when there are no routes at all", async () => {
    loadDocsDataMock.mockResolvedValue(docsData({ routes: [] }));
    expect(await loadDocsRouteData(undefined)).toMatchObject({
      repositoryNotUsingGitPageDocs: false,
      shouldShowRepositorySearch: true,
    });
  });
});

describe("loadSiteMetadata", () => {
  it("reads the header name and icon path from the root config under the base path", async () => {
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", " /git-page-docs ");
    loadRootConfigMock.mockResolvedValue({ site: { SiteHeaderName: " My Docs ", SiteIconPath: "icons/x.png" } });
    expect(await loadSiteMetadata()).toEqual({ siteName: "My Docs", iconPath: "/git-page-docs/icons/x.png" });
  });

  it("falls back to the site name and default icon", async () => {
    loadRootConfigMock.mockResolvedValue({ site: { name: "Named" } });
    expect(await loadSiteMetadata()).toEqual({ siteName: "Named", iconPath: "/icon.svg" });
    expect(await loadSiteName()).toBe("Named");
  });

  it("keeps static fallbacks when the config cannot be loaded", async () => {
    loadRootConfigMock.mockRejectedValue(new Error("boom"));
    expect(await loadSiteMetadata()).toEqual({ siteName: FALLBACK_HEADER_NAME, iconPath: "/icon.svg" });
    expect(await loadSiteName()).toBe(FALLBACK_HEADER_NAME);
  });
});
