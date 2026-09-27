import type { Dispatch, SetStateAction } from "react";
import type {
  BreadcrumbItem,
  BrowseItem,
  LoadedAudioContent,
  LoadedHtmlContent,
  LoadedMdContent,
  LoadedVideoContent,
} from "@/entities/docs";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
// Type-only (erased at runtime): the audio route controls config is shaped by its UI component.
import type { AudioRouteControlsConfig } from "../ui/content-type-containers/audio-route-controls";
import type { DocsShellLabels } from "./use-docs-shell-labels";

/** Setter of a browse-all index (a React state setter). */
export type BrowseIndexSetter = Dispatch<SetStateAction<number>>;

/**
 * Browse-all position per content type: the current index, its setter and the
 * items the page can page through. Produced by useDocsShellNavigationState and
 * read by the content blocks, inline and inside the URL fullscreen overlay.
 */
export interface BrowseState {
  mdBrowseIndex: number;
  htmlBrowseIndex: number;
  videoBrowseIndex: number;
  audioBrowseIndex: number;
  setMdBrowseIndex: BrowseIndexSetter;
  setHtmlBrowseIndex: BrowseIndexSetter;
  setVideoBrowseIndex: BrowseIndexSetter;
  setAudioBrowseIndex: BrowseIndexSetter;
  mdItems: BrowseItem<LoadedMdContent>[];
  htmlItems: BrowseItem<LoadedHtmlContent>[];
  videoItems: BrowseItem<LoadedVideoContent>[];
  audioItems: BrowseItem<LoadedAudioContent>[];
}

/**
 * Navigation context every content block shares: the route guide breadcrumb
 * with its home target, plus the icon and audio-control configs the shell
 * resolves once per render.
 */
export interface BrowseNavigationProps {
  routeGuideEnabled: boolean;
  breadcrumbTrail: BreadcrumbItem[];
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
  homePathClick: string | undefined;
  homeAncestorKeys: string[];
  routeGuideIconConfig: ResolvedRouteGuideIconConfig;
  audioRouteControlsConfig: AudioRouteControlsConfig;
}

/** The shell labels the content blocks, their browse nav and the fullscreen controls render. */
export type ContentLabels = Pick<
  DocsShellLabels,
  | "menuCloseLabel"
  | "fullscreenExpandLabel"
  | "previousLabel"
  | "nextLabel"
  | "browsePrevLabel"
  | "browseNextLabel"
  | "mdCopyLabel"
  | "mdCopiedLabel"
  | "mdCopyErrorLabel"
  | "mdDownloadLabel"
>;
