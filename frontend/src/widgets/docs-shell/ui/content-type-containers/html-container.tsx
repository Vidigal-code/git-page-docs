"use client";

import { useMemo } from "react";
import type { ContentTypeRouteConfig, LanguageCode } from "@/entities/docs";
import { isFrameBlockedUrl } from "@/shared/lib/is-frame-blocked-url";
import type { BrowseNavConfig } from "../page-content-browse-nav";
import { ContentContainerWrapper } from "./content-container-wrapper";
import { ContentHeaderBlock } from "./content-header-block";
import styles from "../../docs-shell.module.css";

const BASE_TARGET_BLANK = "<base target=\"_blank\" />";
const BASE_TARGET_SELF = "<base target=\"_self\" />";
const IFRAME_SANDBOX = "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";

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
}: Readonly<ExternalLinkFallbackProps>) {
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

interface HtmlBodyOptions {
  isBlocked: boolean;
  externalUrl: string | undefined;
  language: string;
  srcdoc: string | null;
}

/** The embedded page: an open-in-new-tab card when the host blocks framing, else the external or inline iframe. */
function renderHtmlBody({ isBlocked, externalUrl, language, srcdoc }: HtmlBodyOptions): React.ReactNode {
  if (isBlocked) {
    return (
      <ExternalLinkFallback
        url={externalUrl ?? ""}
        language={language}
        messageClassName={styles.externalLinkMessage}
        buttonClassName={styles.externalLinkButton}
      />
    );
  }
  if (externalUrl) {
    return (
      <iframe
        title="HTML content"
        className={styles.htmlIframe}
        src={externalUrl}
        sandbox={IFRAME_SANDBOX}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <iframe
      title="HTML content"
      className={styles.htmlIframe}
      srcDoc={srcdoc ?? undefined}
      sandbox={IFRAME_SANDBOX}
      referrerPolicy="no-referrer"
    />
  );
}

interface HtmlContainerProps {
  html?: string;
  url?: string;
  config?: ContentTypeRouteConfig;
  language: LanguageCode;
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  /** When true, hide header (title/description) - e.g. in URL fullscreen overlay */
  hideHeader?: boolean;
  isDarkMode?: boolean;
  browseNav?: BrowseNavConfig;
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
  hideHeader = false,
}: Readonly<HtmlContainerProps>) {
  const blockLink = config?.blockLink !== false;
  const srcdoc = useMemo(
    () => (html ? injectBaseTarget(html, blockLink) : null),
    [html, blockLink],
  );

  const containerStyle = getContainerStyle(config?.container);
  const externalUrl = url ?? config?.url?.[language] ?? config?.url?.en;
  const useExternalUrl = Boolean(externalUrl);
  const isBlocked = useExternalUrl && isFrameBlockedUrl(externalUrl ?? undefined);

  const header = hideHeader ? null : <ContentHeaderBlock config={config} language={language} isDarkMode={isDarkMode} />;
  const wrapperClass = isBlocked
    ? `${styles.htmlWrapper} ${styles.htmlWrapperExternalLink}`
    : styles.htmlWrapper;
  const content = (
    <article className={styles.card}>
      <div className={wrapperClass} style={containerStyle}>
        {renderHtmlBody({ isBlocked, externalUrl, language, srcdoc })}
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
