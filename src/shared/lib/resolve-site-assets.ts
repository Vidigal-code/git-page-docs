import type { CSSProperties } from "react";

export const FALLBACK_HEADER_NAME = "Git Pages Docs";
export const FALLBACK_ICON_PATH = "/icon.svg";

/** Minimal config shape for header icon resolution (SiteConfig satisfies this) */
export interface HeaderIconConfigInput {
  SiteHeaderName?: string;
  name?: string;
  SiteIconPath?: string;
  IconImageMenuHeader?: string;
  IconImageMenuHeaderLightImg?: string;
  IconImageMenuHeaderDarkImg?: string;
  IconImageMenuHeaderLight?: string;
  IconImageMenuHeaderDark?: string;
  IconImageMenuHeaderReactIcones?: boolean;
  IconImageMenuHeaderReactIconesTag?: string;
  IconImageMenuHeaderReactIconesTagColorDark?: string;
  IconImageMenuHeaderReactIconesTagColorLight?: string;
  IconImageMenuHeaderReactIconesTagSize?: string;
  IconImageMenuHeaderImgWidth?: string | number;
  IconImageMenuHeaderImgHeight?: string | number;
}

export interface ResolvedHeaderIconConfig {
  iconImage: string;
  headerName: string;
  useReactIcon: boolean;
  reactIconTag: string | undefined;
  reactIconStyle: CSSProperties;
  iconImgWidth: number;
  iconImgHeight: number;
}

/**
 * Resolves header icon, name, and React icon config from site config.
 */
export function resolveHeaderIconConfig(
  site: HeaderIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string
): ResolvedHeaderIconConfig {
  const headerName = resolveHeaderName(site?.SiteHeaderName, site?.name);
  if (!site) {
    return {
      iconImage: resolveIconPath(undefined, basePath),
      headerName,
      useReactIcon: false,
      reactIconTag: undefined,
      reactIconStyle: {},
      iconImgWidth: 20,
      iconImgHeight: 20,
    };
  }
  const rawIconImage =
    (mode === "dark"
      ? site.IconImageMenuHeaderDarkImg?.trim() || site.IconImageMenuHeaderDark?.trim()
      : site.IconImageMenuHeaderLightImg?.trim() || site.IconImageMenuHeaderLight?.trim()) ||
    site.IconImageMenuHeader?.trim() ||
    site.SiteIconPath?.trim();
  const iconImage = resolveIconPath(rawIconImage, basePath);
  const useReactIcon = Boolean(site.IconImageMenuHeaderReactIcones);
  const reactIconTag = site.IconImageMenuHeaderReactIconesTag;
  const reactIconColor =
    mode === "dark"
      ? site.IconImageMenuHeaderReactIconesTagColorDark
      : site.IconImageMenuHeaderReactIconesTagColorLight;
  const reactIconSize = site.IconImageMenuHeaderReactIconesTagSize;
  const reactIconStyle: CSSProperties = {
    color: reactIconColor?.trim() || undefined,
    fontSize: reactIconSize?.trim() || undefined,
  };
  const iconImgWidth = Number(site.IconImageMenuHeaderImgWidth) || 20;
  const iconImgHeight = Number(site.IconImageMenuHeaderImgHeight) || 20;
  return {
    iconImage,
    headerName,
    useReactIcon,
    reactIconTag,
    reactIconStyle,
    iconImgWidth,
    iconImgHeight,
  };
}

/**
 * Resolves the icon path for use in headers and metadata.
 * SiteIconPath like "gitpagedocs/icon.svg" is not served in static export;
 * we use the fallback (public/icon.svg) which is deployed at /icon.svg or {basePath}/icon.svg.
 */
export function resolveIconPath(siteIconPath: string | undefined, basePath: string): string {
  const trimmed = siteIconPath?.trim();
  if (!trimmed) {
    return basePath ? `${basePath}${FALLBACK_ICON_PATH}` : FALLBACK_ICON_PATH;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed === FALLBACK_ICON_PATH || trimmed === "/icon.svg") {
    return basePath ? `${basePath}${FALLBACK_ICON_PATH}` : trimmed;
  }
  return basePath ? `${basePath}${FALLBACK_ICON_PATH}` : FALLBACK_ICON_PATH;
}

/**
 * Resolves the site header name with fallback.
 */
export function resolveHeaderName(
  siteHeaderName: string | undefined,
  siteName: string | undefined
): string {
  const header = siteHeaderName?.trim() || siteName?.trim();
  return header || FALLBACK_HEADER_NAME;
}
