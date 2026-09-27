import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { BsMoonStarsFill, BsSunFill } from "@/shared/ui/fallback-icons";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";

interface ConfiguredIconProps {
  /** Resolved icon config; `undefined` renders `fallback`. */
  icon: ResolvedNavMenuIconConfig | undefined;
  /** Rendered when the config carries neither a react icon nor an image. */
  fallback: ReactNode;
  /** Shown by the react icon slot until (or unless) its tag resolves. */
  reactIconFallback?: ReactNode;
  /** Tag used when the config's react icon tag is empty. */
  defaultTag?: string;
  alt?: string;
  imageClassName?: string;
}

/**
 * Renders a resolved nav-menu icon config: the configured react icon, else the
 * configured image, else `fallback`.
 */
export function ConfiguredIcon({
  icon,
  fallback,
  reactIconFallback,
  defaultTag,
  alt = "",
  imageClassName,
}: Readonly<ConfiguredIconProps>) {
  if (icon?.useReactIcon) {
    const tag = defaultTag && !icon.reactIconTag ? defaultTag : icon.reactIconTag;
    return (
      <span style={icon.reactIconStyle}>
        <ReactIconByTag tag={tag} style={icon.reactIconStyle} fallback={reactIconFallback} />
      </span>
    );
  }
  if (icon?.iconImage) {
    return (
      <Image
        src={icon.iconImage}
        alt={alt}
        width={icon.iconImgWidth}
        height={icon.iconImgHeight}
        className={imageClassName}
        unoptimized
      />
    );
  }
  return <>{fallback}</>;
}

interface DocsShellBrandIconProps {
  useReactIcon: boolean;
  reactIconTag: string | undefined;
  reactIconStyle: CSSProperties;
  activeLayoutMode: "dark" | "light" | undefined;
  iconImage: string | undefined;
  iconImgWidth: number;
  iconImgHeight: number;
  alt: string;
  reactIconClassName: string;
  imageClassName: string;
}

/**
 * Site brand icon of the header and sidebar: the configured react icon (moon or
 * sun while its tag resolves, by theme mode), else the configured image, else
 * nothing.
 */
export function DocsShellBrandIcon({
  useReactIcon,
  reactIconTag,
  reactIconStyle,
  activeLayoutMode,
  iconImage,
  iconImgWidth,
  iconImgHeight,
  alt,
  reactIconClassName,
  imageClassName,
}: Readonly<DocsShellBrandIconProps>) {
  if (useReactIcon) {
    return (
      <span className={reactIconClassName} style={reactIconStyle}>
        <ReactIconByTag
          tag={reactIconTag}
          fallback={activeLayoutMode === "dark" ? <BsMoonStarsFill aria-hidden /> : <BsSunFill aria-hidden />}
        />
      </span>
    );
  }
  if (iconImage) {
    return <Image src={iconImage} alt={alt} width={iconImgWidth} height={iconImgHeight} className={imageClassName} unoptimized />;
  }
  return null;
}
