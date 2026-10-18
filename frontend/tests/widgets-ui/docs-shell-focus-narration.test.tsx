// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DocsShell } from "@/widgets/docs-shell";
import type { FocusModeOptions } from "@/entities/docs";
import { makeConfig, makeDocsData, makePages, makeSite } from "../widgets-model/fixtures";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/",
  useRouter: () => navigation.router,
}));

class BrowserUtterance extends EventTarget {
  rate = 1;
  volume = 1;
  constructor(readonly text: string) { super(); }
}

const synthesis = Object.assign(new EventTarget(), {
  paused: false,
  speak: vi.fn<(utterance: BrowserUtterance) => void>(),
  cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(),
  getVoices: () => [],
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("speechSynthesis", synthesis);
  vi.stubGlobal("SpeechSynthesisUtterance", BrowserUtterance);
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function renderDocument(html = "<h1>Introduction</h1><p>First section.</p><h2>Details</h2><p>Second section.</p>", focusMode?: FocusModeOptions): void {
  const pages = makePages();
  if (!pages[0].md || !pages[1].md) throw new Error("Markdown fixtures are required");
  pages[0].md.markdownByLanguage.en = html;
  pages[1].md.markdownByLanguage.en = "<h1>Installation</h1><p>New document.</p><h2>Setup</h2><p>Following section.</p>";
  const data = makeDocsData({ pages, config: makeConfig({ site: makeSite({ FocusMode: true, AiChatEnabled: false, focusMode }) }) });
  render(<DocsShell data={data} />);
}

async function openFocusReader(): Promise<HTMLElement> {
  fireEvent.click(await screen.findByRole("button", { name: "Focus mode" }));
  const dialog = screen.getByRole("dialog", { name: "Focus mode" });
  fireEvent.click(within(dialog).getByText("Accessibility and reading", { selector: "summary" }));
  return dialog;
}

it("reads only the section visible in focus mode", async () => {
  renderDocument();
  const dialog = await openFocusReader();
  fireEvent.click(within(dialog).getByRole("button", { name: "Next section" }));
  expect(within(dialog).getByRole("heading").textContent).toBe("Details");
  fireEvent.click(within(dialog).getByRole("button", { name: "Read document" }));
  expect(synthesis.speak.mock.calls.map(([utterance]) => utterance.text)).toEqual(["Details Second section."]);
});

it("stops narration when navigating to another section with identical content", async () => {
  renderDocument("<h2>Repeated</h2><p>The same content.</p><h2>Repeated</h2><p>The same content.</p>");
  const dialog = await openFocusReader();
  fireEvent.click(within(dialog).getByRole("button", { name: "Read document" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Next section" }));
  expect(synthesis.cancel).toHaveBeenCalledOnce();
  expect(within(dialog).getByRole("button", { name: "Read document" })).toBeTruthy();
});

it("stops speech when entering and leaving focus even for a single section, preserving reading preferences", async () => {
  renderDocument("<h1>Introduction</h1><p>Only one section.</p>");
  const main = within(screen.getByRole("main"));
  fireEvent.click(main.getByText("Accessibility and reading", { selector: "summary" }));
  fireEvent.change(main.getByRole("slider", { name: /Speed/ }), { target: { value: "1.5" } });
  fireEvent.change(main.getByRole("slider", { name: /Volume/ }), { target: { value: "0.35" } });
  fireEvent.click(main.getByRole("button", { name: "Read document" }));
  const pageUtterance = synthesis.speak.mock.calls[0][0];
  const dialog = await openFocusReader();
  expect(synthesis.cancel).toHaveBeenCalledOnce();
  fireEvent.click(within(dialog).getByRole("button", { name: "Read document" }));
  const sectionUtterance = synthesis.speak.mock.calls[1][0];
  expect(sectionUtterance).toMatchObject({ text: "Introduction Only one section.", rate: 1.5, volume: 0.35 });
  fireEvent.click(within(dialog).getByRole("button", { name: "Pause reading" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  expect(synthesis.cancel).toHaveBeenCalledTimes(2);
  for (const utterance of [pageUtterance, sectionUtterance]) {
    act(() => utterance.dispatchEvent(new Event("end")));
  }
  expect(synthesis.speak).toHaveBeenCalledTimes(2);
  fireEvent.click(main.getByText("Accessibility and reading", { selector: "summary" }));
  expect(main.getByRole("button", { name: "Read document" })).toBeTruthy();
  expect(main.getByRole("button", { name: "Stop reading" }).hasAttribute("disabled")).toBe(true);
});

it("reads the whole visible document when section navigation is disabled", async () => {
  renderDocument(undefined, { sectionNavigationEnabled: false });
  const dialog = await openFocusReader();
  expect(within(dialog).getAllByRole("heading")).toHaveLength(2);
  fireEvent.click(within(dialog).getByRole("button", { name: "Read document" }));
  expect(synthesis.speak.mock.calls[0][0].text).toBe("Introduction First section. Details Second section.");
});

it("discards paused speech when navigating sections and documents, then restores full-page reading outside focus", async () => {
  renderDocument();
  const dialog = await openFocusReader();
  const focus = within(dialog);
  fireEvent.click(focus.getByRole("button", { name: "Read document" }));
  const previous = synthesis.speak.mock.calls[0][0];
  fireEvent.click(focus.getByRole("button", { name: "Pause reading" }));
  act(() => previous.dispatchEvent(new Event("end")));
  fireEvent.click(focus.getByRole("button", { name: "Next section" }));
  expect(synthesis.cancel).toHaveBeenCalledOnce();
  fireEvent.click(focus.getByRole("button", { name: "Read document" }));
  expect(synthesis.speak.mock.calls[1][0].text).toBe("Details Second section.");
  act(() => previous.dispatchEvent(new Event("resume")));
  expect(synthesis.speak).toHaveBeenCalledTimes(2);
  fireEvent.click(focus.getByRole("button", { name: "Next document" }));
  await focus.findByRole("heading", { name: "Installation" });
  const readDocument = await focus.findByRole("button", { name: "Read document" });
  expect(synthesis.cancel).toHaveBeenCalledTimes(2);
  fireEvent.click(readDocument);
  expect(synthesis.speak.mock.calls[2][0].text).toBe("Installation New document.");
  fireEvent.click(focus.getByRole("button", { name: "Close" }));
  const main = within(screen.getByRole("main"));
  fireEvent.click(main.getByText("Accessibility and reading", { selector: "summary" }));
  fireEvent.click(main.getByRole("button", { name: "Read document" }));
  expect(synthesis.speak.mock.calls[3][0].text).toBe("Installation New document. Setup Following section.");
});
