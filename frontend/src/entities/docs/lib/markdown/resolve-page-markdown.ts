import type { DocsContent, LanguageCode, LoadedPage } from "../../model/types";

interface MarkdownResolutionOptions {
  legacyDocs: readonly DocsContent[] | undefined;
  pageIndex: number;
  language: LanguageCode;
}

/**
 * Markdown HTML for a page in the requested language, falling back to the
 * legacy flat `docs` array for configs generated before the page structure.
 *
 * Returns an empty string when the page carries no markdown for the language —
 * a source-viewer, video or audio-only route, or a document that is not
 * translated yet. Absence is reported as emptiness rather than placeholder
 * copy so callers can hide markdown-only affordances instead of rendering a
 * "not found" body.
 */
export function resolvePageMarkdownHtml(
  page: LoadedPage | undefined,
  { legacyDocs, pageIndex, language }: MarkdownResolutionOptions,
): string {
  if (!page) return legacyDocs?.[pageIndex]?.markdownByLanguage[language] ?? "";
  if (!page.md?.config.path?.[language]?.trim()) return "";
  const sources = page.md.sourceByLanguage;
  if (sources !== undefined) {
    const source = sources[language];
    if (!Object.hasOwn(sources, language) || typeof source !== "string" || !hasMarkdownDocument(source)) return "";
  }
  return page.md.markdownByLanguage[language] ?? "";
}

/** Whether a page has a readable markdown document in the requested language. */
export function hasMarkdownDocument(markdownHtml: string): boolean {
  return markdownHtml.trim().length > 0;
}
