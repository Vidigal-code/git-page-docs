import { describe, expect, it } from "vitest";
import { hasMarkdownDocument, resolvePageMarkdownHtml } from "@/entities/docs/lib/markdown/resolve-page-markdown";
import type { DocsContent, LoadedPage } from "@/entities/docs/model/types";

const page: LoadedPage = {
  id: 1,
  md: { routeId: 1, config: { id: 1, path: { en: "a.md", pt: "pt/a.md" } }, markdownByLanguage: { en: "<p>en</p>", pt: "<p>pt</p>" } },
};
const legacy: DocsContent[] = [{ routeId: 9, markdownByLanguage: { en: "<p>legacy</p>" } }];

describe("resolvePageMarkdownHtml", () => {
  it("returns the page markdown for the language", () => {
    expect(resolvePageMarkdownHtml(page, { legacyDocs: legacy, pageIndex: 0, language: "pt" })).toBe("<p>pt</p>");
  });

  it("does not expose the loader placeholder when the translated file path is absent", () => {
    const untranslated: LoadedPage = {
      id: 1,
      md: { routeId: 1, config: { id: 1, path: { en: "a.md" } }, markdownByLanguage: { pt: "<p>Missing language file path in config.</p>" } },
    };
    expect(resolvePageMarkdownHtml(untranslated, { legacyDocs: legacy, pageIndex: 0, language: "pt" })).toBe("");
  });

  it("requires a successfully loaded source when the loader supplies source metadata", () => {
    const unavailable: LoadedPage = {
      id: 1,
      md: { routeId: 1, config: { id: 1, path: { en: "missing.md" } }, markdownByLanguage: { en: "<p>Unable to load remote markdown file.</p>" }, sourceByLanguage: {} },
    };
    expect(resolvePageMarkdownHtml(unavailable, { legacyDocs: legacy, pageIndex: 0, language: "en" })).toBe("");
  });

  it("falls back to legacy docs only when no structured page exists", () => {
    expect(resolvePageMarkdownHtml(page, { legacyDocs: legacy, pageIndex: 0, language: "es" })).toBe("");
    expect(resolvePageMarkdownHtml(undefined, { legacyDocs: legacy, pageIndex: 0, language: "en" })).toBe("<p>legacy</p>");
    expect(resolvePageMarkdownHtml({ id: 2 }, { legacyDocs: legacy, pageIndex: 0, language: "en" })).toBe("");
  });

  it("returns an empty string when neither source has the language", () => {
    expect(resolvePageMarkdownHtml(page, { legacyDocs: legacy, pageIndex: 0, language: "fr" })).toBe("");
    expect(resolvePageMarkdownHtml(undefined, { legacyDocs: legacy, pageIndex: 5, language: "en" })).toBe("");
    expect(resolvePageMarkdownHtml(undefined, { legacyDocs: undefined, pageIndex: 0, language: "en" })).toBe("");
  });
});

describe("hasMarkdownDocument", () => {
  it("treats blank html as no document", () => {
    expect(hasMarkdownDocument("")).toBe(false);
    expect(hasMarkdownDocument("  \n\t")).toBe(false);
    expect(hasMarkdownDocument("<p>x</p>")).toBe(true);
  });
});
