import { afterEach, expect, it, vi } from "vitest";
import { loadDocsData } from "@/entities/docs/api/load-docs-data";
import { loadRemoteDocsData } from "@/entities/docs/api/load-remote-docs-data-client";
import { createTempWorkspace, minimalConfig, requestedUrls, stubRepoFetch } from "./test-helpers";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const PDF_PATH = "gitpagedocs/docs/versions/v2/pt/guide.pdf";
const VERSION_PATH = "gitpagedocs/docs/versions/v2/config.json";
const PDF_ROUTE = { id: 12, pdf: { pathPdf: { pt: PDF_PATH, es: "https://example.org/manual.pdf" } } };
const PDF_MENU = { id: 12, pt: { title: "Manual", "path-click": "page:12" } };
const VERSION = { "routes-pdf": [PDF_ROUTE], "menus-header-pdf": [PDF_MENU], hierarchyPage: { pdf: 0 } };

function config() {
  return minimalConfig({
    "routes-pdf": [{ id: 1, pdf: { pathPdf: { en: "old.pdf" } } }],
    VersionControl: { versions: [{ id: "v2", path: VERSION_PATH }] },
  }, { docsVersion: "v2", languages: { en: true, pt: true, es: false } });
}

it("loads a PDF-only remote version without requesting PDF bodies", async () => {
  const fetch = stubRepoFetch({
    "author/manual/gitpagedocs/config.json": config(),
    [`author/manual/${VERSION_PATH}`]: VERSION,
  });
  const data = await loadRemoteDocsData("author", "manual", "v2", "pt");
  expect(data?.pages.map((page) => page.id)).toEqual([12]);
  expect(data?.availableLanguages).toEqual(["pt"]);
  const resolvedPath = `https://raw.githubusercontent.com/author/manual/HEAD/${PDF_PATH}`;
  expect(data?.pages[0].pdf?.pathPdfByLanguage).toEqual({ pt: resolvedPath });
  expect(data?.config["menus-header-pdf"]).toEqual([PDF_MENU]);
  expect(data?.pathToPageMap?.[PDF_PATH]).toEqual({ pageIndex: 0, contentType: "pdf" });
  expect(data?.pathToPageMap?.[resolvedPath]).toEqual({ pageIndex: 0, contentType: "pdf" });
  expect(data?.pathToPageMap?.["page:12"]).toEqual({ pageIndex: 0, contentType: "pdf" });
  expect(data?.docs).toEqual([]);
  expect(requestedUrls(fetch).some((url) => url.endsWith(".pdf"))).toBe(false);
});

it.each([{}, { pathPdf: null }])("ignores an incomplete remote PDF configuration %j", async (pdf) => {
  stubRepoFetch({ "author/manual/gitpagedocs/config.json": minimalConfig({ "routes-pdf": [{ id: 23, pdf }] }) });
  const data = await loadRemoteDocsData("author", "manual");
  expect(data?.pages).toEqual([]);
  expect(data?.pathToPageMap).toEqual({});
});

it.each(["local", "remote"])("keeps valid Markdown and PDF when %s PDF routes contain malformed JSON", async (source) => {
  const malformedRoutes = [
    { id: 23, pdf: {} }, { id: 24, pdf: { pathPdf: null } },
    { id: 25, pdf: { pathPdf: [] } }, { id: 26, pdf: { pathPdf: "guide.pdf" } },
    { id: 27, pdf: { pathPdf: { en: 42 } } }, { id: 28, pdf: { pathPdf: {} } },
    { id: 29, pdf: { pathPdf: { en: { path: "guide.pdf" } } } },
    { pdf: { pathPdf: { en: "guide.pdf" } } }, { id: "30", pdf: { pathPdf: { en: "guide.pdf" } } },
  ];
  const documentPath = "gitpagedocs/docs/en/intro.md";
  const rootConfig = minimalConfig({
    "routes-md": [{ id: 1, path: { en: documentPath } }],
    "routes-pdf": [...malformedRoutes, { id: 12, pdf: { pathPdf: { en: PDF_PATH } } }],
  });
  vi.stubEnv("GITHUB_ACTIONS", "");
  vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "");
  vi.stubEnv("GITHUB_REPOSITORY", "");
  const workspace = createTempWorkspace();
  stubRepoFetch({ "author/manual/gitpagedocs/config.json": rootConfig, [`author/manual/${documentPath}`]: "# Introduction" });
  try {
    workspace.write("gitpagedocs/config.json", rootConfig);
    workspace.write(documentPath, "# Introduction");
    const data = source === "local" ? await loadDocsData(undefined) : await loadRemoteDocsData("author", "manual");
    expect(data?.pages.map((page) => page.id)).toEqual([1, 12]);
    expect(data?.pages[0].md?.markdownByLanguage.en).toContain("Introduction");
    expect(data?.pages[1].pdf?.pathPdfByLanguage.en).toContain(PDF_PATH);
    expect(data?.config["routes-pdf"]).toHaveLength(1);
  } finally {
    workspace.cleanup();
  }
});

it("loads a PDF-only local version with its menus, hierarchy and enabled languages", async () => {
  vi.stubEnv("GITHUB_ACTIONS", "");
  vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "");
  vi.stubEnv("GITHUB_REPOSITORY", "");
  const workspace = createTempWorkspace();
  const fetch = stubRepoFetch({});
  try {
    workspace.write("gitpagedocs/config.json", config());
    workspace.write(VERSION_PATH, VERSION);
    const data = await loadDocsData(undefined);
    expect(data.pages.map((page) => page.id)).toEqual([12]);
    expect(data.availableLanguages).toEqual(["pt"]);
    expect(data.pages[0].pdf?.pathPdfByLanguage.pt).toBe(`/${PDF_PATH}`);
    expect(data.config["menus-header-pdf"]).toEqual([PDF_MENU]);
    expect(data.config.hierarchyPage).toEqual({ pdf: 0 });
    expect(data.docs).toEqual([]);
    expect(requestedUrls(fetch).some((url) => url.endsWith(".pdf"))).toBe(false);
  } finally {
    workspace.cleanup();
  }
});
