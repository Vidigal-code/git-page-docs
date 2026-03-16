import type { ContentType, HeaderMenuItem, HeaderMenuLocalizedContent, LanguageCode, LoadedDocsData } from "@/entities/docs/model/types";

export interface MenuEntry {
  key: string;
  id: number;
  title: string;
  pathClick: string;
  active: boolean;
  level: number;
  searchLabel: string;
  ancestorKeys: string[];
}

export interface MenuNode {
  key: string;
  id: number;
  title: string;
  pathClick: string;
  active: boolean;
  level: number;
  searchLabel: string;
  ancestorKeys: string[];
  children: MenuNode[];
  isSectionHeader?: boolean;
}

export function getRouteIndexByPath(data: LoadedDocsData, language: LanguageCode, filePath: string): number {
  return data.config.routes.findIndex((route) => route.path[language] === filePath);
}

export function getPageIndexByPathClick(data: LoadedDocsData, pathClick: string): number {
  const entry = data.pathToPageMap?.[pathClick];
  if (entry) return entry.pageIndex;
  const routeIdx = data.config.routes.findIndex((r) => {
    const paths = r.path as Record<string, string>;
    return paths && Object.values(paths).includes(pathClick);
  });
  if (routeIdx >= 0 && data.pages?.length) {
    const pageId = data.config.routes[routeIdx]?.id;
    const pageIdx = data.pages.findIndex((p) => p.id === pageId);
    return pageIdx >= 0 ? pageIdx : routeIdx;
  }
  return routeIdx;
}

function buildLocalizedSubmenuTree(
  submenus: HeaderMenuLocalizedContent[],
  parentKey: string,
  parentTrail: string[],
  parentAncestors: string[],
  level: number,
  data: LoadedDocsData,
  language: LanguageCode,
  pageIndex: number,
): MenuNode[] {
  const entries: MenuNode[] = [];
  submenus.forEach((submenu, index) => {
    const pathClick = submenu["path-click"] ?? "";
    const title = submenu.title ?? "Menu";
    const trail = [...parentTrail, title];
    const key = `${parentKey}-l${level}-${index}`;
    const ancestorKeys = [...parentAncestors];
    const children = submenu.submenus?.length
      ? buildLocalizedSubmenuTree(submenu.submenus, key, trail, [...ancestorKeys, key], level + 1, data, language, pageIndex)
      : [];
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

export function buildHeaderMenuTree(
  menus: HeaderMenuItem[],
  data: LoadedDocsData,
  language: LanguageCode,
  pageIndex: number,
  level = 0,
  parentTrail: string[] = [],
  parentAncestors: string[] = [],
): MenuNode[] {
  const entries: MenuNode[] = [];
  menus.forEach((menu) => {
    const value = menu[language] as HeaderMenuLocalizedContent | undefined;
    const title = value?.title ?? "Menu";
    const pathClick = value?.["path-click"] ?? "";
    const trail = [...parentTrail, title];
    const key = `${trail.join("-")}-${menu.id}`;
    const ancestorKeys = [...parentAncestors];
    const nestedByItem = Array.isArray(menu.submenus)
      ? buildHeaderMenuTree(menu.submenus, data, language, pageIndex, level + 1, trail, [...ancestorKeys, key])
      : [];
    const nestedByLanguage = value?.submenus?.length
      ? buildLocalizedSubmenuTree(value.submenus, `${menu.id}`, trail, [...ancestorKeys, key], level + 1, data, language, pageIndex)
      : [];
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

const DEFAULT_HIERARCHY = { md: 0, html: 1, video: 2 };

export function buildUnifiedHeaderMenuTree(
  data: LoadedDocsData,
  language: LanguageCode,
  pageIndex: number,
): MenuNode[] {
  const hierarchyMenu = data.config.hierarchyMenu ?? DEFAULT_HIERARCHY;
  const langmenu = data.config.site.langmenu;
  const sections: { type: ContentType; menus: HeaderMenuItem[]; labelKey: string }[] = [];

  const menusMd = data.config["menus-header-md"] ?? data.config["menus-header"];
  if (menusMd?.length) {
    sections.push({ type: "md", menus: menusMd, labelKey: "titleHeaderMenuMd" });
  }
  const menusHtml = data.config["menus-header-html"];
  if (menusHtml?.length) {
    sections.push({ type: "html", menus: menusHtml, labelKey: "titleHeaderMenuHtml" });
  }
  const menusVideo = data.config["menus-header-video"];
  if (menusVideo?.length) {
    sections.push({ type: "video", menus: menusVideo, labelKey: "titleHeaderMenuVideo" });
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
    result.push(...buildHeaderMenuTree(menus, data, language, pageIndex, showSectionLabels ? 1 : 0, showSectionLabels ? [] : [], []));
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
