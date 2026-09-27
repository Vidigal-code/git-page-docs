"use client";

import { FiChevronsRight } from "@/shared/ui/fallback-icons";
import { NavMenuBlockToggle } from "@/features/nav-menu-block-preference";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import { ConfiguredIcon } from "./docs-shell-icon";
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
}: Readonly<CollapsedNavRailProps>) {
  const expandFallback = <FiChevronsRight aria-hidden />;

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
        data-testid="sidebar-expand"
      >
        <ConfiguredIcon
          icon={navMenuConfig.sidebarExpandIcon}
          defaultTag="FiChevronsRight"
          fallback={expandFallback}
          reactIconFallback={expandFallback}
          alt="Expand sidebar"
        />
      </button>
    </div>
  );
}
