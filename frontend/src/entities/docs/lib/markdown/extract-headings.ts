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
    const text = stripHtmlTags(rawContent).trim();
    const idMatch = HEADING_ID_ATTR_REGEX.exec(attrs);
    const id = idMatch?.[1] || slugify(text);
    if (!id) continue;
    if (specificIds.length > 0 && !specificIds.includes(id)) continue;

    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * Drops every `<...>` run the way `/<[^>]+>/g` would, using one forward scan
 * (indexOf) instead of a regex that backtracks quadratically on unclosed "<".
 * "<>" and a "<" with no later ">" are kept verbatim, as the regex kept them.
 */
function stripHtmlTags(html: string): string {
  let output = "";
  let index = 0;
  while (index < html.length) {
    const open = html.indexOf("<", index);
    if (open === -1) {
      output += html.slice(index);
      break;
    }
    const close = html.indexOf(">", open + 1);
    if (close === -1) {
      output += html.slice(index);
      break;
    }
    if (close === open + 1) {
      output += html.slice(index, close + 1);
      index = close + 1;
      continue;
    }
    output += html.slice(index, open);
    index = close + 1;
  }
  return output;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || "";
}
