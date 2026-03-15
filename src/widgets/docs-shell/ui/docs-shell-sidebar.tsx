import Image from "next/image";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { MenuNode } from "../model/menu-tree";
import { DocsShellMenuTree } from "./docs-shell-menu-tree";
import styles from "../docs-shell.module.css";

interface DocsShellSidebarProps {
  siteName: string;
  useReactHeaderIcon: boolean;
  reactHeaderIconTag: string | undefined;
  headerReactIconStyle: React.CSSProperties;
  activeLayoutMode: "dark" | "light" | undefined;
  iconImage: string | undefined;
  menuNodes: MenuNode[];
  menuCloseLabel: string;
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
  onToggleNode: (nodeKey: string) => void;
  isNodeExpanded: (nodeKey: string) => boolean;
  onCollapseSidebar: () => void;
}

export function DocsShellSidebar({
  siteName,
  useReactHeaderIcon,
  reactHeaderIconTag,
  headerReactIconStyle,
  activeLayoutMode,
  iconImage,
  menuNodes,
  menuCloseLabel,
  onMenuClick,
  onToggleNode,
  isNodeExpanded,
  onCollapseSidebar,
}: DocsShellSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        {useReactHeaderIcon ? (
          <span className={styles.brandReactIcon} style={headerReactIconStyle}>
            <ReactIconByTag tag={reactHeaderIconTag} fallback={activeLayoutMode === "dark" ? <BsMoonStarsFill aria-hidden /> : <BsSunFill aria-hidden />} />
          </span>
        ) : iconImage ? (
          <Image src={iconImage} alt={siteName} width={28} height={28} className={styles.brandIcon} unoptimized />
        ) : null}
        <span>{siteName}</span>
      </div>
      <nav className={styles.menuList}>
        <DocsShellMenuTree
          nodes={menuNodes}
          keyPrefix="desktop"
          onMenuClick={onMenuClick}
          onToggleNode={onToggleNode}
          isNodeExpanded={isNodeExpanded}
        />
      </nav>
      <div className={styles.sidebarFooter}>
        <button className={`${styles.button} ${styles.sidebarRailButton}`} onClick={onCollapseSidebar} aria-label={menuCloseLabel} title={menuCloseLabel}>
          ❮❮
        </button>
      </div>
    </aside>
  );
}
