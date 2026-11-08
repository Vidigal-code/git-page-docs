import matter from "gray-matter";
import { Marked } from "marked";
import { fromHtml } from "hast-util-from-html";
import { defaultSchema, sanitize, type Schema } from "hast-util-sanitize";
import { toHtml } from "hast-util-to-html";
import { createHeadingSlug, getHeadingText } from "../../lib/markdown/heading-content";

const markdownSchema: Schema = {
  ...defaultSchema,
  clobber: defaultSchema.clobber?.filter((attribute) => attribute !== "id"),
  strip: [...(defaultSchema.strip ?? []), "style", "iframe", "object", "embed", "textarea", "xmp"],
  attributes: {
    ...defaultSchema.attributes,
    "*": ["align", "alt", "checked", "colSpan", "dir", "height", "id", "lang", "open", "rowSpan", "start", "title", "width"],
    h2: [],
  },
};

const markdownParser = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    heading({ tokens, depth }) {
      const content = this.parser.parseInline(tokens);
      const id = createHeadingSlug(getHeadingText(content)) || "heading";
      return `<h${depth} id="${id}">${content}</h${depth}>\n`;
    },
  },
});

/** Adds id attributes to h1-h6 that lack them, for TOC anchor links */
function addHeadingIds(html: string): string {
  let output = "";
  let previousEnd = 0;
  for (const match of html.matchAll(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi)) {
    const [heading, level, attributes, content] = match;
    const start = match.index ?? 0;
    output += html.slice(previousEnd, start);
    if (/(?:^|\s)id\s*=/i.test(attributes)) output += heading;
    else {
      const id = createHeadingSlug(getHeadingText(content)) || "heading";
      output += `<h${level}${attributes} id="${id}">${content}</h${level}>`;
    }
    previousEnd = start + heading.length;
  }
  return output + html.slice(previousEnd);
}

export function markdownToHtml(markdown: string): string {
  const parsed = matter(markdown.replace(/^\uFEFF/, ""));
  const html = markdownParser.parse(parsed.content, { async: false });
  const tree = fromHtml(addHeadingIds(html), { fragment: true });
  return toHtml(sanitize(tree, markdownSchema), { characterReferences: { useNamedReferences: true } });
}
