/**
 * @file use-highlighted-lines.ts
 * @description Tokenizes source code with Shiki (VS Code's highlighting
 * engine) using the genuine VS Code Dark+/Light+ palettes, picked by the
 * active site theme's mode. The Shiki bundle and each grammar are dynamically
 * imported, so nothing lands on the route's initial chunk, and any failure
 * (unknown grammar, oversized file, network) degrades to plain text.
 */
"use client";

import { useEffect, useState } from "react";
import type { ThemedToken } from "shiki";
import { resolveShikiLanguage } from "../lib/resolve-shiki-language";

export type HighlightThemeMode = "light" | "dark";

/** VS Code's default editor themes, keyed by the site theme's mode. */
const SHIKI_THEME_BY_MODE: Readonly<Record<HighlightThemeMode, string>> = {
  dark: "dark-plus",
  light: "light-plus",
};

/** Above this size highlighting is skipped so a huge blob cannot stall the tab. */
const MAX_HIGHLIGHT_CHARS = 400_000;

/**
 * Returns one token row per source line, or `null` while loading / when the
 * file cannot be highlighted (callers render the plain text in that case).
 * `content` must already have normalized line endings so token rows stay
 * aligned with the caller's line split.
 */
export function useHighlightedLines(
  content: string,
  filePath: string,
  mode: HighlightThemeMode,
): ThemedToken[][] | null {
  const [lines, setLines] = useState<ThemedToken[][] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLines(null);

    const language = resolveShikiLanguage(filePath);
    if (!language || !content || content.length > MAX_HIGHLIGHT_CHARS) {
      return;
    }

    void (async () => {
      try {
        const shiki = await import("shiki");
        const isKnownLanguage =
          language in shiki.bundledLanguages || language in shiki.bundledLanguagesAlias;
        if (!isKnownLanguage || cancelled) return;
        const result = await shiki.codeToTokens(content, {
          lang: language as keyof typeof shiki.bundledLanguages,
          theme: SHIKI_THEME_BY_MODE[mode],
        });
        if (!cancelled) setLines(result.tokens);
      } catch {
        // Plain-text fallback: highlighting is progressive enhancement.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [content, filePath, mode]);

  return lines;
}
