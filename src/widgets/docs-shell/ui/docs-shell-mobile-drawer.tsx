import type { MenuNode } from "../model/menu-tree";
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
            ✕
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
