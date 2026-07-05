"use client";

import Image from "next/image";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";

export function renderAudioControlIcon(
  icon: ResolvedNavMenuIconConfig | undefined,
  fallback: React.ReactNode,
) {
  if (!icon) return fallback;

  if (icon.useReactIcon) {
    return (
      <span style={icon.reactIconStyle}>
        <ReactIconByTag tag={icon.reactIconTag} style={icon.reactIconStyle} fallback={fallback} ariaHidden />
      </span>
    );
  }

  if (icon.iconImage) {
    return (
      <Image
        src={icon.iconImage}
        alt=""
        width={icon.iconImgWidth}
        height={icon.iconImgHeight}
        unoptimized
      />
    );
  }

  return fallback;
}
