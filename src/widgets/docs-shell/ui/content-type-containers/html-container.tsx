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

const EXTERNAL_LINK_LABELS: Record<string, { message: string; button: string }> = {
  pt: {
    message: "Esta página não pode ser incorporada. Abra em uma nova aba para visualizar.",
    button: "Abrir em nova aba",
  },
  es: {
    message: "Esta página no puede incrustarse. Ábrela en una nueva pestaña para verla.",
    button: "Abrir en nueva pestaña",
  },
  en: {
    message: "This page cannot be embedded. Open it in a new tab to view.",
    button: "Open in new tab",
  },
};

function getExternalLinkLabels(lang: string) {
  return EXTERNAL_LINK_LABELS[lang] ?? EXTERNAL_LINK_LABELS.en;
}

interface ExternalLinkFallbackProps {
  url: string;
  language: string;
  messageClassName: string;
  buttonClassName: string;
}

function ExternalLinkFallback({
  url,
  language,
  messageClassName,
  buttonClassName,
}: ExternalLinkFallbackProps) {
  const { message, button } = getExternalLinkLabels(language);
  return (
    <div className={styles.externalLinkCard}>
      <p className={messageClassName}>{message}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClassName}>
        {button}
      </a>
    </div>
  );
}

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
  /** Called when fullscreen is about to open (for URL sync) */
  onFullscreenOpen?: () => void;
  /** Called when fullscreen is about to close (for URL sync) */
  onFullscreenClose?: () => void;
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
  onFullscreenOpen,
  onFullscreenClose,
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
  const wrapperClass = isBlocked
    ? `${styles.htmlWrapper} ${styles.htmlWrapperExternalLink}`
    : styles.htmlWrapper;
  const content = (
    <article className={styles.card}>
      <div className={wrapperClass} style={containerStyle}>
        {isBlocked ? (
          <ExternalLinkFallback
            url={externalUrl ?? ""}
            language={language}
            messageClassName={styles.externalLinkMessage}
            buttonClassName={styles.externalLinkButton}
          />
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
