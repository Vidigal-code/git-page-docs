// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DocsShell } from "@/widgets/docs-shell";
import { makeConfig, makeDocsData, makePages, makeSite } from "../widgets-model/fixtures";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/",
  useRouter: () => navigation.router,
}));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

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
