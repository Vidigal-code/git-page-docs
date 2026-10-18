"use client";

import type { FocusModeOptions, LoadedDocsData, MenuNode, VersionLinkOption } from "@/entities/docs";
import type { ReactNode } from "react";
import type { MenuEntry } from "../model/menu-tree";
import { DocsShellFocusOverlay, type FocusDocumentView, type FocusDocumentNavigation } from "./docs-shell-focus-overlay";
import { DocsShellInfoOverlay } from "./docs-shell-info-overlay";
import { DocsShellMobileDrawer } from "./docs-shell-mobile-drawer";
import { DocsShellQuickNavOverlay } from "./docs-shell-quick-nav-overlay";
import { DocsShellUrlFullscreenOverlay } from "./docs-shell-url-fullscreen-overlay";
import { DocsShellVersionLinksOverlay } from "./docs-shell-version-links-overlay";
import type { FullscreenParams } from "../model/use-docs-shell-url-params";
import type { DocsShellControlsProps } from "./docs-shell-controls";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import type { BrowseNavigationProps, BrowseState, ContentLabels } from "../model/content-browse-props";
import type { OnMenuClickOptions } from "../model/use-docs-shell-navigation-state";
import type { DocsShellLabels } from "../model/use-docs-shell-labels";
import type { FocusNavigationTarget } from "../model/focus-navigation";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";

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
  onMenuClick: (pathClick: string, ancestorKeys: string[], options?: OnMenuClickOptions) => void;
  toggleNode: (key: string) => void;
  isNodeExpanded: (key: string) => boolean;
  controlsProps: DocsShellControlsProps;
  navMenuConfig: NavMenuConfig;
  blockMenuOnNav: boolean;
  setBlockMenuOnNav: (value: boolean) => void;
  backgroundControl?: ReactNode;
  controlsConfig: DocsShellOverlaysControlsConfig;
  labels: ContentLabels & Pick<DocsShellLabels, "focusFirstSectionLabel" | "focusLastSectionLabel" | "focusPreviousSectionLabel" | "focusNextSectionLabel" | "focusSectionsLabel" | "focusDocumentsLabel">;
  versionLinksPopupOpen: boolean;
  setVersionLinksPopupOpen: (v: boolean) => void;
  infoPopupOpen: boolean;
  setInfoPopupOpen: (v: boolean) => void;
  quickNavOpen: boolean;
  quickNavPlaceholder: string;
  quickNavigationEntries: MenuEntry[];
  navigateHintLabel: string;
  selectHintLabel: string;
  escHintLabel: string;
  closeHintLabel: string;
  noNavigationResults: string;
  closeQuickNavigation: () => void;
  focusModeOpen: boolean;
  focusModeLabel: string;
  focusModeCurrentHtml: string;
  focusSectionIndex: number;
  focusSectionCount: number;
  focusDocument: FocusDocumentView;
  focusDocumentNavigation: FocusDocumentNavigation;
  focusOptions?: FocusModeOptions;
  focusAccessibilityControls?: ReactNode;
  focusContainerPagination?: ReactNode;
  focusContainerPaginationTop?: ReactNode;
  closeFocusMode: () => void;
  onFocusModeNavigate: (target: FocusNavigationTarget) => void;
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
  aiChatIconConfig?: { open: ResolvedNavMenuIconConfig };
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
        navMenuConfig={props.navMenuConfig}
        blockMenuOnNav={props.blockMenuOnNav}
        setBlockMenuOnNav={props.setBlockMenuOnNav}
        backgroundControl={props.backgroundControl}
        onOpenAiChat={props.onOpenAiChat}
        aiChatIconConfig={props.aiChatIconConfig}
      />
      {controlsConfig.activeNavigation && props.quickNavOpen && <DocsShellQuickNavOverlay
        quickNavPlaceholder={props.quickNavPlaceholder}
        menuCloseLabel={labels.menuCloseLabel}
        entries={props.quickNavigationEntries}
        navigateHintLabel={props.navigateHintLabel}
        selectHintLabel={props.selectHintLabel}
        escHintLabel={props.escHintLabel}
        closeHintLabel={props.closeHintLabel}
        noNavigationResults={props.noNavigationResults}
        onClose={props.closeQuickNavigation}
        onMenuClick={props.onMenuClick}
      />}
      <DocsShellFocusOverlay
        isOpen={controlsConfig.focusModeEnabled && props.focusModeOpen}
        focusModeLabel={props.focusModeLabel}
        menuCloseLabel={labels.menuCloseLabel}
        firstLabel={labels.focusFirstSectionLabel}
        lastLabel={labels.focusLastSectionLabel}
        previousLabel={labels.focusPreviousSectionLabel}
        nextLabel={labels.focusNextSectionLabel}
        sectionsLabel={labels.focusSectionsLabel}
        documentsLabel={labels.focusDocumentsLabel}
        sectionIndex={props.focusSectionIndex}
        sectionCount={props.focusSectionCount}
        document={props.focusDocument}
        documentNavigation={props.focusDocumentNavigation}
        options={props.focusOptions}
        accessibilityControls={props.focusAccessibilityControls}
        containerPagination={props.focusContainerPagination}
        containerPaginationTop={props.focusContainerPaginationTop}
        sourceActionLabels={{ copy: labels.mdCopyLabel, copied: labels.mdCopiedLabel, copyError: labels.mdCopyErrorLabel, download: labels.mdDownloadLabel }}
        focusModeCurrentHtml={props.focusModeCurrentHtml}
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
