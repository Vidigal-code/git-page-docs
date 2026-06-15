import Image from "next/image";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { NavMenuBlockToggle } from "@/features/nav-menu-block-preference";
import { DocsLockButton, type DocsLockTexts } from "@/features/docs-access";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/icons/nav-menu/resolve-nav-menu-icon";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
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
}: DocsShellSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        {useReactHeaderIcon ? (
          <span className={styles.brandReactIcon} style={headerReactIconStyle}>
            <ReactIconByTag tag={reactHeaderIconTag} fallback={activeLayoutMode === "dark" ? <BsMoonStarsFill aria-hidden /> : <BsSunFill aria-hidden />} />
          </span>
        ) : iconImage ? (
          <Image src={iconImage} alt={siteName} width={iconImgWidth} height={iconImgHeight} className={styles.brandIcon} unoptimized />
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
          {aiChatIconConfig.open.useReactIcon ? (
            <span style={aiChatIconConfig.open.reactIconStyle}>
              <ReactIconByTag tag={aiChatIconConfig.open.reactIconTag} style={aiChatIconConfig.open.reactIconStyle} />
            </span>
          ) : aiChatIconConfig.open.iconImage ? (
            <Image src={aiChatIconConfig.open.iconImage} alt="IA" width={aiChatIconConfig.open.iconImgWidth} height={aiChatIconConfig.open.iconImgHeight} unoptimized />
          ) : (
            "✨"
          )}
        </button>
        <button className={`${styles.button} ${styles.sidebarRailButton}`} onClick={onCollapseSidebar} aria-label={menuCloseLabel} title={menuCloseLabel}>
          {navMenuConfig.sidebarCollapseIcon.useReactIcon ? (
            <span style={navMenuConfig.sidebarCollapseIcon.reactIconStyle}>
              <ReactIconByTag tag={navMenuConfig.sidebarCollapseIcon.reactIconTag || "FiChevronsLeft"} style={navMenuConfig.sidebarCollapseIcon.reactIconStyle} />
            </span>
          ) : navMenuConfig.sidebarCollapseIcon.iconImage ? (
            <Image src={navMenuConfig.sidebarCollapseIcon.iconImage} alt="Collapse sidebar" width={navMenuConfig.sidebarCollapseIcon.iconImgWidth} height={navMenuConfig.sidebarCollapseIcon.iconImgHeight} unoptimized />
          ) : (
            "❮❮"
          )}
        </button>
      </div>
    </aside>
  );
}
