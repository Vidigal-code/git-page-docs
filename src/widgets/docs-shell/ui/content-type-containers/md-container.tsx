"use client";

import { useMemo } from "react";
import { extractHeadingsFromHtml, type BreadcrumbItem, type ContentTypeRouteConfig, type LanguageCode } from "@/entities/docs";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { ContentContainerWrapper, type BrowseNavProps } from "./content-container-wrapper";
import { ContentHeaderBlock } from "./content-header-block";
import { RouteGuideBreadcrumb, TocContainer } from "@/features/route-guide";
import type { TocPosition } from "@/features/route-guide";
import styles from "../../docs-shell.module.css";

function getContainerStyle(container: ContentTypeRouteConfig["container"]): React.CSSProperties {
  if (container === "full") {
    return { minHeight: "80vh", overflow: "auto" };
  }
  if (typeof container === "number" && container > 0) {
    return { height: container, overflow: "auto" };
  }
  return {};
}

interface MdContainerProps {
  html: string;
  config?: ContentTypeRouteConfig;
  language: LanguageCode;
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  isDarkMode?: boolean;
  browseNav?: BrowseNavProps;
  routeGuideEnabled?: boolean;
  breadcrumbTrail?: BreadcrumbItem[];
  onBreadcrumbClick?: (pathClick: string, ancestorKeys: string[]) => void;
  homePathClick?: string;
  homeAncestorKeys?: string[];
  routeGuideIconConfig?: ResolvedRouteGuideIconConfig;
  /** Default TOC position when not set in config. */
  tocPositionDefault?: TocPosition;
  /** Default for RouteguideBrandContainerTop when not set in config. */
  tocContainerTopDefault?: boolean;
  /** When true, TOC links use default anchor behavior (for fullscreen mode) */
  useDefaultScrollBehavior?: boolean;
  /** When true, show only markdown content (hide routes/TOC) - for fullscreen mode */
  contentOnly?: boolean;
  /** Called when fullscreen is about to open (for URL sync) */
  onFullscreenOpen?: () => void;
  /** Called when fullscreen is about to close (for URL sync) */
  onFullscreenClose?: () => void;
}

export function MdContainer({
  html,
  config,
  language,
  fullscreenEnabled = false,
  fullscreenCloseLabel,
  fullscreenExpandLabel,
  isDarkMode = false,
  browseNav,
  routeGuideEnabled = false,
  breadcrumbTrail = [],
  onBreadcrumbClick,
  homePathClick,
  homeAncestorKeys = [],
  routeGuideIconConfig,
  tocPositionDefault = "center",
  tocContainerTopDefault = false,
  useDefaultScrollBehavior = false,
  contentOnly = false,
  onFullscreenOpen,
  onFullscreenClose,
}: MdContainerProps) {
  const containerStyle = getContainerStyle(config?.container);
  const breadcrumb =
    routeGuideEnabled &&
    breadcrumbTrail.length > 0 &&
    onBreadcrumbClick &&
    routeGuideIconConfig ? (
      <RouteGuideBreadcrumb
        trail={breadcrumbTrail}
        onNavigate={onBreadcrumbClick}
        iconConfig={routeGuideIconConfig}
        homePathClick={homePathClick}
        homeAncestorKeys={homeAncestorKeys}
      />
    ) : null;

  const routeguideBrand = config && "RouteguideBrand" in config && config.RouteguideBrand === true;
  const headings = useMemo(() => {
    if (!routeguideBrand) return [];
    const specificIds =
      config && "RouteGuideSpeciFicbrand" in config ? (config.RouteGuideSpeciFicbrand ?? []) : [];
    return extractHeadingsFromHtml(html, specificIds);
  }, [routeguideBrand, html, config]);

  const validPositions: TocPosition[] = ["center", "left", "right"];
  const fromConfig = config && "RouteguideBrandPosition" in config ? config.RouteguideBrandPosition : undefined;
  const tocPosition: TocPosition =
    (fromConfig && validPositions.includes(fromConfig as TocPosition) ? (fromConfig as TocPosition) : null) ??
    (validPositions.includes(tocPositionDefault) ? tocPositionDefault : "center");

  const markdownContent = (
    <article className={styles.card}>
      <div className={styles.markdown} style={containerStyle} dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );

  const header = (
    <>
      {breadcrumb}
      {!contentOnly && <ContentHeaderBlock config={config} language={language} isDarkMode={isDarkMode} />}
    </>
  );

  const content =
    fullscreenEnabled
      ? (fullscreenButton: React.ReactNode, options?: { contentOnly?: boolean }) => {
          const hideToc = contentOnly || options?.contentOnly;
          const showToc = !hideToc && routeguideBrand && headings.length > 0;
          return showToc ? (
            <TocContainer
              headings={headings}
              position={tocPosition}
              markdownContent={markdownContent}
              useDefaultScrollBehavior={useDefaultScrollBehavior}
              contentActions={fullscreenButton}
              containerTop={config?.RouteguideBrandContainerTop ?? tocContainerTopDefault ?? false}
            />
          ) : (
            <div style={{ position: "relative" }}>
              {markdownContent}
              {fullscreenButton}
            </div>
          );
        }
      : (_fullscreenButton: React.ReactNode, options?: { contentOnly?: boolean }) => {
          const hideToc = contentOnly || options?.contentOnly;
          const showToc = !hideToc && routeguideBrand && headings.length > 0;
          return showToc ? (
          <TocContainer
            headings={headings}
            position={tocPosition}
            markdownContent={markdownContent}
            useDefaultScrollBehavior={useDefaultScrollBehavior}
            containerTop={config?.RouteguideBrandContainerTop ?? tocContainerTopDefault ?? false}
          />
        ) : (
          markdownContent
        );
        };

  return (
    <ContentContainerWrapper
      header={header}
      fullscreenEnabled={fullscreenEnabled}
      fullscreenCloseLabel={fullscreenCloseLabel}
      fullscreenExpandLabel={fullscreenExpandLabel}
      onBeforeFullscreen={onFullscreenOpen}
      onAfterFullscreen={onFullscreenClose}
      marginTop={config?.marginTop}
      marginBottom={config?.marginBottom}
      browseNav={browseNav}
    >
      {content}
    </ContentContainerWrapper>
  );
}
