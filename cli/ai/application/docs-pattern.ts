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

const PAGE_DELIMITER = /^===\s*PAGE:\s*(.+?)\s*\|\s*(.*?)\s*===\s*$/;

/** Turn an arbitrary heading into a safe lowercase-kebab slug. */
export function slugify(raw: string): string {
  const slug = (raw ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "page";
}

export function parseAiPages(markdown: string): AiDocPage[] {
  const text = (markdown ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const pages: AiDocPage[] = [];
  let current: { slug: string; title: string; body: string[] } | null = null;

  const flush = () => {
    if (current) {
      pages.push({ slug: current.slug, title: current.title, body: current.body.join("\n").trim() });
    }
  };

  for (const line of text.split("\n")) {
    const match = line.match(PAGE_DELIMITER);
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
