"use client";

import { useEffect, useRef, useState } from "react";
import type { LanguageCode, SiteConfig } from "@/entities/docs";
import { pdfFileName, resolvePdfSource } from "../../model/pdf-source";
import { usePdfDocument } from "../../model/use-pdf-document";
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
  langmenu?: SiteConfig["langmenu"];
}

interface PdfDocumentProps {
  source: string;
  title: string;
  previewEnabled: boolean;
  downloadEnabled: boolean;
  openInNewTabEnabled: boolean;
  labels: PdfLabels;
}

function PdfDocument({ source, title, previewEnabled, downloadEnabled, openInNewTabEnabled, labels }: Readonly<PdfDocumentProps>) {
  const resource = usePdfDocument(source, { previewEnabled });
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const download = async () => {
    setDownloading(true);
    setDownloadError(false);
    try {
      const loaded = await resource.load();
      if (!mounted.current) return;
      if (!loaded) {
        setDownloadError(true);
        return;
      }
      const link = document.createElement("a");
      link.href = loaded.url;
      link.download = pdfFileName(source);
      link.click();
    } catch {
      if (mounted.current) setDownloadError(true);
    } finally {
      if (mounted.current) setDownloading(false);
    }
  };
  return <>
    <div className={styles.actions}>
      {downloadEnabled && <button type="button" className={shellStyles.button} onClick={() => void download()} disabled={downloading}>{downloading ? labels.downloading : labels.download}</button>}
      {openInNewTabEnabled && <a className={shellStyles.button} href={source} target="_blank" rel="noopener noreferrer">{labels.openInNewTab}</a>}
    </div>
    {downloadError && <p role="alert">{labels.downloadError}</p>}
    {previewEnabled && resource.document && <iframe className={styles.preview} title={title} src={resource.document.url} />}
    {previewEnabled && resource.state === "loading" && <output>{labels.downloading}</output>}
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
      />
    </MediaCard>
  );
}
