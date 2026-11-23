// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { PageContentArea } from "@/widgets/docs-shell/ui/page-content-area";
import { useDocsShellNavigationState } from "@/widgets/docs-shell/model/use-docs-shell-navigation-state";
import { useDocsShellLabels } from "@/widgets/docs-shell/model/use-docs-shell-labels";
import { resolveRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { makeDocsData } from "../widgets-model/fixtures";
import type { LoadedDocsData, LoadedMdContent } from "@/entities/docs";

afterEach(cleanup);

function Harness({ data }: Readonly<{ data: LoadedDocsData }>) {
  const nav = useDocsShellNavigationState({ data, language: "en", setSidebarOpen: () => undefined, setMenuOpen: () => undefined });
  const labels = useDocsShellLabels(data, "en");
  return <PageContentArea currentPage={data.pages?.[0]} data={data} language="en" labels={labels} browse={nav.browse}
    documentActions={<button>Next document</button>} navigation={{
      routeGuideEnabled: false, breadcrumbTrail: [], onMenuClick: nav.onMenuClick, homePathClick: undefined, homeAncestorKeys: [],
      routeGuideIconConfig: resolveRouteGuideIconConfig({}, false, ""),
      audioRouteControlsConfig: { playLabel: "Play", pauseLabel: "Pause", restartLabel: "Restart", loopOnLabel: "Loop", loopOffLabel: "Stop loop" },
    }} />;
}

function markdown(routeId: number, title: string): LoadedMdContent {
  return { routeId, config: { id: routeId, path: { en: `${title}.md` } }, markdownByLanguage: { en: `<p>${title}</p>` } };
}

it("places document actions after Markdown content inside its article", () => {
  render(<Harness data={makeDocsData({ pages: [{ id: 1, md: markdown(1, "Last paragraph") }] })} />);
  const article = screen.getByRole("article");
  const content = within(article).getByText("Last paragraph");
  const next = within(article).getByRole("button", { name: "Next document" });
  expect(content.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("renders document actions once in the last accessible Markdown block", () => {
  const hidden = markdown(3, "Protected");
  hidden.config = { ...hidden.config, authorization: { requiredRoles: ["editor"] } };
  render(<Harness data={makeDocsData({ pages: [{ id: 39, blocks: [
    { id: "first", type: "md", content: markdown(1, "First") },
    { id: "last", type: "md", content: markdown(2, "Last") },
    { id: "hidden", type: "md", content: hidden },
  ] }] })} />);
  expect(screen.getAllByRole("button", { name: "Next document" })).toHaveLength(1);
  const articles = screen.getAllByRole("article");
  expect(within(articles[0]).queryByRole("button", { name: "Next document" })).toBeNull();
  expect(within(articles[1]).getByRole("button", { name: "Next document" })).toBeTruthy();
});

it("keeps document actions available when the page has no Markdown", () => {
  render(<Harness data={makeDocsData({ pages: [{ id: 1, html: { routeId: 1, config: { id: 1 }, htmlByLanguage: { en: "<p>HTML page</p>" } } }] })} />);
  expect(screen.getByRole("button", { name: "Next document" })).toBeTruthy();
});

it("keeps document actions available when every content block is protected", () => {
  const hidden = markdown(1, "Protected");
  hidden.config = { ...hidden.config, authorization: { requiredRoles: ["editor"] } };
  render(<Harness data={makeDocsData({ pages: [{ id: 39, blocks: [{ id: "hidden", type: "md", content: hidden }] }] })} />);
  expect(screen.queryByText("Protected")).toBeNull();
  expect(screen.getByRole("button", { name: "Next document" })).toBeTruthy();
});
