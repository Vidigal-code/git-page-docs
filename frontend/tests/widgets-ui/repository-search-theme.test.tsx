// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RepositorySearchScreen } from "@/page-slices/docs-route/ui/repository-search-screen";
import { makeDocsData, setWindowUrl } from "../widgets-model/fixtures";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/",
  useRouter: () => navigation.router,
}));

beforeEach(() => {
  localStorage.clear();
  navigation.router.push.mockClear();
  navigation.params = new URLSearchParams("theme=mono-dark&modetheme=dark&id=old-page");
  setWindowUrl(`/?${navigation.params}`);
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("carries the selected theme when searching for another repository", () => {
  render(<RepositorySearchScreen data={makeDocsData()} repositoryNotUsingGitPageDocs={false} />);
  expect(screen.getByRole("button", { name: "Theme selector" }).textContent).toBe("mono-dark");
  fireEvent.change(screen.getByRole("textbox", { name: "Owner" }), { target: { value: "Vidigal-code" } });
  fireEvent.change(screen.getByRole("textbox", { name: "Repository" }), { target: { value: "git-page-docs" } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  expect(navigation.router.push).toHaveBeenCalledWith("/Vidigal-code/git-page-docs/?theme=mono-dark&modetheme=dark");
});

it("carries the theme selected after the search screen opened", () => {
  const data = makeDocsData({ activeRepository: { source: "remote", owner: "owner", repo: "docs" } });
  render(<RepositorySearchScreen data={data} repositoryNotUsingGitPageDocs={false} />);
  fireEvent.click(screen.getByRole("button", { name: "Theme selector" }));
  fireEvent.click(screen.getByRole("button", { name: "aurora-light" }));
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  expect(navigation.router.push).toHaveBeenCalledWith("/owner/docs/?theme=aurora-light&modetheme=light");
});

it("keeps the configured family for repository navigation while allowing a mode choice", () => {
  const data = makeDocsData({ activeRepository: { source: "remote", owner: "owner", repo: "docs" } });
  data.config.site.HideThemeSelector = true;
  data.config.site.ThemeDefault = "aurora-dark";
  data.config.site.ThemeModeDefault = "light";
  render(<RepositorySearchScreen data={data} repositoryNotUsingGitPageDocs={false} />);

  expect(screen.queryByRole("button", { name: "Theme selector" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Light mode" }));
  fireEvent.click(screen.getByRole("button", { name: "Search" }));

  expect(navigation.router.push).toHaveBeenCalledWith("/owner/docs/?theme=aurora-light&modetheme=light");
  expect(screen.queryByRole("button", { name: "Theme selector" })).toBeNull();
  expect(screen.getByRole("button", { name: "Dark mode" })).toBeTruthy();
});

it("opens the repository without theme parameters when the catalogue is empty", () => {
  const data = makeDocsData({
    activeRepository: { source: "remote", owner: "owner", repo: "docs" },
    layoutsConfig: { layouts: [] },
  });
  render(<RepositorySearchScreen data={data} repositoryNotUsingGitPageDocs={false} />);
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  expect(navigation.router.push).toHaveBeenCalledWith("/owner/docs/");
});
