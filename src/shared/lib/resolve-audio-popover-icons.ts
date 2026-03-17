import type { CSSProperties } from "react";
import { resolveIconPath } from "./resolve-icon-path";
import type { ResolvedNavMenuIconConfig } from "./resolve-nav-menu-icon";

const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/256/25/25231.png";

type IconKeyPrefix =
  | "IconAudioPlayerPopoverPlay"
  | "IconAudioPlayerPopoverPause"
  | "IconAudioPlayerPopoverRestart"
  | "IconAudioPlayerPopoverLoopOn"
  | "IconAudioPlayerPopoverLoopOff";

/** Input for audio popover icon resolution; accepts site config or partial overlay */
export interface AudioPlayerPopoverIconsConfigInput {
  IconAudioPlayerPopoverPlayLightImg?: string;
  IconAudioPlayerPopoverPlayDarkImg?: string;
  IconAudioPlayerPopoverPlayReactIcones?: boolean;
  IconAudioPlayerPopoverPlayReactIconesTag?: string;
  IconAudioPlayerPopoverPlayReactIconesTagColorDark?: string;
  IconAudioPlayerPopoverPlayReactIconesTagColorLight?: string;
  IconAudioPlayerPopoverPlayReactIconesTagSize?: string;
  IconAudioPlayerPopoverPlayImgWidth?: string | number;
  IconAudioPlayerPopoverPlayImgHeight?: string | number;
  IconAudioPlayerPopoverPauseLightImg?: string;
  IconAudioPlayerPopoverPauseDarkImg?: string;
  IconAudioPlayerPopoverPauseReactIcones?: boolean;
  IconAudioPlayerPopoverPauseReactIconesTag?: string;
  IconAudioPlayerPopoverPauseReactIconesTagColorDark?: string;
  IconAudioPlayerPopoverPauseReactIconesTagColorLight?: string;
  IconAudioPlayerPopoverPauseReactIconesTagSize?: string;
  IconAudioPlayerPopoverPauseImgWidth?: string | number;
  IconAudioPlayerPopoverPauseImgHeight?: string | number;
  IconAudioPlayerPopoverRestartLightImg?: string;
  IconAudioPlayerPopoverRestartDarkImg?: string;
  IconAudioPlayerPopoverRestartReactIcones?: boolean;
  IconAudioPlayerPopoverRestartReactIconesTag?: string;
  IconAudioPlayerPopoverRestartReactIconesTagColorDark?: string;
  IconAudioPlayerPopoverRestartReactIconesTagColorLight?: string;
  IconAudioPlayerPopoverRestartReactIconesTagSize?: string;
  IconAudioPlayerPopoverRestartImgWidth?: string | number;
  IconAudioPlayerPopoverRestartImgHeight?: string | number;
  IconAudioPlayerPopoverLoopOnLightImg?: string;
  IconAudioPlayerPopoverLoopOnDarkImg?: string;
  IconAudioPlayerPopoverLoopOnReactIcones?: boolean;
  IconAudioPlayerPopoverLoopOnReactIconesTag?: string;
  IconAudioPlayerPopoverLoopOnReactIconesTagColorDark?: string;
  IconAudioPlayerPopoverLoopOnReactIconesTagColorLight?: string;
  IconAudioPlayerPopoverLoopOnReactIconesTagSize?: string;
  IconAudioPlayerPopoverLoopOnImgWidth?: string | number;
  IconAudioPlayerPopoverLoopOnImgHeight?: string | number;
  IconAudioPlayerPopoverLoopOffLightImg?: string;
  IconAudioPlayerPopoverLoopOffDarkImg?: string;
  IconAudioPlayerPopoverLoopOffReactIcones?: boolean;
  IconAudioPlayerPopoverLoopOffReactIconesTag?: string;
  IconAudioPlayerPopoverLoopOffReactIconesTagColorDark?: string;
  IconAudioPlayerPopoverLoopOffReactIconesTagColorLight?: string;
  IconAudioPlayerPopoverLoopOffReactIconesTagSize?: string;
  IconAudioPlayerPopoverLoopOffImgWidth?: string | number;
  IconAudioPlayerPopoverLoopOffImgHeight?: string | number;
}

function resolveAudioPopoverIcon(
  site: object | undefined,
  mode: "dark" | "light",
  basePath: string,
  prefix: IconKeyPrefix,
  fallbackTag: string
): ResolvedNavMenuIconConfig {
  if (!site) {
    return {
      iconImage: resolveIconPath(DEFAULT_IMG, basePath),
      useReactIcon: true,
      reactIconTag: fallbackTag,
      reactIconStyle: {},
      iconImgWidth: 20,
      iconImgHeight: 20,
    };
  }
  const s = site as Record<string, unknown>;
  const rawIconImage =
    mode === "dark"
      ? (s[`${prefix}DarkImg`] as string)?.trim()
      : (s[`${prefix}LightImg`] as string)?.trim();
  const iconImage = resolveIconPath(rawIconImage || DEFAULT_IMG, basePath);
  const useReactIcon = Boolean(s[`${prefix}ReactIcones`]);
  const reactIconTag = (s[`${prefix}ReactIconesTag`] as string)?.trim() || fallbackTag;
  const reactIconColor =
    mode === "dark"
      ? (s[`${prefix}ReactIconesTagColorDark`] as string)?.trim()
      : (s[`${prefix}ReactIconesTagColorLight`] as string)?.trim();
  const reactIconSize = (s[`${prefix}ReactIconesTagSize`] as string)?.trim();
  const reactIconStyle: CSSProperties = {
    color: reactIconColor || undefined,
    fontSize: reactIconSize || undefined,
  };
  const iconImgWidth = Number(s[`${prefix}ImgWidth`]) || 20;
  const iconImgHeight = Number(s[`${prefix}ImgHeight`]) || 20;
  return {
    iconImage,
    useReactIcon,
    reactIconTag,
    reactIconStyle,
    iconImgWidth,
    iconImgHeight,
  };
}

export function resolveAudioPlayerPopoverPlayIconConfig(
  site: object | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  return resolveAudioPopoverIcon(site, mode, basePath, "IconAudioPlayerPopoverPlay", "CiPlay1");
}

export function resolveAudioPlayerPopoverPauseIconConfig(
  site: object | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  return resolveAudioPopoverIcon(site, mode, basePath, "IconAudioPlayerPopoverPause", "FaPause");
}

export function resolveAudioPlayerPopoverRestartIconConfig(
  site: object | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  return resolveAudioPopoverIcon(site, mode, basePath, "IconAudioPlayerPopoverRestart", "IoReload");
}

export function resolveAudioPlayerPopoverLoopOnIconConfig(
  site: object | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  return resolveAudioPopoverIcon(site, mode, basePath, "IconAudioPlayerPopoverLoopOn", "FiRepeat");
}

export function resolveAudioPlayerPopoverLoopOffIconConfig(
  site: object | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  return resolveAudioPopoverIcon(site, mode, basePath, "IconAudioPlayerPopoverLoopOff", "FiRepeat");
}
