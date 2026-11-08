import type { ThemedToken } from "shiki";
import { readableTextColor } from "@/shared/lib/color-contrast";
import { MAX_HIGHLIGHT_CHARS, tokenizeCode } from "./tokenize-code";
import { toTokenStyle } from "./token-style";
import type { HighlightThemeMode } from "./resolve-shiki-theme";

export interface MarkdownHighlightOptions {
  themeId?: string;
  mode: HighlightThemeMode;
  background: string;
}

function highlightTextNode(node: Text, tokens: ThemedToken[], cursor: { offset: number; index: number }): number {
  const { offset } = cursor;
  const fragment = document.createDocumentFragment();
  const end = offset + node.length;
  const marker = node.parentElement?.closest("[data-markdown-marker]");
  let position = offset;
  let index = cursor.index;
  for (; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.offset >= end) break;
    const start = Math.max(offset, token.offset);
    const stop = Math.min(end, token.offset + token.content.length);
    if (stop <= start) continue;
    if (start > position) fragment.append(node.data.slice(position - offset, start - offset));
    const span = document.createElement("span");
    span.textContent = node.data.slice(start - offset, stop - offset);
    Object.assign(span.style, toTokenStyle(token));
    if (marker) span.style.color = "inherit";
    fragment.append(span);
    position = stop;
    if (token.offset + token.content.length > end) break;
  }
  if (position < end) fragment.append(node.data.slice(position - offset));
  node.replaceWith(fragment);
  return index;
}

function applyTokens(code: HTMLElement, tokens: ThemedToken[]): void {
  const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
  const nodes: { node: Text; offset: number }[] = [];
  let offset = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    nodes.push({ node, offset });
    offset += node.length;
  }
  let index = 0;
  for (const entry of nodes) index = highlightTextNode(entry.node, tokens, { offset: entry.offset, index });
}

/** Enhances sanitized Markdown while retaining its existing anchors and markers. */
export async function highlightMarkdownCode(html: string, options: MarkdownHighlightOptions): Promise<string> {
  const template = document.createElement("template");
  template.innerHTML = html;
  const readableColors = new Map<string, string>();
  let remaining = MAX_HIGHLIGHT_CHARS;
  for (const code of template.content.querySelectorAll<HTMLElement>("pre > code")) {
    const language = [...code.classList].find((name) => name.startsWith("language-"))?.slice("language-".length);
    const content = code.textContent ?? "";
    if (!language || !content || content.length > remaining) continue;
    remaining -= content.length;
    const result = await tokenizeCode({ content, language, themeId: options.themeId, mode: options.mode });
    if (result) applyTokens(code, result.lines.flat().map((token) => {
      const foreground = token.color ?? result.foreground ?? "";
      let color = readableColors.get(foreground);
      if (color === undefined) {
        color = readableTextColor(foreground, options.background);
        readableColors.set(foreground, color);
      }
      return { ...token, color };
    }));
  }
  return template.innerHTML;
}
