import { describe, expect, it } from "vitest";
import { hasMarkdownDocument, resolvePageMarkdownHtml } from "@/entities/docs/lib/markdown/resolve-page-markdown";
import type { DocsContent, LoadedPage } from "@/entities/docs/model/types";

const page: LoadedPage = {
  id: 1,
  md: { routeId: 1, config: { id: 1, path: { en: "a.md" } }, markdownByLanguage: { en: "<p>en</p>", pt: "<p>pt</p>" } },
};
const legacy: DocsContent[] = [{ routeId: 9, markdownByLanguage: { en: "<p>legacy</p>" } }];

describe("resolvePageMarkdownHtml", () => {
  it("returns the page markdown for the language", () => {
    expect(resolvePageMarkdownHtml(page, legacy, 0, "pt")).toBe("<p>pt</p>");
  });

  it("falls back to the legacy docs array by page index", () => {
    expect(resolvePageMarkdownHtml(page, legacy, 0, "es")).toBe("");
    expect(resolvePageMarkdownHtml(undefined, legacy, 0, "en")).toBe("<p>legacy</p>");
    expect(resolvePageMarkdownHtml({ id: 2 }, legacy, 0, "en")).toBe("<p>legacy</p>");
  });

  it("returns an empty string when neither source has the language", () => {
    expect(resolvePageMarkdownHtml(page, legacy, 0, "fr")).toBe("");
    expect(resolvePageMarkdownHtml(undefined, legacy, 5, "en")).toBe("");
    expect(resolvePageMarkdownHtml(undefined, undefined, 0, "en")).toBe("");
  });
});

describe("hasMarkdownDocument", () => {
  it("treats blank html as no document", () => {
    expect(hasMarkdownDocument("")).toBe(false);
    expect(hasMarkdownDocument("  \n\t")).toBe(false);
    expect(hasMarkdownDocument("<p>x</p>")).toBe(true);
  });
});
