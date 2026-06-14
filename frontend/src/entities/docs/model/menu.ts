/** Menu and breadcrumb domain types (FSD: entities layer) */

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

export interface BreadcrumbItem {
  title: string;
  pathClick: string;
  ancestorKeys: string[];
}

function findBreadcrumbTrailRecurse(
  nodes: MenuNode[],
  pathClick: string,
  trail: BreadcrumbItem[],
  ancestorKeys: string[],
): BreadcrumbItem[] | null {
  for (const node of nodes) {
    const nextAncestors = [...ancestorKeys, node.key];
    const nextTrail: BreadcrumbItem[] = [
      ...trail,
      { title: node.title, pathClick: node.pathClick, ancestorKeys: nextAncestors },
    ];
    if (node.pathClick && node.pathClick === pathClick) {
      return nextTrail;
    }
    const found = findBreadcrumbTrailRecurse(node.children, pathClick, nextTrail, nextAncestors);
    if (found) return found;
  }
  return null;
}

export function getBreadcrumbTrail(nodes: MenuNode[], pathClick: string): BreadcrumbItem[] {
  if (!pathClick) return [];
  const found = findBreadcrumbTrailRecurse(nodes, pathClick, [], []);
  return found ?? [];
}
