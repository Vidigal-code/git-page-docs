import type { ContentType } from "@/entities/docs";
import styles from "../../docs-shell.module.css";

export type FullscreenAlign = "start" | "center";

/** Content whose fullscreen view has no scrolling body, so it is centered. */
const CENTERED_CONTENT_TYPES: ReadonlySet<ContentType> = new Set<ContentType>(["audio"]);

export function getFullscreenAlign(contentType: ContentType | null | undefined): FullscreenAlign {
  return contentType && CENTERED_CONTENT_TYPES.has(contentType) ? "center" : "start";
}

export function getFullscreenInnerClassName(align: FullscreenAlign): string {
  if (align === "center") {
    return `${styles.contentContainerFullscreenInner} ${styles.contentContainerFullscreenInnerCentered}`;
  }
  return styles.contentContainerFullscreenInner;
}
