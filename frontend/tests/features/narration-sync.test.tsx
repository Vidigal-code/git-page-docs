// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useMarkdownNarration } from "@/features/markdown-narration/model/use-markdown-narration";
import { NarrationPanel } from "@/features/markdown-narration/ui/narration-panel";
import { DEFAULT_NARRATION_LABELS } from "@/features/markdown-narration/model/narration-labels";

class TestUtterance extends EventTarget {
  text: string;
  lang = "";
  rate = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  constructor(text: string) { super(); this.text = text; }
}
const synthesis = Object.assign(new EventTarget(), {
  paused: false,
  speak: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(),
  getVoices: vi.fn((): SpeechSynthesisVoice[] => []),
});
function Reader({ html = "<p>A readable document.</p>" }: Readonly<{ html?: string }>) {
  const controller = useMarkdownNarration({ html, language: "en" });
  return <>
    <NarrationPanel controller={controller} labels={DEFAULT_NARRATION_LABELS} />
    <NarrationPanel controller={controller} labels={DEFAULT_NARRATION_LABELS} />
  </>;
}
function openPanels(): void {
  for (const summary of screen.getAllByText("Accessibility and reading", { selector: "summary" })) fireEvent.click(summary);
}
beforeEach(() => {
  vi.clearAllMocks();
  synthesis.paused = false;
  vi.stubGlobal("speechSynthesis", synthesis);
  vi.stubGlobal("SpeechSynthesisUtterance", TestUtterance);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("synchronizes both reading panels with native pause and resume events", () => {
  render(<Reader />);
  openPanels();
  fireEvent.click(screen.getAllByRole("button", { name: "Read document" })[0]);
  const utterance = synthesis.speak.mock.calls[0][0] as TestUtterance;
  synthesis.paused = true;
  act(() => utterance.dispatchEvent(new Event("pause")));
  expect(screen.getAllByRole("button", { name: "Resume reading" })).toHaveLength(2);
  expect(screen.getAllByRole("status").map((element) => element.textContent)).toEqual(["Reading paused", "Reading paused"]);
  synthesis.paused = false;
  act(() => utterance.dispatchEvent(new Event("resume")));
  expect(screen.getAllByRole("button", { name: "Pause reading" })).toHaveLength(2);
});

it("waits for resume before advancing a chunk that ends while the reader is paused", () => {
  render(<Reader html={"<p>" + "A long readable paragraph. ".repeat(100) + "</p>"} />);
  openPanels();
  fireEvent.click(screen.getAllByRole("button", { name: "Read document" })[0]);
  const first = synthesis.speak.mock.calls[0][0] as TestUtterance;
  fireEvent.click(screen.getAllByRole("button", { name: "Pause reading" })[1]);
  act(() => first.dispatchEvent(new Event("end")));
  expect(synthesis.speak).toHaveBeenCalledOnce();
  expect(screen.getAllByRole("button", { name: "Resume reading" })).toHaveLength(2);
  fireEvent.click(screen.getAllByRole("button", { name: "Resume reading" })[0]);
  expect(synthesis.resume).toHaveBeenCalledOnce();
  expect(synthesis.speak).toHaveBeenCalledTimes(2);
  expect(screen.getAllByRole("button", { name: "Pause reading" })).toHaveLength(2);
  act(() => first.dispatchEvent(new Event("resume")));
  expect(synthesis.speak).toHaveBeenCalledTimes(2);
});

it("keeps keyboard focus on the same primary reading button while its action changes", () => {
  render(<Reader />);
  openPanels();
  const primary = screen.getAllByRole("button", { name: "Read document" })[0];
  primary.focus();
  fireEvent.click(primary);
  expect(document.activeElement).toBe(primary);
  expect(primary.textContent).toBe("Pause reading");
  fireEvent.click(primary);
  expect(document.activeElement).toBe(primary);
  expect(primary.textContent).toBe("Resume reading");
  fireEvent.click(primary);
  expect(primary.textContent).toBe("Pause reading");
  expect(synthesis.speak).toHaveBeenCalledOnce();
});

it("stops a paused session, ignores its late events, and starts again from the beginning", () => {
  render(<Reader html={"<p>" + "Read the complete guide. ".repeat(100) + "</p>"} />);
  openPanels();
  fireEvent.click(screen.getAllByRole("button", { name: "Read document" })[0]);
  const previous = synthesis.speak.mock.calls[0][0] as TestUtterance;
  fireEvent.click(screen.getAllByRole("button", { name: "Pause reading" })[0]);
  act(() => previous.dispatchEvent(new Event("end")));
  fireEvent.click(screen.getAllByRole("button", { name: "Stop reading" })[1]);
  expect(synthesis.cancel).toHaveBeenCalledOnce();
  for (const type of ["end", "pause", "resume", "error"]) act(() => previous.dispatchEvent(new Event(type)));
  expect(screen.getAllByRole("status").map((element) => element.textContent)).toEqual(["Ready to read", "Ready to read"]);
  fireEvent.click(screen.getAllByRole("button", { name: "Read document" })[1]);
  expect(synthesis.speak).toHaveBeenCalledTimes(2);
  expect(synthesis.speak.mock.calls[1][0].text).toBe(previous.text);
  for (const type of ["end", "pause", "resume", "error"]) act(() => previous.dispatchEvent(new Event(type)));
  expect(synthesis.speak).toHaveBeenCalledTimes(2);
  expect(screen.getAllByRole("button", { name: "Pause reading" })).toHaveLength(2);
});

it("finishes the last chunk only after a native resume if its end arrived while paused", () => {
  render(<Reader />);
  openPanels();
  fireEvent.click(screen.getAllByRole("button", { name: "Read document" })[0]);
  const utterance = synthesis.speak.mock.calls[0][0] as TestUtterance;
  act(() => utterance.dispatchEvent(new Event("pause")));
  act(() => utterance.dispatchEvent(new Event("end")));
  expect(screen.getAllByRole("button", { name: "Resume reading" })).toHaveLength(2);
  act(() => utterance.dispatchEvent(new Event("resume")));
  expect(screen.getAllByRole("button", { name: "Read document" })).toHaveLength(2);
  expect(synthesis.speak).toHaveBeenCalledOnce();
});

it("discards a paused continuation when the current document changes", () => {
  const { rerender } = render(<Reader html={"<p>" + "First document. ".repeat(100) + "</p>"} />);
  openPanels();
  fireEvent.click(screen.getAllByRole("button", { name: "Read document" })[0]);
  const previous = synthesis.speak.mock.calls[0][0] as TestUtterance;
  fireEvent.click(screen.getAllByRole("button", { name: "Pause reading" })[0]);
  act(() => previous.dispatchEvent(new Event("end")));
  rerender(<Reader html="<p>Second document.</p>" />);
  act(() => previous.dispatchEvent(new Event("resume")));
  expect(synthesis.speak).toHaveBeenCalledOnce();
  fireEvent.click(screen.getAllByRole("button", { name: "Read document" })[0]);
  expect(synthesis.speak.mock.calls[1][0].text).toBe("Second document.");
});
