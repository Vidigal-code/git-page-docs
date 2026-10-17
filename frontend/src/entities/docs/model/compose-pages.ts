import type { LoadedContentBlock, LoadedPage, PageContentBlockConfig, PathToPageEntry } from "./types";
import { getPageCompositions } from "../lib/validate-page-compositions";

interface PageCompositionInput {
  pages: LoadedPage[];
  pathToPageMap: Record<string, PathToPageEntry>;
  definitions: unknown;
}

interface ComposedPages {
  pages: LoadedPage[];
  pathToPageMap: Record<string, PathToPageEntry>;
}

function resolveBlock(block: PageContentBlockConfig, page: LoadedPage | undefined): LoadedContentBlock | undefined {
  if (!page) return undefined;
  const { id, type } = block;
  switch (type) {
    case "md": return page.md ? { id, type, content: page.md } : undefined;
    case "html": return page.html ? { id, type, content: page.html } : undefined;
    case "video": return page.video ? { id, type, content: page.video } : undefined;
    case "audio": return page.audio ? { id, type, content: page.audio } : undefined;
    case "pdf": return page.pdf ? { id, type, content: page.pdf } : undefined;
  }
}

export function composePages(input: PageCompositionInput): ComposedPages {
  const definitions = getPageCompositions(input.definitions);
  if (definitions.length === 0) return { pages: input.pages, pathToPageMap: input.pathToPageMap };
  const routePages = new Map(input.pages.map((page) => [page.id, page]));
  const compositions = definitions.filter((definition) => !routePages.has(definition.id)).map((definition): LoadedPage => ({
    id: definition.id,
    authorization: definition.authorization,
    blocks: definition.blocks.flatMap((block) => {
      const resolved = resolveBlock(block, routePages.get(block.routeId));
      return resolved ? [resolved] : [];
    }),
  }));
  const pages = [...input.pages, ...compositions].sort((left, right) => left.id - right.id);
  const indexes = new Map(pages.map((page, index) => [page.id, index]));
  const pathToPageMap: Record<string, PathToPageEntry> = {};
  for (const [path, entry] of Object.entries(input.pathToPageMap)) {
    const originalPage = input.pages[entry.pageIndex];
    const pageIndex = originalPage ? indexes.get(originalPage.id) : undefined;
    if (pageIndex !== undefined) pathToPageMap[path] = { ...entry, pageIndex };
  }
  for (const page of compositions) {
    const pageIndex = indexes.get(page.id);
    if (pageIndex !== undefined) pathToPageMap[`page:${page.id}`] = { pageIndex, contentType: page.blocks?.[0]?.type ?? "md" };
  }
  return { pages, pathToPageMap };
}
