import { decodeHTML } from "entities/decode";

export function getHeadingText(html: string): string {
  return decodeHTML(stripHtmlTags(html)).trim();
}

export function createHeadingSlug(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}_\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
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
