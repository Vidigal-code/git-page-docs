import type { AuthConfig, BrowseItem, ContentTypeRouteConfig, LoadedPdfContent } from "@/entities/docs";
import { evaluateRouteAccess } from "@/features/route-authorization";
import type { BrowseIndexSetter, BrowseState } from "./content-browse-props";

interface PdfBrowseAccess {
  authConfig: AuthConfig | undefined;
  canAccessPdf?: (config: ContentTypeRouteConfig) => boolean;
}

interface PdfBrowseSelection {
  items: BrowseItem<LoadedPdfContent>[];
  index: number;
  setIndex: BrowseIndexSetter;
}

const ANONYMOUS_SESSION = { unlockedKeyIds: [], roles: [], authenticatedProviders: [] };

export function canAccessPdfContent(content: LoadedPdfContent | undefined, access: PdfBrowseAccess): content is LoadedPdfContent {
  if (!content) return false;
  return access.canAccessPdf?.(content.config)
    ?? evaluateRouteAccess(content.config.authorization, access.authConfig, ANONYMOUS_SESSION).allowed;
}

/** Keeps visible browse positions mapped to their original page positions after access filtering. */
export function resolvePdfBrowseState(browse: BrowseState, access: PdfBrowseAccess): PdfBrowseSelection {
  const items = browse.pdfItems.filter((item) => canAccessPdfContent(item.content, access));
  const visibleIndex = (rawIndex: number): number => Math.max(items.indexOf(browse.pdfItems[rawIndex]), 0);
  const setIndex: BrowseIndexSetter = (value) => {
    browse.setPdfBrowseIndex((rawIndex) => {
      const nextIndex = typeof value === "function" ? value(visibleIndex(rawIndex)) : value;
      const item = items[Math.min(Math.max(nextIndex, 0), items.length - 1)];
      return item ? browse.pdfItems.indexOf(item) : 0;
    });
  };
  return { items, index: visibleIndex(browse.pdfBrowseIndex), setIndex };
}
