import { afterEach, expect, it, vi } from "vitest";
import { loadPages } from "@/entities/docs/api/content/load-pages";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const PDF_PATH = "gitpagedocs/docs/versions/0.0.9/en/guide.pdf";

function loadPdf(path: string, source: "local" | "remote" = "local") {
  return loadPages({
    sortedIds: [9], routesMd: [], routesSourceViewer: [], routesHtml: [], routesVideo: [], routesAudio: [],
    routesPdf: [{ id: 9, pdf: { pathPdf: { en: path } } }],
    languages: ["en", "pt"], source, owner: "author", repo: "manual",
  });
}

it("loads PDF URLs without fetching document text or inventing translations", async () => {
  vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "/handbook");
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { pages, pathToPageMap } = await loadPdf(PDF_PATH);
  expect(pages[0].pdf?.pathPdfByLanguage).toEqual({ en: `/handbook/${PDF_PATH}`, pt: "" });
  expect(pages[0].md).toBeUndefined();
  expect(pathToPageMap["page:9"]).toEqual({ pageIndex: 0, contentType: "pdf" });
  expect(fetch).not.toHaveBeenCalled();
});

it("resolves repository PDFs against the remote repository and preserves external URLs", async () => {
  const remote = await loadPdf(PDF_PATH, "remote");
  expect(remote.pages[0].pdf?.pathPdfByLanguage.en).toBe(`https://raw.githubusercontent.com/author/manual/HEAD/${PDF_PATH}`);
  const externalUrl = "https://files.example.org/guide.pdf#page=3";
  const external = await loadPdf(externalUrl);
  expect(external.pages[0].pdf?.pathPdfByLanguage.en).toBe(externalUrl);
});

it.each(["javascript:alert(1)", "data:application/pdf;base64,AAA", "//other.example/guide.pdf", "../private.pdf", "%2e%2e/private.pdf", "folder\\private.pdf", "https://[invalid", "guide%ZZ.pdf", "guide\n.pdf"])("rejects unsafe PDF location %s", async (path) => {
  const result = await loadPdf(path);
  expect(result.pages[0].pdf?.pathPdfByLanguage.en).toBe("");
});
