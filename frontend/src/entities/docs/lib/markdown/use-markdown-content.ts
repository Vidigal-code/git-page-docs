"use client";

import { useEffect, useMemo, useState } from "react";
import { useIsomorphicLayoutEffect } from "@/shared/lib/use-isomorphic-layout-effect";
import { prepareMarkdownContent, unmarkedMarkdownContent, type MarkdownContentOptions, type PreparedMarkdownContent } from "./prepare-markdown-content";

export function useMarkdownContent(options: MarkdownContentOptions): PreparedMarkdownContent {
  const { html, config, language, defaults, instanceId } = options;
  const [hydrated, setHydrated] = useState(false);
  useIsomorphicLayoutEffect(() => { setHydrated(true); }, []);
  const result = useMemo(() => {
    const input = { html, config, language, defaults, instanceId };
    return hydrated ? prepareMarkdownContent(input) : unmarkedMarkdownContent(input);
  }, [hydrated, html, config, language, defaults, instanceId]);
  useEffect(() => {
    // eslint-disable-next-line no-console -- Report invalid public configuration to site authors.
    for (const issue of result.issues) console.warn(`[markdownMarkers] route ${config?.id}: ${issue}`);
  }, [result, config?.id]);
  return result;
}
