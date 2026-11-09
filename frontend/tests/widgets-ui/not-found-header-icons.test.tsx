// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import NotFound from "@/app/not-found";
import { RepositorySearchScreen } from "@/page-slices/docs-route/ui/repository-search-screen";
import { SourceViewerPage } from "@/page-slices/source-viewer";
import { DocsShell } from "@/widgets/docs-shell";
import { IntroductionGuidePage } from "@/page-slices/introduction-guide/ui/introduction-guide-page";
import { SHELL_THEME_CACHE_KEY, type LayoutItem, type ThemeTemplate } from "@/entities/docs";
import { withConfigDefaults } from "@/entities/docs/lib/with-config-defaults";
import { makeConfig, makeDocsData, makeSite } from "../widgets-model/fixtures";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams("theme=motion-dark"), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({ useSearchParams: () => navigation.params, usePathname: () => "/owner/repo/", useRouter: () => navigation.router }));
const THEMES = Object.fromEntries(["motion-dark", "motion-light"].map((id): [string, ThemeTemplate] => [id, {
  id, name: id, author: "Tests", version: "1", mode: id.endsWith("light") ? "light" : "dark",
  supportsLightAndDarkModes: false, colors: { background: id.endsWith("light") ? "#eceff4" : "#102030" }, typography: { fontFamily: "sans-serif", fontSize: {} }, components: {}, animations: {},
  backgroundEffects: { enabled: true, layers: [{ id: "stars", kind: "stars", count: 1 }] },
}]));
const LAYOUTS: LayoutItem[] = Object.values(THEMES).map(theme => ({ id: theme.id, name: theme.name, author: theme.author, mode: theme.mode, file: `templates/${theme.id}.json`, preview: "", supportsLightAndDarkModes: false }));
const CONTROLS = ["Pause background animation", "Theme selector", "Language selector"];

function expectIconControls(): void {
  for (const name of CONTROLS) {
    for (const control of screen.getAllByRole("button", { name })) {
      expect(control.textContent).toBe("");
      expect(control.querySelector("svg")).not.toBeNull();
    }
  }
}

function serveOfficialSite(site: Record<string, unknown> | null): void {
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("Vidigal-code/git-page-docs/") && url.endsWith("gitpagedocs/config.json")) {
      return site ? Response.json({ site }) : new Response(null, { status: 503 });
    }
    if (url.includes("layoutsConfig.json")) return Response.json({ layouts: LAYOUTS });
    const theme = Object.values(THEMES).find(candidate => url.includes(`/${candidate.id}.json`));
    return theme ? Response.json(theme) : new Response(null, { status: 404 });
  }));
}
beforeEach(() => {
  window.history.replaceState({}, "", "/owner/repo/?theme=motion-dark");
  localStorage.clear();
  localStorage.setItem(SHELL_THEME_CACHE_KEY, JSON.stringify({ layoutsConfig: { layouts: LAYOUTS }, themes: THEMES }));
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("scrollTo", vi.fn());
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });

it("renders icons while a remote repository and official settings are still loading", async () => {
  let release: () => void = () => {};
  const pending = new Promise<void>(resolve => { release = resolve; });
  vi.stubGlobal("fetch", vi.fn(async () => { await pending; return new Response(null, { status: 404 }); }));
  render(<NotFound />);
  try {
    expect(screen.getByRole("heading", { name: /Loading documentation/ })).toBeTruthy();
    expectIconControls();
  } finally { await act(async () => { release(); }); }
});

it("keeps default icons when official settings fail and the repository is not installed", async () => {
  serveOfficialSite(null);
  render(<NotFound />);
  expect(await screen.findByRole("heading", { name: "GitPageDocs is not installed." })).toBeTruthy();
  expectIconControls();
});

it("backfills icon settings omitted from an official configuration", async () => {
  serveOfficialSite({ name: "Configured documentation" });
  render(<NotFound />);
  expect(await screen.findByRole("link", { name: "Configured documentation" })).toBeTruthy();
  expectIconControls();
});

it("preserves explicit text controls after the official settings load", async () => {
  serveOfficialSite({
    name: "Text documentation", IconLanguageSelectorReactIcones: false,
    IconThemeSelectorReactIcones: false, IconBackgroundAnimationPauseReactIcones: false,
  });
  render(<NotFound />);
  await screen.findByRole("link", { name: "Text documentation" });
  await waitFor(() => expect(screen.getByRole("button", { name: "Language selector" }).textContent).toBe("English"));
  expect(screen.getByRole("button", { name: "Theme selector" }).textContent).toBe("motion-dark");
  expect(screen.getByRole("button", { name: "Pause background animation" }).textContent).toBe("Pause background animation");
});

it("uses default icons on a non-repository not-found page", () => {
  window.history.replaceState({}, "", "/missing/?theme=motion-dark");
  serveOfficialSite(null);
  render(<NotFound />);
  expect(screen.getByText("404")).toBeTruthy();
  expectIconControls();
});

it.each(["search", "uninstalled repository", "source viewer", "documentation"] as const)("renders initial controls as icons in %s", (page) => {
  serveOfficialSite(null);
  const data = makeDocsData({
    config: withConfigDefaults(makeConfig({ site: makeSite({ ThemeDefault: "motion-dark" }) })),
    layoutsConfig: { layouts: LAYOUTS }, themes: THEMES,
  });
  if (page === "source viewer") {
    render(<SourceViewerPage data={data} initialRoute={{ owner: "owner", repo: "repo", branch: "main", path: "" }} />);
  } else if (page === "documentation") {
    render(<DocsShell data={data} />);
  } else {
    render(<RepositorySearchScreen data={data} repositoryNotUsingGitPageDocs={page === "uninstalled repository"} />);
  }
  expectIconControls();
});

it.each(["search", "source viewer", "documentation", "not found", "introduction guide"] as const)(
  "honors the fixed configured palette and hides theme controls in %s",
  async (page) => {
    document.documentElement.style.setProperty("--background", "#000000");
    vi.stubGlobal("IntersectionObserver", class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); });
    const site = makeSite({
      name: "Fixed documentation", HideThemeSelector: true,
      ThemeDefault: "motion-light", ThemeModeDefault: "light",
    });
    serveOfficialSite({ ...site });
    const data = makeDocsData({
      config: withConfigDefaults(makeConfig({ site })),
      layoutsConfig: { layouts: LAYOUTS }, themes: THEMES,
    });
    if (page === "source viewer") {
      render(<SourceViewerPage data={data} initialRoute={{ owner: "owner", repo: "repo", branch: "main", path: "" }} />);
    } else if (page === "documentation") {
      render(<DocsShell data={data} />);
    } else if (page === "introduction guide") {
      render(<IntroductionGuidePage />);
    } else if (page === "not found") {
      window.history.replaceState({}, "", "/missing/?theme=motion-dark");
      render(<NotFound />);
    } else {
      render(<RepositorySearchScreen data={data} repositoryNotUsingGitPageDocs={false} />);
    }

    await waitFor(() => expect(document.documentElement.style.getPropertyValue("--background")).toBe("#eceff4"));
    expect(screen.queryByRole("button", { name: "Theme selector" })).toBeNull();
    expect(screen.queryByRole("button", { name: /^(Dark|Light) mode$/ })).toBeNull();
  },
);
