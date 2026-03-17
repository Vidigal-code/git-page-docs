import Image from "next/image";
import type { MenuNode } from "../model/menu-tree";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { DocsShellControls } from "./docs-shell-controls";
import { DocsShellMenuTree } from "./docs-shell-menu-tree";
import styles from "../docs-shell.module.css";

interface DocsShellMobileDrawerProps {
  isOpen: boolean;
  siteName: string;
  menuNodes: MenuNode[];
  menuCloseLabel: string;
  onClose: () => void;
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
  onToggleNode: (nodeKey: string) => void;
  isNodeExpanded: (nodeKey: string) => boolean;
  controls: React.ComponentProps<typeof DocsShellControls>;
  navMenuCloseIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
}

export function DocsShellMobileDrawer({
  isOpen,
  siteName,
  menuNodes,
  menuCloseLabel,
  onClose,
  onMenuClick,
  onToggleNode,
  isNodeExpanded,
  controls,
  navMenuCloseIcon,
}: DocsShellMobileDrawerProps) {
  if (!isOpen) {
    return null;
  }
  return (
    <div className={styles.mobileDrawerOverlay} onClick={onClose}>
      <aside className={styles.mobileDrawer} onClick={(event) => event.stopPropagation()}>
        <div className={styles.mobileDrawerHeader}>
          <strong>{siteName}</strong>
          <button className={`${styles.button} ${styles.mobileDrawerClose}`} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            {navMenuCloseIcon?.useReactIcon ? (
              <span style={navMenuCloseIcon.reactIconStyle}>
                <ReactIconByTag tag={navMenuCloseIcon.reactIconTag} style={navMenuCloseIcon.reactIconStyle} />
              </span>
            ) : navMenuCloseIcon?.iconImage ? (
              <Image
                src={navMenuCloseIcon.iconImage}
                alt=""
                width={navMenuCloseIcon.iconImgWidth}
                height={navMenuCloseIcon.iconImgHeight}
                unoptimized
              />
            ) : (
              "✕"
            )}
          </button>
        </div>
        <nav className={styles.mobileMenu}>
          <DocsShellMenuTree
            nodes={menuNodes}
            keyPrefix="mobile"
            onMenuClick={onMenuClick}
            onToggleNode={onToggleNode}
            isNodeExpanded={isNodeExpanded}
          />
        </nav>
        <div className={styles.mobileControls}>
          <DocsShellControls {...controls} />
        </div>
      </aside>
    </div>
  );
}
