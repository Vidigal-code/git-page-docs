"use client";

import { useMemo } from "react";
import type { ContentTypeRouteConfig } from "@/entities/docs/model/types";
import type { LanguageCode } from "@/entities/docs/model/types";
import { isFrameBlockedUrl } from "@/shared/lib/is-frame-blocked-url";
import { ContentContainerWrapper, type BrowseNavProps } from "./content-container-wrapper";
import { ContentHeaderBlock } from "./content-header-block";
import styles from "../../docs-shell.module.css";

const BASE_TARGET_BLANK = "<base target=\"_blank\" />";
const BASE_TARGET_SELF = "<base target=\"_self\" />";

function injectBaseTarget(html: string, blockLink: boolean): string {
  const baseTag = blockLink ? BASE_TARGET_BLANK : BASE_TARGET_SELF;
  const lower = html.toLowerCase();
  const headEnd = lower.indexOf("</head>");
  if (headEnd >= 0) {
    return html.slice(0, headEnd) + baseTag + html.slice(headEnd);
  }
  return baseTag + html;
}

function getContainerStyle(container: ContentTypeRouteConfig["container"]): React.CSSProperties {
  if (container === "full") {
    return { minHeight: "80vh", overflow: "auto" };
  }
  if (typeof container === "number" && container > 0) {
    return { height: container, overflow: "auto" };
  }
  return {};
}

interface HtmlContainerProps {
  html?: string;
  url?: string;
  config?: ContentTypeRouteConfig;
  language: LanguageCode;
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  isDarkMode?: boolean;
  browseNav?: BrowseNavProps;
}

export function HtmlContainer({
  html = "",
  url,
  config,
  language,
  fullscreenEnabled = false,
  fullscreenCloseLabel,
  fullscreenExpandLabel,
  isDarkMode = false,
  browseNav,
}: HtmlContainerProps) {
  const blockLink = config?.blockLink !== false;
  const srcdoc = useMemo(
    () => (html ? injectBaseTarget(html, blockLink) : null),
    [html, blockLink],
  );

  const containerStyle = getContainerStyle(config?.container);
  const externalUrl = url ?? config?.url?.[language] ?? config?.url?.en;
  const useExternalUrl = Boolean(externalUrl);
  const isBlocked = useExternalUrl && isFrameBlockedUrl(externalUrl ?? undefined);

  const header = <ContentHeaderBlock config={config} language={language} isDarkMode={isDarkMode} />;
  const content = (
    <article className={styles.card}>
      <div className={styles.htmlWrapper} style={containerStyle}>
        {isBlocked ? (
          <div className={styles.externalLinkCard}>
            <p className={styles.externalLinkMessage}>
              {language === "pt"
                ? "Esta página não pode ser incorporada. Abra em uma nova aba para visualizar."
                : language === "es"
                  ? "Esta página no puede incrustarse. Ábrela en una nueva pestaña para verla."
                  : "This page cannot be embedded. Open it in a new tab to view."}
            </p>
            <a
              href={externalUrl ?? ""}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLinkButton}
            >
              {language === "pt"
                ? "Abrir em nova aba"
                : language === "es"
                  ? "Abrir en nueva pestaña"
                  : "Open in new tab"}
            </a>
          </div>
        ) : useExternalUrl ? (
          <iframe
            title="HTML content"
            className={styles.htmlIframe}
            src={externalUrl ?? ""}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
          />
        ) : (
          <iframe
            title="HTML content"
            className={styles.htmlIframe}
            srcDoc={srcdoc ?? undefined}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
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
