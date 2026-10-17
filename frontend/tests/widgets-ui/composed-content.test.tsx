// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { PageContentArea } from "@/widgets/docs-shell/ui/page-content-area";
import { useDocsShellNavigationState } from "@/widgets/docs-shell/model/use-docs-shell-navigation-state";
import { useDocsShellLabels } from "@/widgets/docs-shell/model/use-docs-shell-labels";
import { resolveRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { makeDocsData } from "../widgets-model/fixtures";
import type { LoadedDocsData, LoadedMdContent, ContentTypeRouteConfig } from "@/entities/docs";

afterEach(cleanup);

function Harness({ data, canAccessContent }: Readonly<{ data: LoadedDocsData; canAccessContent?: (config: ContentTypeRouteConfig) => boolean }>) {
  const nav = useDocsShellNavigationState({ data, language: "en", setSidebarOpen: () => undefined, setMenuOpen: () => undefined });
  const labels = useDocsShellLabels(data, "en");
  return <PageContentArea currentPage={data.pages?.[0]} data={data} language="en" labels={labels} browse={nav.browse} navigation={{
    canAccessContent,
    routeGuideEnabled: false, breadcrumbTrail: [], onMenuClick: nav.onMenuClick, homePathClick: undefined, homeAncestorKeys: [],
    routeGuideIconConfig: resolveRouteGuideIconConfig({}, false, ""),
    audioRouteControlsConfig: { playLabel: "Play", pauseLabel: "Pause", restartLabel: "Restart", loopOnLabel: "Loop", loopOffLabel: "Stop loop" },
  }} />;
}

function markdown(routeId: number, title: string): LoadedMdContent {
  return { routeId, config: { id: routeId, path: { en: `${title}.md` }, browseAll: true }, markdownByLanguage: { en: `<h1>${title}</h1>` }, sourceByLanguage: { en: `# ${title}` } };
}

it("renders ordered and repeated content blocks without legacy browse-all replacing their references", () => {
  const first = markdown(1, "First");
  const second = markdown(2, "Second");
  render(<Harness data={makeDocsData({ pages: [{ id: 39, blocks: [
    { id: "first", type: "md", content: first },
    { id: "html", type: "html", content: { routeId: 3, config: { id: 3, titleIsVisible: true, title: { en: "Embedded HTML" } }, htmlByLanguage: { en: "<p>Game</p>" } } },
    { id: "second", type: "md", content: second },
    { id: "repeat", type: "md", content: first },
  ] }] })} />);
  expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual(["First", "Embedded HTML", "Second", "First"]);
  expect(screen.getAllByRole("button", { name: "Copy markdown" })).toHaveLength(3);
  expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
});

it("gives repeated Markdown sections distinct anchors while copying the original document", async () => {
  const copy = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: copy } });
  const content = { ...markdown(1, "Repeated"), markdownByLanguage: { en: '<h1 id="café">Café</h1><a href="#caf%C3%A9">Read section</a>' }, sourceByLanguage: { en: '# Café\n[Read section](#caf%C3%A9)' } };
  render(<Harness data={makeDocsData({ pages: [{ id: 39, blocks: [
    { id: "first", type: "md", content }, { id: "second", type: "md", content },
  ] }] })} />);
  const headings = screen.getAllByRole("heading", { name: "Café" });
  expect(new Set(headings.map((heading) => heading.id)).size).toBe(2);
  const links = screen.getAllByRole("link", { name: "Read section" });
  expect(decodeURIComponent(links[0].getAttribute("href")!.slice(1))).toBe(headings[0].id);
  expect(decodeURIComponent(links[1].getAttribute("href")!.slice(1))).toBe(headings[1].id);
  fireEvent.click(screen.getAllByRole("button", { name: "Copy markdown" })[1]);
  expect(copy).toHaveBeenCalledWith('# Café\n[Read section](#caf%C3%A9)');
});

it("does not mount protected blocks or a protected composition before access is granted", () => {
  const privateMd = { ...markdown(2, "Secret"), config: { id: 2, path: { en: "secret.md" }, authorization: { requiredRoles: ["editor"] } } };
  const fetchPdf = vi.fn(() => new Promise<Response>(() => undefined));
  vi.stubGlobal("fetch", fetchPdf);
  const data = makeDocsData({ pages: [{ id: 39, blocks: [
    { id: "public", type: "md", content: markdown(1, "Public") },
    { id: "private", type: "md", content: privateMd },
    { id: "pdf", type: "pdf", content: { routeId: 3, config: { id: 3, authorization: { requiredRoles: ["editor"] } }, pathPdfByLanguage: { en: "https://example.com/private.pdf" } } },
  ] }] });
  const { rerender } = render(<Harness data={data} />);
  expect(screen.getByRole("heading", { name: "Public" })).not.toBeNull();
  expect(screen.queryByRole("heading", { name: "Secret" })).toBeNull();
  expect(fetchPdf).not.toHaveBeenCalled();
  rerender(<Harness data={data} canAccessContent={(config) => config.id !== 3} />);
  expect(screen.getByRole("heading", { name: "Secret" })).not.toBeNull();
  const protectedPage = { ...data.pages![0], authorization: { requiredRoles: ["editor"] } };
  rerender(<Harness data={{ ...data, pages: [protectedPage] }} />);
  expect(screen.queryByRole("heading")).toBeNull();
  rerender(<Harness data={data} canAccessContent={() => true} />);
  expect(fetchPdf).toHaveBeenCalledWith("https://example.com/private.pdf", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  vi.unstubAllGlobals();
});
