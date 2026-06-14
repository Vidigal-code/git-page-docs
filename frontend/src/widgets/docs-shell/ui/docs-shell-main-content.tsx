"use client";

import type {
  BrowseItem,
  BreadcrumbItem,
  LoadedAudioContent,
  LoadedDocsData,
  LoadedHtmlContent,
  LoadedMdContent,
  LoadedPage,
  LoadedVideoContent,
} from "@/entities/docs";
import { SiteFooter, type FooterConfig } from "@/shared/ui/site-footer";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { DocsShellControls, type DocsShellControlsProps } from "./docs-shell-controls";
import { DocsShellHeader } from "./docs-shell-header";
import { PageContentArea } from "./page-content-area";
import type { FullscreenParams } from "../model/use-docs-shell-url-params";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import styles from "../docs-shell.module.css";

export interface DocsShellMainContentProps {
  headerName: string;
  iconImage: string | undefined;
  useReactHeaderIcon: boolean;
  reactHeaderIconTag: string | undefined;
  headerReactIconStyle: React.CSSProperties;
  iconImgWidth: number;
  iconImgHeight: number;
  menuOpen: boolean;
  menuOpenLabel: string;
  menuCloseLabel: string;
  onToggleMenu: () => void;
  activeLayoutMode?: "light" | "dark";
  controlsProps: DocsShellControlsProps;
  navMenuConfig: NavMenuConfig;
  currentPage: LoadedPage | undefined;
  data: LoadedDocsData;
  language: string;
  nextMode: string;
  previousLabel: string;
  nextLabel: string;
  browsePrevLabel: string;
  browseNextLabel: string;
  fullscreenExpandLabel: string;
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
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
  homePathClick: string | undefined;
  homeAncestorKeys: string[];
  routeGuideIconConfig: ResolvedRouteGuideIconConfig;
  onFullscreenOpen: (params: FullscreenParams) => void;
  onFullscreenClose: () => void;
  linearNavigationEntries: { pathClick: string; ancestorKeys: string[] }[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  goToLinearNavigation: (offset: -1 | 1) => void;
  footerEnabled: boolean;
  footerConfig: FooterConfig;
}

export function DocsShellMainContent(props: DocsShellMainContentProps) {
  const {
    headerName,
    iconImage,
    useReactHeaderIcon,
    reactHeaderIconTag,
    headerReactIconStyle,
    iconImgWidth,
    iconImgHeight,
    menuOpen,
    menuOpenLabel,
    menuCloseLabel,
    onToggleMenu,
    activeLayoutMode,
    controlsProps,
    currentPage,
    data,
    language,
    nextMode,
    previousLabel,
    nextLabel,
    browsePrevLabel,
    browseNextLabel,
    fullscreenExpandLabel,
    mdBrowseIndex,
    htmlBrowseIndex,
    videoBrowseIndex,
    audioBrowseIndex,
    setMdBrowseIndex,
    setHtmlBrowseIndex,
    setVideoBrowseIndex,
    setAudioBrowseIndex,
    mdItems,
    htmlItems,
    videoItems,
    audioItems,
    routeGuideEnabled,
    breadcrumbTrail,
    onMenuClick,
    homePathClick,
    homeAncestorKeys,
    routeGuideIconConfig,
    onFullscreenOpen,
    onFullscreenClose,
    linearNavigationEntries,
    canGoPrevious,
    canGoNext,
    goToLinearNavigation,
    footerEnabled,
    footerConfig,
  } = props;

  return (
    <div className={styles.contentArea}>
      <DocsShellHeader
        headerName={headerName}
        iconImage={iconImage}
        useReactHeaderIcon={useReactHeaderIcon}
        reactHeaderIconTag={reactHeaderIconTag}
        headerReactIconStyle={headerReactIconStyle}
        iconImgWidth={iconImgWidth}
        iconImgHeight={iconImgHeight}
        menuOpen={menuOpen}
        menuOpenLabel={menuOpenLabel}
        menuCloseLabel={menuCloseLabel}
        onToggleMenu={onToggleMenu}
        activeLayoutMode={activeLayoutMode}
        navMenuConfig={props.navMenuConfig}
        controls={<DocsShellControls {...controlsProps} />}
      />

      <main className={styles.main}>
        <PageContentArea
          currentPage={currentPage}
          data={data}
          language={language}
          isDarkMode={nextMode === "dark"}
          fullscreenCloseLabel={menuCloseLabel}
          fullscreenExpandLabel={fullscreenExpandLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          browsePrevLabel={browsePrevLabel}
          browseNextLabel={browseNextLabel}
          mdBrowseIndex={mdBrowseIndex}
          htmlBrowseIndex={htmlBrowseIndex}
          videoBrowseIndex={videoBrowseIndex}
          audioBrowseIndex={audioBrowseIndex}
          setMdBrowseIndex={setMdBrowseIndex}
          setHtmlBrowseIndex={setHtmlBrowseIndex}
          setVideoBrowseIndex={setVideoBrowseIndex}
          setAudioBrowseIndex={setAudioBrowseIndex}
          mdItems={mdItems}
          htmlItems={htmlItems}
          videoItems={videoItems}
          audioItems={audioItems}
          routeGuideEnabled={routeGuideEnabled}
          breadcrumbTrail={breadcrumbTrail}
          onMenuClick={onMenuClick}
          homePathClick={homePathClick}
          homeAncestorKeys={homeAncestorKeys}
          routeGuideIconConfig={routeGuideIconConfig}
          onFullscreenOpen={onFullscreenOpen}
          onFullscreenClose={onFullscreenClose}
        />
        {linearNavigationEntries.length > 1 && (
          <div className={styles.footerActions}>
            <button className={styles.button} onClick={() => goToLinearNavigation(-1)} disabled={!canGoPrevious}>
              {previousLabel}
            </button>
            <button className={styles.button} onClick={() => goToLinearNavigation(1)} disabled={!canGoNext}>
              {nextLabel}
            </button>
          </div>
        )}
      </main>
      {footerEnabled && (
        <SiteFooter
          language={language}
          projectLabel={footerConfig.projectLabel}
          linkName={footerConfig.linkName}
          linkUrl={footerConfig.linkUrl}
          dateMode={footerConfig.dateMode}
          dateCustom={footerConfig.dateCustom}
        />
      )}
    </div>
  );
}
