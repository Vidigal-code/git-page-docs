"use client";

import type {
  BrowseItem,
  BreadcrumbItem,
  LoadedAudioContent,
  LoadedDocsData,
  LoadedHtmlContent,
  LoadedMdContent,
  LoadedVideoContent,
  MenuNode,
  VersionLinkOption,
} from "@/entities/docs";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
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
  menuCloseLabel: string;
  onMenuClick: (pathClick: string, ancestorKeys: string[], options?: { fromLinearNav?: boolean; fromQuickNav?: boolean }) => void;
  toggleNode: (key: string) => void;
  isNodeExpanded: (key: string) => boolean;
  controlsProps: DocsShellControlsProps;
  navMenuConfig: NavMenuConfig;
  controlsConfig: DocsShellOverlaysControlsConfig;
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
  previousLabel: string;
  nextLabel: string;
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
  mdBrowseIndex: number;
  htmlBrowseIndex: number;
  videoBrowseIndex: number;
  audioBrowseIndex: number;
  setMdBrowseIndex: (v: number | ((p: number) => number)) => void;
  setHtmlBrowseIndex: (v: number | ((p: number) => number)) => void;
  setVideoBrowseIndex: (v: number | ((p: number) => number)) => void;
  setAudioBrowseIndex: (v: number | ((p: number) => number)) => void;
  mdItems: BrowseItem<LoadedMdContent>[];
  htmlItems: BrowseItem<LoadedHtmlContent>[];
  videoItems: BrowseItem<LoadedVideoContent>[];
  audioItems: BrowseItem<LoadedAudioContent>[];
  routeGuideEnabled: boolean;
  breadcrumbTrail: BreadcrumbItem[];
  homePathClick: string | undefined;
  homeAncestorKeys: string[];
  routeGuideIconConfig: ResolvedRouteGuideIconConfig;
  closeUrlFullscreen: () => void;
  nextMode: string;
  browsePrevLabel: string;
  browseNextLabel: string;
  fullscreenExpandLabel: string;
}

export function DocsShellOverlays(props: DocsShellOverlaysProps) {
  const { controlsProps, controlsConfig } = props;
  return (
    <>
      <DocsShellMobileDrawer
        isOpen={props.menuOpen}
        siteName={props.headerName}
        menuNodes={props.headerMenuTree}
        menuCloseLabel={props.menuCloseLabel}
        onClose={() => props.setMenuOpen(false)}
        onMenuClick={props.onMenuClick}
        onToggleNode={props.toggleNode}
        isNodeExpanded={props.isNodeExpanded}
        controls={controlsProps}
        navMenuCloseIcon={props.navMenuConfig.navMenuMobileCloseIcon}
      />
      <DocsShellQuickNavOverlay
        isOpen={controlsConfig.activeNavigation && props.quickNavOpen}
        quickNavPlaceholder={props.quickNavPlaceholder}
        menuCloseLabel={props.menuCloseLabel}
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
        menuCloseLabel={props.menuCloseLabel}
        previousLabel={props.previousLabel}
        nextLabel={props.nextLabel}
        focusModeCurrentHtml={props.focusModeCurrentHtml}
        canFocusModeGoPrevious={props.canFocusModeGoPrevious}
        canFocusModeGoNext={props.canFocusModeGoNext}
        onClose={props.closeFocusMode}
        onNavigate={props.onFocusModeNavigate}
      />
      <DocsShellVersionLinksOverlay
        isOpen={props.versionLinksPopupOpen}
        versionLinksLabel={props.versionLinksLabel}
        menuCloseLabel={props.menuCloseLabel}
        options={props.versionLinkOptionsWithLabels}
        onClose={() => props.setVersionLinksPopupOpen(false)}
        onOpenVersionLink={(url) => window.open(url, "_blank", "noreferrer")}
      />
      <DocsShellInfoOverlay
        isOpen={props.infoPopupOpen}
        lastUpdateLabel={props.lastUpdateLabel}
        updateDate={props.updateDate}
        menuCloseLabel={props.menuCloseLabel}
        onClose={() => props.setInfoPopupOpen(false)}
      />
      <DocsShellUrlFullscreenOverlay
        isOpen={Boolean(props.urlFullscreenParams)}
        params={props.urlFullscreenParams}
        data={props.data}
        language={props.language}
        isDarkMode={props.nextMode === "dark"}
        menuCloseLabel={props.menuCloseLabel}
        fullscreenExpandLabel={props.fullscreenExpandLabel}
        previousLabel={props.previousLabel}
        nextLabel={props.nextLabel}
        browsePrevLabel={props.browsePrevLabel}
        browseNextLabel={props.browseNextLabel}
        mdBrowseIndex={props.mdBrowseIndex}
        htmlBrowseIndex={props.htmlBrowseIndex}
        videoBrowseIndex={props.videoBrowseIndex}
        audioBrowseIndex={props.audioBrowseIndex}
        setMdBrowseIndex={props.setMdBrowseIndex}
        setHtmlBrowseIndex={props.setHtmlBrowseIndex}
        setVideoBrowseIndex={props.setVideoBrowseIndex}
        setAudioBrowseIndex={props.setAudioBrowseIndex}
        mdItems={props.mdItems}
        htmlItems={props.htmlItems}
        videoItems={props.videoItems}
        audioItems={props.audioItems}
        routeGuideEnabled={props.routeGuideEnabled}
        breadcrumbTrail={props.breadcrumbTrail}
        onMenuClick={props.onMenuClick}
        homePathClick={props.homePathClick}
        homeAncestorKeys={props.homeAncestorKeys}
        routeGuideIconConfig={props.routeGuideIconConfig}
        onClose={props.closeUrlFullscreen}
      />
    </>
  );
}
