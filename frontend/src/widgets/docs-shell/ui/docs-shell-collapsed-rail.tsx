"use client";

import Image from "next/image";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { NavMenuBlockToggle } from "@/features/nav-menu-block-preference";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import styles from "../docs-shell.module.css";

export interface CollapsedNavRailProps {
  menuOpenLabel: string;
  onExpand: () => void;
  blockMenuOnNav: boolean;
  setBlockMenuOnNav: (v: boolean) => void;
  navMenuConfig: NavMenuConfig;
}

export function CollapsedNavRail({
  menuOpenLabel,
  onExpand,
  blockMenuOnNav,
  setBlockMenuOnNav,
  navMenuConfig,
}: CollapsedNavRailProps) {
  return (
    <div className={styles.collapsedNavRail}>
      <NavMenuBlockToggle
        blockMenuOnNav={blockMenuOnNav}
        onToggle={() => setBlockMenuOnNav(!blockMenuOnNav)}
        activeIcon={navMenuConfig.navMenuBlockActiveIcon}
        inactiveIcon={navMenuConfig.navMenuBlockInactiveIcon}
        labelActive={navMenuConfig.blockMenuOnNavLabelActive}
        labelInactive={navMenuConfig.blockMenuOnNavLabelInactive}
        className={`${styles.button} ${styles.sidebarRailButton}`}
      />
      <button
        className={`${styles.button} ${styles.sidebarRailButton}`}
        onClick={onExpand}
        aria-label={menuOpenLabel}
        title={menuOpenLabel}
      >
        {navMenuConfig.sidebarExpandIcon.useReactIcon ? (
          <span style={navMenuConfig.sidebarExpandIcon.reactIconStyle}>
            <ReactIconByTag tag={navMenuConfig.sidebarExpandIcon.reactIconTag || "FiChevronsRight"} style={navMenuConfig.sidebarExpandIcon.reactIconStyle} />
          </span>
        ) : navMenuConfig.sidebarExpandIcon.iconImage ? (
          <Image src={navMenuConfig.sidebarExpandIcon.iconImage} alt="Expand sidebar" width={navMenuConfig.sidebarExpandIcon.iconImgWidth} height={navMenuConfig.sidebarExpandIcon.iconImgHeight} unoptimized />
        ) : (
          "❯❯"
        )}
      </button>
    </div>
  );
}
