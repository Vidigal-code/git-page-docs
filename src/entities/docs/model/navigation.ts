/** Navigation domain types (FSD: entities layer) */

export interface BrowseItem<T> {
  pageIndex: number;
  content: T;
}
