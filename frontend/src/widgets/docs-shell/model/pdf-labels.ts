import { getLangMenuLabelFromMenu, type LanguageCode, type SiteConfig } from "@/entities/docs";

export interface PdfLabels {
  title: string;
  download: string;
  openInNewTab: string;
  unavailable: string;
  downloadError: string;
  openError: string;
  downloading: string;
}

export function resolvePdfLabels(langmenu: SiteConfig["langmenu"] | undefined, language: LanguageCode): PdfLabels {
  const menu = langmenu ?? {};
  return {
    title: getLangMenuLabelFromMenu(menu, language, "titleHeaderMenuPdf", "PDF"),
    download: getLangMenuLabelFromMenu(menu, language, "PdfDownload", "Download PDF"),
    openInNewTab: getLangMenuLabelFromMenu(menu, language, "PdfOpenInNewTab", "Open in new tab"),
    unavailable: getLangMenuLabelFromMenu(menu, language, "PdfUnavailable", "PDF unavailable. Open or download a valid document."),
    downloadError: getLangMenuLabelFromMenu(menu, language, "PdfDownloadError", "Could not download PDF."),
    openError: getLangMenuLabelFromMenu(menu, language, "PdfOpenError", "Could not open PDF. Check the file and allow pop-ups, then try again."),
    downloading: getLangMenuLabelFromMenu(menu, language, "PdfDownloading", "Downloading PDF..."),
  };
}
