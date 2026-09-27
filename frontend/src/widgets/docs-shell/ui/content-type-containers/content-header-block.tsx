"use client";

import type { ContentTypeRouteConfig, LanguageCode } from "@/entities/docs";
import { parseCssToStyle } from "./parse-css-to-style";
import styles from "../../docs-shell.module.css";

export interface ContentHeaderBlockProps {
  config?: ContentTypeRouteConfig;
  language: LanguageCode;
  isDarkMode?: boolean;
}

export function ContentHeaderBlock({ config, language, isDarkMode = false }: Readonly<ContentHeaderBlockProps>) {
  const title = config?.title?.[language] ?? config?.title?.en;
  const description = config?.description?.[language] ?? config?.description?.en;
  const titleIsVisible = config?.titleIsVisible ?? false;
  const descriptionIsVisible = config?.descriptionIsVisible ?? false;
  const titlePosition = config?.titlePosition ?? "center";
  const descriptionPosition = config?.descriptionPosition ?? "center";
  const titleCss = isDarkMode ? config?.titleDarkCss ?? config?.titleCss : config?.titleLightCss ?? config?.titleCss;
  const descCss = isDarkMode ? config?.descriptionDarkCss ?? config?.descriptionCss : config?.descriptionLightCss ?? config?.descriptionCss;

  if (!(titleIsVisible && title) && !(descriptionIsVisible && description)) {
    return null;
  }

  return (
    <header className={styles.contentHeaderAboveCard}>
      {titleIsVisible && title && (
        <h1
          className={styles.contentTitle}
          style={{
            textAlign: (["center", "left", "right"].includes(titlePosition ?? "") ? titlePosition : "center") as React.CSSProperties["textAlign"],
            ...parseCssToStyle(titleCss),
          }}
        >
          {title}
        </h1>
      )}
      {descriptionIsVisible && description && (
        <h3
          className={styles.contentDescription}
          style={{
            textAlign: (["center", "left", "right"].includes(descriptionPosition ?? "") ? descriptionPosition : "center") as React.CSSProperties["textAlign"],
            ...parseCssToStyle(descCss),
          }}
        >
          {description}
        </h3>
      )}
    </header>
  );
}
