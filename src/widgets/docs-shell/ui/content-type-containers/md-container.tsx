"use client";

import { useMemo } from "react";
import type { ContentTypeRouteConfig } from "@/entities/docs/model/types";
import type { LanguageCode } from "@/entities/docs/model/types";
import type { BreadcrumbItem } from "@/widgets/docs-shell/model/menu-tree";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { extractHeadingsFromHtml } from "@/entities/docs/lib/markdown/extract-headings";
import { ContentContainerWrapper, type BrowseNavProps } from "./content-container-wrapper";
import { ContentHeaderBlock } from "./content-header-block";
import { RouteGuideBreadcrumb, TocTree } from "@/features/route-guide";
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
  const toc = routeguideBrand && headings.length > 0 ? <TocTree headings={headings} /> : null;

  const header = (
    <>
      {breadcrumb}
      <ContentHeaderBlock config={config} language={language} isDarkMode={isDarkMode} />
      {toc}
    </>
  );
  const content = (
    <article className={styles.card}>
      <div className={styles.markdown} style={containerStyle} dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );

  return (
    <ContentContainerWrapper
      header={header}
      fullscreenEnabled={fullscreenEnabled}
      fullscreenCloseLabel={fullscreenCloseLabel}
      fullscreenExpandLabel={fullscreenExpandLabel}
      marginTop={config?.marginTop}
      marginBottom={config?.marginBottom}
      browseNav={browseNav}
    >
      {content}
    </ContentContainerWrapper>
  );
}
