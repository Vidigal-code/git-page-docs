import type { CSSProperties } from "react";
import { resolveIconPath } from "../resolve-icon-path";

/** Minimal config shape for nav menu icon resolution */
export interface NavMenuIconConfigInput {
  IconNavMenuOpenLightImg?: string;
  IconNavMenuOpenDarkImg?: string;
  IconNavMenuOpenReactIcones?: boolean;
  IconNavMenuOpenReactIconesTag?: string;
  IconNavMenuOpenReactIconesTagColorDark?: string;
  IconNavMenuOpenReactIconesTagColorLight?: string;
  IconNavMenuOpenReactIconesTagSize?: string;
  IconNavMenuOpenImgWidth?: string | number;
  IconNavMenuOpenImgHeight?: string | number;
  IconNavMenuCloseLightImg?: string;
  IconNavMenuCloseDarkImg?: string;
  IconNavMenuCloseReactIcones?: boolean;
  IconNavMenuCloseReactIconesTag?: string;
  IconNavMenuCloseReactIconesTagColorDark?: string;
  IconNavMenuCloseReactIconesTagColorLight?: string;
  IconNavMenuCloseReactIconesTagSize?: string;
  IconNavMenuCloseImgWidth?: string | number;
  IconNavMenuCloseImgHeight?: string | number;
  IconNavMenuMobileCloseLightImg?: string;
  IconNavMenuMobileCloseDarkImg?: string;
  IconNavMenuMobileCloseReactIcones?: boolean;
  IconNavMenuMobileCloseReactIconesTag?: string;
  IconNavMenuMobileCloseReactIconesTagColorDark?: string;
  IconNavMenuMobileCloseReactIconesTagColorLight?: string;
  IconNavMenuMobileCloseReactIconesTagSize?: string;
  IconNavMenuMobileCloseImgWidth?: string | number;
  IconNavMenuMobileCloseImgHeight?: string | number;
  IconNavMenuMobileOpenLightImg?: string;
  IconNavMenuMobileOpenDarkImg?: string;
  IconNavMenuMobileOpenReactIcones?: boolean;
  IconNavMenuMobileOpenReactIconesTag?: string;
  IconNavMenuMobileOpenReactIconesTagColorDark?: string;
  IconNavMenuMobileOpenReactIconesTagColorLight?: string;
  IconNavMenuMobileOpenReactIconesTagSize?: string;
  IconNavMenuMobileOpenImgWidth?: string | number;
  IconNavMenuMobileOpenImgHeight?: string | number;
  IconNavMenuBlockActiveLightImg?: string;
  IconNavMenuBlockActiveDarkImg?: string;
  IconNavMenuBlockActiveReactIcones?: boolean;
  IconNavMenuBlockActiveReactIconesTag?: string;
  IconNavMenuBlockActiveReactIconesTagColorDark?: string;
  IconNavMenuBlockActiveReactIconesTagColorLight?: string;
  IconNavMenuBlockActiveReactIconesTagSize?: string;
  IconNavMenuBlockActiveImgWidth?: string | number;
  IconNavMenuBlockActiveImgHeight?: string | number;
  IconNavMenuBlockInactiveLightImg?: string;
  IconNavMenuBlockInactiveDarkImg?: string;
  IconNavMenuBlockInactiveReactIcones?: boolean;
  IconNavMenuBlockInactiveReactIconesTag?: string;
  IconNavMenuBlockInactiveReactIconesTagColorDark?: string;
  IconNavMenuBlockInactiveReactIconesTagColorLight?: string;
  IconNavMenuBlockInactiveReactIconesTagSize?: string;
  IconNavMenuBlockInactiveImgWidth?: string | number;
  IconNavMenuBlockInactiveImgHeight?: string | number;
}

export interface ResolvedNavMenuIconConfig {
  iconImage: string;
  useReactIcon: boolean;
  reactIconTag: string | undefined;
  reactIconStyle: CSSProperties;
  iconImgWidth: number;
  iconImgHeight: number;
}

type KeyOfConfig = keyof NavMenuIconConfigInput;

export interface NavMenuIconKeysConfig {
  lightKey: KeyOfConfig;
  darkKey: KeyOfConfig;
  useReactKey: KeyOfConfig;
  tagKey: KeyOfConfig;
  colorDarkKey: KeyOfConfig;
  colorLightKey: KeyOfConfig;
  sizeKey: KeyOfConfig;
  widthKey: KeyOfConfig;
  heightKey: KeyOfConfig;
  fallbackTag: string;
}

const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/256/25/25231.png";

const NAV_MENU_ICON_KEYS: Record<string, NavMenuIconKeysConfig> = {
  open: {
    lightKey: "IconNavMenuOpenLightImg",
    darkKey: "IconNavMenuOpenDarkImg",
    useReactKey: "IconNavMenuOpenReactIcones",
    tagKey: "IconNavMenuOpenReactIconesTag",
    colorDarkKey: "IconNavMenuOpenReactIconesTagColorDark",
    colorLightKey: "IconNavMenuOpenReactIconesTagColorLight",
    sizeKey: "IconNavMenuOpenReactIconesTagSize",
    widthKey: "IconNavMenuOpenImgWidth",
    heightKey: "IconNavMenuOpenImgHeight",
    fallbackTag: "FaBars",
  },
  close: {
    lightKey: "IconNavMenuCloseLightImg",
    darkKey: "IconNavMenuCloseDarkImg",
    useReactKey: "IconNavMenuCloseReactIcones",
    tagKey: "IconNavMenuCloseReactIconesTag",
    colorDarkKey: "IconNavMenuCloseReactIconesTagColorDark",
    colorLightKey: "IconNavMenuCloseReactIconesTagColorLight",
    sizeKey: "IconNavMenuCloseReactIconesTagSize",
    widthKey: "IconNavMenuCloseImgWidth",
    heightKey: "IconNavMenuCloseImgHeight",
    fallbackTag: "IoClose",
  },
  mobileOpen: {
    lightKey: "IconNavMenuMobileOpenLightImg",
    darkKey: "IconNavMenuMobileOpenDarkImg",
    useReactKey: "IconNavMenuMobileOpenReactIcones",
    tagKey: "IconNavMenuMobileOpenReactIconesTag",
    colorDarkKey: "IconNavMenuMobileOpenReactIconesTagColorDark",
    colorLightKey: "IconNavMenuMobileOpenReactIconesTagColorLight",
    sizeKey: "IconNavMenuMobileOpenReactIconesTagSize",
    widthKey: "IconNavMenuMobileOpenImgWidth",
    heightKey: "IconNavMenuMobileOpenImgHeight",
    fallbackTag: "FaBars",
  },
  mobileClose: {
    lightKey: "IconNavMenuMobileCloseLightImg",
    darkKey: "IconNavMenuMobileCloseDarkImg",
    useReactKey: "IconNavMenuMobileCloseReactIcones",
    tagKey: "IconNavMenuMobileCloseReactIconesTag",
    colorDarkKey: "IconNavMenuMobileCloseReactIconesTagColorDark",
    colorLightKey: "IconNavMenuMobileCloseReactIconesTagColorLight",
    sizeKey: "IconNavMenuMobileCloseReactIconesTagSize",
    widthKey: "IconNavMenuMobileCloseImgWidth",
    heightKey: "IconNavMenuMobileCloseImgHeight",
    fallbackTag: "IoClose",
  },
  blockActive: {
    lightKey: "IconNavMenuBlockActiveLightImg",
    darkKey: "IconNavMenuBlockActiveDarkImg",
    useReactKey: "IconNavMenuBlockActiveReactIcones",
    tagKey: "IconNavMenuBlockActiveReactIconesTag",
    colorDarkKey: "IconNavMenuBlockActiveReactIconesTagColorDark",
    colorLightKey: "IconNavMenuBlockActiveReactIconesTagColorLight",
    sizeKey: "IconNavMenuBlockActiveReactIconesTagSize",
    widthKey: "IconNavMenuBlockActiveImgWidth",
    heightKey: "IconNavMenuBlockActiveImgHeight",
    fallbackTag: "FiLock",
  },
  blockInactive: {
    lightKey: "IconNavMenuBlockInactiveLightImg",
    darkKey: "IconNavMenuBlockInactiveDarkImg",
    useReactKey: "IconNavMenuBlockInactiveReactIcones",
    tagKey: "IconNavMenuBlockInactiveReactIconesTag",
    colorDarkKey: "IconNavMenuBlockInactiveReactIconesTagColorDark",
    colorLightKey: "IconNavMenuBlockInactiveReactIconesTagColorLight",
    sizeKey: "IconNavMenuBlockInactiveReactIconesTagSize",
    widthKey: "IconNavMenuBlockInactiveImgWidth",
    heightKey: "IconNavMenuBlockInactiveImgHeight",
    fallbackTag: "FiUnlock",
  },
};

function resolveIconFromKeys(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string,
  keys: NavMenuIconKeysConfig,
): ResolvedNavMenuIconConfig {
  if (!site) {
    return {
      iconImage: resolveIconPath(DEFAULT_IMG, basePath),
      useReactIcon: true,
      reactIconTag: keys.fallbackTag,
      reactIconStyle: {},
      iconImgWidth: 20,
      iconImgHeight: 20,
    };
  }
  const rawIconImage =
    mode === "dark"
      ? (site[keys.darkKey] as string)?.trim()
      : (site[keys.lightKey] as string)?.trim();
  const iconImage = resolveIconPath(rawIconImage || DEFAULT_IMG, basePath);
  const useReactIcon = Boolean(site[keys.useReactKey]);
  const reactIconTag = (site[keys.tagKey] as string) || keys.fallbackTag;
  const reactIconColor =
    mode === "dark"
      ? (site[keys.colorDarkKey] as string)?.trim()
      : (site[keys.colorLightKey] as string)?.trim();
  const reactIconSize = (site[keys.sizeKey] as string)?.trim();
  const reactIconStyle: CSSProperties = {
    color: reactIconColor || undefined,
    fontSize: reactIconSize || undefined,
  };
  const iconImgWidth = Number(site[keys.widthKey]) || 20;
  const iconImgHeight = Number(site[keys.heightKey]) || 20;
  return {
    iconImage,
    useReactIcon,
    reactIconTag,
    reactIconStyle,
    iconImgWidth,
    iconImgHeight,
  };
}

export type NavMenuIconKey = keyof typeof NAV_MENU_ICON_KEYS;

export function createNavMenuIconResolver(iconKey: NavMenuIconKey) {
  const keys = NAV_MENU_ICON_KEYS[iconKey];
  if (!keys) {
    throw new Error(`Unknown nav menu icon key: ${iconKey}`);
  }
  return (
    site: NavMenuIconConfigInput | undefined,
    mode: "dark" | "light",
    basePath: string,
  ): ResolvedNavMenuIconConfig => resolveIconFromKeys(site, mode, basePath, keys);
}

export function hasNavMenuIconConfig(
  site: NavMenuIconConfigInput | undefined,
  iconKey: "mobileOpen" | "mobileClose",
): boolean {
  if (!site) return false;
  const keys = NAV_MENU_ICON_KEYS[iconKey];
  return Boolean(
    (site[keys.lightKey] as string)?.trim() ||
      (site[keys.darkKey] as string)?.trim() ||
      site[keys.useReactKey] ||
      (site[keys.tagKey] as string)?.trim(),
  );
}
