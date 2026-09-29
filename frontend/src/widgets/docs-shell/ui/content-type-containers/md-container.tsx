"use client";

import { useMemo } from "react";
import { extractHeadingsFromHtml, type BreadcrumbItem, type LanguageCode } from "@/entities/docs";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { ContentContainerWrapper } from "./content-container-wrapper";
import { ContentHeaderBlock } from "./content-header-block";
import { getContainerStyle } from "./container-style";
import { toContainerWrapperProps, type RouteContainerFrameProps } from "./container-wrapper-props";
import { MdSourceActions, type MdSourceActionLabels } from "./md-source-actions";
import { RouteGuideBreadcrumb, TocContainer } from "@/features/route-guide";
import type { TocPosition } from "@/features/route-guide";
import styles from "../../docs-shell.module.css";

const VALID_TOC_POSITIONS: ReadonlySet<TocPosition> = new Set<TocPosition>(["center", "left", "right"]);

interface MdContainerProps extends RouteContainerFrameProps {
  html: string;
  language: LanguageCode;
  isDarkMode?: boolean;
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
  /** Original markdown of the page (current language); enables copy / download. */
  markdownSource?: string;
  /** File name offered by "download .md". */
  markdownFileName?: string;
  sourceActionLabels?: MdSourceActionLabels;
}

export function MdContainer(props: Readonly<MdContainerProps>) {
  const {
    html,
    config,
    language,
    fullscreenEnabled = false,
    isDarkMode = false,
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
    markdownSource,
    markdownFileName = "document.md",
    sourceActionLabels,
  } = props;
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

  const fromConfig = config && "RouteguideBrandPosition" in config ? config.RouteguideBrandPosition : undefined;
  const tocPosition: TocPosition =
    (fromConfig && VALID_TOC_POSITIONS.has(fromConfig) ? fromConfig : null) ??
    (VALID_TOC_POSITIONS.has(tocPositionDefault) ? tocPositionDefault : "center");

  const markdownContent = (
    <article className={styles.card}>
      <div className={styles.markdown} style={containerStyle} dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );

  // Copy / download sit beside the fullscreen button (to its left when it is shown).
  const withSourceActions = (fullscreenButton: React.ReactNode) => {
    if (!markdownSource || !sourceActionLabels) return fullscreenButton;
    return (
      <>
        <MdSourceActions
          source={markdownSource}
          fileName={markdownFileName}
          labels={sourceActionLabels}
          besideFullscreen={Boolean(fullscreenButton)}
        />
        {fullscreenButton}
      </>
    );
  };

  const header = (
    <>
      {breadcrumb}
      {!contentOnly && <ContentHeaderBlock config={config} language={language} isDarkMode={isDarkMode} />}
    </>
  );

  // Without fullscreen the wrapper's button is left out, so only the source actions sit beside the content.
  const content = (fullscreenButton: React.ReactNode, options?: { contentOnly?: boolean }) => {
    const contentActions = withSourceActions(fullscreenEnabled ? fullscreenButton : null);
    const hideToc = contentOnly || options?.contentOnly;
    const showToc = !hideToc && routeguideBrand && headings.length > 0;
    return showToc ? (
      <TocContainer
        headings={headings}
        position={tocPosition}
        markdownContent={markdownContent}
        useDefaultScrollBehavior={useDefaultScrollBehavior}
        contentActions={contentActions}
        containerTop={config?.RouteguideBrandContainerTop ?? tocContainerTopDefault ?? false}
      />
    ) : (
      <div style={{ position: "relative" }}>
        {markdownContent}
        {contentActions}
      </div>
    );
  };

  return (
    <ContentContainerWrapper header={header} {...toContainerWrapperProps(props)}>
      {content}
    </ContentContainerWrapper>
  );
}
