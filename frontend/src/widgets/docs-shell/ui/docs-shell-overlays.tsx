"use client";

import type { LoadedDocsData, MenuNode, VersionLinkOption } from "@/entities/docs";
import type { MenuEntry } from "../model/menu-tree";
import { DocsShellFocusOverlay } from "./docs-shell-focus-overlay";
import { DocsShellInfoOverlay } from "./docs-shell-info-overlay";
import { DocsShellMobileDrawer } from "./docs-shell-mobile-drawer";
import { DocsShellQuickNavOverlay } from "./docs-shell-quick-nav-overlay";
import { DocsShellUrlFullscreenOverlay } from "./docs-shell-url-fullscreen-overlay";
import { DocsShellVersionLinksOverlay } from "./docs-shell-version-links-overlay";
import type { FullscreenParams } from "../model/use-docs-shell-url-params";
import type { DocsShellControlsProps } from "./docs-shell-controls";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import type { BrowseNavigationProps, BrowseState, ContentLabels } from "../model/content-browse-props";

export interface DocsShellOverlaysControlsConfig {
  activeNavigation: boolean;
  focusModeEnabled: boolean;
  focusModeLabel: string;
  versionLinksLabel: string;
  versionLinkOptionsWithLabels: VersionLinkOption[];
  lastUpdateLabel: string;
  updateDate: string;
}

export interface DocsShellOverlaysProps {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  headerName: string;
  headerMenuTree: MenuNode[];
  onMenuClick: (pathClick: string, ancestorKeys: string[], options?: { fromLinearNav?: boolean; fromQuickNav?: boolean }) => void;
  toggleNode: (key: string) => void;
  isNodeExpanded: (key: string) => boolean;
  controlsProps: DocsShellControlsProps;
  navMenuConfig: NavMenuConfig;
  controlsConfig: DocsShellOverlaysControlsConfig;
  labels: ContentLabels;
  versionLinksPopupOpen: boolean;
  setVersionLinksPopupOpen: (v: boolean) => void;
  infoPopupOpen: boolean;
  setInfoPopupOpen: (v: boolean) => void;
  quickNavOpen: boolean;
  quickNavPlaceholder: string;
  quickNavQuery: string;
  filteredQuickNavEntries: MenuEntry[];
  quickNavActiveIndex: number;
  navigateHintLabel: string;
  selectHintLabel: string;
  escHintLabel: string;
  closeHintLabel: string;
  noNavigationResults: string;
  quickNavListRef: React.RefObject<HTMLDivElement | null>;
  quickNavItemRefs: React.RefObject<Array<HTMLButtonElement | null>>;
  closeQuickNavigation: () => void;
  setQuickNavQuery: (q: string) => void;
  setQuickNavActiveIndex: (nextIndex: number | ((prev: number) => number)) => void;
  focusModeOpen: boolean;
  focusModeLabel: string;
  focusModeCurrentHtml: string;
  canFocusModeGoPrevious: boolean;
  canFocusModeGoNext: boolean;
  closeFocusMode: () => void;
  onFocusModeNavigate: (offset: -1 | 1) => void;
  versionLinksLabel: string;
  versionLinkOptionsWithLabels: VersionLinkOption[];
  lastUpdateLabel: string;
  updateDate: string;
  urlFullscreenParams: FullscreenParams | null;
  data: LoadedDocsData;
  language: string;
  nextMode: string;
  browse: BrowseState;
  navigation: BrowseNavigationProps;
  closeUrlFullscreen: () => void;
  onOpenAiChat: () => void;
  aiChatIconConfig: any;
}

export function DocsShellOverlays(props: Readonly<DocsShellOverlaysProps>) {
  const { controlsProps, controlsConfig, labels } = props;
  return (
    <>
      <DocsShellMobileDrawer
        isOpen={props.menuOpen}
        siteName={props.headerName}
        menuNodes={props.headerMenuTree}
        menuCloseLabel={labels.menuCloseLabel}
        onClose={() => props.setMenuOpen(false)}
        onMenuClick={props.onMenuClick}
        onToggleNode={props.toggleNode}
        isNodeExpanded={props.isNodeExpanded}
        controls={controlsProps}
        navMenuCloseIcon={props.navMenuConfig.navMenuMobileCloseIcon}
        onOpenAiChat={props.onOpenAiChat}
        aiChatIconConfig={props.aiChatIconConfig}
      />
      <DocsShellQuickNavOverlay
        isOpen={controlsConfig.activeNavigation && props.quickNavOpen}
        quickNavPlaceholder={props.quickNavPlaceholder}
        menuCloseLabel={labels.menuCloseLabel}
        quickNavQuery={props.quickNavQuery}
        filteredQuickNavEntries={props.filteredQuickNavEntries}
        quickNavActiveIndex={props.quickNavActiveIndex}
        navigateHintLabel={props.navigateHintLabel}
        selectHintLabel={props.selectHintLabel}
        escHintLabel={props.escHintLabel}
        closeHintLabel={props.closeHintLabel}
        noNavigationResults={props.noNavigationResults}
        quickNavListRef={props.quickNavListRef}
        quickNavItemRefs={props.quickNavItemRefs}
        onClose={props.closeQuickNavigation}
        onQueryChange={props.setQuickNavQuery}
        onActiveIndexChange={props.setQuickNavActiveIndex}
        onMenuClick={props.onMenuClick}
      />
      <DocsShellFocusOverlay
        isOpen={controlsConfig.focusModeEnabled && props.focusModeOpen}
        focusModeLabel={props.focusModeLabel}
        menuCloseLabel={labels.menuCloseLabel}
        previousLabel={labels.previousLabel}
        nextLabel={labels.nextLabel}
        focusModeCurrentHtml={props.focusModeCurrentHtml}
        canFocusModeGoPrevious={props.canFocusModeGoPrevious}
        canFocusModeGoNext={props.canFocusModeGoNext}
        onClose={props.closeFocusMode}
        onNavigate={props.onFocusModeNavigate}
      />
      <DocsShellVersionLinksOverlay
        isOpen={props.versionLinksPopupOpen}
        versionLinksLabel={props.versionLinksLabel}
        menuCloseLabel={labels.menuCloseLabel}
        options={props.versionLinkOptionsWithLabels}
        onClose={() => props.setVersionLinksPopupOpen(false)}
        onOpenVersionLink={(url) => window.open(url, "_blank", "noreferrer")}
      />
      <DocsShellInfoOverlay
        isOpen={props.infoPopupOpen}
        lastUpdateLabel={props.lastUpdateLabel}
        updateDate={props.updateDate}
        menuCloseLabel={labels.menuCloseLabel}
        onClose={() => props.setInfoPopupOpen(false)}
      />
      <DocsShellUrlFullscreenOverlay
        isOpen={Boolean(props.urlFullscreenParams)}
        params={props.urlFullscreenParams}
        data={props.data}
        language={props.language}
        isDarkMode={props.nextMode === "dark"}
        labels={labels}
        browse={props.browse}
        navigation={props.navigation}
        onClose={props.closeUrlFullscreen}
      />
    </>
  );
}
