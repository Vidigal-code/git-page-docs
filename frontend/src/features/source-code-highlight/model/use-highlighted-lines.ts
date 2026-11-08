"use client";

import { useEffect, useState } from "react";
import { resolveShikiLanguage } from "../lib/resolve-shiki-language";
import { tokenizeCode, type HighlightedCode } from "../lib/tokenize-code";
import type { HighlightThemeMode } from "../lib/resolve-shiki-theme";

export type { HighlightThemeMode, HighlightedCode };

export function useHighlightedLines(
  content: string,
  filePath: string,
  theme: { id?: string; mode: HighlightThemeMode },
): HighlightedCode | null {
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);
  const { id, mode } = theme;
  useEffect(() => {
    let cancelled = false;
    setHighlighted(null);
    void tokenizeCode({ content, language: resolveShikiLanguage(filePath), themeId: id, mode }).then((result) => {
      if (!cancelled) setHighlighted(result);
    });
    return () => { cancelled = true; };
  }, [content, filePath, id, mode]);
  return highlighted;
}
