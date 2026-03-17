import type { CSSProperties } from "react";
import { resolveIconPath } from "./resolve-icon-path";

export const FALLBACK_HEADER_NAME = "Git Pages Docs";

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

export function resolveHeaderName(
  siteHeaderName: string | undefined,
  siteName: string | undefined
): string {
  const header = siteHeaderName?.trim() || siteName?.trim();
  return header || FALLBACK_HEADER_NAME;
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
