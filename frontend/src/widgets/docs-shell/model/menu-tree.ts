import {
  getBreadcrumbTrail,
  getPageIndexByPathClick,
  type BreadcrumbItem,
  type ContentType,
  type HeaderMenuItem,
  type HeaderMenuLocalizedContent,
  type LanguageCode,
  type LoadedDocsData,
  type MenuEntry,
  type MenuNode,
  type SiteConfig,
} from "@/entities/docs";
import { DEFAULT_HIERARCHY } from "@/shared/config/constants";

export type { MenuEntry, MenuNode };
export { getPageIndexByPathClick };
export { getBreadcrumbTrail, getUrlParamsForPathClick, type BreadcrumbItem } from "@/entities/docs";

/** What every level of a menu tree needs to resolve pages and filter paths. */
export interface MenuTreeSelection {
  pageIndex: number;
  isPathAllowed?: (pathClick: string) => boolean;
}

interface MenuTreeContext extends MenuTreeSelection {
  data: LoadedDocsData;
  language: LanguageCode;
}

const UNORDERED_SECTION_PRIORITY = 999;

/** Where a nested submenu list hangs in the tree being built. */
interface SubmenuPosition {
  parentKey: string;
  parentTrail: string[];
  parentAncestors: string[];
  level: number;
}

function buildLocalizedSubmenuTree(
  submenus: HeaderMenuLocalizedContent[],
  position: SubmenuPosition,
  context: MenuTreeContext,
): MenuNode[] {
  const { parentKey, parentTrail, parentAncestors, level } = position;
  const { data, pageIndex, isPathAllowed } = context;
  const entries: MenuNode[] = [];
  submenus.forEach((submenu, index) => {
    const pathClick = submenu["path-click"] ?? "";
    const title = submenu.title ?? "Menu";
    const trail = [...parentTrail, title];
    const key = `${parentKey}-l${level}-${index}`;
    const ancestorKeys = [...parentAncestors];
    const children = submenu.submenus?.length
      ? buildLocalizedSubmenuTree(
          submenu.submenus,
          { parentKey: key, parentTrail: trail, parentAncestors: [...ancestorKeys, key], level: level + 1 },
          context,
        )
      : [];
    const allowed = !pathClick || isPathAllowed?.(pathClick) !== false;
    if (!allowed && children.length === 0) {
      return;
    }
    entries.push({
      key,
      id: index,
      title,
      pathClick: allowed ? pathClick : "",
      active: allowed && pathClick ? pageIndex === getPageIndexByPathClick(data, pathClick) : false,
      level,
      searchLabel: trail.join(" / "),
      ancestorKeys,
      children,
    });
  });
  return entries;
}

export interface BuildHeaderMenuTreeOptions extends MenuTreeContext {
  /** Nesting depth of `menus` (0 = top level). */
  level?: number;
  /** Titles of the ancestors, used to build stable keys and search labels. */
  parentTrail?: string[];
  /** Keys of the ancestors (expansion map). */
  parentAncestors?: string[];
}

export function buildHeaderMenuTree(
  menus: HeaderMenuItem[],
  options: BuildHeaderMenuTreeOptions,
): MenuNode[] {
  const { data, language, pageIndex, level = 0, parentTrail = [], parentAncestors = [], isPathAllowed } = options;
  const entries: MenuNode[] = [];
  menus.forEach((menu) => {
    const value = menu[language] as HeaderMenuLocalizedContent | undefined;
    const title = value?.title ?? "Menu";
    const pathClick = value?.["path-click"] ?? "";
    const trail = [...parentTrail, title];
    const key = `${trail.join("-")}-${menu.id}`;
    const ancestorKeys = [...parentAncestors];
    const nestedByItem = Array.isArray(menu.submenus)
      ? buildHeaderMenuTree(menu.submenus, {
          data, language, pageIndex,
          level: level + 1,
          parentTrail: trail,
          parentAncestors: [...ancestorKeys, key],
          isPathAllowed,
        })
      : [];
    const nestedByLanguage = value?.submenus?.length
      ? buildLocalizedSubmenuTree(
          value.submenus,
          { parentKey: `${menu.id}`, parentTrail: trail, parentAncestors: [...ancestorKeys, key], level: level + 1 },
          { data, language, pageIndex, isPathAllowed },
        )
      : [];
    const allowed = !pathClick || isPathAllowed?.(pathClick) !== false;
    if (!allowed && nestedByItem.length === 0 && nestedByLanguage.length === 0) {
      return;
    }
    entries.push({
      key,
      id: menu.id,
      title,
      pathClick: allowed ? pathClick : "",
      active: allowed && pathClick ? pageIndex === getPageIndexByPathClick(data, pathClick) : false,
      level,
      searchLabel: trail.join(" / "),
      ancestorKeys,
      children: [...nestedByItem, ...nestedByLanguage],
    });
  });
  return entries;
}

export function buildUnifiedHeaderMenuTree(
  data: LoadedDocsData,
  language: LanguageCode,
  selection: MenuTreeSelection,
): MenuNode[] {
  const { pageIndex, isPathAllowed } = selection;
  const hierarchyMenu = data.config.hierarchyMenu ?? DEFAULT_HIERARCHY as Record<string, number>;
  const langmenu = data.config.site.langmenu;
  const candidates: { type: ContentType; menus: HeaderMenuItem[]; labelKey: string }[] = [
    { type: "md", menus: data.config["menus-header-md"] ?? data.config["menus-header"] ?? [], labelKey: "titleHeaderMenuMd" },
    { type: "source-viewer", menus: data.config["menus-header-source-viewer"] ?? [], labelKey: "titleHeaderMenuSourceViewer" },
    { type: "html", menus: data.config["menus-header-html"] ?? [], labelKey: "titleHeaderMenuHtml" },
    { type: "video", menus: data.config["menus-header-video"] ?? [], labelKey: "titleHeaderMenuVideo" },
    { type: "audio", menus: data.config["menus-header-audio"] ?? [], labelKey: "titleHeaderMenuAudio" },
    { type: "pdf", menus: data.config["menus-header-pdf"] ?? [], labelKey: "titleHeaderMenuPdf" },
  ];
  const sections = candidates.filter(({ type, menus }) => menus.length > 0 && (type !== "pdf" || data.config.site.pdf?.enabled !== false));

  sections.sort((a, b) => (hierarchyMenu[a.type] ?? UNORDERED_SECTION_PRIORITY) - (hierarchyMenu[b.type] ?? UNORDERED_SECTION_PRIORITY));
  const showSectionLabels = sections.length > 1;
  const result: MenuNode[] = [];

  for (const { type, menus, labelKey } of sections) {
    if (showSectionLabels) {
      const label = (langmenu[language] as Record<string, string>)?.[labelKey] ?? (langmenu.en as Record<string, string>)?.[labelKey] ?? labelKey;
      result.push({
        key: `section-${type}`,
        id: -1,
        title: label,
        pathClick: "",
        active: false,
        level: 0,
        searchLabel: label,
        ancestorKeys: [],
        children: [],
        isSectionHeader: true,
      });
    }
    // Section labels are sibling rows, not hierarchy parents: the title trail
    // (keys, search labels) and the ancestor keys start fresh in every section.
    const sectionNodes = buildHeaderMenuTree(menus, {
      data, language, pageIndex,
      level: showSectionLabels ? 1 : 0,
      isPathAllowed,
    });
    if (sectionNodes.length === 0) {
      if (showSectionLabels) {
        result.pop();
      }
      continue;
    }
    result.push(...sectionNodes);
  }

  return result;
}

export function flattenMenuTree(nodes: MenuNode[]): MenuEntry[] {
  const result: MenuEntry[] = [];
  nodes.forEach((node) => {
    result.push({
      key: node.key,
      id: node.id,
      title: node.title,
      pathClick: node.pathClick,
      active: node.active,
      level: node.level,
      searchLabel: node.searchLabel,
      ancestorKeys: node.ancestorKeys,
    });
    if (node.children.length) {
      result.push(...flattenMenuTree(node.children));
    }
  });
  return result;
}

export function getMenuDisplayNodes(nodes: MenuNode[], site: Pick<SiteConfig, "nestedMenusEnabled">): MenuNode[] {
  if (site.nestedMenusEnabled !== false) return nodes;
  return nodes.flatMap((node) => {
    const row = node.pathClick || node.isSectionHeader ? [{ ...node, level: 0, children: [] }] : [];
    return [...row, ...getMenuDisplayNodes(node.children, site)];
  });
}

export function getCurrentPageBreadcrumbTrail(nodes: MenuNode[], pathClick: string | undefined): BreadcrumbItem[] {
  const exactTrail = getBreadcrumbTrail(nodes, pathClick ?? "");
  if (exactTrail.length > 0) return exactTrail;
  const activeDestination = flattenMenuTree(nodes).find((entry) => entry.active && entry.pathClick);
  return activeDestination ? getBreadcrumbTrail(nodes, activeDestination.pathClick) : [];
}
