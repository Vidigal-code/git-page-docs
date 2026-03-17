import type { CSSProperties } from "react";
import { resolveIconPath } from "./resolve-icon-path";

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

const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/256/25/25231.png";

function resolveIconFromSite(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string,
  lightKey: keyof NavMenuIconConfigInput,
  darkKey: keyof NavMenuIconConfigInput,
  useReactKey: keyof NavMenuIconConfigInput,
  tagKey: keyof NavMenuIconConfigInput,
  colorDarkKey: keyof NavMenuIconConfigInput,
  colorLightKey: keyof NavMenuIconConfigInput,
  sizeKey: keyof NavMenuIconConfigInput,
  widthKey: keyof NavMenuIconConfigInput,
  heightKey: keyof NavMenuIconConfigInput,
  fallbackTag: string,
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
  const rawIconImage =
    mode === "dark"
      ? (site[darkKey] as string)?.trim()
      : (site[lightKey] as string)?.trim();
  const iconImage = resolveIconPath(rawIconImage || DEFAULT_IMG, basePath);
  const useReactIcon = Boolean(site[useReactKey]);
  const reactIconTag = (site[tagKey] as string) || fallbackTag;
  const reactIconColor =
    mode === "dark"
      ? (site[colorDarkKey] as string)?.trim()
      : (site[colorLightKey] as string)?.trim();
  const reactIconSize = (site[sizeKey] as string)?.trim();
  const reactIconStyle: CSSProperties = {
    color: reactIconColor || undefined,
    fontSize: reactIconSize || undefined,
  };
  const iconImgWidth = Number(site[widthKey]) || 20;
  const iconImgHeight = Number(site[heightKey]) || 20;
  return {
    iconImage,
    useReactIcon,
    reactIconTag,
    reactIconStyle,
    iconImgWidth,
    iconImgHeight,
  };
}

export function resolveNavMenuOpenIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  return resolveIconFromSite(
    site,
    mode,
    basePath,
    "IconNavMenuOpenLightImg",
    "IconNavMenuOpenDarkImg",
    "IconNavMenuOpenReactIcones",
    "IconNavMenuOpenReactIconesTag",
    "IconNavMenuOpenReactIconesTagColorDark",
    "IconNavMenuOpenReactIconesTagColorLight",
    "IconNavMenuOpenReactIconesTagSize",
    "IconNavMenuOpenImgWidth",
    "IconNavMenuOpenImgHeight",
    "FaBars",
  );
}

export function resolveNavMenuCloseIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  return resolveIconFromSite(
    site,
    mode,
    basePath,
    "IconNavMenuCloseLightImg",
    "IconNavMenuCloseDarkImg",
    "IconNavMenuCloseReactIcones",
    "IconNavMenuCloseReactIconesTag",
    "IconNavMenuCloseReactIconesTagColorDark",
    "IconNavMenuCloseReactIconesTagColorLight",
    "IconNavMenuCloseReactIconesTagSize",
    "IconNavMenuCloseImgWidth",
    "IconNavMenuCloseImgHeight",
    "IoClose",
  );
}

function hasMobileOpenConfig(site: NavMenuIconConfigInput | undefined): boolean {
  if (!site) return false;
  return Boolean(
    site.IconNavMenuMobileOpenLightImg?.trim() ||
      site.IconNavMenuMobileOpenDarkImg?.trim() ||
      site.IconNavMenuMobileOpenReactIcones ||
      site.IconNavMenuMobileOpenReactIconesTag?.trim()
  );
}

export function resolveNavMenuMobileOpenIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  if (hasMobileOpenConfig(site)) {
    return resolveIconFromSite(
      site,
      mode,
      basePath,
      "IconNavMenuMobileOpenLightImg",
      "IconNavMenuMobileOpenDarkImg",
      "IconNavMenuMobileOpenReactIcones",
      "IconNavMenuMobileOpenReactIconesTag",
      "IconNavMenuMobileOpenReactIconesTagColorDark",
      "IconNavMenuMobileOpenReactIconesTagColorLight",
      "IconNavMenuMobileOpenReactIconesTagSize",
      "IconNavMenuMobileOpenImgWidth",
      "IconNavMenuMobileOpenImgHeight",
      "FaBars",
    );
  }
  return resolveNavMenuOpenIconConfig(site, mode, basePath);
}

function hasMobileCloseConfig(site: NavMenuIconConfigInput | undefined): boolean {
  if (!site) return false;
  return Boolean(
    site.IconNavMenuMobileCloseLightImg?.trim() ||
      site.IconNavMenuMobileCloseDarkImg?.trim() ||
      site.IconNavMenuMobileCloseReactIcones ||
      site.IconNavMenuMobileCloseReactIconesTag?.trim()
  );
}

export function resolveNavMenuMobileCloseIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  if (hasMobileCloseConfig(site)) {
    return resolveIconFromSite(
      site,
      mode,
      basePath,
      "IconNavMenuMobileCloseLightImg",
      "IconNavMenuMobileCloseDarkImg",
      "IconNavMenuMobileCloseReactIcones",
      "IconNavMenuMobileCloseReactIconesTag",
      "IconNavMenuMobileCloseReactIconesTagColorDark",
      "IconNavMenuMobileCloseReactIconesTagColorLight",
      "IconNavMenuMobileCloseReactIconesTagSize",
      "IconNavMenuMobileCloseImgWidth",
      "IconNavMenuMobileCloseImgHeight",
      "IoClose",
    );
  }
  return resolveNavMenuCloseIconConfig(site, mode, basePath);
}

export function resolveNavMenuBlockActiveIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  return resolveIconFromSite(
    site,
    mode,
    basePath,
    "IconNavMenuBlockActiveLightImg",
    "IconNavMenuBlockActiveDarkImg",
    "IconNavMenuBlockActiveReactIcones",
    "IconNavMenuBlockActiveReactIconesTag",
    "IconNavMenuBlockActiveReactIconesTagColorDark",
    "IconNavMenuBlockActiveReactIconesTagColorLight",
    "IconNavMenuBlockActiveReactIconesTagSize",
    "IconNavMenuBlockActiveImgWidth",
    "IconNavMenuBlockActiveImgHeight",
    "FiLock",
  );
}

export function resolveNavMenuBlockInactiveIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedNavMenuIconConfig {
  return resolveIconFromSite(
    site,
    mode,
    basePath,
    "IconNavMenuBlockInactiveLightImg",
    "IconNavMenuBlockInactiveDarkImg",
    "IconNavMenuBlockInactiveReactIcones",
    "IconNavMenuBlockInactiveReactIconesTag",
    "IconNavMenuBlockInactiveReactIconesTagColorDark",
    "IconNavMenuBlockInactiveReactIconesTagColorLight",
    "IconNavMenuBlockInactiveReactIconesTagSize",
    "IconNavMenuBlockInactiveImgWidth",
    "IconNavMenuBlockInactiveImgHeight",
    "FiUnlock",
  );
}
