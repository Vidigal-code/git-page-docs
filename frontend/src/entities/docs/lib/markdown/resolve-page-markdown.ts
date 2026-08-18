import type { DocsContent, LanguageCode, LoadedPage } from "../../model/types";

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
  legacyDocs: readonly DocsContent[] | undefined,
  pageIndex: number,
  language: LanguageCode,
): string {
  return page?.md?.markdownByLanguage[language] ?? legacyDocs?.[pageIndex]?.markdownByLanguage[language] ?? "";
}

/** Whether a page has a readable markdown document in the requested language. */
export function hasMarkdownDocument(markdownHtml: string): boolean {
  return markdownHtml.trim().length > 0;
}
