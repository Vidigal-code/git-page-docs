import { useEffect, useRef, useState } from "react";
import { pdfFileName } from "./pdf-source";
import { showPdfInTab } from "./pdf-tab";
import type { PdfResource } from "./use-pdf-document";

interface PdfActions {
  downloading: boolean;
  opening: boolean;
  downloadError: boolean;
  openError: boolean;
  download: () => Promise<void>;
  openInNewTab: () => Promise<void>;
}

export function usePdfActions(source: string, resource: PdfResource): PdfActions {
  const [downloading, setDownloading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [openError, setOpenError] = useState(false);
  const mounted = useRef(true);
  const pendingTab = useRef<Window | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pendingTab.current?.close();
      pendingTab.current = null;
    };
  }, []);

  const download = async (): Promise<void> => {
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

  const openInNewTab = async (): Promise<void> => {
    setOpenError(false);
    let tab: Window | null = null;
    try {
      tab = window.open("about:blank", "_blank");
      if (!tab) throw new Error("The PDF tab was blocked.");
      pendingTab.current = tab;
      tab.opener = null;
      setOpening(true);
      const loaded = await resource.load();
      if (!mounted.current) return;
      if (tab.closed) {
        pendingTab.current = null;
        return;
      }
      if (!loaded) throw new Error("The PDF could not be loaded.");
      showPdfInTab(tab, loaded.blob);
      pendingTab.current = null;
    } catch {
      tab?.close();
      pendingTab.current = null;
      if (mounted.current) setOpenError(true);
    } finally {
      if (mounted.current) setOpening(false);
    }
  };

  return { downloading, opening, downloadError, openError, download, openInNewTab };
}
