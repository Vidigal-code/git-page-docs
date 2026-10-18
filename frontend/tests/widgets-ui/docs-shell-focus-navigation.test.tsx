// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DocsShell } from "@/widgets/docs-shell";
import { makeConfig, makeDocsData, makePages, makeSite } from "../widgets-model/fixtures";
import type { LoadedMdContent, LoadedPage } from "@/entities/docs";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/",
  useRouter: () => navigation.router,
}));

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("counts the active translated pagination file in focus document navigation", async () => {
  const owner: LoadedMdContent = {
    routeId: 1,
    config: { id: 1, path: { pt: "owner.pt.md" }, pagination: { items: [{ routeId: 2 }] } },
    markdownByLanguage: { pt: "<h1>Original</h1>" },
  };
  const translated: LoadedMdContent = {
    routeId: 2,
    config: { id: 2, path: { en: "translated.md" } },
    markdownByLanguage: { en: "<h1>Translated lesson</h1>" },
  };
  const next: LoadedMdContent = {
    routeId: 3,
    config: { id: 3, path: { en: "next.md" } },
    markdownByLanguage: { en: "<h1>Next document content</h1>" },
  };
  const data = makeDocsData({
    pages: [{ id: 1, md: owner }, { id: 2, md: translated }, { id: 3, md: next }],
    pathToPageMap: { "page:1": { pageIndex: 0, contentType: "md" }, "page:3": { pageIndex: 2, contentType: "md" } },
    config: makeConfig({
      site: makeSite({ FocusMode: true, AiChatEnabled: false }),
      "routes-md": [owner.config, translated.config, next.config],
      "menus-header-html": [],
      "menus-header-md": [
        { id: 1, en: { title: "Localized container", "path-click": "page:1" } },
        { id: 3, en: { title: "Next document", "path-click": "page:3" } },
      ],
    }),
  });
  render(<DocsShell data={data} />);
  fireEvent.click(await screen.findByRole("button", { name: "Focus mode" }));
  const dialog = screen.getByRole("dialog", { name: "Focus mode" });
  const documents = within(dialog).getByRole("navigation", { name: "Documents" });
  expect(within(dialog).getByRole("heading", { name: "Translated lesson" })).toBeTruthy();
  expect(documents.textContent).toContain("1 / 2");
  fireEvent.click(within(documents).getByRole("button", { name: "Next document" }));
  await waitFor(() => expect(within(dialog).getByRole("heading", { name: "Next document content" })).toBeTruthy());
  expect(screen.getByRole("dialog", { name: "Focus mode" })).toBe(dialog);
});

it("copies the authorized Markdown composition in focus and downloads it with the page filename", async () => {
  const copy = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: copy } });
  const first: LoadedMdContent = { routeId: 1, config: { id: 1, path: { en: "first.md" } }, markdownByLanguage: { en: '<h1 id="first">First block</h1>' }, sourceByLanguage: { en: "# First block" } };
  const second: LoadedMdContent = { routeId: 2, config: { id: 2, path: { en: "second.md" } }, markdownByLanguage: { en: '<h1 id="second">Second block</h1>' }, sourceByLanguage: { en: "# Second block" } };
  const secret: LoadedMdContent = { routeId: 3, config: { id: 3, path: { en: "secret.md" }, authorization: { requiredRoles: ["editor"] } }, markdownByLanguage: { en: "<h1>Secret</h1>" }, sourceByLanguage: { en: "# Secret" } };
  const page: LoadedPage = { id: 39, blocks: [{ id: "one", type: "md", content: first }, { id: "two", type: "md", content: second }, { id: "private", type: "md", content: secret }] };
  const data = makeDocsData({ pages: [page], pathToPageMap: { "page:39": { pageIndex: 0, contentType: "md" } }, config: makeConfig({
    site: makeSite({ FocusMode: true, AiChatEnabled: false, focusMode: { sectionNavigationEnabled: false } }),
    pages: [{ id: 39, blocks: [] }], "menus-header-md": [{ id: 39, en: { title: "Composition", "path-click": "page:39" } }], "menus-header-html": [],
  }) });
  let filename = "";
  vi.stubGlobal("URL", class extends URL { static createObjectURL = () => "blob:combined"; static revokeObjectURL = vi.fn(); });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) { filename = this.download; });
  render(<DocsShell data={data} />);
  fireEvent.click(await screen.findByRole("button", { name: "Focus mode" }));
  const dialog = screen.getByRole("dialog", { name: "Focus mode" });
  expect(within(dialog).getAllByRole("heading").map((heading) => heading.textContent)).toEqual(["First block", "Second block"]);
  expect(screen.queryByRole("heading", { name: "Secret" })).toBeNull();
  fireEvent.click(within(dialog).getByRole("button", { name: "Copy markdown" }));
  expect(copy).toHaveBeenCalledWith("# First block\n\n# Second block");
  fireEvent.click(within(dialog).getByRole("button", { name: "Download .md" }));
  expect(filename).toBe("page-39.md");
  click.mockRestore();
});

it("keeps the focus dialog open when following nested menu documents and resets the section", async () => {
  const pages = makePages();
  if (!pages[0].md || !pages[1].md) throw new Error("Markdown fixtures are required");
  pages[0].md.markdownByLanguage.en = "<h1>Introduction</h1><p>First section.</p><h2>Details</h2><p>Second section.</p>";
  pages[1].md.markdownByLanguage.en = "<h1>Installation</h1><p>Install first.</p><h2>Configuration</h2><p>Configure second.</p>";
  const data = makeDocsData({ pages, config: makeConfig({ site: makeSite({ FocusMode: true }) }) });
  render(<DocsShell data={data} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Focus mode" })).toBeTruthy());
  fireEvent.click(screen.getByRole("button", { name: "Focus mode" }));
  const dialog = screen.getByRole("dialog", { name: "Focus mode" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Next section" }));
  expect(within(dialog).getByText("Second section.")).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "Next document" }));
  await waitFor(() => expect(within(dialog).getByText("Install first.")).toBeTruthy());
  expect(screen.getByRole("dialog", { name: "Focus mode" })).toBe(dialog);
  expect(within(dialog).queryByText("Configure second.")).toBeNull();
});

it("shows the entire document when section navigation is disabled", async () => {
  const pages = makePages();
  if (!pages[0].md) throw new Error("Markdown fixture is required");
  pages[0].md.markdownByLanguage.en = "<h1>Introduction</h1><p>First section.</p><h2>Details</h2><p>Second section.</p>";
  const data = makeDocsData({ pages, config: makeConfig({ site: makeSite({ FocusMode: true, focusMode: { sectionNavigationEnabled: false } }) }) });
  render(<DocsShell data={data} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Focus mode" })).toBeTruthy());
  fireEvent.click(screen.getByRole("button", { name: "Focus mode" }));
  const dialog = screen.getByRole("dialog", { name: "Focus mode" });
  expect(within(dialog).getByText("First section.")).toBeTruthy();
  expect(within(dialog).getByText("Second section.")).toBeTruthy();
  expect(within(dialog).queryByRole("navigation", { name: "Sections" })).toBeNull();
});

it("offers four document and four section actions without closing focus or retaining the old section", async () => {
  const pages = makePages();
  if (!pages[0].md || !pages[1].md) throw new Error("Markdown fixtures are required");
  pages[0].md.markdownByLanguage.en = "<h1>Introduction first</h1><h2>Introduction middle</h2><h2>Introduction last</h2>";
  pages[1].md.markdownByLanguage.en = "<h1>Installation first</h1><h2>Installation middle</h2><h2>Installation last</h2>";
  const thirdPath = "docs/third.md";
  pages[2] = { id: 3, md: { routeId: 3, config: { id: 3, path: { en: thirdPath } }, markdownByLanguage: { en: "<h1>Last document first</h1><h2>Last document middle</h2><h2>Last document last</h2>" } } };
  const config = makeConfig({ site: makeSite({ FocusMode: true }), "menus-header-html": [] });
  config["menus-header-md"]?.push({ id: 3, en: { title: "Last document", "path-click": thirdPath } });
  const data = makeDocsData({ pages, config });
  data.pathToPageMap = { ...data.pathToPageMap, [thirdPath]: { pageIndex: 2, contentType: "md" } };
  render(<DocsShell data={data} />);
  fireEvent.click(await screen.findByRole("button", { name: "Focus mode" }));
  const dialog = screen.getByRole("dialog", { name: "Focus mode" });
  const documents = within(dialog).getByRole("navigation", { name: "Documents" });
  const sections = within(dialog).getByRole("navigation", { name: "Sections" });
  expect(within(documents).getAllByRole("button")).toHaveLength(4);
  expect(within(sections).getAllByRole("button")).toHaveLength(4);
  expect(within(documents).getByRole("button", { name: "First document" }).matches(":disabled")).toBe(true);
  expect(within(sections).getByRole("button", { name: "First section" }).matches(":disabled")).toBe(true);
  fireEvent.click(within(sections).getByRole("button", { name: "Last section" }));
  expect(within(dialog).getByRole("heading", { name: "Introduction last" })).toBeTruthy();
  fireEvent.click(within(documents).getByRole("button", { name: "Last document" }));
  await waitFor(() => expect(within(dialog).getByRole("heading", { name: "Last document first" })).toBeTruthy());
  expect(within(documents).getByRole("button", { name: "Last document" }).matches(":disabled")).toBe(true);
  expect(screen.getByRole("dialog", { name: "Focus mode" })).toBe(dialog);
  fireEvent.click(within(sections).getByRole("button", { name: "Last section" }));
  expect(within(dialog).getByRole("heading", { name: "Last document last" })).toBeTruthy();
  expect(within(sections).getByRole("button", { name: "Last section" }).matches(":disabled")).toBe(true);
  fireEvent.click(within(sections).getByRole("button", { name: "First section" }));
  expect(within(dialog).getByRole("heading", { name: "Last document first" })).toBeTruthy();
  fireEvent.click(within(documents).getByRole("button", { name: "First document" }));
  await waitFor(() => expect(within(dialog).getByRole("heading", { name: "Introduction first" })).toBeTruthy());
  fireEvent.click(within(documents).getByRole("button", { name: "Next document" }));
  await waitFor(() => expect(within(dialog).getByRole("heading", { name: "Installation first" })).toBeTruthy());
  fireEvent.click(within(documents).getByRole("button", { name: "Previous document" }));
  await waitFor(() => expect(within(dialog).getByRole("heading", { name: "Introduction first" })).toBeTruthy());
  fireEvent.click(within(sections).getByRole("button", { name: "Next section" }));
  expect(within(dialog).getByRole("heading", { name: "Introduction middle" })).toBeTruthy();
  fireEvent.click(within(sections).getByRole("button", { name: "Previous section" }));
  expect(within(dialog).getByRole("heading", { name: "Introduction first" })).toBeTruthy();
});
