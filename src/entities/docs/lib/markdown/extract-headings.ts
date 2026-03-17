/**
 * Extract heading structure (h1-h6) from rendered Markdown HTML for TOC.
 */

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
    const level = parseInt(match[1], 10);
    const attrs = match[2] || "";
    const rawContent = match[3] || "";
    const text = rawContent.replace(/<[^>]+>/g, "").trim();
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const id = idMatch?.[1] || slugify(text);
    if (!id) continue;
    if (specificIds.length > 0 && !specificIds.includes(id)) continue;

    headings.push({ id, text, level });
  }

  return headings;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || "";
}
