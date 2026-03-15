"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { IconType } from "react-icons";
import { resolveReactIconByTag } from "@/shared/lib/react-icon-tag/resolve-react-icon-by-tag";

interface ReactIconByTagProps {
  tag?: string;
  fallback?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ariaHidden?: boolean;
}

export function ReactIconByTag({
  tag,
  fallback = null,
  className,
  style,
  ariaHidden = true,
}: ReactIconByTagProps) {
  const [IconComponent, setIconComponent] = useState<IconType | null>(null);

  useEffect(() => {
    let isMounted = true;
    resolveReactIconByTag(tag).then((resolvedIcon) => {
      if (isMounted) {
        setIconComponent(() => resolvedIcon);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [tag]);

  if (!IconComponent) {
    return <>{fallback}</>;
  }

  return <IconComponent className={className} style={style} aria-hidden={ariaHidden} />;
}
