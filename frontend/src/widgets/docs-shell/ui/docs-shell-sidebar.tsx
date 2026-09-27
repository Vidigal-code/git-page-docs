import { BsRobot, FiChevronsLeft } from "@/shared/ui/fallback-icons";
import { NavMenuBlockToggle } from "@/features/nav-menu-block-preference";
import { DocsLockButton, type DocsLockTexts } from "@/features/docs-access";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/icons/nav-menu/resolve-nav-menu-icon";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import type { MenuNode } from "../model/menu-tree";
import { ConfiguredIcon, DocsShellBrandIcon } from "./docs-shell-icon";
import { DocsShellMenuTree } from "./docs-shell-menu-tree";
import styles from "../docs-shell.module.css";

interface DocsShellSidebarProps {
  siteName: string;
  useReactHeaderIcon: boolean;
  reactHeaderIconTag: string | undefined;
  headerReactIconStyle: React.CSSProperties;
  activeLayoutMode: "dark" | "light" | undefined;
  iconImage: string | undefined;
  iconImgWidth: number;
  iconImgHeight: number;
  menuNodes: MenuNode[];
  menuCloseLabel: string;
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
  onToggleNode: (nodeKey: string) => void;
  isNodeExpanded: (nodeKey: string) => boolean;
  onCollapseSidebar: () => void;
  blockMenuOnNav: boolean;
  setBlockMenuOnNav: (v: boolean) => void;
  navMenuConfig: NavMenuConfig;
  onOpenAiChat: () => void;
  aiChatIconConfig: any;
  docsLock?: {
    icon: ResolvedNavMenuIconConfig;
    texts: DocsLockTexts;
    onConfirmBlock: () => void;
  };
}

export function DocsShellSidebar({
  siteName,
  useReactHeaderIcon,
  reactHeaderIconTag,
  headerReactIconStyle,
  activeLayoutMode,
  iconImage,
  iconImgWidth,
  iconImgHeight,
  menuNodes,
  menuCloseLabel,
  onMenuClick,
  onToggleNode,
  isNodeExpanded,
  onCollapseSidebar,
  blockMenuOnNav,
  setBlockMenuOnNav,
  navMenuConfig,
  onOpenAiChat,
  aiChatIconConfig,
  docsLock,
}: Readonly<DocsShellSidebarProps>) {
  const aiChatFallback = <BsRobot aria-hidden />;
  const collapseFallback = <FiChevronsLeft aria-hidden />;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <DocsShellBrandIcon
          useReactIcon={useReactHeaderIcon}
          reactIconTag={reactHeaderIconTag}
          reactIconStyle={headerReactIconStyle}
          activeLayoutMode={activeLayoutMode}
          iconImage={iconImage}
          iconImgWidth={iconImgWidth}
          iconImgHeight={iconImgHeight}
          alt={siteName}
          reactIconClassName={styles.brandReactIcon}
          imageClassName={styles.brandIcon}
        />
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
        {docsLock && (
          <DocsLockButton
            icon={docsLock.icon}
            texts={docsLock.texts}
            onConfirmBlock={docsLock.onConfirmBlock}
            className={`${styles.button} ${styles.sidebarRailButton}`}
          />
        )}
        <NavMenuBlockToggle
          blockMenuOnNav={blockMenuOnNav}
          onToggle={() => setBlockMenuOnNav(!blockMenuOnNav)}
          activeIcon={navMenuConfig.navMenuBlockActiveIcon}
          inactiveIcon={navMenuConfig.navMenuBlockInactiveIcon}
          labelActive={navMenuConfig.blockMenuOnNavLabelActive}
          labelInactive={navMenuConfig.blockMenuOnNavLabelInactive}
          className={`${styles.button} ${styles.sidebarRailButton}`}
        />
        <button data-testid="ai-chat-open" className={`${styles.button} ${styles.sidebarRailButton}`} onClick={onOpenAiChat} aria-label="Abrir Chat Inteligência Artificial" title="Assistente de IA">
          <ConfiguredIcon icon={aiChatIconConfig.open} fallback={aiChatFallback} reactIconFallback={aiChatFallback} alt="IA" />
        </button>
        <button className={`${styles.button} ${styles.sidebarRailButton}`} onClick={onCollapseSidebar} aria-label={menuCloseLabel} title={menuCloseLabel}>
          <ConfiguredIcon
            icon={navMenuConfig.sidebarCollapseIcon}
            defaultTag="FiChevronsLeft"
            fallback={collapseFallback}
            reactIconFallback={collapseFallback}
            alt="Collapse sidebar"
          />
        </button>
      </div>
    </aside>
  );
}
