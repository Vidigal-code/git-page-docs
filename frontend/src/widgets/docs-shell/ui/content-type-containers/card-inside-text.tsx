"use client";

import { toTextAlign, type ContentHeaderText } from "./content-header-text";
import type { ContentTypeRouteConfig } from "@/entities/docs";
import { parseCssToStyle } from "./parse-css-to-style";
import styles from "../../docs-shell.module.css";

interface CardInsideTextProps {
  header: ContentHeaderText;
  config?: ContentTypeRouteConfig;
}

/** Route title rendered inside a content card. */
export function CardInsideTitle({ header, config }: Readonly<CardInsideTextProps>) {
  if (!header.showTitle) return null;
  return (
    <h1 className={styles.contentTitleVideoInside} style={{ textAlign: toTextAlign(config?.titlePosition), ...parseCssToStyle(header.titleCss) }}>
      {header.title}
    </h1>
  );
}

/** Route description rendered inside a content card. */
export function CardInsideDescription({ header, config }: Readonly<CardInsideTextProps>) {
  if (!header.showDescription) return null;
  return (
    <h3
      className={styles.contentDescriptionVideoInside}
      style={{ textAlign: toTextAlign(config?.descriptionPosition), ...parseCssToStyle(header.descriptionCss) }}
    >
      {header.description}
    </h3>
  );
}
