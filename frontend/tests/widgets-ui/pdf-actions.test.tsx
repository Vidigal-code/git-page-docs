// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PdfContainer } from "@/widgets/docs-shell/ui/content-type-containers/pdf-container";

const sourceUrl = "https://raw.example.com/guide.pdf";
const previewUrl = "blob:https://docs.example.com/preview";
const openedUrl = "blob:https://docs.example.com/opened";
const fetchPdf = vi.fn();
const revokeUrl = vi.fn();
const createUrl = vi.fn();
const tab = {
  opener: null as Window | null,
  closed: false,
  close: vi.fn(),
  location: { replace: vi.fn() },
  document: document.implementation.createHTMLDocument(),
};
const baseProps = { pathPdf: sourceUrl, language: "en", fullscreenCloseLabel: "Close", fullscreenExpandLabel: "Expand" };

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  fetchPdf.mockReset();
  createUrl.mockReset();
  tab.opener = window;
  tab.closed = false;
  fetchPdf.mockImplementation(() => Promise.resolve(new Response("%PDF-1.7 sample", { status: 200 })));
  createUrl.mockReturnValueOnce(previewUrl).mockReturnValue(openedUrl);
  vi.stubGlobal("fetch", fetchPdf);
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = createUrl;
    static revokeObjectURL = revokeUrl;
  });
  vi.spyOn(window, "open").mockReturnValue(tab as unknown as Window);
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  tab.closed = true;
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

it("reserves a tab during the click and opens a validated PDF Blob when preview is disabled", async () => {
  let finishFetch: (response: Response) => void = () => undefined;
  fetchPdf.mockImplementationOnce(() => new Promise<Response>((resolve) => { finishFetch = resolve; }));
  render(<PdfContainer {...baseProps} sitePdf={{ previewEnabled: false }} />);
  expect(fetchPdf).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Open in new tab" }));
  expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
  expect(tab.opener).toBeNull();
  expect(tab.location.replace).not.toHaveBeenCalled();
  finishFetch(new Response("%PDF-1.7 sample", { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": "attachment" } }));
  await waitFor(() => expect(tab.location.replace).toHaveBeenCalledWith(openedUrl));
  expect(createUrl.mock.calls[1][0].type).toBe("application/pdf");
  expect(fetchPdf).toHaveBeenCalledTimes(1);
});

it("keeps an opened PDF available after route changes and releases it when its tab closes", async () => {
  const { rerender } = render(<PdfContainer {...baseProps} sitePdf={{ previewEnabled: false }} />);
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Open in new tab" })); });
  expect(tab.location.replace).toHaveBeenCalledWith(openedUrl);
  rerender(<PdfContainer {...baseProps} pathPdf="/other.pdf" sitePdf={{ previewEnabled: false }} />);
  expect(tab.close).not.toHaveBeenCalled();
  expect(revokeUrl).toHaveBeenCalledWith(previewUrl);
  expect(revokeUrl).not.toHaveBeenCalledWith(openedUrl);
  tab.closed = true;
  await act(async () => { await vi.runOnlyPendingTimersAsync(); });
  expect(revokeUrl).toHaveBeenCalledWith(openedUrl);
});

it.each(["blocked", "network", "http", "html", "navigation"])("reports %s errors without falling back to the raw PDF URL", async (failure) => {
  if (failure === "blocked") vi.mocked(window.open).mockReturnValueOnce(null);
  if (failure === "network") fetchPdf.mockRejectedValueOnce(new TypeError("CORS denied"));
  if (failure === "http") fetchPdf.mockResolvedValueOnce(new Response("Not found", { status: 404 }));
  if (failure === "html") fetchPdf.mockResolvedValueOnce(new Response("<html>Not a PDF</html>"));
  if (failure === "navigation") tab.location.replace.mockImplementationOnce(() => { throw new Error("Navigation denied"); });
  render(<PdfContainer {...baseProps} sitePdf={{ previewEnabled: false }} />);
  fireEvent.click(screen.getByRole("button", { name: "Open in new tab" }));
  expect((await screen.findByRole("alert")).textContent).toBe("Could not open PDF. Check the file and allow pop-ups, then try again.");
  expect(tab.location.replace).not.toHaveBeenCalledWith(sourceUrl);
  if (failure === "blocked") expect(fetchPdf).not.toHaveBeenCalled();
  else expect(tab.close).toHaveBeenCalledOnce();
});
it.each(["unmount", "source change"])("closes a pending tab on %s without navigating after cancellation", async (cancellation) => {
  let finishFetch: (response: Response) => void = () => undefined;
  fetchPdf.mockImplementationOnce(() => new Promise<Response>((resolve) => { finishFetch = resolve; }));
  const { rerender, unmount } = render(<PdfContainer {...baseProps} sitePdf={{ previewEnabled: false }} />);
  fireEvent.click(screen.getByRole("button", { name: "Open in new tab" }));
  const signal = fetchPdf.mock.calls[0][1].signal as AbortSignal;
  if (cancellation === "unmount") unmount();
  else rerender(<PdfContainer {...baseProps} pathPdf="/next.pdf" sitePdf={{ previewEnabled: false }} />);
  expect(tab.close).toHaveBeenCalledOnce();
  expect(signal.aborted).toBe(true);
  await act(async () => { finishFetch(new Response("%PDF-1.7 late result")); });
  expect(tab.location.replace).not.toHaveBeenCalled();
});

it("does not reopen or navigate a pending tab that the reader closes", async () => {
  let finishFetch: (response: Response) => void = () => undefined;
  fetchPdf.mockImplementationOnce(() => new Promise<Response>((resolve) => { finishFetch = resolve; }));
  render(<PdfContainer {...baseProps} sitePdf={{ previewEnabled: false }} />);
  fireEvent.click(screen.getByRole("button", { name: "Open in new tab" }));
  tab.closed = true;
  await act(async () => { finishFetch(new Response("%PDF-1.7 result")); });
  expect(tab.location.replace).not.toHaveBeenCalled();
  expect(screen.queryByRole("alert")).toBeNull();
});

it("configures PDF action icons independently while preserving accessible button names", () => {
  const iconSettings = {
    IconPdfDownloadReactIcones: true,
    IconPdfDownloadReactIconesTag: "FiDownload",
    IconPdfDownloadReactIconesTagColorDark: "rgb(1, 2, 3)",
    IconPdfDownloadReactIconesTagSize: "24px",
    IconPdfOpenInNewTabReactIcones: false,
  };
  const { rerender } = render(<PdfContainer {...baseProps} sitePdf={{ previewEnabled: false }} siteIconSettings={iconSettings} isDarkMode />);
  const download = screen.getByRole("button", { name: "Download PDF" });
  expect(download.textContent).toBe("");
  expect(download.getAttribute("title")).toBe("Download PDF");
  expect(download.querySelector('[aria-hidden="true"]')?.getAttribute("style")).toContain("color: rgb(1, 2, 3)");
  expect(screen.getByRole("button", { name: "Open in new tab" }).textContent).toBe("Open in new tab");
  rerender(<PdfContainer {...baseProps} sitePdf={{ previewEnabled: false }} siteIconSettings={{
    IconPdfDownloadReactIcones: false, IconPdfOpenInNewTabReactIcones: true,
  }} />);
  expect(screen.getByRole("button", { name: "Download PDF" }).textContent).toBe("Download PDF");
  expect(screen.getByRole("button", { name: "Open in new tab" }).textContent).toBe("");
  expect(screen.getByRole("button", { name: "Open in new tab" }).getAttribute("title")).toBe("Open in new tab");
});

it("reuses the validated preview when opening a PDF and localizes popup errors", async () => {
  const { rerender } = render(<PdfContainer {...baseProps} />);
  await screen.findByTitle("PDF");
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Open in new tab" })); });
  expect(fetchPdf).toHaveBeenCalledTimes(1);
  expect(tab.location.replace).toHaveBeenCalledWith(openedUrl);
  vi.mocked(window.open).mockReturnValueOnce(null);
  rerender(<PdfContainer {...baseProps} language="pt" langmenu={{ pt: { PdfOpenInNewTab: "Abrir PDF", PdfOpenError: "Permita a nova guia." } }} />);
  fireEvent.click(screen.getByRole("button", { name: "Abrir PDF" }));
  expect((await screen.findByRole("alert")).textContent).toBe("Permita a nova guia.");
});
