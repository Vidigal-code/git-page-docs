const PDF_TAB_RELEASE_INTERVAL_MS = 1000;

/** A separate URL keeps the PDF usable after its original route has unmounted. */
export function showPdfInTab(tab: Window, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  try {
    tab.location.replace(url);
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
  const releaseTimer = window.setInterval(() => {
    if (!tab.closed) return;
    window.clearInterval(releaseTimer);
    URL.revokeObjectURL(url);
  }, PDF_TAB_RELEASE_INTERVAL_MS);
}
