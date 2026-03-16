import matter from "gray-matter";
import { marked } from "marked";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || "heading";
}

/** Adds id attributes to h1-h6 that lack them, for TOC anchor links */
function addHeadingIds(html: string): string {
  return html.replace(
    /<h([1-6])([^>]*)>([^<]*)<\/h[1-6]>/gi,
    (_, level, attrs, content) => {
      if (/id=/.test(attrs)) return `<h${level}${attrs}>${content}</h${level}>`;
      const id = slugify(content);
      const idAttr = id ? ` id="${id}"` : "";
      return `<h${level}${attrs}${idAttr}>${content}</h${level}>`;
    }
  );
}

export function markdownToHtml(markdown: string): string {
  const parsed = matter(markdown);
  const html = marked.parse(parsed.content) as string;
  return addHeadingIds(html);
}
