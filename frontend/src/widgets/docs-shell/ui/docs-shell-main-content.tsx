"use client";

import { getLangMenuLabelFromMenu, type LoadedDocsData, type LoadedPage } from "@/entities/docs";
import { useId, type ReactNode } from "react";
import { BackToTop } from "@/shared/ui/back-to-top";
import { SiteFooter, type FooterConfig } from "@/shared/ui/site-footer";
import { ControlIcon } from "@/shared/ui/control-icon";
import { resolveControlIcon } from "@/shared/lib/icons/resolve-control-icon";
import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
import { FiChevronRight } from "@react-icons/all-files/fi/FiChevronRight";
import { DocsShellControls, type DocsShellControlsProps } from "./docs-shell-controls";
import { DocsShellHeader } from "./docs-shell-header";
import { PageContentArea } from "./page-content-area";
import type { FullscreenParams } from "../model/use-docs-shell-url-params";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import type { BrowseNavigationProps, BrowseState, ContentLabels } from "../model/content-browse-props";
import styles from "../docs-shell.module.css";

export interface DocsShellMainContentProps {
  accessibilityControls?: ReactNode;
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
  const mainId = useId();
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
  const previousIcon = resolveControlIcon(data.config.site, { name: "DocumentPrevious", mode: activeLayoutMode ?? "dark" });
  const nextIcon = resolveControlIcon(data.config.site, { name: "DocumentNext", mode: activeLayoutMode ?? "dark" });

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

      <main id={mainId} className={styles.main} tabIndex={-1}>
        {props.accessibilityControls}
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
            <button type="button" className={previousIcon ? `${styles.button} ${styles.modeIconButton}` : styles.button} onClick={() => goToLinearNavigation(-1)} disabled={!canGoPrevious} aria-label={labels.previousLabel} title={labels.previousLabel}>
              {previousIcon ? <ControlIcon icon={previousIcon} fallback={<FiChevronLeft aria-hidden />} /> : labels.previousLabel}
            </button>
            <button type="button" className={nextIcon ? `${styles.button} ${styles.modeIconButton}` : styles.button} onClick={() => goToLinearNavigation(1)} disabled={!canGoNext} aria-label={labels.nextLabel} title={labels.nextLabel}>
              {nextIcon ? <ControlIcon icon={nextIcon} fallback={<FiChevronRight aria-hidden />} /> : labels.nextLabel}
            </button>
          </div>
        )}
        <BackToTop
          label={getLangMenuLabelFromMenu(data.config.site.langmenu, language, "backToTop", "Back to top")}
          targetId={mainId}
          enabled={data.config.site.backToTop?.enabled}
          minPageHeightViewports={data.config.site.backToTop?.minPageHeightViewports}
        />
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
