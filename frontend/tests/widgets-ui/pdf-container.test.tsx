// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import { PageContentArea } from "@/widgets/docs-shell/ui/page-content-area";
import { useDocsShellNavigationState } from "@/widgets/docs-shell/model/use-docs-shell-navigation-state";
import { useDocsShellLabels } from "@/widgets/docs-shell/model/use-docs-shell-labels";
import { resolveRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { makeDocsData } from "../widgets-model/fixtures";
import type { LoadedDocsData } from "@/entities/docs";
import { PdfContainer } from "@/widgets/docs-shell/ui/content-type-containers/pdf-container";

const previewUrl = "blob:https://docs.example.com/pdf-preview";
const fetchPdf = vi.fn();
const revokeUrl = vi.fn();
beforeEach(() => {
  fetchPdf.mockImplementation(() => Promise.resolve(new Response("%PDF-1.7 sample", { status: 200 })));
  vi.stubGlobal("fetch", fetchPdf);
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = vi.fn(() => previewUrl);
    static revokeObjectURL = revokeUrl;
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
const documentUrl = "https://docs.example.com/guide.pdf";
const baseProps = {
  pathPdf: documentUrl,
  language: "en",
  fullscreenCloseLabel: "Close",
  fullscreenExpandLabel: "Expand",
};

it("renders the native PDF preview and the two document actions by default", async () => {
  render(<PdfContainer {...baseProps} />);
  expect((await screen.findByTitle("PDF")).getAttribute("src")).toBe(previewUrl);
  expect(screen.getByRole("button", { name: "Download PDF" })).not.toBeNull();
  expect(screen.getByRole("button", { name: "Open in new tab" })).not.toBeNull();
});

it("honors site defaults, route overrides, and the global PDF switch", async () => {
  const config = { id: 23, pdf: { pathPdf: { en: documentUrl }, previewEnabled: false, downloadEnabled: false } };
  const { rerender } = render(<PdfContainer {...baseProps} config={config} sitePdf={{ openInNewTabEnabled: false }} />);
  expect(screen.queryByTitle("PDF")).toBeNull();
  expect(screen.queryByRole("button", { name: "Download PDF" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Open in new tab" })).toBeNull();
  rerender(<PdfContainer {...baseProps} config={{ id: 23, pdf: { pathPdf: { en: documentUrl }, previewEnabled: true, downloadEnabled: true, openInNewTabEnabled: true } }} sitePdf={{ previewEnabled: false, downloadEnabled: false, openInNewTabEnabled: false }} />);
  expect(await screen.findByTitle("PDF")).not.toBeNull();
  expect(screen.getByRole("button", { name: "Download PDF" })).not.toBeNull();
  expect(screen.getByRole("button", { name: "Open in new tab" })).not.toBeNull();
  rerender(<PdfContainer {...baseProps} config={config} sitePdf={{ enabled: false }} />);
  expect(screen.queryByRole("article")).toBeNull();
});

it.each(["javascript:alert(1)", "data:application/pdf;base64,AAAA", "//untrusted.example/file.pdf", "", "file:///C:/secret.pdf"])("rejects an unavailable or unsafe PDF source: %s", (pathPdf) => {
  render(<PdfContainer {...baseProps} pathPdf={pathPdf} />);
  expect(screen.queryByTitle("PDF")).toBeNull();
  expect(screen.queryByRole("button", { name: "Open in new tab" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Download PDF" })).toBeNull();
  expect(screen.getByRole("status").textContent).toContain("PDF unavailable");
});

it("downloads the validated document using the preview cache and releases its temporary URL", async () => {
  let downloadedFile: { href: string; name: string } | undefined;
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    downloadedFile = { href: this.href, name: this.download };
  });
  const { unmount } = render(<PdfContainer {...baseProps} />);
  await screen.findByTitle("PDF");
  fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
  await waitFor(() => expect(downloadedFile).toEqual({ href: previewUrl, name: "guide.pdf" }));
  expect(fetchPdf).toHaveBeenCalledTimes(1);
  unmount();
  expect(revokeUrl).toHaveBeenCalledWith(previewUrl);
});

it.each(["http", "network", "html"])("reports %s download errors and keeps the open action available", async (failure) => {
  if (failure === "network") fetchPdf.mockRejectedValueOnce(new TypeError("CORS denied"));
  else fetchPdf.mockResolvedValueOnce(new Response("<html>Not a PDF</html>", { status: failure === "http" ? 404 : 200 }));
  render(<PdfContainer {...baseProps} sitePdf={{ previewEnabled: false }} />);
  expect(fetchPdf).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
  expect((screen.getByRole("button", { name: "Downloading PDF..." }) as HTMLButtonElement).disabled).toBe(true);
  expect((await screen.findByRole("alert")).textContent).toBe("Could not download PDF.");
  expect(screen.queryByTitle("PDF")).toBeNull();
  expect(screen.getByRole("button", { name: "Open in new tab" })).not.toBeNull();
});

it("localizes PDF actions and status messages from langmenu", async () => {
  const langmenu = { pt: { titleHeaderMenuPdf: "Documento PDF", PdfDownload: "Baixar PDF", PdfOpenInNewTab: "Abrir em nova guia", PdfUnavailable: "PDF indisponivel", PdfDownloading: "Carregando PDF" } };
  const { rerender } = render(<PdfContainer {...baseProps} language="pt" langmenu={langmenu} />);
  expect(await screen.findByTitle("Documento PDF")).not.toBeNull();
  expect(screen.getByRole("button", { name: "Baixar PDF" })).not.toBeNull();
  expect(screen.getByRole("button", { name: "Abrir em nova guia" })).not.toBeNull();
  rerender(<PdfContainer {...baseProps} language="pt" langmenu={langmenu} pathPdf="" />);
  expect(screen.getByRole("status").textContent).toBe("PDF indisponivel");
});

function PdfPageHarness({ data }: Readonly<{ data: LoadedDocsData }>) {
  const nav = useDocsShellNavigationState({ data, language: "en", setSidebarOpen: () => undefined, setMenuOpen: () => undefined });
  const labels = useDocsShellLabels(data, "en");
  return <PageContentArea currentPage={data.pages?.[nav.pageIndex]} data={data} language="en" labels={labels} browse={nav.browse} navigation={{
    routeGuideEnabled: false, breadcrumbTrail: [], onMenuClick: nav.onMenuClick, homePathClick: undefined, homeAncestorKeys: [],
    routeGuideIconConfig: resolveRouteGuideIconConfig({}, false, ""),
    audioRouteControlsConfig: { playLabel: "Play", pauseLabel: "Pause", restartLabel: "Restart", loopOnLabel: "Loop", loopOffLabel: "Stop loop" },
  }} />;
}

it("browses PDF documents while preserving the page's Markdown content", async () => {
  const data = makeDocsData({ pages: [
    { id: 23, md: { routeId: 23, config: { id: 23 }, markdownByLanguage: { en: "<h1>PDF guide</h1>" } },
      pdf: { routeId: 23, config: { id: 23, browseAll: true, title: { en: "First PDF" } }, pathPdfByLanguage: { en: documentUrl } } },
    { id: 24, pdf: { routeId: 24, config: { id: 24, title: { en: "Second PDF" } }, pathPdfByLanguage: { en: "/git-page-docs/second.pdf" } } },
  ] });
  render(<PdfPageHarness data={data} />);
  expect(await screen.findByTitle("First PDF")).not.toBeNull();
  expect(screen.getByRole("heading", { name: "PDF guide" })).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(await screen.findByTitle("Second PDF")).not.toBeNull();
  expect(screen.getByRole("heading", { name: "PDF guide" })).not.toBeNull();
  expect(fetchPdf).toHaveBeenLastCalledWith("/git-page-docs/second.pdf", expect.objectContaining({ signal: expect.any(AbortSignal) }));
});

it.each(["", "   "])("gives the native PDF preview an accessible name when its configured title is '%s'", async (title) => {
  render(<PdfContainer {...baseProps} config={{ id: 23, title: { en: title } }} />);
  expect(await screen.findByTitle("PDF")).not.toBeNull();
});

it("aborts a pending PDF request when the document is removed", () => {
  let signal: AbortSignal | undefined;
  fetchPdf.mockImplementationOnce((_source: string, options: RequestInit) => {
    signal = options.signal ?? undefined;
    return new Promise<Response>(() => undefined);
  });
  const { unmount } = render(<PdfContainer {...baseProps} />);
  expect(signal?.aborted).toBe(false);
  unmount();
  expect(signal?.aborted).toBe(true);
});

it("releases the previous PDF preview and fetches the new source on navigation", async () => {
  const { rerender } = render(<PdfContainer {...baseProps} />);
  await screen.findByTitle("PDF");
  rerender(<PdfContainer {...baseProps} pathPdf="/git-page-docs/new.pdf" />);
  await screen.findByTitle("PDF");
  expect(revokeUrl).toHaveBeenCalledWith(previewUrl);
  expect(fetchPdf).toHaveBeenLastCalledWith("/git-page-docs/new.pdf", expect.objectContaining({ signal: expect.any(AbortSignal) }));
});

it("reports an invalid PDF preview without hiding the open action", async () => {
  fetchPdf.mockResolvedValueOnce(new Response("<html>Unexpected response</html>", { status: 200 }));
  render(<PdfContainer {...baseProps} />);
  await waitFor(() => expect(screen.getByRole("status").textContent).toContain("PDF unavailable"));
  expect(screen.queryByTitle("PDF")).toBeNull();
  expect(screen.getByRole("button", { name: "Open in new tab" })).not.toBeNull();
});

it("skips protected PDFs during browsing and does not fetch a denied PDF section in a mixed page", async () => {
  const privateUrl = "https://docs.example.com/private.pdf";
  const publicUrl = "https://docs.example.com/public.pdf";
  const protectedPdf = { routeId: 24, config: { id: 24, title: { en: "Protected PDF" }, authorization: { requiredRoles: ["editor"] } }, pathPdfByLanguage: { en: privateUrl } };
  const publicMd = { routeId: 23, config: { id: 23 }, markdownByLanguage: { en: "<h1>Public guide</h1>" } };
  const data = makeDocsData({ pages: [
    { id: 23, md: publicMd, pdf: { routeId: 23, config: { id: 23, browseAll: true, title: { en: "First PDF" } }, pathPdfByLanguage: { en: documentUrl } } },
    { id: 24, pdf: protectedPdf },
    { id: 25, pdf: { routeId: 25, config: { id: 25, title: { en: "Public PDF" } }, pathPdfByLanguage: { en: publicUrl } } },
  ] });
  const { unmount } = render(<PdfPageHarness data={data} />);
  await screen.findByTitle("First PDF");
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(await screen.findByTitle("Public PDF")).not.toBeNull();
  expect(fetchPdf.mock.calls.some(([url]) => url === privateUrl)).toBe(false);
  unmount();
  fetchPdf.mockClear();
  render(<PdfPageHarness data={makeDocsData({ pages: [{ id: 24, md: publicMd, pdf: protectedPdf }] })} />);
  expect(screen.getByRole("heading", { name: "Public guide" })).not.toBeNull();
  expect(screen.queryByRole("button", { name: "Download PDF" })).toBeNull();
  expect(fetchPdf).not.toHaveBeenCalled();
});
