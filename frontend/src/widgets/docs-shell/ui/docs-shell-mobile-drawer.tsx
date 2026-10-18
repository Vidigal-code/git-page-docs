import { BsRobot, FiX } from "@/shared/ui/fallback-icons";
import { NavMenuBlockToggle } from "@/features/nav-menu-block-preference";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
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
  navMenuConfig: NavMenuConfig;
  blockMenuOnNav: boolean;
  setBlockMenuOnNav: (value: boolean) => void;
  backgroundControl?: React.ReactNode;
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
  navMenuConfig,
  blockMenuOnNav,
  setBlockMenuOnNav,
  backgroundControl,
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
        <div className={styles.mobileMenuActions}>
          <NavMenuBlockToggle
            blockMenuOnNav={blockMenuOnNav}
            onToggle={() => setBlockMenuOnNav(!blockMenuOnNav)}
            activeIcon={navMenuConfig.navMenuBlockActiveIcon}
            inactiveIcon={navMenuConfig.navMenuBlockInactiveIcon}
            labelActive={navMenuConfig.blockMenuOnNavLabelActive}
            labelInactive={navMenuConfig.blockMenuOnNavLabelInactive}
            className={`${styles.button} ${styles.sidebarRailButton}`}
          />
          {backgroundControl}
        </div>
        <div className={styles.mobileControls}>
          <DocsShellControls {...controls} />
        </div>
      </aside>
    </div>
  );
}
