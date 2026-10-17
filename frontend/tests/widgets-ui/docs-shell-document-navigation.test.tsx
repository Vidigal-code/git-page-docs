// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DocsShell } from "@/widgets/docs-shell";
import { withConfigDefaults } from "@/entities/docs/lib/with-config-defaults";
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

it("navigates Markdown documents through labelled arrow icons and disables unavailable directions", async () => {
  const pages = makePages();
  if (!pages[0].md || !pages[1].md) throw new Error("Markdown fixtures are required");
  pages[0].md.markdownByLanguage.en = "<h1>First document</h1>";
  pages[1].md.markdownByLanguage.en = "<h1>Second document</h1>";
  const site = {
    ...makeSite(), icons: {
      DocumentPrevious: { reactIcon: true, tag: "FiChevronLeft" },
      DocumentNext: { reactIcon: true, tag: "FiChevronRight" },
    },
  };
  const config = withConfigDefaults({ ...makeConfig({ "menus-header-html": [] }), site });
  render(<DocsShell data={makeDocsData({ pages, config })} />);
  const previous = await screen.findByRole("button", { name: "Previous" });
  const next = screen.getByRole("button", { name: "Next" });
  expect(previous.textContent).toBe("");
  expect(next.textContent).toBe("");
  expect(previous.querySelector("svg")).not.toBeNull();
  expect(next.querySelector("svg")).not.toBeNull();
  expect(previous.getAttribute("title")).toBe("Previous");
  expect(next.getAttribute("title")).toBe("Next");
  expect(previous.matches(":disabled")).toBe(true);
  fireEvent.click(next);
  await waitFor(() => expect(screen.getByRole("heading", { name: "Second document" })).toBeTruthy());
  expect(next.matches(":disabled")).toBe(true);
  fireEvent.click(previous);
  await waitFor(() => expect(screen.getByRole("heading", { name: "First document" })).toBeTruthy());
});

it.each([
  { previousEnabled: false, nextEnabled: true, previousText: "Previous", nextText: "" },
  { previousEnabled: true, nextEnabled: false, previousText: "", nextText: "Next" },
])("configures both directions independently when quick navigation is disabled ($previousEnabled/$nextEnabled)", async ({ previousEnabled, nextEnabled, previousText, nextText }) => {
  const site = {
    ...makeSite(), ActiveNavigation: false, icons: {
      DocumentPrevious: { reactIcon: previousEnabled },
      DocumentNext: { reactIcon: nextEnabled },
    },
  };
  const config = withConfigDefaults({ ...makeConfig(), site });
  render(<DocsShell data={makeDocsData({ config })} />);
  const previous = await screen.findByRole("button", { name: "Previous" });
  const next = screen.getByRole("button", { name: "Next" });
  expect(previous.textContent).toBe(previousText);
  expect(next.textContent).toBe(nextText);
  expect(previous.getAttribute("title")).toBe("Previous");
  expect(next.getAttribute("title")).toBe("Next");
  expect(screen.queryByRole("button", { name: "Ctrl+K" })).toBeNull();
});
