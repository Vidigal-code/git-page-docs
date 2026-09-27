import {
  getPageIndexByPathClick,
  type ContentType,
  type HeaderMenuItem,
  type HeaderMenuLocalizedContent,
  type LanguageCode,
  type LoadedDocsData,
  type MenuEntry,
  type MenuNode,
} from "@/entities/docs";
import { DEFAULT_HIERARCHY } from "@/shared/config/constants";

export type { MenuEntry, MenuNode };
export { getPageIndexByPathClick };
export { getBreadcrumbTrail, getUrlParamsForPathClick, type BreadcrumbItem } from "@/entities/docs";

/** What every level of a menu tree needs to resolve pages and filter paths. */
interface MenuTreeContext {
  data: LoadedDocsData;
  language: LanguageCode;
  pageIndex: number;
  isPathAllowed?: (pathClick: string) => boolean;
}

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
      pathClick,
      active: pathClick ? pageIndex === getPageIndexByPathClick(data, pathClick) : false,
      level,
      searchLabel: trail.join(" / "),
      ancestorKeys,
      children,
    });
  });
  return entries;
}

export interface BuildHeaderMenuTreeOptions {
  /** Nesting depth of `menus` (0 = top level). */
  level?: number;
  /** Titles of the ancestors, used to build stable keys and search labels. */
  parentTrail?: string[];
  /** Keys of the ancestors (expansion map). */
  parentAncestors?: string[];
  isPathAllowed?: (pathClick: string) => boolean;
}

export function buildHeaderMenuTree(
  menus: HeaderMenuItem[],
  data: LoadedDocsData,
  language: LanguageCode,
  pageIndex: number,
  options: BuildHeaderMenuTreeOptions = {},
): MenuNode[] {
  const { level = 0, parentTrail = [], parentAncestors = [], isPathAllowed } = options;
  const entries: MenuNode[] = [];
  menus.forEach((menu) => {
    const value = menu[language] as HeaderMenuLocalizedContent | undefined;
    const title = value?.title ?? "Menu";
    const pathClick = value?.["path-click"] ?? "";
    const trail = [...parentTrail, title];
    const key = `${trail.join("-")}-${menu.id}`;
    const ancestorKeys = [...parentAncestors];
    const nestedByItem = Array.isArray(menu.submenus)
      ? buildHeaderMenuTree(menu.submenus, data, language, pageIndex, {
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
      pathClick,
      active: pathClick ? pageIndex === getPageIndexByPathClick(data, pathClick) : false,
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
  pageIndex: number,
  isPathAllowed?: (pathClick: string) => boolean,
): MenuNode[] {
  const hierarchyMenu = data.config.hierarchyMenu ?? DEFAULT_HIERARCHY as Record<string, number>;
  const langmenu = data.config.site.langmenu;
  const sections: { type: ContentType; menus: HeaderMenuItem[]; labelKey: string }[] = [];

  const menusMd = data.config["menus-header-md"] ?? data.config["menus-header"];
  if (menusMd?.length) {
    sections.push({ type: "md", menus: menusMd, labelKey: "titleHeaderMenuMd" });
  }
  const menusSourceViewer = data.config["menus-header-source-viewer"];
  if (menusSourceViewer?.length) {
    sections.push({ type: "source-viewer", menus: menusSourceViewer, labelKey: "titleHeaderMenuSourceViewer" });
  }
  const menusHtml = data.config["menus-header-html"];
  if (menusHtml?.length) {
    sections.push({ type: "html", menus: menusHtml, labelKey: "titleHeaderMenuHtml" });
  }
  const menusVideo = data.config["menus-header-video"];
  if (menusVideo?.length) {
    sections.push({ type: "video", menus: menusVideo, labelKey: "titleHeaderMenuVideo" });
  }
  const menusAudio = data.config["menus-header-audio"];
  if (menusAudio?.length) {
    sections.push({ type: "audio", menus: menusAudio, labelKey: "titleHeaderMenuAudio" });
  }

  sections.sort((a, b) => (hierarchyMenu[a.type] ?? 999) - (hierarchyMenu[b.type] ?? 999));
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
    const sectionNodes = buildHeaderMenuTree(menus, data, language, pageIndex, {
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
