"use client";

import Image from "next/image";
import type { BreadcrumbItem } from "@/widgets/docs-shell/model/menu-tree";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import styles from "./route-guide-breadcrumb.module.css";

interface RouteGuideBreadcrumbProps {
  trail: BreadcrumbItem[];
  onNavigate: (pathClick: string, ancestorKeys: string[]) => void;
  iconConfig: ResolvedRouteGuideIconConfig;
  homePathClick?: string;
  homeAncestorKeys?: string[];
}

export function RouteGuideBreadcrumb({
  trail,
  onNavigate,
  iconConfig,
  homePathClick,
  homeAncestorKeys = [],
}: RouteGuideBreadcrumbProps) {
  const { iconImage, useReactIcon, reactIconTag, reactIconStyle, iconImgWidth, iconImgHeight } =
    iconConfig;

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <button
            type="button"
            className={styles.link}
            onClick={() => homePathClick && onNavigate(homePathClick, homeAncestorKeys)}
            aria-label="Home"
            disabled={!homePathClick}
          >
            {useReactIcon && reactIconTag ? (
              <span className={styles.icon} style={reactIconStyle}>
                <ReactIconByTag tag={reactIconTag} />
              </span>
            ) : (
              <Image
                src={iconImage}
                alt=""
                width={iconImgWidth}
                height={iconImgHeight}
                className={styles.iconImg}
                unoptimized
              />
            )}
          </button>
        </li>
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={item.pathClick || `trail-${index}`} className={styles.item}>
              <span className={styles.separator} aria-hidden>
                {" "}
                &gt;{" "}
              </span>
              {item.pathClick ? (
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => onNavigate(item.pathClick, item.ancestorKeys)}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.title}
                </button>
              ) : (
                <span className={styles.text} aria-current={isLast ? "page" : undefined}>
                  {item.title}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
