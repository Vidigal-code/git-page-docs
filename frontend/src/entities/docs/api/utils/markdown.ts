import matter from "gray-matter";
import { Marked } from "marked";
import { createHeadingSlug, getHeadingText } from "../../lib/markdown/heading-content";

const markdownParser = new Marked({
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
  return addHeadingIds(html);
}
