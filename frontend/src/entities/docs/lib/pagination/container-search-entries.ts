import type { MenuEntry } from "../../model/menu";
import type { PaginatedContainer } from "./resolve-container-pages";

interface ContainerSearchOptions {
  containers: PaginatedContainer[];
  menuEntries: MenuEntry[];
  language: string;
}

export function buildContainerSearchEntries({ containers, menuEntries, language }: ContainerSearchOptions): MenuEntry[] {
  return containers.flatMap((container) => {
    const owner = menuEntries.find((entry) => entry.id === container.ownerPageId && entry.pathClick);
    if (!owner) return [];
    return container.items.map((item, index) => {
      const title = item.title?.[language] ?? item.title?.en ?? `${container.type.toUpperCase()} ${index + 1}`;
      return {
        ...owner, key: `${owner.key}:${container.key}:${index}`, title,
        searchLabel: `${owner.searchLabel} > ${title} (${container.type.toUpperCase()} ${index + 1}/${container.items.length})`,
        containerPage: { key: container.key, index },
      };
    });
  });
}
