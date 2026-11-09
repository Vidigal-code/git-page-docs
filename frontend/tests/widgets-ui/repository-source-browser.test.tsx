// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { RepositorySourceBrowser, buildSourceViewerLabels } from "@/widgets/repository-source-browser";

const INITIAL_ROUTE = { owner: "reader", repo: "handbook", branch: "main", path: "docs" };
const TREE_URL = "https://api.github.com/repos/reader/handbook/git/trees/main?recursive=1";
const FILE_URL = "https://raw.githubusercontent.com/reader/handbook/main/docs/guide.txt";
const TREE = [
  { path: "docs", type: "tree" },
  { path: "docs/examples", type: "tree" },
  { path: "docs/examples/hidden.txt", type: "blob", size: 30 },
  { path: "docs/guide.txt", type: "blob", size: 12 },
  { path: "README.md", type: "blob", size: 20 },
];

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("navigates a directory table and full file breadcrumb without refetching the tree", async () => {
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === TREE_URL) return Response.json({ tree: TREE });
    if (url === FILE_URL) return new Response("Hello reader");
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  const onRouteChange = vi.fn();
  render(<RepositorySourceBrowser initialRoute={INITIAL_ROUTE} labels={buildSourceViewerLabels({}, "en")} onRouteChange={onRouteChange} />);

  const files = await screen.findByRole("table", { name: "Files" });
  const rows = within(files).getAllByRole("row");
  expect(rows.map(row => row.textContent)).toEqual(["NameSize", "..", "examples", "guide.txt12 B"]);
  const breadcrumb = screen.getByRole("navigation", { name: "Repository path" });
  expect(within(breadcrumb).getByRole("button", { name: "handbook" })).toBeTruthy();
  fireEvent.click(within(files).getByRole("button", { name: "guide.txt" }));

  await screen.findByText("Hello reader");
  expect(screen.queryByRole("table", { name: "Files" })).toBeNull();
  expect(within(breadcrumb).getByText("guide.txt").getAttribute("aria-current")).toBe("page");
  expect(onRouteChange).toHaveBeenLastCalledWith({ ...INITIAL_ROUTE, path: "docs/guide.txt" });
  fireEvent.click(within(breadcrumb).getByRole("button", { name: "docs" }));

  expect(screen.getByRole("table", { name: "Files" })).toBeTruthy();
  expect(fetch.mock.calls.map(([url]) => String(url))).toEqual([TREE_URL, FILE_URL]);
});
it("keeps unrelated folders collapsed and displays and opens an empty file", async () => {
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === TREE_URL) return Response.json({ tree: [...TREE, { path: "empty.txt", type: "blob", size: 0 }] });
    if (url.endsWith("/README.md")) return new Response("# Repository readme");
    if (url.endsWith("/empty.txt")) return new Response("");
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  render(<RepositorySourceBrowser initialRoute={{ ...INITIAL_ROUTE, path: "" }} labels={buildSourceViewerLabels({}, "en")} />);

  const files = await screen.findByRole("table", { name: "Files" });
  expect(screen.getByRole("heading", { name: "Repository readme" })).toBeTruthy();
  const tree = screen.getByRole("complementary", { name: "Files" });
  expect(within(tree).getByRole("button", { name: "docs" }).getAttribute("aria-expanded")).toBe("false");
  expect(within(tree).queryByText("hidden.txt")).toBeNull();
  expect(within(files).getByRole("row", { name: "empty.txt 0 B" })).toBeTruthy();
  fireEvent.click(within(files).getByRole("button", { name: "empty.txt" }));
  await screen.findByText("empty.txt", { selector: "[aria-current=page]" });
  expect(screen.queryByRole("table", { name: "Files" })).toBeNull();
  expect(screen.queryByText("File could not be loaded.")).toBeNull();
});
