"use client";

import type { LoadedDocsData, LoadedPage } from "@/entities/docs";
import { SiteFooter, type FooterConfig } from "@/shared/ui/site-footer";
import { DocsShellControls, type DocsShellControlsProps } from "./docs-shell-controls";
import { DocsShellHeader } from "./docs-shell-header";
import { PageContentArea } from "./page-content-area";
import type { FullscreenParams } from "../model/use-docs-shell-url-params";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import type { BrowseNavigationProps, BrowseState, ContentLabels } from "../model/content-browse-props";
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
  onToggleMenu: () => void;
  activeLayoutMode?: "light" | "dark";
  controlsProps: DocsShellControlsProps;
  navMenuConfig: NavMenuConfig;
  currentPage: LoadedPage | undefined;
  data: LoadedDocsData;
  language: string;
  nextMode: string;
  labels: ContentLabels;
  browse: BrowseState;
  navigation: BrowseNavigationProps;
  onFullscreenOpen: (params: FullscreenParams) => void;
  onFullscreenClose: () => void;
  linearNavigationEntries: { pathClick: string; ancestorKeys: string[] }[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  goToLinearNavigation: (offset: -1 | 1) => void;
  footerEnabled: boolean;
  footerConfig: FooterConfig;
}

export function DocsShellMainContent(props: Readonly<DocsShellMainContentProps>) {
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
    onToggleMenu,
    activeLayoutMode,
    controlsProps,
    currentPage,
    data,
    language,
    nextMode,
    labels,
    browse,
    navigation,
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
        menuCloseLabel={labels.menuCloseLabel}
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
          activeThemeId={controlsProps.activeThemeId}
          labels={labels}
          browse={browse}
          navigation={navigation}
          onFullscreenOpen={onFullscreenOpen}
          onFullscreenClose={onFullscreenClose}
        />
        {linearNavigationEntries.length > 1 && (
          <div className={styles.footerActions}>
            <button className={styles.button} onClick={() => goToLinearNavigation(-1)} disabled={!canGoPrevious}>
              {labels.previousLabel}
            </button>
            <button className={styles.button} onClick={() => goToLinearNavigation(1)} disabled={!canGoNext}>
              {labels.nextLabel}
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
