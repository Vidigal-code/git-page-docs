import type { CSSProperties } from "react";
import { resolveIconPath } from "../resolve-icon-path";
import type { IconConfigFields } from "../icon-config-fields";

export const FALLBACK_HEADER_NAME = "Git Page Docs";

/** Minimal config shape for header icon resolution (SiteConfig satisfies this) */
export interface HeaderIconConfigInput extends IconConfigFields<"ImageMenuHeader"> {
  SiteHeaderName?: string;
  name?: string;
  SiteIconPath?: string;
  IconImageMenuHeader?: string;
  IconImageMenuHeaderLight?: string;
  IconImageMenuHeaderDark?: string;
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
      useReactIcon: true,
      reactIconTag: "FaGithubAlt",
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
  const useReactIcon = (site.IconImageMenuHeaderReactIcones ?? !rawIconImage);
  const reactIconTag = site.IconImageMenuHeaderReactIconesTag || "FaGithubAlt";
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
