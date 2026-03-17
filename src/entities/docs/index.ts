export { loadDocsData } from "./api/load-docs-data";
export { buildFooterConfigFromData } from "./lib/footer/build-footer-config";
export type * from "./model/types";
export {
  type MenuNode,
  type MenuEntry,
  type BreadcrumbItem,
  getBreadcrumbTrail,
} from "./model/menu";
export { getRouteIndexByPath, getPageIndexByPathClick, getUrlParamsForPathClick } from "./model/menu-utils";
export type { BrowseItem } from "./model/navigation";
