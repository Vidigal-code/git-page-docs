import { decodeHTMLAttribute } from "entities/decode";
import { createHeadingSlug, getHeadingText } from "./heading-content";

/**
 * Extract heading structure (h1-h6) from rendered Markdown HTML for TOC.
 */

const HEADING_ID_ATTR_REGEX = /id=["']([^"']+)["']/i;

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Parses HTML string and extracts headings (h1-h6) with their id and text.
 * If specificIds is non-empty, only headings whose id is in that array are included.
 * Uses regex-based extraction on both server and client to avoid hydration mismatch.
 */
export function extractHeadingsFromHtml(
  html: string,
  specificIds: string[] = []
): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const regex = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = Number.parseInt(match[1], 10);
    const attrs = match[2] || "";
    const rawContent = match[3] || "";
    const text = getHeadingText(rawContent);
    const idMatch = HEADING_ID_ATTR_REGEX.exec(attrs);
    const id = decodeHTMLAttribute(idMatch?.[1] ?? "") || createHeadingSlug(text);
    if (!id) continue;
    if (specificIds.length > 0 && !specificIds.includes(id)) continue;

    headings.push({ id, text, level });
  }

  return headings;
}
