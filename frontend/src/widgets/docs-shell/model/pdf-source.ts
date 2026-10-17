const LOCAL_URL_BASE = "https://pdf.local.invalid";
const HTTP_PROTOCOLS = new Set(["https:", "http:"]);
const DEFAULT_PDF_FILENAME = "document.pdf";

/** Accepts resolved HTTP(S) assets and site-relative paths without protocol-relative URLs. */
export function resolvePdfSource(source: string): string | undefined {
  const value = source.trim();
  const isLocal = value.startsWith("/") && !value.startsWith("//");
  if (!value || value.includes("\\") || (!isLocal && !/^https?:\/\//i.test(value))) return undefined;
  try {
    const url = new URL(value, LOCAL_URL_BASE);
    if (!HTTP_PROTOCOLS.has(url.protocol) || url.username || url.password) return undefined;
    return isLocal ? `${url.pathname}${url.search}${url.hash}` : url.href;
  } catch {
    return undefined;
  }
}

export function pdfFileName(source: string): string {
  try {
    const basename = new URL(source, LOCAL_URL_BASE).pathname.split("/").at(-1);
    const name = decodeURIComponent(basename ?? "").replace(/[^\p{L}\p{N}._-]+/gu, "_");
    if (!name) return DEFAULT_PDF_FILENAME;
    return /\.pdf$/i.test(name) ? name : `${name}.pdf`;
  } catch {
    return DEFAULT_PDF_FILENAME;
  }
}
