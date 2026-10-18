import type { LanguageCode } from "./site";

export type ContainerPageAction = "first" | "previous" | "next" | "last";

export interface ContainerPaginationOptions {
  enabled?: boolean;
  alignment?: "left" | "center" | "right";
  placement?: "top" | "bottom" | "both";
  display?: "icon" | "text";
  showCount?: boolean;
  controls?: Partial<Record<ContainerPageAction, boolean>>;
  labels?: Partial<Record<ContainerPageAction | "pages", string | Record<LanguageCode, string>>>;
  icons?: Partial<Record<ContainerPageAction, string>>;
  iconSize?: string;
}

export interface ContainerPaginationItem {
  routeId: number;
  title?: Record<LanguageCode, string>;
  description?: Record<LanguageCode, string>;
}

export interface ContainerPaginationConfig extends ContainerPaginationOptions {
  items: ContainerPaginationItem[];
}

export interface ContainerPageSelection {
  key: string;
  index: number;
}
