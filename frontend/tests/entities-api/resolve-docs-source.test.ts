import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveDocsSource } from "@/entities/docs/api/resolve-docs-source";
import { minimalConfig, requestedUrls, stubRepoFetch } from "./test-helpers";

const REMOTE_CONFIG = {
  site: { name: "Remote", defaultLanguage: "en", rendering: "", ThemeDefault: "x", HideThemeSelector: false, languages: { en: true, pt: false } },
  routes: [],
  "menus-header": [],
};

function localConfig(site: Record<string, unknown> = {}) {
  return minimalConfig({}, { name: "Local", ProjectLink: "https://github.com/me/mine", ...site });
}

beforeEach(() => {
  vi.stubEnv("GITHUB_ACTIONS", "");
  vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "");
  vi.stubEnv("GITHUB_REPOSITORY", "");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("resolveDocsSource with repository search disabled", () => {
  it("serves the local config with defaults backfilled and ignores the slug", async () => {
    const fetchSpy = stubRepoFetch({});

    const resolved = await resolveDocsSource(["o", "r"], localConfig());

    expect(resolved).toMatchObject({
      source: "local",
      owner: undefined,
      repo: undefined,
      hasGitPageDocs: true,
      showRepositorySearchHome: false,
      isRepositoryRouteRequest: false,
    });
    expect(resolved.config.site.name).toBe("Local");
    expect(resolved.config.site.langmenu.en.menuOpen).toBe("Menu");
    expect(resolved.config.translations?.navigation?.next?.pt).toBeTypeOf("string");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("resolveDocsSource with repository search enabled", () => {
  beforeEach(() => vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "true"));

  it("shows the search home only for the bare root request", async () => {
    stubRepoFetch({});
    expect((await resolveDocsSource(undefined, localConfig())).showRepositorySearchHome).toBe(true);
    expect((await resolveDocsSource([], localConfig())).showRepositorySearchHome).toBe(true);
    expect((await resolveDocsSource(undefined, localConfig(), "v1")).showRepositorySearchHome).toBe(false);
    expect((await resolveDocsSource(undefined, localConfig({ repositorySearchHome: false }))).showRepositorySearchHome).toBe(false);
    expect((await resolveDocsSource(["o"], localConfig())).showRepositorySearchHome).toBe(false);
  });

  it("loads a requested repository's config remotely, folding in its language bundles", async () => {
    const fetchSpy = stubRepoFetch({
      "o/r/gitpagedocs/config.json": REMOTE_CONFIG,
      "o/r/gitpagedocs/langs/en.json": { langmenu: { menuOpen: "Remote EN" } },
      "o/r/gitpagedocs/langs/pt.json": { langmenu: { menuOpen: "Remote PT" } },
    });

    const resolved = await resolveDocsSource(["o", "r"], localConfig());

    expect(resolved).toMatchObject({
      source: "remote",
      owner: "o",
      repo: "r",
      hasGitPageDocs: true,
      showRepositorySearchHome: false,
      isRepositoryRouteRequest: true,
    });
    expect(resolved.config.site.name).toBe("Remote");
    expect(resolved.config.site.langmenu.en.menuOpen).toBe("Remote EN");
    expect(resolved.config.site.langmenu.en.menuClose).toBe("Close");
    expect(requestedUrls(fetchSpy).some((url) => url.endsWith("gitpagedocs/langs/pt.json"))).toBe(false);
  });

  it("flags a requested repository without gitpagedocs and falls back to the local config", async () => {
    stubRepoFetch({});

    const resolved = await resolveDocsSource(["o", "r"], localConfig());

    expect(resolved).toMatchObject({ source: "remote", owner: "o", repo: "r", hasGitPageDocs: false, isRepositoryRouteRequest: true });
    expect(resolved.config.site.name).toBe("Local");
  });

  it("treats the project's own repository as a local source, matched case-insensitively", async () => {
    stubRepoFetch({ "ME/MINE/gitpagedocs/config.json": REMOTE_CONFIG });

    const resolved = await resolveDocsSource(["ME", "MINE"], localConfig());

    expect(resolved).toMatchObject({ source: "local", owner: "ME", repo: "MINE", hasGitPageDocs: true, isRepositoryRouteRequest: true });
    expect(resolved.config.site.name).toBe("Remote");
  });

  it("matches the project's repository through site.rendering as well", async () => {
    stubRepoFetch({});

    const resolved = await resolveDocsSource(["them", "theirs"], localConfig({ ProjectLink: "", rendering: "https://github.com/them/theirs" }));

    expect(resolved).toMatchObject({ source: "local", owner: "them", repo: "theirs", hasGitPageDocs: false });
    expect(resolved.config.site.name).toBe("Local");
  });
});

describe("resolveDocsSource on a GitHub Pages build", () => {
  beforeEach(() => vi.stubEnv("GITHUB_ACTIONS", "true"));

  it("hides the search home for ordinary repositories", async () => {
    stubRepoFetch({});
    expect((await resolveDocsSource(undefined, localConfig())).showRepositorySearchHome).toBe(false);
    // An explicit opt-in cannot override the Pages restriction.
    expect((await resolveDocsSource(undefined, localConfig({ repositorySearchHome: true }))).showRepositorySearchHome).toBe(false);
  });

  it("shows the search home for the official aggregator repository", async () => {
    stubRepoFetch({});
    vi.stubEnv("GITHUB_REPOSITORY", "Vidigal-code/git-page-docs");
    expect((await resolveDocsSource(undefined, localConfig())).showRepositorySearchHome).toBe(true);
    expect((await resolveDocsSource(undefined, localConfig({ repositorySearchHome: false }))).showRepositorySearchHome).toBe(false);

    vi.stubEnv("GITHUB_REPOSITORY", "");
    expect((await resolveDocsSource(undefined, localConfig({ rendering: "https://github.com/x/git-page-docs" }))).showRepositorySearchHome).toBe(true);
    expect((await resolveDocsSource(undefined, localConfig({ ProjectLink: "https://github.com/x/GIT-PAGE-DOCS" }))).showRepositorySearchHome).toBe(true);
  });

  it("still resolves requested repositories remotely", async () => {
    stubRepoFetch({ "o/r/gitpagedocs/config.json": REMOTE_CONFIG });
    const resolved = await resolveDocsSource(["o", "r"], localConfig());
    expect(resolved).toMatchObject({ source: "remote", owner: "o", repo: "r", isRepositoryRouteRequest: true, showRepositorySearchHome: false });
  });
});
