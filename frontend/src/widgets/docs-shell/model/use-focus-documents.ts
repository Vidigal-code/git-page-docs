import { useMemo } from "react";
import { hasMarkdownDocument, resolvePageMarkdownHtml, type LoadedDocsData, type MenuEntry, type RouteAuthorizationConfig } from "@/entities/docs";
import { getPageIndexByPathClick } from "./menu-tree";
import { resolveFocusNavigationIndex, type FocusNavigationTarget } from "./focus-navigation";

interface FocusDocument extends MenuEntry {
  pageIndex: number;
}

interface FocusDocumentsOptions {
  data: LoadedDocsData;
  entries: readonly MenuEntry[];
  language: string;
  currentPageIndex: number;
  isPathAllowed: (path: string) => boolean;
  canAccessRoute?: (authorization: RouteAuthorizationConfig | undefined) => boolean;
}

interface FocusDocuments {
  documents: FocusDocument[];
  currentDocumentIndex: number;
  previousDocument: FocusDocument | undefined;
  nextDocument: FocusDocument | undefined;
  getDocument: (target: FocusNavigationTarget) => FocusDocument | undefined;
}

export function useFocusDocuments({ data, entries, language, currentPageIndex, isPathAllowed, canAccessRoute }: FocusDocumentsOptions): FocusDocuments {
  const documents = useMemo(() => {
    const seenPages = new Set<number>();
    return entries.flatMap((entry) => {
      if (!entry.pathClick || !isPathAllowed(entry.pathClick)) return [];
      const pageIndex = getPageIndexByPathClick(data, entry.pathClick);
      if (pageIndex < 0 || seenPages.has(pageIndex)) return [];
      const markdown = resolvePageMarkdownHtml(data.pages?.[pageIndex], {
        legacyDocs: data.pages ? undefined : data.docs, pageIndex, language, canAccessRoute,
      });
      if (!hasMarkdownDocument(markdown)) return [];
      seenPages.add(pageIndex);
      return [{ ...entry, pageIndex }];
    });
  }, [data, entries, language, isPathAllowed, canAccessRoute]);
  const currentDocumentIndex = documents.findIndex((document) => document.pageIndex === currentPageIndex);
  return {
    documents,
    currentDocumentIndex,
    previousDocument: currentDocumentIndex > 0 ? documents[currentDocumentIndex - 1] : undefined,
    nextDocument: currentDocumentIndex >= 0 ? documents[currentDocumentIndex + 1] : undefined,
    getDocument: (target) => documents[resolveFocusNavigationIndex({ target, currentIndex: currentDocumentIndex, count: documents.length })],
  };
}
