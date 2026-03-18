import {
  getBreadcrumbTrail,
  getPageIndexByPathClick,
  getUrlParamsForPathClick,
  type BreadcrumbItem,
  type ContentType,
  type HeaderMenuItem,
  type HeaderMenuLocalizedContent,
  type LanguageCode,
  type LoadedDocsData,
  type MenuEntry,
  type MenuNode,
} from "@/entities/docs";
import { DEFAULT_HIERARCHY } from "@/shared/config/constants";

export type { MenuEntry, MenuNode, BreadcrumbItem };
export { getBreadcrumbTrail, getPageIndexByPathClick };
export { getUrlParamsForPathClick };

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

export function buildUnifiedHeaderMenuTree(
  data: LoadedDocsData,
  language: LanguageCode,
  pageIndex: number,
): MenuNode[] {
  const hierarchyMenu = data.config.hierarchyMenu ?? DEFAULT_HIERARCHY as Record<string, number>;
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
