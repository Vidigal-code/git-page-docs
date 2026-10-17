"use client";

import type { LanguageCode, SiteConfig } from "@/entities/docs";
import { FiDownload } from "@react-icons/all-files/fi/FiDownload";
import { FiExternalLink } from "@react-icons/all-files/fi/FiExternalLink";
import { resolveControlIcon, type ControlIconSettings } from "@/shared/lib/icons/resolve-control-icon";
import { ControlIcon, type ControlIconConfig } from "@/shared/ui/control-icon";
import { resolvePdfSource } from "../../model/pdf-source";
import { usePdfDocument } from "../../model/use-pdf-document";
import { usePdfActions } from "../../model/use-pdf-actions";
import { resolvePdfLabels, type PdfLabels } from "../../model/pdf-labels";
import type { RouteContainerFrameProps } from "./container-wrapper-props";
import { resolveContentHeaderText } from "./content-header-text";
import { MediaCard } from "./route-content-frame";
import styles from "./pdf-container.module.css";
import shellStyles from "../../docs-shell.module.css";

interface PdfContainerProps extends RouteContainerFrameProps {
  pathPdf: string;
  language: LanguageCode;
  isDarkMode?: boolean;
  sitePdf?: SiteConfig["pdf"];
  siteIconSettings?: ControlIconSettings;
  langmenu?: SiteConfig["langmenu"];
}

interface PdfDocumentProps {
  source: string;
  title: string;
  previewEnabled: boolean;
  downloadEnabled: boolean;
  openInNewTabEnabled: boolean;
  labels: PdfLabels;
  icons: { download?: ControlIconConfig; openInNewTab?: ControlIconConfig };
}

function PdfDocument({ source, title, previewEnabled, downloadEnabled, openInNewTabEnabled, labels, icons }: Readonly<PdfDocumentProps>) {
  const resource = usePdfDocument(source, { previewEnabled });
  const actions = usePdfActions(source, resource);
  const downloadLabel = actions.downloading ? labels.downloading : labels.download;
  return <>
    <div className={styles.actions}>
      {downloadEnabled && <button
        type="button"
        className={shellStyles.button}
        onClick={() => void actions.download()}
        disabled={actions.downloading}
        aria-busy={actions.downloading}
        aria-label={downloadLabel}
        title={downloadLabel}
      >{icons.download ? <ControlIcon icon={icons.download} fallback={<FiDownload aria-hidden />} /> : downloadLabel}</button>}
      {openInNewTabEnabled && <button
        type="button"
        className={shellStyles.button}
        onClick={() => void actions.openInNewTab()}
        disabled={actions.opening}
        aria-busy={actions.opening}
        aria-label={labels.openInNewTab}
        title={labels.openInNewTab}
      >{icons.openInNewTab ? <ControlIcon icon={icons.openInNewTab} fallback={<FiExternalLink aria-hidden />} /> : labels.openInNewTab}</button>}
    </div>
    {actions.downloadError && <p role="alert">{labels.downloadError}</p>}
    {actions.openError && <p role="alert">{labels.openError}</p>}
    {previewEnabled && resource.document && <iframe className={styles.preview} title={title} src={resource.document.url} />}
    {(previewEnabled || actions.opening) && resource.state === "loading" && <output>{labels.downloading}</output>}
    {previewEnabled && resource.state === "error" && <output>{labels.unavailable}</output>}
  </>;
}

export function PdfContainer(props: Readonly<PdfContainerProps>) {
  const { pathPdf, language, config, isDarkMode = false, sitePdf } = props;
  if (sitePdf?.enabled === false) return null;
  const previewEnabled = config?.pdf?.previewEnabled ?? sitePdf?.previewEnabled ?? true;
  const downloadEnabled = config?.pdf?.downloadEnabled ?? sitePdf?.downloadEnabled ?? true;
  const openInNewTabEnabled = config?.pdf?.openInNewTabEnabled ?? sitePdf?.openInNewTabEnabled ?? true;
  const header = resolveContentHeaderText(config, language, isDarkMode);
  const labels = resolvePdfLabels(props.langmenu, language);
  const source = resolvePdfSource(pathPdf);
  const mode = isDarkMode ? "dark" : "light";
  const icons = {
    download: resolveControlIcon(props.siteIconSettings, { name: "PdfDownload", mode }),
    openInNewTab: resolveControlIcon(props.siteIconSettings, { name: "PdfOpenInNewTab", mode }),
  };
  if (!source) {
    return <MediaCard frame={props} header={header}><output>{labels.unavailable}</output></MediaCard>;
  }
  return (
    <MediaCard frame={props} header={header}>
      <PdfDocument
        key={`${source}:${previewEnabled}`}
        source={source}
        title={header.title?.trim() || labels.title}
        previewEnabled={previewEnabled}
        downloadEnabled={downloadEnabled}
        openInNewTabEnabled={openInNewTabEnabled}
        labels={labels}
        icons={icons}
      />
    </MediaCard>
  );
}
