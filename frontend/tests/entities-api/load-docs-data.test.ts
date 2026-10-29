import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadDocsData } from "@/entities/docs/api/load-docs-data";
import { buildVersionLinkOptions } from "@/entities/docs/lib/version-links";
import { createTempWorkspace, requestedUrls, stubRepoFetch, type TempWorkspace } from "./test-helpers";

const FALLBACK_ID = "gitpagedocs-fallback-dark";

const LAYOUT_INDEX = {
  layouts: [{ id: "alpha", name: "Alpha", author: "t", file: "templates/alpha.json", preview: "", supportsLightAndDarkModes: false, mode: "dark" }],
};
const ALPHA_TEMPLATE = {
  id: "alpha",
  name: "Alpha",
  author: "t",
  version: "1",
  mode: "dark",
  supportsLightAndDarkModes: false,
  colors: { background: "#alpha" },
  typography: { fontFamily: "x", fontSize: { base: "1rem" } },
  components: {},
  animations: {},
};

function baseSite(overrides: Record<string, unknown> = {}) {
  return { name: "Local", defaultLanguage: "en", rendering: "", ThemeDefault: "alpha", HideThemeSelector: false, ...overrides };
}

let workspace: TempWorkspace;

beforeEach(() => {
  vi.stubEnv("GITHUB_ACTIONS", "");
  vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "");
  vi.stubEnv("GITHUB_REPOSITORY", "");
  vi.stubEnv("GITPAGEDOCS_LAYOUTS_SOURCE", "");
  workspace = createTempWorkspace();
});

afterEach(() => {
  workspace.cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("loadDocsData on a local workspace", () => {
  function writeVersionedWorkspace(): void {
    workspace.write("gitpagedocs/config.json", {
      site: baseSite({ docsVersion: "v1" }),
      routes: [],
      "menus-header": [{ id: 1, en: { title: "Root", "path-click": "docs/en/root.md" } }],
      "routes-md": [{ id: 1, path: { en: "docs/en/root.md" } }],
      VersionControl: {
        versions: [
          { id: "v1", path: "docs/v1/config.json" },
          { id: "v1", path: "docs/v1/duplicate.json" },
          { id: "v2", path: "docs/v2/config.json" },
        ],
      },
    });
    workspace.write("docs/en/root.md", "# Root");
    workspace.write("docs/v1/config.json", {
      "routes-md": [{ id: 2, path: { en: "docs/v1/en/b.md", pt: "docs/v1/pt/b.md" } }],
      "menus-header-md": [{ id: 2, en: { title: "B", "path-click": "docs/v1/en/b.md" } }],
    });
    workspace.write("docs/v1/en/b.md", "# B en");
    workspace.write("docs/v1/pt/b.md", "# B pt");
    workspace.write("gitpagelayouts/layoutsConfig.json", LAYOUT_INDEX);
    workspace.write("gitpagelayouts/templates/alpha.json", ALPHA_TEMPLATE);
  }

  function writeOfficialLayoutWorkspace(): ReturnType<typeof vi.fn> {
    writeVersionedWorkspace();
    workspace.write("gitpagedocs/config.json", {
      site: baseSite({ layoutsConfigPathOficial: true }),
      routes: [],
    });
    return stubRepoFetch({
      "Vidigal-code/git-page-docs/gitpagelayouts/layoutsConfig.json": {
        layouts: [{ ...LAYOUT_INDEX.layouts[0], id: "published", file: "templates/published.json" }],
      },
      "Vidigal-code/git-page-docs/gitpagelayouts/templates/published.json": { ...ALPHA_TEMPLATE, id: "published" },
    });
  }

  it("uses the local layout catalog when development explicitly requests a local preview", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("GITPAGEDOCS_LAYOUTS_SOURCE", "local");
    const fetchSpy = writeOfficialLayoutWorkspace();

    const data = await loadDocsData(undefined);

    expect(data.layoutsConfig.layouts.map(({ id }) => id)).toEqual(["alpha"]);
    expect(data.themes.alpha).toEqual(ALPHA_TEMPLATE);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(data.config.site.layoutsConfigPathOficial).toBe(true);
  });

  it.each([
    { environment: "development", source: "" },
    { environment: "development", source: "unknown" },
    { environment: "production", source: "local" },
    { environment: "test", source: "local" },
  ])("preserves configured official layouts in $environment with source '$source'", async ({ environment, source }) => {
    vi.stubEnv("NODE_ENV", environment);
    vi.stubEnv("GITPAGEDOCS_LAYOUTS_SOURCE", source);
    const fetchSpy = writeOfficialLayoutWorkspace();

    const data = await loadDocsData(undefined);

    expect(data.layoutsConfig.layouts.map(({ id }) => id)).toEqual(["published"]);
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("assembles the active version's routes, pages, languages, layouts and defaults", async () => {
    writeVersionedWorkspace();
    const fetchSpy = stubRepoFetch({});

    const data = await loadDocsData(undefined);

    expect(data.availableVersions.map((v) => v.id)).toEqual(["v1", "v2"]);
    expect(data.activeVersionId).toBe("v1");
    expect(data.activeVersion?.path).toBe("docs/v1/config.json");
    expect(data.pages.map((p) => p.id)).toEqual([2]);
    expect(data.docs).toEqual([{ routeId: 2, markdownByLanguage: { en: '<h1 id="b-en">B en</h1>\n', pt: '<h1 id="b-pt">B pt</h1>\n' } }]);
    expect(data.pathToPageMap).toEqual({
      "docs/v1/en/b.md": { pageIndex: 0, contentType: "md" },
      "docs/v1/pt/b.md": { pageIndex: 0, contentType: "md" },
    });
    expect(data.availableLanguages).toEqual(["en", "pt"]);
    expect(data.config.routes).toEqual([{ id: 2, path: { en: "docs/v1/en/b.md", pt: "docs/v1/pt/b.md" } }]);
    expect(data.config["menus-header"]?.[0]?.id).toBe(2);
    expect(data.config.site.name).toBe("Local");
    expect(data.config.site.langmenu.en.menuOpen).toBe("Menu");
    expect(data.layoutsConfig.layouts.map((l) => l.id)).toEqual(["alpha"]);
    expect(data.themes.alpha.colors.background).toBe("#alpha");
    expect(data.showRepositorySearchHome).toBe(false);
    expect(data.activeRepository).toEqual({ owner: undefined, repo: undefined, requested: false, hasGitPageDocs: true, source: "local" });
    expect(requestedUrls(fetchSpy).every((url) => url.endsWith("layoutsConfig.json"))).toBe(true);
  });

  it("keeps the root routes when the selected version has no config of its own", async () => {
    writeVersionedWorkspace();
    stubRepoFetch({});

    const data = await loadDocsData(undefined, "v2");

    expect(data.activeVersionId).toBe("v2");
    expect(data.pages.map((p) => p.id)).toEqual([1]);
    expect(data.docs[0].markdownByLanguage.en).toBe('<h1 id="root">Root</h1>\n');
    expect(data.config["menus-header"]?.[0]?.id).toBe(1);
    expect(data.availableLanguages).toEqual(["en"]);
  });

  it("preserves named and legacy repository links while loading a local version", async () => {
    const activeVersion = {
      id: "v1",
      path: "docs/v1/config.json",
      branch: [{ name: "Main branch", url: "https://github.com/demo/docs/tree/main" }],
      release: [],
      commit: "/demo/docs/commit/abc",
    };
    workspace.write("gitpagedocs/config.json", {
      site: baseSite({ docsVersion: "v1" }),
      routes: [],
      VersionControl: { versions: [activeVersion] },
    });
    workspace.write("docs/v1/config.json", { "routes-md": [{ id: 1, path: { en: "docs/en/start.md" } }] });
    workspace.write("docs/en/start.md", "# Start");
    stubRepoFetch({});

    const data = await loadDocsData(undefined);

    expect(data.activeVersion).toEqual(activeVersion);
    expect(data.pages[0].md?.sourceByLanguage?.en).toBe("# Start");
    expect(buildVersionLinkOptions(data.activeVersion)).toEqual([
      { id: "branch", label: "Branch", name: "Main branch", url: "https://github.com/demo/docs/tree/main" },
      { id: "commit", label: "Commit", url: "/demo/docs/commit/abc" },
    ]);
  });

  it("falls back to the configured docsVersion for an unknown selection", async () => {
    writeVersionedWorkspace();
    stubRepoFetch({});
    const data = await loadDocsData(undefined, "v9");
    expect(data.activeVersionId).toBe("v1");
  });

  it("applies language toggles and the language bundles the config enables", async () => {
    workspace.write("gitpagedocs/config.json", {
      site: baseSite({ languages: { en: true, pt: false } }),
      routes: [{ id: 1, path: { en: "docs/en/a.md", pt: "docs/pt/a.md" } }],
      "menus-header": [],
    });
    workspace.write("gitpagedocs/langs/en.json", { langmenu: { menuOpen: "Bundle EN" } });
    workspace.write("docs/en/a.md", "# A");
    stubRepoFetch({});

    const data = await loadDocsData(undefined);

    expect(data.availableLanguages).toEqual(["en"]);
    expect(data.config.site.langmenu.en.menuOpen).toBe("Bundle EN");
    expect(data.availableVersions).toEqual([]);
    expect(data.activeVersionId).toBeUndefined();
    expect(data.layoutsConfig.layouts[0].id).toBe(FALLBACK_ID);
    expect(data.pages[0].md?.markdownByLanguage).toEqual({ en: '<h1 id="a">A</h1>\n' });
  });
});

describe("loadDocsData with repository search enabled", () => {
  beforeEach(() => {
    vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "true");
    workspace.write("gitpagedocs/config.json", {
      site: baseSite(),
      routes: [{ id: 1, path: { en: "docs/en/a.md" } }],
      "menus-header": [],
    });
    workspace.write("docs/en/a.md", "# A");
  });

  it("renders the search home without any pages", async () => {
    stubRepoFetch({});

    const data = await loadDocsData(undefined);

    expect(data.showRepositorySearchHome).toBe(true);
    expect(data.pages).toEqual([]);
    expect(data.docs).toEqual([]);
    expect(data.config.routes).toEqual([]);
    expect(data.availableLanguages).toEqual(["en"]);
    expect(data.activeRepository.source).toBe("local");
  });

  it("loads a requested repository's docs remotely", async () => {
    stubRepoFetch({
      "o/r/gitpagedocs/config.json": {
        site: baseSite({ name: "Remote" }),
        routes: [],
        "menus-header": [],
        "routes-md": [{ id: 5, path: { en: "docs/en/r.md" } }],
      },
      "o/r/docs/en/r.md": "# R",
    });

    const data = await loadDocsData(["o", "r"]);

    expect(data.activeRepository).toEqual({ owner: "o", repo: "r", requested: true, hasGitPageDocs: true, source: "remote" });
    expect(data.config.site.name).toBe("Remote");
    expect(data.pages.map((p) => p.id)).toEqual([5]);
    expect(data.docs[0].markdownByLanguage.en).toBe('<h1 id="r">R</h1>\n');
    expect(data.showRepositorySearchHome).toBe(false);
  });

  it("yields an empty docs set for a requested repository without gitpagedocs", async () => {
    stubRepoFetch({});

    const data = await loadDocsData(["o", "r"]);

    expect(data.activeRepository).toEqual({ owner: "o", repo: "r", requested: true, hasGitPageDocs: false, source: "remote" });
    expect(data.pages).toEqual([]);
    expect(data.config.site.name).toBe("Local");
    expect(data.layoutsConfig.layouts[0].id).toBe(FALLBACK_ID);
  });
});
