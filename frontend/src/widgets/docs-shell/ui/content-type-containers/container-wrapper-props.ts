import type { ContentTypeRouteConfig } from "@/entities/docs";
import type { BrowseNavConfig } from "../page-content-browse-nav";
import type { ReactNode } from "react";

export interface ContainerPaginationSlot {
  content: ReactNode;
  placement?: "top" | "bottom" | "both";
}

/** Props every route content container (markdown, HTML, video, audio) takes for its frame. */
export interface RouteContainerFrameProps {
  pagination?: ContainerPaginationSlot;
  config?: ContentTypeRouteConfig;
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  browseNav?: BrowseNavConfig;
  /** Called when fullscreen is about to open (for URL sync) */
  onFullscreenOpen?: () => void;
  /** Called when fullscreen is about to close (for URL sync) */
  onFullscreenClose?: () => void;
}

export interface ContainerWrapperFrameProps {
  pagination?: ContainerPaginationSlot;
  fullscreenEnabled: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  onBeforeFullscreen?: () => void;
  onAfterFullscreen?: () => void;
  marginTop?: string;
  marginBottom?: string;
  browseNav?: BrowseNavConfig;
}

/** Maps a container's frame props onto `ContentContainerWrapper`. */
export function toContainerWrapperProps(props: RouteContainerFrameProps): ContainerWrapperFrameProps {
  return {
    pagination: props.pagination,
    fullscreenEnabled: props.fullscreenEnabled ?? false,
    fullscreenCloseLabel: props.fullscreenCloseLabel,
    fullscreenExpandLabel: props.fullscreenExpandLabel,
    onBeforeFullscreen: props.onFullscreenOpen,
    onAfterFullscreen: props.onFullscreenClose,
    marginTop: props.config?.marginTop,
    marginBottom: props.config?.marginBottom,
    browseNav: props.browseNav,
  };
}
