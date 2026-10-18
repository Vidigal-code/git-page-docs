"use client";

import { useEffect, useMemo, useState } from "react";
import { useIsomorphicLayoutEffect } from "@/shared/lib/use-isomorphic-layout-effect";
import type { LoadedPage, MarkdownMarkersOptions } from "../../model/types";
import { prepareMarkdownContent } from "./prepare-markdown-content";
import { resolvePageMarkdownHtml, type MarkdownResolutionOptions } from "./resolve-page-markdown";

interface PageMarkdownOptions extends Omit<MarkdownResolutionOptions, "render"> {
  markerDefaults?: MarkdownMarkersOptions;
}

export function usePageMarkdownHtml(page: LoadedPage | undefined, options: PageMarkdownOptions): string {
  const { language, pageIndex, legacyDocs, canAccessRoute, markerDefaults } = options;
  const [hydrated, setHydrated] = useState(false);
  useIsomorphicLayoutEffect(() => { setHydrated(true); }, []);
  const result = useMemo(() => {
    const issues: string[] = [];
    const html = resolvePageMarkdownHtml(page, {
      language, pageIndex, legacyDocs, canAccessRoute,
      render: hydrated ? (input) => {
        const prepared = prepareMarkdownContent({ ...input, instanceId: input.instanceId ?? `focus-${page?.id ?? pageIndex}`, language, defaults: markerDefaults });
        issues.push(...prepared.issues);
        return prepared.html;
      } : undefined,
    });
    return { html, issues };
  }, [hydrated, page, language, pageIndex, legacyDocs, canAccessRoute, markerDefaults]);
  useEffect(() => {
    // eslint-disable-next-line no-console -- Report invalid public configuration to site authors.
    for (const issue of result.issues) console.warn(`[markdownMarkers] focus: ${issue}`);
  }, [result]);
  return result.html;
}
