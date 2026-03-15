import type { HeaderMenuItem, HeaderMenuLocalizedContent, LanguageCode, LoadedDocsData } from "@/entities/docs/model/types";

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
}

export function getRouteIndexByPath(data: LoadedDocsData, language: LanguageCode, filePath: string): number {
  return data.config.routes.findIndex((route) => route.path[language] === filePath);
}

function buildLocalizedSubmenuTree(
  submenus: HeaderMenuLocalizedContent[],
  parentKey: string,
  parentTrail: string[],
  parentAncestors: string[],
  level: number,
  data: LoadedDocsData,
  language: LanguageCode,
  routeIndex: number,
): MenuNode[] {
  const entries: MenuNode[] = [];
  submenus.forEach((submenu, index) => {
    const pathClick = submenu["path-click"] ?? "";
    const title = submenu.title ?? "Menu";
    const trail = [...parentTrail, title];
    const key = `${parentKey}-l${level}-${index}`;
    const ancestorKeys = [...parentAncestors];
    const children = submenu.submenus?.length
      ? buildLocalizedSubmenuTree(submenu.submenus, key, trail, [...ancestorKeys, key], level + 1, data, language, routeIndex)
      : [];
    entries.push({
      key,
      id: index,
      title,
      pathClick,
      active: routeIndex === getRouteIndexByPath(data, language, pathClick),
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
  routeIndex: number,
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
      ? buildHeaderMenuTree(menu.submenus, data, language, routeIndex, level + 1, trail, [...ancestorKeys, key])
      : [];
    const nestedByLanguage = value?.submenus?.length
      ? buildLocalizedSubmenuTree(value.submenus, `${menu.id}`, trail, [...ancestorKeys, key], level + 1, data, language, routeIndex)
      : [];
    entries.push({
      key,
      id: menu.id,
      title,
      pathClick,
      active: routeIndex === getRouteIndexByPath(data, language, pathClick),
      level,
      searchLabel: trail.join(" / "),
      ancestorKeys,
      children: [...nestedByItem, ...nestedByLanguage],
    });
  });
  return entries;
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
