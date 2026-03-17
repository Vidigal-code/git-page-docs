import type { CSSProperties } from "react";
import { resolveIconPath } from "./resolve-icon-path";

/** Config for Route Guide breadcrumb icon (SiteConfig satisfies this) */
export interface RouteGuideIconConfigInput {
  IconRouteGuideLightImg?: string;
  IconRouteGuideDarkImg?: string;
  IconRouteGuideReactIcones?: boolean;
  IconRouteGuideReactIconesTag?: string;
  IconRouteGuideReactIconesTagColorDark?: string;
  IconRouteGuideReactIconesTagColorLight?: string;
  IconRouteGuideReactIconesTagSize?: string;
  IconRouteGuideImgWidth?: number;
  IconRouteGuideImgHeight?: number;
}

export interface ResolvedRouteGuideIconConfig {
  iconImage: string;
  useReactIcon: boolean;
  reactIconTag: string | undefined;
  reactIconStyle: CSSProperties;
  iconImgWidth: number;
  iconImgHeight: number;
}

export function resolveRouteGuideIconConfig(
  site: RouteGuideIconConfigInput | undefined,
  isDarkMode: boolean,
  basePath: string
): ResolvedRouteGuideIconConfig {
  if (!site) {
    return {
      iconImage: resolveIconPath(undefined, basePath),
      useReactIcon: false,
      reactIconTag: undefined,
      reactIconStyle: {},
      iconImgWidth: 20,
      iconImgHeight: 20,
    };
  }
  const rawIconImage = isDarkMode
    ? site.IconRouteGuideDarkImg?.trim()
    : site.IconRouteGuideLightImg?.trim();
  const iconImage = rawIconImage?.startsWith("http")
    ? rawIconImage
    : resolveIconPath(undefined, basePath);
  const useReactIcon = Boolean(site.IconRouteGuideReactIcones);
  const reactIconTag = site.IconRouteGuideReactIconesTag;
  const reactIconColor = isDarkMode
    ? site.IconRouteGuideReactIconesTagColorDark
    : site.IconRouteGuideReactIconesTagColorLight;
  const reactIconStyle: CSSProperties = {
    color: reactIconColor?.trim() || undefined,
    fontSize: site.IconRouteGuideReactIconesTagSize?.trim() || undefined,
  };
  const iconImgWidth = site.IconRouteGuideImgWidth ?? 20;
  const iconImgHeight = site.IconRouteGuideImgHeight ?? 20;
  return {
    iconImage,
    useReactIcon,
    reactIconTag,
    reactIconStyle,
    iconImgWidth,
    iconImgHeight,
  };
}
