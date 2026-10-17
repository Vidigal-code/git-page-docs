import { BsRobot, FiX } from "@/shared/ui/fallback-icons";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";
import type { MenuNode } from "../model/menu-tree";
import { ConfiguredIcon } from "./docs-shell-icon";
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
  navMenuCloseIcon?: ResolvedNavMenuIconConfig;
  onOpenAiChat: () => void;
  aiChatIconConfig?: { open: ResolvedNavMenuIconConfig };
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
  onOpenAiChat,
  aiChatIconConfig,
}: Readonly<DocsShellMobileDrawerProps>): React.JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.mobileDrawerOverlay}>
      <button type="button" className={styles.overlayBackdrop} onClick={onClose} aria-label={menuCloseLabel} tabIndex={-1} />
      <aside className={styles.mobileDrawer}>
        <div className={styles.mobileDrawerHeader}>
          {aiChatIconConfig && (
            <button type="button" data-testid="ai-chat-open" className={`${styles.button} ${styles.mobileDrawerClose}`} onClick={onOpenAiChat} aria-label="Abrir Chat Inteligencia Artificial" title="Assistente de IA">
              <ConfiguredIcon icon={aiChatIconConfig.open} fallback={<BsRobot aria-hidden />} alt="IA" />
            </button>
          )}
          <strong>{siteName}</strong>
          <button className={`${styles.button} ${styles.mobileDrawerClose}`} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            <ConfiguredIcon icon={navMenuCloseIcon} fallback={<FiX aria-hidden />} />
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
