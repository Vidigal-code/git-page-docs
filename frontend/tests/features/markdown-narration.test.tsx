// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useMarkdownNarration } from "@/features/markdown-narration/model/use-markdown-narration";
import { sharedPlaybackArbiter } from "@/shared/lib/media-playback";
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
  speak: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(),
  getVoices: vi.fn((): SpeechSynthesisVoice[] => []),
});

beforeEach(() => {
  vi.clearAllMocks();
  synthesis.getVoices.mockReturnValue([]);
  Object.assign(synthesis, { paused: false });
  vi.stubGlobal("speechSynthesis", synthesis);
  vi.stubGlobal("SpeechSynthesisUtterance", TestUtterance);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("reads the current Markdown text in its language and pauses other media first", () => {
  const pauseAudio = vi.fn();
  const unregister = sharedPlaybackArbiter.register({ id: "audio-test", pause: pauseAudio });
  const { result } = renderHook(() => useMarkdownNarration({ html: "<h1>Guia</h1><p>Texto de leitura.</p>", language: "pt" }));
  act(() => result.current.start());
  const utterance = synthesis.speak.mock.calls[0]?.[0] as TestUtterance;
  expect(utterance.text).toBe("Guia Texto de leitura.");
  expect(utterance.lang).toBe("pt");
  expect(pauseAudio).toHaveBeenCalledOnce();
  expect(pauseAudio.mock.invocationCallOrder[0]).toBeLessThan(synthesis.speak.mock.invocationCallOrder[0]);
  unregister();
});

it("pauses, resumes and stops narration when another media player starts", () => {
  const { result } = renderHook(() => useMarkdownNarration({ html: "<p>Read this.</p>", language: "en" }));
  act(() => result.current.start());
  expect(result.current.status).toBe("speaking");
  act(() => result.current.pause());
  expect(result.current.status).toBe("paused");
  expect(synthesis.pause).toHaveBeenCalledOnce();
  act(() => result.current.resume());
  expect(result.current.status).toBe("speaking");
  expect(synthesis.resume).toHaveBeenCalledOnce();
  act(() => sharedPlaybackArbiter.claim("video-test"));
  expect(result.current.status).toBe("idle");
  expect(synthesis.cancel).toHaveBeenCalled();
});

it("allows simultaneous playback only when mediaExclusivePlayback is false", () => {
  const pauseAudio = vi.fn();
  const unregister = sharedPlaybackArbiter.register({ id: "audio-test", pause: pauseAudio });
  const { result } = renderHook(() => useMarkdownNarration({ html: "<p>Text.</p>", language: "en", exclusivePlayback: false }));
  act(() => result.current.start());
  expect(pauseAudio).not.toHaveBeenCalled();
  act(() => sharedPlaybackArbiter.claim("video-test"));
  expect(result.current.status).toBe("speaking");
  unregister();
});

it("cancels speech when the document changes or the reader unmounts", () => {
  const { result, rerender, unmount } = renderHook(({ html }) => useMarkdownNarration({ html, language: "en" }), {
    initialProps: { html: "<p>First page.</p>" },
  });
  act(() => result.current.start());
  rerender({ html: "<p>Second page.</p>" });
  expect(synthesis.cancel).toHaveBeenCalledOnce();
  expect(result.current.status).toBe("idle");
  act(() => result.current.start());
  unmount();
  expect(synthesis.cancel).toHaveBeenCalledTimes(2);
});

it("loads browser voices asynchronously and applies reader voice, rate and volume", () => {
  const { result } = renderHook(() => useMarkdownNarration({ html: "<p>Olá.</p>", language: "pt", settings: { defaultRate: 1.5, defaultVolume: 0.7 } }));
  const voice = { voiceURI: "pt-local", name: "Português", lang: "pt-BR", localService: true, default: false };
  synthesis.getVoices.mockReturnValue([voice]);
  act(() => synthesis.dispatchEvent(new Event("voiceschanged")));
  expect(result.current.voices).toEqual([voice]);
  act(() => result.current.setVoiceUri(voice.voiceURI));
  act(() => result.current.start());
  const utterance = synthesis.speak.mock.calls[0]?.[0] as TestUtterance;
  expect(utterance.voice).toBe(voice);
  expect(utterance.rate).toBe(1.5);
  expect(utterance.volume).toBe(0.7);
});

it("reports completion and speech errors without swallowing them", () => {
  const { result } = renderHook(() => useMarkdownNarration({ html: "<p>Text.</p>", language: "en" }));
  act(() => result.current.start());
  act(() => synthesis.speak.mock.calls.at(-1)?.[0].dispatchEvent(new Event("end")));
  expect(result.current.status).toBe("idle");
  act(() => result.current.start());
  act(() => synthesis.speak.mock.calls.at(-1)?.[0].dispatchEvent(Object.assign(new Event("error"), { error: "network" })));
  expect(result.current.status).toBe("error");
});

it("reads long documents in bounded chunks without dropping text", () => {
  const text = "A complete documentation paragraph. ".repeat(100).trim();
  const { result } = renderHook(() => useMarkdownNarration({ html: `<p>${text}</p>`, language: "en" }));
  act(() => result.current.start());
  expect(synthesis.speak.mock.calls[0]?.[0].text.length).toBeLessThan(text.length);
  const spoken: string[] = [];
  while (result.current.status === "speaking") {
    const utterance = synthesis.speak.mock.calls.at(-1)?.[0] as TestUtterance;
    spoken.push(utterance.text);
    act(() => utterance.dispatchEvent(new Event("end")));
  }
  expect(spoken.join(" ")).toBe(text);
});

it("offers native labelled controls and announces the reading state", () => {
  function Reader() {
    const controller = useMarkdownNarration({ html: "<p>A readable page.</p>", language: "en" });
    return <NarrationPanel controller={controller} labels={DEFAULT_NARRATION_LABELS} />;
  }
  render(<Reader />);
  fireEvent.click(screen.getByText("Accessibility and reading", { selector: "summary" }));
  expect(screen.getByRole("combobox", { name: "Browser voice" })).toBeTruthy();
  fireEvent.change(screen.getByRole("slider", { name: /Speed/ }), { target: { value: "1.5" } });
  fireEvent.click(screen.getByRole("button", { name: "Read document" }));
  expect(synthesis.speak.mock.calls[0]?.[0].rate).toBe(1.5);
  expect(screen.getByRole("status").textContent).toBe("Reading document");
  fireEvent.click(screen.getByRole("button", { name: "Pause reading" }));
  expect(screen.getByRole("button", { name: "Resume reading" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Stop reading" }));
  expect(screen.getByRole("status").textContent).toBe("Ready to read");
});

it("does not start when narration is disabled or the browser lacks speech synthesis", () => {
  const disabled = renderHook(() => useMarkdownNarration({ html: "<p>Text.</p>", language: "en", enabled: false }));
  act(() => disabled.result.current.start());
  expect(synthesis.speak).not.toHaveBeenCalled();
  vi.stubGlobal("SpeechSynthesisUtterance", undefined);
  const unsupported = renderHook(() => useMarkdownNarration({ html: "<p>Text.</p>", language: "en" }));
  expect(unsupported.result.current.supported).toBe(false);
  act(() => unsupported.result.current.start());
  expect(synthesis.speak).not.toHaveBeenCalled();
});

it("normalizes invalid settings and ignores events from a stopped document", () => {
  const { result } = renderHook(() => useMarkdownNarration({ html: "<p>Text.</p>", language: "en", settings: { defaultRate: Number.NaN, defaultVolume: 3 } }));
  expect(result.current.rate).toBe(1);
  expect(result.current.volume).toBe(1);
  act(() => result.current.setRate(-1));
  act(() => result.current.setVolume(Number.NaN));
  expect(result.current.rate).toBe(0.5);
  expect(result.current.volume).toBe(1);
  act(() => result.current.start());
  const stopped = synthesis.speak.mock.calls.at(-1)?.[0] as TestUtterance;
  act(() => result.current.stop());
  act(() => stopped.dispatchEvent(new Event("error")));
  expect(result.current.status).toBe("idle");
});

it("can start a new reading after stopping while the native engine is paused", () => {
  const { result } = renderHook(() => useMarkdownNarration({ html: "<p>Text.</p>", language: "en" }));
  act(() => result.current.start());
  act(() => result.current.pause());
  Object.assign(synthesis, { paused: true });
  act(() => result.current.stop());
  act(() => result.current.start());
  expect(synthesis.resume).toHaveBeenCalledOnce();
});
