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
