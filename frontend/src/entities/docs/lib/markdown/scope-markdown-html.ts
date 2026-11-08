import { decodeHTMLAttribute } from "entities/decode";
import { escapeAttribute } from "entities/escape";

const ELEMENT_TAG = /<[a-z][a-z0-9]*\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
const HEADING_TAG = /^<h[1-6]\b/i;
const LINK_TAG = /<a\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
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

/** Scopes headings and selected guide targets without changing Markdown sources or external links. */
export function scopeMarkdownHtml(html: string, instanceId: string, guideIds: readonly string[] = []): string {
  const targets = new Set(guideIds);
  const headingIds = new Map<string, string>();
  const scoped = html.replace(ELEMENT_TAG, (tag) => {
    const attribute = ID_ATTRIBUTE.exec(tag);
    if (!attribute) return tag;
    const id = decodeHTMLAttribute(attribute[2]);
    if (!HEADING_TAG.test(tag) && !targets.has(id)) return tag;
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
