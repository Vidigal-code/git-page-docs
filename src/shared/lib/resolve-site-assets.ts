/** Barrel: re-exports from split modules for backward compatibility */

export {
  FALLBACK_ICON_PATH,
  resolveIconPath,
} from "./resolve-icon-path";
export {
  FALLBACK_HEADER_NAME,
  resolveHeaderName,
  resolveHeaderIconConfig,
  type HeaderIconConfigInput,
  type ResolvedHeaderIconConfig,
} from "./resolve-header-icon";
export {
  resolveRouteGuideIconConfig,
  type RouteGuideIconConfigInput,
  type ResolvedRouteGuideIconConfig,
} from "./resolve-route-guide-icon";
export {
  resolveNavMenuOpenIconConfig,
  resolveNavMenuCloseIconConfig,
  resolveNavMenuMobileOpenIconConfig,
  resolveNavMenuMobileCloseIconConfig,
  resolveNavMenuBlockActiveIconConfig,
  resolveNavMenuBlockInactiveIconConfig,
  type NavMenuIconConfigInput,
  type ResolvedNavMenuIconConfig,
} from "./resolve-nav-menu-icon";
export {
  resolveAudioPlayerPopoverCloseIconConfig,
  type AudioPlayerPopoverCloseIconConfigInput,
} from "./resolve-audio-popover-close-icon";
export {
  resolveAudioPlayerPopoverPlayIconConfig,
  resolveAudioPlayerPopoverPauseIconConfig,
  resolveAudioPlayerPopoverRestartIconConfig,
  resolveAudioPlayerPopoverLoopOnIconConfig,
  resolveAudioPlayerPopoverLoopOffIconConfig,
} from "./resolve-audio-popover-icons";
