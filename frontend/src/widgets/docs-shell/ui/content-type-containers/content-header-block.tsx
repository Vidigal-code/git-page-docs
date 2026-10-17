"use client";

import type { ContentTypeRouteConfig, LanguageCode } from "@/entities/docs";
import { resolveContentHeaderText, toTextAlign, type ContentHeaderText } from "./content-header-text";
import { parseCssToStyle } from "./parse-css-to-style";
import styles from "../../docs-shell.module.css";

export interface ContentHeaderBlockProps {
  config?: ContentTypeRouteConfig;
  language: LanguageCode;
  isDarkMode?: boolean;
}

/** Route title and description rendered outside a content card. */
export function ContentHeaderBlock({ config, language, isDarkMode = false }: Readonly<ContentHeaderBlockProps>) {
  const header = resolveContentHeaderText(config, language, isDarkMode);
  return <ContentHeaderTextBlock header={header} config={config} />;
}

export function ContentHeaderTextBlock({ header, config }: Readonly<{ header: ContentHeaderText; config?: ContentTypeRouteConfig }>) {
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
