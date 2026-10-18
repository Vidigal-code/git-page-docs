import type { ContentTypeRouteConfig } from "../../model/types/config";
import type { LanguageCode } from "../../model/types/site";
import type { MarkdownMarker, MarkdownMarkerStyle, MarkdownMarkerText, MarkdownMarkersOptions } from "../../model/types/markdown-markers";
import { extractHeadingsFromHtml, type HeadingItem } from "./extract-headings";
import { scopeMarkdownHtml, scopeMarkdownId } from "./scope-markdown-html";

const EXCLUDED_CONTENT = 'script,style,template,noscript,iframe,object,embed,head,meta,link,[hidden],[aria-hidden="true"]';
const BLOCK_CONTENT = "p,div,section,article,li,dt,dd,td,th,pre,blockquote,h1,h2,h3,h4,h5,h6";
const STYLE_PROPERTIES = { background: "--markdown-marker-background", color: "--markdown-marker-color", outlineColor: "--markdown-marker-outline" } as const;

export interface MarkdownContentOptions {
  html: string;
  language: LanguageCode;
  config?: ContentTypeRouteConfig;
  defaults?: MarkdownMarkersOptions;
  instanceId?: string;
}

export interface PreparedMarkdownContent {
  html: string;
  headings: HeadingItem[];
  issues: string[];
}

export function unmarkedMarkdownContent(options: MarkdownContentOptions): PreparedMarkdownContent {
  const { html, config, instanceId } = options;
  const headings = config?.RouteguideBrand === true ? extractHeadingsFromHtml(html, config.RouteGuideSpeciFicbrand ?? []) : [];
  return {
    html: instanceId ? scopeMarkdownHtml(html, instanceId) : html,
    headings: headings.map((heading) => ({ ...heading, id: instanceId ? scopeMarkdownId(heading.id, instanceId) : heading.id })),
    issues: [],
  };
}

function translated(value: MarkdownMarkerText | undefined, language: LanguageCode): string {
  const resolved = typeof value === "string" ? value : value?.[language] ?? value?.en;
  return typeof resolved === "string" ? resolved : "";
}

function normalizedOffsets(content: string): { text: string; offsets: { start: number; end: number }[] } {
  const offsets: { start: number; end: number }[] = [];
  let text = "";
  const segments = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(content);
  for (const { segment, index } of segments) {
    const normalized = /^\s+$/u.test(segment) ? " " : segment.normalize("NFC");
    const end = index + segment.length;
    if (normalized === " " && text.endsWith(" ")) {
      const previous = offsets.at(-1);
      if (previous) previous.end = end;
      continue;
    }
    text += normalized;
    offsets.push(...normalized.split("").map(() => ({ start: index, end })));
  }
  return { text, offsets };
}

function textProjection(root: DocumentFragment): { content: string; runs: { node: Text; start: number }[] } {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => node instanceof Element && node.matches(EXCLUDED_CONTENT) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const runs: { node: Text; start: number }[] = [];
  let content = "";
  let previousBlock: Element | null = null;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node instanceof Element) {
      if (node.tagName === "BR") content += "\n";
      continue;
    }
    if (!(node instanceof Text)) continue;
    const block = node.parentElement?.closest(BLOCK_CONTENT) ?? null;
    if (content && block !== previousBlock) content += "\n";
    previousBlock = block;
    runs.push({ node, start: content.length });
    content += node.data;
  }
  return { content, runs };
}

function highlightText(root: DocumentFragment, target: MarkerTarget): HTMLElement[] {
  const { content, runs } = textProjection(root);
  const normalized = normalizedOffsets(content);
  const text = target.text.normalize("NFC").replace(/\s+/gu, " ").trim();
  if (!text) return [];
  let found = -text.length;
  for (let occurrence = 0; occurrence < target.occurrence; occurrence++) {
    found = normalized.text.indexOf(text, found + text.length);
    if (found < 0) return [];
  }
  const start = normalized.offsets[found].start;
  const end = normalized.offsets[found + text.length - 1].end;
  return runs.flatMap(({ node, start: offset }) => {
    const from = Math.max(0, start - offset);
    const to = Math.min(node.length, end - offset);
    if (to <= from) return [];
    const match = node.splitText(from);
    match.splitText(to - from);
    const mark = document.createElement("mark");
    match.replaceWith(mark);
    mark.append(match);
    return [mark];
  });
}

interface MarkerTarget {
  text: string;
  selector: string;
  occurrence: number;
}

function findTargets(root: DocumentFragment, target: MarkerTarget): { elements: HTMLElement[]; issue?: string } {
  if (!Number.isSafeInteger(target.occurrence) || target.occurrence < 1) return { elements: [], issue: "occurrence must be a positive integer" };
  if (Boolean(target.text) === Boolean(target.selector)) return { elements: [], issue: "provide exactly one text or selector target" };
  if (!target.selector) return { elements: highlightText(root, target) };
  try {
    const element = root.querySelectorAll<HTMLElement>(target.selector)[target.occurrence - 1];
    return { elements: element && !element.closest(EXCLUDED_CONTENT) ? [element] : [] };
  } catch (error) {
    if (error instanceof DOMException && error.name === "SyntaxError") return { elements: [], issue: "invalid CSS selector" };
    throw error;
  }
}

function applyStyle(elements: HTMLElement[], style: MarkdownMarkerStyle): string[] {
  const issues: string[] = [];
  const probe = document.createElement("span").style;
  for (const [key, property] of Object.entries(STYLE_PROPERTIES)) {
    const value = style[key as keyof MarkdownMarkerStyle];
    if (value === undefined) continue;
    probe.color = "";
    if (typeof value === "string") probe.color = value;
    if (!probe.color) {
      issues.push(`invalid ${key} color`);
      continue;
    }
    for (const element of elements) element.style.setProperty(property, value);
  }
  return issues;
}

function fragmentId(href: string): string {
  try {
    return decodeURIComponent(href.slice(1));
  } catch (error) {
    if (error instanceof URIError) return href.slice(1);
    throw error;
  }
}

interface MarkerResult {
  heading?: HeadingItem;
  issues: string[];
}

function targetId(root: DocumentFragment, target: HTMLElement, markerId: string): string {
  if (target.id) return target.id;
  const baseId = `markdown-marker-${encodeURIComponent(markerId)}`;
  let id = baseId;
  let suffix = 1;
  while (root.getElementById(id)) id = `${baseId}-${suffix++}`;
  return id;
}

function applyMarker(root: DocumentFragment, marker: MarkdownMarker, options: MarkdownContentOptions): MarkerResult {
  const { elements, issue } = findTargets(root, {
    selector: translated(marker.selector, options.language), text: translated(marker.text, options.language), occurrence: marker.occurrence ?? 1,
  });
  const target = elements[0];
  if (!target) return { issues: [`${marker.id}: ${issue ?? "target not found in visible document content"}`] };
  for (const element of elements) element.dataset.markdownMarker = marker.id;
  const style = { ...options.defaults?.style, ...options.config?.markdownMarkers?.style, ...marker.style };
  const issues = applyStyle(elements, style).map((issue) => `${marker.id}: ${issue}`);
  target.id = targetId(root, target, marker.id);
  const level = /^H[1-6]$/.test(target.tagName) ? Number(target.tagName[1]) : 2;
  const label = translated(marker.label, options.language) || marker.id;
  target.dataset.markdownMarkerLabel = label;
  return { heading: { id: target.id, text: label, level }, issues };
}

function scopeTargets(root: DocumentFragment, instanceId: string): void {
  const ids = new Set([...root.querySelectorAll("[id]")].map((element) => element.id));
  for (const element of root.querySelectorAll("[id]")) element.id = scopeMarkdownId(element.id, instanceId);
  for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    const id = fragmentId(link.getAttribute("href") ?? "");
    if (ids.has(id)) link.setAttribute("href", `#${encodeURIComponent(scopeMarkdownId(id, instanceId))}`);
  }
}

function applyMarkers(root: DocumentFragment, items: readonly MarkdownMarker[], options: MarkdownContentOptions): MarkerResult[] {
  const markerIds = new Set<string>();
  return items.flatMap((marker): MarkerResult[] => {
    if (marker?.enabled === false) return [];
    if (!marker || typeof marker.id !== "string" || !marker.id.trim() || markerIds.has(marker.id)) {
      return [{ issues: ["marker id must be a unique nonempty string"] }];
    }
    markerIds.add(marker.id);
    return [applyMarker(root, marker, options)];
  });
}

export function prepareMarkdownContent(options: MarkdownContentOptions): PreparedMarkdownContent {
  const { html, config, instanceId } = options;
  const items = config?.markdownMarkers?.items;
  if ((config?.markdownMarkers?.enabled ?? options.defaults?.enabled) === false || items === undefined) return unmarkedMarkdownContent(options);
  if (!Array.isArray(items)) return { ...unmarkedMarkdownContent(options), issues: ["items must be an array"] };
  if (items.length === 0) return unmarkedMarkdownContent(options);
  const template = document.createElement("template");
  template.innerHTML = html;
  const originalHeadings = config?.RouteguideBrand === true ? extractHeadingsFromHtml(html, config.RouteGuideSpeciFicbrand ?? []) : [];
  const results = applyMarkers(template.content, items, options);
  const markedHeadings = results.flatMap((result) => result.heading ? [result.heading] : []);
  const headings = [...new Map([...originalHeadings, ...markedHeadings].map((heading) => [heading.id, heading])).values()];
  const positions = new Map([...template.content.querySelectorAll("[id]")].map((element, index) => [element.id, index]));
  headings.sort((left, right) => (positions.get(left.id) ?? 0) - (positions.get(right.id) ?? 0));
  if (instanceId) scopeTargets(template.content, instanceId);
  return {
    html: template.innerHTML,
    headings: headings.map((heading) => ({ ...heading, id: instanceId ? scopeMarkdownId(heading.id, instanceId) : heading.id })),
    issues: results.flatMap((result) => result.issues),
  };
}
