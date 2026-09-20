/**
 * @file use-highlighted-lines.ts
 * @description Tokenizes source code with Shiki (VS Code's highlighting
 * engine). The token palette is the bundled VS Code theme matched to the
 * active site layout (see resolve-shiki-theme), falling back to Dark+/Light+
 * by mode. The Shiki bundle, each grammar and each theme are dynamically
 * imported, so nothing lands on the route's initial chunk, and any failure
 * (unknown grammar, oversized file, network) degrades to plain text.
 */
"use client";

import { useEffect, useState } from "react";
import type { ThemedToken } from "shiki";
import { resolveShikiLanguage } from "../lib/resolve-shiki-language";
import { resolveShikiTheme, type HighlightThemeMode } from "../lib/resolve-shiki-theme";

export type { HighlightThemeMode };

export interface HighlightedCode {
  /** One token row per source line, aligned with the caller's line split. */
  lines: ThemedToken[][];
  /** The Shiki theme's editor background, for a matching panel surface. */
  background?: string;
  /** The Shiki theme's default foreground. */
  foreground?: string;
}

/** Above this size highlighting is skipped so a huge blob cannot stall the tab. */
const MAX_HIGHLIGHT_CHARS = 400_000;

/**
 * Returns the highlighted code, or `null` while loading / when the file
 * cannot be highlighted (callers render the plain text in that case).
 * `content` must already have normalized line endings so token rows stay
 * aligned with the caller's line split.
 */
export function useHighlightedLines(
  content: string,
  filePath: string,
  themeId: string | undefined,
  mode: HighlightThemeMode,
): HighlightedCode | null {
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHighlighted(null);

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
          theme: resolveShikiTheme(themeId, mode),
        });
        if (!cancelled) {
          setHighlighted({ lines: result.tokens, background: result.bg, foreground: result.fg });
        }
      } catch {
        // Plain-text fallback: highlighting is progressive enhancement.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [content, filePath, themeId, mode]);

  return highlighted;
}
