import type { CSSProperties } from "react";
import { resolveIconPath } from "../resolve-icon-path";
import type { ResolvedNavMenuIconConfig } from "../nav-menu/resolve-nav-menu-icon";

export interface AudioPlayerPopoverCloseIconConfigInput {
  IconAudioPlayerPopoverCloseLightImg?: string;
  IconAudioPlayerPopoverCloseDarkImg?: string;
  IconAudioPlayerPopoverCloseReactIcones?: boolean;
  IconAudioPlayerPopoverCloseReactIconesTag?: string;
  IconAudioPlayerPopoverCloseReactIconesTagColorDark?: string;
  IconAudioPlayerPopoverCloseReactIconesTagColorLight?: string;
  IconAudioPlayerPopoverCloseReactIconesTagSize?: string;
  IconAudioPlayerPopoverCloseImgWidth?: string | number;
  IconAudioPlayerPopoverCloseImgHeight?: string | number;
}

const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/256/25/25231.png";
const FALLBACK_TAG = "IoClose";

export function resolveAudioPlayerPopoverCloseIconConfig(
  site: AudioPlayerPopoverCloseIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  if (!site) {
    return {
      iconImage: resolveIconPath(DEFAULT_IMG, basePath),
      useReactIcon: true,
      reactIconTag: FALLBACK_TAG,
      reactIconStyle: {},
      iconImgWidth: 20,
      iconImgHeight: 20,
    };
  }
  const rawIconImage =
    mode === "dark"
      ? site.IconAudioPlayerPopoverCloseDarkImg?.trim()
      : site.IconAudioPlayerPopoverCloseLightImg?.trim();
  const iconImage = resolveIconPath(rawIconImage || DEFAULT_IMG, basePath);
  const useReactIcon = Boolean(site.IconAudioPlayerPopoverCloseReactIcones);
  const reactIconTag = site.IconAudioPlayerPopoverCloseReactIconesTag?.trim() || FALLBACK_TAG;
  const reactIconColor =
    mode === "dark"
      ? site.IconAudioPlayerPopoverCloseReactIconesTagColorDark?.trim()
      : site.IconAudioPlayerPopoverCloseReactIconesTagColorLight?.trim();
  const reactIconSize = site.IconAudioPlayerPopoverCloseReactIconesTagSize?.trim();
  const reactIconStyle: CSSProperties = {
    color: reactIconColor || undefined,
    fontSize: reactIconSize || undefined,
  };
  const iconImgWidth = Number(site.IconAudioPlayerPopoverCloseImgWidth) || 20;
  const iconImgHeight = Number(site.IconAudioPlayerPopoverCloseImgHeight) || 20;
  return {
    iconImage,
    useReactIcon,
    reactIconTag,
    reactIconStyle,
    iconImgWidth,
    iconImgHeight,
  };
}
