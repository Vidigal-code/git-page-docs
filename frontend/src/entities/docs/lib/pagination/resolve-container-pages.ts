import type { LoadedContentBlock, LoadedPage } from "../../model/types/content";
import type { ContainerPaginationItem, ContainerPaginationOptions } from "../../model/types/container-pagination";
import type { ContentTypeRouteConfig, PageBlockType, RouteAuthorizationConfig } from "../../model/types/config";

export interface ResolvedContainerItem {
  block: LoadedContentBlock;
  title: Record<string, string> | undefined;
}

export interface PaginatedContainer {
  key: string;
  ownerPageId: number;
  type: PageBlockType;
  index: number;
  items: ResolvedContainerItem[];
  options: ContainerPaginationOptions;
}

export interface ContainerPagesOptions {
  pages: LoadedPage[];
  positions: Readonly<Record<string, number>>;
  defaults?: ContainerPaginationOptions;
  canAccess: (authorization: RouteAuthorizationConfig | undefined) => boolean;
}

export interface ResolvedContainerPages {
  pages: LoadedPage[];
  containers: PaginatedContainer[];
  issues: string[];
}

export function getPageContentBlocks(page: LoadedPage): LoadedContentBlock[] {
  if (page.blocks) return page.blocks;
  const blocks: LoadedContentBlock[] = [];
  if (page.md) blocks.push({ id: "md", type: "md", content: page.md });
  if (page.html) blocks.push({ id: "html", type: "html", content: page.html });
  if (page.video) blocks.push({ id: "video", type: "video", content: page.video });
  if (page.audio) blocks.push({ id: "audio", type: "audio", content: page.audio });
  if (page.pdf) blocks.push({ id: "pdf", type: "pdf", content: page.pdf });
  return blocks;
}

function isOptionalTranslation(value: unknown): boolean {
  return value === undefined || (value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.values(value).every(text => typeof text === "string"));
}

function isPaginationItem(value: unknown): value is ContainerPaginationItem {
  return value !== null && typeof value === "object" && "routeId" in value && Number.isSafeInteger(value.routeId)
    && (!("title" in value) || isOptionalTranslation(value.title))
    && (!("description" in value) || isOptionalTranslation(value.description));
}

function resolveItem(owner: LoadedContentBlock, item: unknown, options: BlockResolutionOptions): { item?: ResolvedContainerItem; issue?: string } {
  if (!isPaginationItem(item)) return { issue: `${owner.type} pagination item requires an integer routeId and localized text` };
  const source = options.blocks.find((block) => block.type === owner.type && block.content.routeId === item.routeId);
  if (!source) return { issue: `${owner.type} route ${item.routeId} was not found` };
  const sourceConfig: ContentTypeRouteConfig = source.content.config;
  if (!options.canAccess(sourceConfig.authorization)) return {};
  const config = { ...owner.content.config, ...sourceConfig, markdownMarkers: sourceConfig.markdownMarkers, pagination: undefined, browseAll: false, ...item.title && { title: item.title }, ...item.description && { description: item.description } };
  return { item: { block: { ...source, content: { ...source.content, config } } as LoadedContentBlock, title: config.title } };
}

interface BlockResolutionOptions extends ContainerPagesOptions {
  blocks: LoadedContentBlock[];
  ownerPageId: number;
}

function resolveBlock(owner: LoadedContentBlock, options: BlockResolutionOptions): { block: LoadedContentBlock; container?: PaginatedContainer; issues: string[] } {
    const config: ContentTypeRouteConfig = owner.content.config;
    if (!config.pagination || !options.canAccess(config.authorization)) return { block: owner, issues: [] };
    if ((config.pagination.enabled ?? options.defaults?.enabled) === false) return { block: owner, issues: [] };
    if (!Array.isArray(config.pagination.items)) return { block: owner, issues: [`${owner.type} pagination.items must be an array`] };
    const resolved = config.pagination.items.map((item) => resolveItem(owner, item, options));
    const items = resolved.flatMap((result) => result.item ? [result.item] : []);
    const issues = resolved.flatMap((result) => result.issue ? [result.issue] : []);
    if (!items.length) return { block: owner, issues };
    const key = `page-${options.ownerPageId}-${owner.id}`;
    const position = options.positions[key] ?? 0;
    const index = Number.isSafeInteger(position) ? Math.min(Math.max(position, 0), items.length - 1) : 0;
    const settings = {
      ...options.defaults, ...config.pagination,
      controls: { ...options.defaults?.controls, ...config.pagination.controls },
      icons: { ...options.defaults?.icons, ...config.pagination.icons },
      labels: { ...options.defaults?.labels, ...config.pagination.labels },
    };
    const container = { key, ownerPageId: options.ownerPageId, type: owner.type, index, items, options: settings };
    return { block: { ...items[index].block, id: owner.id }, container, issues };
}

export function resolveContainerPages(options: ContainerPagesOptions): ResolvedContainerPages {
  const blocks = options.pages.filter(page => options.canAccess(page.authorization)).flatMap(getPageContentBlocks);
  const results = options.pages.map((page) => {
    const resolved = getPageContentBlocks(page).map((block) => options.canAccess(page.authorization)
      ? resolveBlock(block, { ...options, blocks, ownerPageId: page.id }) : { block, issues: [] });
    const content = resolved.map((result) => result.block);
    const resolvedPage = page.blocks ? { ...page, blocks: content } : { ...page, ...Object.fromEntries(content.map((block) => [block.type, block.content])) };
    return { page: resolvedPage, containers: resolved.flatMap((result) => result.container ? [result.container] : []), issues: resolved.flatMap((result) => result.issues) };
  });
  const pages = results.map((result) => result.page);
  const containers = results.flatMap((result) => result.containers);
  return { pages, containers, issues: results.flatMap((result) => result.issues) };
}
