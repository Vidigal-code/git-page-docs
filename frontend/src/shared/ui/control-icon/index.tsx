"use client";

import type { CSSProperties, ReactNode } from "react";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";

export interface ControlIconConfig {
  tag: string;
  style: CSSProperties;
}

interface ControlIconProps {
  icon: ControlIconConfig;
  fallback: ReactNode;
}

export function ControlIcon({ icon, fallback }: Readonly<ControlIconProps>): ReactNode {
  return (
    <span style={icon.style} aria-hidden="true">
      <ReactIconByTag tag={icon.tag} style={icon.style} fallback={fallback} />
    </span>
  );
}
