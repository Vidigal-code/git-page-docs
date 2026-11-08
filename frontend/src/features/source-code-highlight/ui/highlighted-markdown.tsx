"use client";

import { useMemo, useRef, type CSSProperties, type ReactElement } from "react";
import { useIsomorphicLayoutEffect } from "@/shared/lib/use-isomorphic-layout-effect";
import { highlightMarkdownCode } from "../lib/highlight-markdown-code";
import type { HighlightThemeMode } from "../lib/resolve-shiki-theme";

export interface MarkdownHighlightTheme {
  id?: string;
  mode: HighlightThemeMode;
}

interface HighlightedMarkdownProps {
  html: string;
  className?: string;
  style?: CSSProperties;
  theme: MarkdownHighlightTheme;
}

function replaceCodeContents(blocks: HTMLElement[], html: string): void {
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("pre > code").forEach((source, index) => {
    const contents = document.createRange();
    contents.selectNodeContents(source);
    blocks[index]?.replaceChildren(contents.extractContents());
  });
}

export function HighlightedMarkdown({ html, className, style, theme }: Readonly<HighlightedMarkdownProps>): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const markup = useMemo(() => ({ __html: html }), [html]);
  const { id, mode } = theme;
  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root?.querySelector("pre > code[class]")) return;
    let cancelled = false;
    const blocks = [...root.querySelectorAll<HTMLElement>("pre > code")];
    replaceCodeContents(blocks, html);
    const background = getComputedStyle(root).getPropertyValue("--markdown-code-background").trim();
    void highlightMarkdownCode(html, { themeId: id, mode, background }).then((highlighted) => {
      if (!cancelled) replaceCodeContents(blocks, highlighted);
    });
    return () => { cancelled = true; };
  }, [html, id, mode]);
  return <div ref={ref} className={className} style={style} dangerouslySetInnerHTML={markup} />;
}
