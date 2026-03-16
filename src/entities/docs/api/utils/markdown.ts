import matter from "gray-matter";
import { marked } from "marked";

export function markdownToHtml(markdown: string): string {
  const parsed = matter(markdown);
  return marked.parse(parsed.content) as string;
}
