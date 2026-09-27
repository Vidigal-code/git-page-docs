/**
 * Parse an AI documentation response into gitpagedocs pages.
 *
 * The model is instructed (see GITPAGEDOCS_DOC_SYSTEM_PROMPT) to delimit each
 * page with a line `=== PAGE: <slug> | <Title> ===`. This splits that response
 * into individual pages. If the model ignored the format, the whole response is
 * returned as a single "ai-overview" page so content is never lost.
 */

export interface AiDocPage {
  /** lowercase-kebab, English, identical across languages (used as the filename) */
  slug: string;
  title: string;
  body: string;
}

// Slug is everything up to the first `|`, title everything up to the closing
// `===`; both are trimmed by the caller. Kept free of overlapping quantifiers
// so a hostile line cannot make the match super-linear.
const PAGE_DELIMITER = /^===\s*PAGE:([^|]*)\|(.*)===\s*$/;

/** Turn an arbitrary heading into a safe lowercase-kebab slug. */
export function slugify(raw: string): string {
  const slug = (raw ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join("-")
    .slice(0, 60);
  return slug || "page";
}

export function parseAiPages(markdown: string): AiDocPage[] {
  const text = (markdown ?? "").replaceAll("\r\n", "\n").trim();
  if (!text) return [];

  const pages: AiDocPage[] = [];
  let current: { slug: string; title: string; body: string[] } | null = null;

  const flush = () => {
    if (current) {
      pages.push({ slug: current.slug, title: current.title, body: current.body.join("\n").trim() });
    }
  };

  for (const line of text.split("\n")) {
    const match = PAGE_DELIMITER.exec(line);
    if (match) {
      flush();
      const rawSlug = match[1].trim();
      const title = match[2].trim() || rawSlug;
      current = { slug: slugify(rawSlug), title, body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  flush();

  const withBody = pages.filter((page) => page.body.length > 0);
  if (withBody.length === 0) {
    return [{ slug: "ai-overview", title: "Overview", body: text }];
  }

  // De-duplicate slugs within a single response (suffix later collisions).
  const seen = new Map<string, number>();
  return withBody.map((page) => {
    const count = seen.get(page.slug) ?? 0;
    seen.set(page.slug, count + 1);
    return count === 0 ? page : { ...page, slug: `${page.slug}-${count + 1}` };
  });
}
