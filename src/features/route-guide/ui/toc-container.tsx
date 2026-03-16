"use client";

import { TocTree } from "./toc-tree";
import type { HeadingItem } from "@/entities/docs/lib/markdown/extract-headings";
import styles from "./toc-container.module.css";

export type TocPosition = "center" | "left" | "right";

interface TocContainerProps {
  headings: HeadingItem[];
  position: TocPosition;
  markdownContent: React.ReactNode;
  useDefaultScrollBehavior?: boolean;
  /** Rendered inside the markdown content area (e.g. fullscreen button) */
  contentActions?: React.ReactNode;
}

export function TocContainer({
  headings,
  position,
  markdownContent,
  useDefaultScrollBehavior = false,
  contentActions,
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

  return (
    <div
      className={`${styles.wrapper} ${styles[`position${position.charAt(0).toUpperCase() + position.slice(1)}`]}`}
      data-toc-wrapper
    >
      {position === "left" && toc}
      {position === "center" && toc}
      {contentWithActions}
      {position === "right" && toc}
    </div>
  );
}
