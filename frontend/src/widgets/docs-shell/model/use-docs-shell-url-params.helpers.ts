import { getPathClickByRouteId, type LanguageCode, type LoadedDocsData } from "@/entities/docs";
import { buildUnifiedHeaderMenuTree, getBreadcrumbTrail, getPageIndexByPathClick } from "./menu-tree";

export type FullscreenContentType = "md" | "html" | "video" | "audio" | null;

export interface FullscreenParams {
  type: FullscreenContentType;
  lang: LanguageCode;
  file?: string;
  id?: number;
  slug?: string;
}

/** A page selected through the URL plus the menu ancestors to expand so it is visible. */
export interface PageTarget {
  pageIndex: number;
  ancestorKeys: string[];
}

/** The `?menu=<lang>` selection resolved to a path click. */
export interface MenuSelection {
  lang: LanguageCode;
  pathClick: string;
}

function parseMediaSelector(params: URLSearchParams): { id: number | undefined; slug: string | undefined } {
  const rawId = params.get("id");
  const id = rawId ? Number.parseInt(rawId, 10) : undefined;
  return { id: Number.isNaN(id) ? undefined : id, slug: params.get("slug") ?? undefined };
}

/**
 * Reads a fullscreen request from the query: `?mdfull|htmlfull=<lang>&file=`
 * for documents (the file is required) or `?videofull|audiofull=<lang>` with an
 * optional `id`/`slug` for media. Checked in that order, first match wins.
 */
export function parseFullscreenParams(params: URLSearchParams): FullscreenParams | null {
  const file = params.get("file");
  const mdfull = params.get("mdfull");
  if (mdfull && file) {
    return { type: "md", lang: mdfull, file };
  }
  const videofull = params.get("videofull");
  if (videofull) {
    return { type: "video", lang: videofull, ...parseMediaSelector(params) };
  }
  const htmlfull = params.get("htmlfull");
  if (htmlfull && file) {
    return { type: "html", lang: htmlfull, file };
  }
  const audiofull = params.get("audiofull");
  if (audiofull) {
    return { type: "audio", lang: audiofull, ...parseMediaSelector(params) };
  }
  return null;
}

/** Matches a `?name=` slug against the known path keys, ignoring case and a `.md`/`.html` extension. */
export function findPathClickBySlug(data: LoadedDocsData, slug: string): string | null {
  const normalized = slug.toLowerCase().replace(/\.(md|html)$/, "");
  const suffixes = [`/${normalized}`, `/${normalized}.md`, `/${normalized}.html`];
  for (const key of Object.keys(data.pathToPageMap ?? {})) {
    const lower = key.toLowerCase();
    if (suffixes.some((suffix) => lower.endsWith(suffix))) {
      return key;
    }
  }
  return null;
}

function resolveByRouteId(data: LoadedDocsData, rawId: string, lang: LanguageCode): string | null {
  const id = Number.parseInt(rawId, 10);
  return Number.isNaN(id) ? null : getPathClickByRouteId(data, id, lang);
}

/** Resolves `?menu=<lang>&id=<route>` or `?menu=<lang>&name|nome=<slug>` to a path click; the id wins over the slug. */
export function resolveMenuSelection(data: LoadedDocsData, params: URLSearchParams): MenuSelection | null {
  const lang = params.get("menu");
  if (!lang) {
    return null;
  }
  const routeId = params.get("id");
  const slug = params.get("name") ?? params.get("nome");
  let pathClick: string | null = null;
  if (routeId) {
    pathClick = resolveByRouteId(data, routeId, lang);
  } else if (slug) {
    pathClick = findPathClickBySlug(data, slug);
  }
  return pathClick ? { lang, pathClick } : null;
}

function buildPageTarget(data: LoadedDocsData, language: LanguageCode, pathClick: string, pageIndex: number): PageTarget {
  const tree = buildUnifiedHeaderMenuTree(data, language, pageIndex);
  const trail = getBreadcrumbTrail(tree, pathClick);
  return { pageIndex, ancestorKeys: trail.at(-1)?.ancestorKeys ?? [] };
}

/** Locates the page a path click opens and the menu ancestors leading to it; null when the path is unknown. */
export function resolvePageTarget(data: LoadedDocsData, language: LanguageCode, pathClick: string): PageTarget | null {
  const pageIndex = getPageIndexByPathClick(data, pathClick);
  return pageIndex < 0 ? null : buildPageTarget(data, language, pathClick, pageIndex);
}

/** The navigation a menu selection triggers, or null when it points nowhere or at the current page. */
export function resolveMenuNavigationTarget(
  data: LoadedDocsData,
  selection: MenuSelection,
  currentPageIndex: number,
): PageTarget | null {
  const pageIndex = getPageIndexByPathClick(data, selection.pathClick);
  if (pageIndex < 0 || pageIndex === currentPageIndex) {
    return null;
  }
  return buildPageTarget(data, selection.lang, selection.pathClick, pageIndex);
}
