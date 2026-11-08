import { fromHtml } from "hast-util-from-html";
import { defaultSchema } from "hast-util-sanitize";
import { toHtml } from "hast-util-to-html";
import type { ContentTypeRouteConfig } from "../../model/types/config";
import { extractHeadingsFromHtml, type HeadingItem } from "./extract-headings";
import { createHeadingSlug } from "./heading-content";

type HtmlNode = ReturnType<typeof fromHtml>["children"][number];
type HtmlElement = Extract<HtmlNode, { type: "element" }>;
const MAX_LABEL_LENGTH = 96;
const MAX_LABEL_CODE_UNITS = MAX_LABEL_LENGTH * 2;
const MAX_HEADING_LEVEL = 6;
const EMPTY_ELEMENT_LABELS = new Set(["br", "hr", "img", "input"]);
const SUPPORTED_TAGS = new Set(defaultSchema.tagNames);

interface MarkdownGuide {
  html: string;
  headings: HeadingItem[];
  issues: string[];
}

export function prepareMarkdownGuide(html: string, config?: ContentTypeRouteConfig): MarkdownGuide {
  if (config?.RouteguideBrand !== true) return { html, headings: [], issues: [] };
  if (config.RouteGuideTags === undefined) {
    return { html, headings: extractHeadingsFromHtml(html, config.RouteGuideSpeciFicbrand), issues: [] };
  }
  const { tags, issues } = normalizedTags(config.RouteGuideTags);
  if (tags.size === 0) return { html, headings: [], issues };
  const tree = fromHtml(html, { fragment: true });
  const elements = documentElements(tree.children);
  const usedIds = deduplicateElementIds(elements);
  const headings: HeadingItem[] = [];
  let headingLevel = 1;
  for (const element of elements) {
    const isHeading = /^h[1-6]$/.test(element.tagName);
    if (isHeading) headingLevel = Number(element.tagName[1]);
    if (!tags.has(element.tagName)) continue;
    const text = elementLabel(element);
    if (!text) continue;
    const id = element.properties.id || uniqueId(`route-guide-${element.tagName}-${createHeadingSlug(text)}`, usedIds);
    element.properties.id = id;
    if (config.RouteGuideSpeciFicbrand?.length && !config.RouteGuideSpeciFicbrand.includes(String(id))) continue;
    headings.push({ id: String(id), text, level: isHeading ? headingLevel : Math.min(headingLevel + 1, MAX_HEADING_LEVEL) });
  }
  return { html: toHtml(tree), headings, issues };
}

function normalizedTags(value: unknown): { tags: Set<string>; issues: string[] } {
  if (!Array.isArray(value)) {
    return {
      tags: new Set(Array.from({ length: MAX_HEADING_LEVEL }, (_, index) => `h${index + 1}`)),
      issues: ["RouteGuideTags must be an array of HTML tag names"],
    };
  }
  const tags = new Set<string>();
  const issues: string[] = [];
  for (const entry of value) {
    const tag = typeof entry === "string" ? entry.trim().toLowerCase() : "";
    if (SUPPORTED_TAGS.has(tag)) tags.add(tag);
    else issues.push(`RouteGuideTags: unsupported tag ${typeof entry === "string" ? entry.slice(0, MAX_LABEL_LENGTH) : typeof entry}`);
  }
  return { tags, issues };
}

function documentElements(nodes: HtmlNode[]): HtmlElement[] {
  const elements: HtmlElement[] = [];
  const pending = [...nodes].reverse();
  while (pending.length) {
    const node = pending.pop();
    if (node?.type !== "element") continue;
    elements.push(node);
    for (let index = node.children.length - 1; index >= 0; index--) pending.push(node.children[index]);
  }
  return elements;
}

function elementLabel(element: HtmlElement): string {
  const named = [element.properties.title, element.properties.alt].find(value => typeof value === "string" && value.trim());
  if (typeof named === "string") return shortenedLabel(named);
  const pending: HtmlNode[] = [...element.children].reverse();
  let text = "";
  while (pending.length && text.length <= MAX_LABEL_CODE_UNITS) {
    const node = pending.pop();
    if (node?.type === "text") text = (text + node.value).replace(/\s+/gu, " ").trimStart();
    if (node?.type === "element") {
      for (let index = node.children.length - 1; index >= 0; index--) pending.push(node.children[index]);
    }
  }
  return shortenedLabel(text) || (EMPTY_ELEMENT_LABELS.has(element.tagName) ? element.tagName : "");
}

function shortenedLabel(value: string): string {
  let label = "";
  let length = 0;
  for (const character of value.replace(/\s+/gu, " ").trim()) {
    if (length === MAX_LABEL_LENGTH) return `${label}…`;
    label += character;
    length++;
  }
  return label;
}

function uniqueId(base: string, usedIds: Set<string>): string {
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}-${suffix++}`;
  usedIds.add(id);
  return id;
}

function deduplicateElementIds(elements: HtmlElement[]): Set<string> {
  const usedIds = new Set(elements.flatMap(element => typeof element.properties.id === "string" ? [element.properties.id] : []));
  const claimedIds = new Set<string>();
  for (const element of elements) {
    const id = element.properties.id;
    if (typeof id !== "string" || !id) continue;
    if (claimedIds.has(id)) element.properties.id = uniqueId(id, usedIds);
    claimedIds.add(String(element.properties.id));
  }
  return usedIds;
}
