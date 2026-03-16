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
}

export function TocContainer({ headings, position, markdownContent, useDefaultScrollBehavior = false }: TocContainerProps) {
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

  return (
    <div
      className={`${styles.wrapper} ${styles[`position${position.charAt(0).toUpperCase() + position.slice(1)}`]}`}
      data-toc-wrapper
    >
      {position === "left" && toc}
      {position === "center" && toc}
      <div className={styles.content}>{markdownContent}</div>
      {position === "right" && toc}
    </div>
  );
}
