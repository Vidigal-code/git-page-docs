import { useMemo } from "react";
import { hasMarkdownDocument, resolvePageMarkdownHtml, type LoadedDocsData, type MenuEntry } from "@/entities/docs";
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
}

interface FocusDocuments {
  documents: FocusDocument[];
  currentDocumentIndex: number;
  previousDocument: FocusDocument | undefined;
  nextDocument: FocusDocument | undefined;
  getDocument: (target: FocusNavigationTarget) => FocusDocument | undefined;
}

export function useFocusDocuments({ data, entries, language, currentPageIndex, isPathAllowed }: FocusDocumentsOptions): FocusDocuments {
  const documents = useMemo(() => {
    const seenPages = new Set<number>();
    return entries.flatMap((entry) => {
      if (!entry.pathClick || !isPathAllowed(entry.pathClick)) return [];
      const pageIndex = getPageIndexByPathClick(data, entry.pathClick);
      if (pageIndex < 0 || seenPages.has(pageIndex)) return [];
      const markdown = resolvePageMarkdownHtml(data.pages?.[pageIndex], {
        legacyDocs: data.pages ? undefined : data.docs, pageIndex, language,
      });
      if (!hasMarkdownDocument(markdown)) return [];
      seenPages.add(pageIndex);
      return [{ ...entry, pageIndex }];
    });
  }, [data, entries, language, isPathAllowed]);
  const currentDocumentIndex = documents.findIndex((document) => document.pageIndex === currentPageIndex);
  return {
    documents,
    currentDocumentIndex,
    previousDocument: currentDocumentIndex > 0 ? documents[currentDocumentIndex - 1] : undefined,
    nextDocument: currentDocumentIndex >= 0 ? documents[currentDocumentIndex + 1] : undefined,
    getDocument: (target) => documents[resolveFocusNavigationIndex({ target, currentIndex: currentDocumentIndex, count: documents.length })],
  };
}
