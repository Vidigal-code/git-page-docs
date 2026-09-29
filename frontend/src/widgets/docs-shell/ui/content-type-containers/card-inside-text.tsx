"use client";

import type { ContentHeaderText } from "./content-header-text";
import { parseCssToStyle } from "./parse-css-to-style";
import styles from "../../docs-shell.module.css";

interface CardInsideTextProps {
  header: ContentHeaderText;
}

/** Route title shown inside a media card (video, audio), above the player. */
export function CardInsideTitle({ header }: Readonly<CardInsideTextProps>) {
  if (!header.showTitle) return null;
  return (
    <h1 className={styles.contentTitleVideoInside} style={{ textAlign: "center", ...parseCssToStyle(header.titleCss) }}>
      {header.title}
    </h1>
  );
}

/** Route description shown inside a media card (video, audio), below the player. */
export function CardInsideDescription({ header }: Readonly<CardInsideTextProps>) {
  if (!header.showDescription) return null;
  return (
    <h3
      className={styles.contentDescriptionVideoInside}
      style={{ textAlign: "center", ...parseCssToStyle(header.descriptionCss) }}
    >
      {header.description}
    </h3>
  );
}
