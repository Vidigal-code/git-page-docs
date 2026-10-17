import { decodeHTMLAttribute } from "entities/decode";
import { escapeAttribute } from "entities/escape";

const HEADING_TAG = /<h[1-6]\b[^>]*>/gi;
const LINK_TAG = /<a\b[^>]*>/gi;
const ID_ATTRIBUTE = /\sid\s*=\s*(["'])([^"']*)\1/i;
const HREF_ATTRIBUTE = /\shref\s*=\s*(["'])([^"']*)\1/i;

export function scopeMarkdownId(id: string, instanceId: string): string {
  return `${encodeURIComponent(instanceId)}--${id}`;
}

function fragmentId(href: string): string | undefined {
  if (!href.startsWith("#")) return undefined;
  try {
    return decodeURIComponent(href.slice(1));
  } catch {
    return undefined;
  }
}

/** Scopes generated heading anchors without changing Markdown sources or external links. */
export function scopeMarkdownHtml(html: string, instanceId: string): string {
  const headingIds = new Map<string, string>();
  const scoped = html.replace(HEADING_TAG, (tag) => {
    const attribute = ID_ATTRIBUTE.exec(tag);
    if (!attribute) return tag;
    const id = decodeHTMLAttribute(attribute[2]);
    const scopedId = scopeMarkdownId(id, instanceId);
    headingIds.set(id, scopedId);
    return tag.replace(attribute[0], ` id="${escapeAttribute(scopedId)}"`);
  });
  return scoped.replace(LINK_TAG, (tag) => {
    const attribute = HREF_ATTRIBUTE.exec(tag);
    if (!attribute) return tag;
    const id = fragmentId(decodeHTMLAttribute(attribute[2]));
    const scopedId = id === undefined ? undefined : headingIds.get(id);
    return scopedId ? tag.replace(attribute[0], ` href="#${escapeAttribute(encodeURIComponent(scopedId))}"`) : tag;
  });
}
