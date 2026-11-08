import type { ThemedToken } from "shiki";
import { resolveShikiTheme, type HighlightThemeMode } from "./resolve-shiki-theme";

export const MAX_HIGHLIGHT_CHARS = 400_000;

export interface HighlightedCode {
  lines: ThemedToken[][];
  background?: string;
  foreground?: string;
}

export interface CodeHighlightOptions {
  content: string;
  language: string | undefined;
  themeId?: string;
  mode: HighlightThemeMode;
}

export async function tokenizeCode(options: CodeHighlightOptions): Promise<HighlightedCode | null> {
  const { content, language, themeId, mode } = options;
  if (!language || !content || content.length > MAX_HIGHLIGHT_CHARS) return null;
  try {
    const shiki = await import("shiki");
    if (!(language in shiki.bundledLanguages || language in shiki.bundledLanguagesAlias)) return null;
    const result = await shiki.codeToTokens(content, {
      lang: language as keyof typeof shiki.bundledLanguages,
      theme: resolveShikiTheme(themeId, mode),
    });
    return { lines: result.tokens, background: result.bg, foreground: result.fg };
  } catch {
    // Code remains readable when an optional grammar or theme cannot load.
    return null;
  }
}
