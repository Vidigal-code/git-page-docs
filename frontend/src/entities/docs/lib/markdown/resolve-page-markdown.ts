import type { ContentTypeRouteConfig, DocsContent, LanguageCode, LoadedMdContent, LoadedPage, RouteAuthorizationConfig } from "../../model/types";
import { scopeMarkdownHtml } from "./scope-markdown-html";

interface MarkdownResolutionOptions {
  legacyDocs: readonly DocsContent[] | undefined;
  pageIndex: number;
  language: LanguageCode;
  canAccessRoute?: (authorization: RouteAuthorizationConfig | undefined) => boolean;
}

function canReadRoute(authorization: RouteAuthorizationConfig | undefined, options: MarkdownResolutionOptions): boolean {
  return options.canAccessRoute?.(authorization) ?? (!authorization || authorization.enabled === false);
}

interface MarkdownPart {
  content: LoadedMdContent;
  instanceId?: string;
}

function readableMarkdownParts(page: LoadedPage, options: MarkdownResolutionOptions): MarkdownPart[] {
  if (!page.blocks) return page.md ? [{ content: page.md }] : [];
  if (!canReadRoute(page.authorization, options)) return [];
  return page.blocks.flatMap((block): MarkdownPart[] => {
    const config: ContentTypeRouteConfig = block.content.config;
    if (block.type !== "md" || !canReadRoute(config.authorization, options)) return [];
    return [{ content: block.content, instanceId: `focus-${page.id}-${block.id}` }];
  });
}

function translatedMarkdown(content: LoadedMdContent, language: LanguageCode): string {
  if (!content.config.path?.[language]?.trim()) return "";
  const sources = content.sourceByLanguage;
  if (sources !== undefined) {
    const source = sources[language];
    if (!Object.hasOwn(sources, language) || typeof source !== "string" || !hasMarkdownDocument(source)) return "";
  }
  return content.markdownByLanguage[language] ?? "";
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
  options: MarkdownResolutionOptions,
): string {
  const { legacyDocs, pageIndex, language } = options;
  if (!page) return legacyDocs?.[pageIndex]?.markdownByLanguage[language] ?? "";
  return readableMarkdownParts(page, options).map(({ content, instanceId }) => {
    const html = translatedMarkdown(content, language);
    return instanceId ? scopeMarkdownHtml(html, instanceId) : html;
  }).filter(hasMarkdownDocument).join("\n");
}

/** Original sources for the authorized Markdown blocks, in the same reading order as the rendered page. */
export function resolvePageMarkdownSource(page: LoadedPage | undefined, options: MarkdownResolutionOptions): string | undefined {
  if (!page) return undefined;
  return readableMarkdownParts(page, options)
    .filter(({ content }) => hasMarkdownDocument(translatedMarkdown(content, options.language)))
    .map(({ content }) => content.sourceByLanguage?.[options.language])
    .filter((source): source is string => Boolean(source))
    .join("\n\n") || undefined;
}

/** Whether a page has a readable markdown document in the requested language. */
export function hasMarkdownDocument(markdownHtml: string): boolean {
  return markdownHtml.trim().length > 0;
}
