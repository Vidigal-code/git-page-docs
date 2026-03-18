"use client";

import { TocTree } from "./toc-tree";
import type { HeadingItem } from "@/entities/docs";
import styles from "./toc-container.module.css";

export type TocPosition = "center" | "left" | "right";

interface TocContainerProps {
  headings: HeadingItem[];
  position: TocPosition;
  markdownContent: React.ReactNode;
  useDefaultScrollBehavior?: boolean;
  /** Rendered inside the markdown content area (e.g. fullscreen button) */
  contentActions?: React.ReactNode;
  /** If true (default), TOC on top of content. If false, TOC beside content on desktop. Mobile always on top. */
  containerTop?: boolean;
}

export function TocContainer({
  headings,
  position,
  markdownContent,
  useDefaultScrollBehavior = false,
  contentActions,
  containerTop = true,
}: TocContainerProps) {
  if (headings.length === 0) {
    return <>{markdownContent}</>;
  }

  const toc = (
    <aside className={styles.tocAside} aria-label="Table of contents" data-position={position}>
      <div className={styles.tocScroll}>
        <TocTree headings={headings} useDefaultScrollBehavior={useDefaultScrollBehavior} />
      </div>
    </aside>
  );

  const contentWithActions = (
    <div className={`${styles.content} ${contentActions ? styles.contentWithActions : ""}`}>
      {markdownContent}
      {contentActions}
    </div>
  );

  const positionClass = styles[`position${position.charAt(0).toUpperCase() + position.slice(1)}`];
  const sideWhenNotTop = position === "left" ? "left" : "right";

  return (
    <div
      className={`${styles.wrapper} ${positionClass}`}
      data-toc-wrapper
      data-container-top={containerTop ? "true" : "false"}
      data-side={!containerTop ? sideWhenNotTop : undefined}
    >
      {position === "left" && toc}
      {position === "center" && toc}
      {contentWithActions}
      {position === "right" && toc}
    </div>
  );
}
