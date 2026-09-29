"use client";

import type { ContentTypeRouteConfig, LanguageCode } from "@/entities/docs";
import { resolveContentHeaderText, toTextAlign } from "./content-header-text";
import { parseCssToStyle } from "./parse-css-to-style";
import styles from "../../docs-shell.module.css";

export interface ContentHeaderBlockProps {
  config?: ContentTypeRouteConfig;
  language: LanguageCode;
  isDarkMode?: boolean;
}

/** Route title and description shown above a content card (markdown, HTML). */
export function ContentHeaderBlock({ config, language, isDarkMode = false }: Readonly<ContentHeaderBlockProps>) {
  const header = resolveContentHeaderText(config, language, isDarkMode);
  if (!header.showTitle && !header.showDescription) return null;

  return (
    <header className={styles.contentHeaderAboveCard}>
      {header.showTitle && (
        <h1
          className={styles.contentTitle}
          style={{ textAlign: toTextAlign(config?.titlePosition), ...parseCssToStyle(header.titleCss) }}
        >
          {header.title}
        </h1>
      )}
      {header.showDescription && (
        <h3
          className={styles.contentDescription}
          style={{ textAlign: toTextAlign(config?.descriptionPosition), ...parseCssToStyle(header.descriptionCss) }}
        >
          {header.description}
        </h3>
      )}
    </header>
  );
}
