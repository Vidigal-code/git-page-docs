"use client";

import { type ReactElement } from "react";
import { useMarkdownContent, type MarkdownMarkersOptions, type BreadcrumbItem, type LanguageCode } from "@/entities/docs";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { resolveContentHeaderText } from "./content-header-text";
import { DOCUMENT_METADATA_LAYOUT, resolveRouteMetadataLayout, RouteMetadata } from "./route-metadata";
import { getContainerStyle } from "./container-style";
import type { RouteContainerFrameProps } from "./container-wrapper-props";
import { RouteContentFrame } from "./route-content-frame";
import { MdSourceActions, type MdSourceActionLabels } from "./md-source-actions";
import { RouteGuideBreadcrumb, TocContainer } from "@/features/route-guide";
import type { TocPosition } from "@/features/route-guide";
import styles from "../../docs-shell.module.css";

const VALID_TOC_POSITIONS: ReadonlySet<TocPosition> = new Set<TocPosition>(["center", "left", "right"]);

interface MdContainerProps extends RouteContainerFrameProps {
  html: string;
  instanceId?: string;
  language: LanguageCode;
  markdownMarkerDefaults?: MarkdownMarkersOptions;
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

export function MdContainer(props: Readonly<MdContainerProps>): ReactElement {
  const {
    html,
    instanceId,
    config,
    language,
    markdownMarkerDefaults,
    fullscreenEnabled = false,
    isDarkMode = false,
    routeGuideEnabled = true,
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
  const configuredLayout = resolveRouteMetadataLayout(config?.layout, DOCUMENT_METADATA_LAYOUT);
  const metadata = {
    config,
    header: resolveContentHeaderText(contentOnly ? undefined : config, language, isDarkMode),
    layout: {
      title: { ...configuredLayout.title, placement: "outside" as const },
      description: { ...configuredLayout.description, placement: "outside" as const },
    },
  };
  const breadcrumb =
    (config?.RouteGuide ?? routeGuideEnabled) &&
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

  const { html: renderedHtml, headings } = useMarkdownContent({ html, config, language, instanceId, defaults: markdownMarkerDefaults });

  const fromConfig = config && "RouteguideBrandPosition" in config ? config.RouteguideBrandPosition : undefined;
  const tocPosition: TocPosition =
    (fromConfig && VALID_TOC_POSITIONS.has(fromConfig) ? fromConfig : null) ??
    (VALID_TOC_POSITIONS.has(tocPositionDefault) ? tocPositionDefault : "center");

  const markdownContent = (
    <article className={styles.card}>
      <div className={styles.markdown} style={containerStyle} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
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
      <RouteMetadata {...metadata} slot={{ placement: "outside", position: "before" }} />
    </>
  );

  // Without fullscreen the wrapper's button is left out, so only the source actions sit beside the content.
  const content = (fullscreenButton: React.ReactNode, options?: { contentOnly?: boolean }) => {
    const contentActions = withSourceActions(fullscreenEnabled ? fullscreenButton : null);
    const hideToc = contentOnly || options?.contentOnly;
    const showToc = !hideToc && headings.length > 0;
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
    <RouteContentFrame frame={props} header={header} footer={<RouteMetadata {...metadata} slot={{ placement: "outside", position: "after" }} />}>
      {content}
    </RouteContentFrame>
  );
}
