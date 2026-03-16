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
 */
export function extractHeadingsFromHtml(
  html: string,
  specificIds: string[] = []
): HeadingItem[] {
  if (typeof document === "undefined") {
    return extractHeadingsFromHtmlServer(html, specificIds);
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  const headingTags = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const headings: HeadingItem[] = [];
  const elements = doc.querySelectorAll(headingTags.join(","));

  elements.forEach((el) => {
    const id = el.id || slugify(el.textContent || "");
    if (!id) return;
    if (specificIds.length > 0 && !specificIds.includes(id)) return;

    const level = parseInt(el.tagName[1], 10);
    headings.push({ id, text: el.textContent?.trim() || "", level });
  });

  return headings;
}

/**
 * Server-safe extraction using regex (no DOM).
 */
function extractHeadingsFromHtmlServer(html: string, specificIds: string[]): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const tagLevels: Record<string, number> = { H1: 1, H2: 2, H3: 3, H4: 4, H5: 5, H6: 6 };
  const regex = /<h([1-6])([^>]*)>([^<]*)<\/h[1-6]>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = tagLevels[(match[1] as keyof typeof tagLevels)] ?? 1;
    const attrs = match[2] || "";
    const text = match[3]?.trim() || "";
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
