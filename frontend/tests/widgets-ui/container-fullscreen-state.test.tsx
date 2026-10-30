// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { AudioContainer } from "@/widgets/docs-shell/ui/content-type-containers/audio-container";
import { HtmlContainer } from "@/widgets/docs-shell/ui/content-type-containers/html-container";
import { VideoContainer } from "@/widgets/docs-shell/ui/content-type-containers/video-container";

afterEach(cleanup);

it("keeps the selected video and playback position when expanding and closing", () => {
  render(<VideoContainer videoType="mp4" pathVideo="/lesson-two.mp4" language="en"
    fullscreenEnabled fullscreenExpandLabel="Expand" fullscreenCloseLabel="Close" />);
  const inlineVideo = screen.getByTestId<HTMLVideoElement>("route-video");
  inlineVideo.currentTime = 42;

  fireEvent.click(screen.getByRole("button", { name: "Expand" }));

  const expandedVideo = within(screen.getByRole("region", { name: "Close" })).getByTestId<HTMLVideoElement>("route-video");
  expect(screen.getAllByTestId("route-video")).toHaveLength(1);
  expect(expandedVideo.getAttribute("src")).toBe("/lesson-two.mp4");
  expect(expandedVideo.currentTime).toBe(42);
  expandedVideo.currentTime = 64;
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.getByTestId<HTMLVideoElement>("route-video").currentTime).toBe(64);
});
it("keeps the selected audio and loop state when expanding and closing", () => {
  render(<AudioContainer audioType="wav" pathAudio="/lesson-two.wav" language="en"
    fullscreenEnabled fullscreenExpandLabel="Expand" fullscreenCloseLabel="Close"
    controlsConfig={{ playLabel: "Play", pauseLabel: "Pause", restartLabel: "Restart", loopOnLabel: "Enable loop", loopOffLabel: "Disable loop" }} />);
  fireEvent.click(screen.getByRole("button", { name: "Enable loop" }));
  fireEvent.click(screen.getByRole("button", { name: "Expand" }));
  const dialog = screen.getByRole("region", { name: "Close" });
  expect(within(dialog).getByRole("button", { name: "Disable loop" }).getAttribute("aria-pressed")).toBe("true");
  expect(dialog.querySelector("audio")?.getAttribute("src")).toBe("/lesson-two.wav");
  fireEvent.click(within(dialog).getByRole("button", { name: "Disable loop" }));
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.getByRole("button", { name: "Enable loop" }).getAttribute("aria-pressed")).toBe("false");
});
it("keeps the embedded HTML document state when expanding and closing", () => {
  render(<HtmlContainer html="<p>Lesson two</p>" language="en"
    fullscreenEnabled fullscreenExpandLabel="Expand" fullscreenCloseLabel="Close" />);
  const inlineFrame = screen.getByTitle<HTMLIFrameElement>("HTML content");
  const contentDocument = inlineFrame.contentDocument;
  if (!contentDocument) throw new Error("Expected the embedded browsing context");
  // JSDOM does not load srcDoc; seed its document at the browser boundary.
  contentDocument.body.innerHTML = '<label>Lesson answer<input value=""></label>';
  const answer = within(contentDocument.body).getByRole<HTMLInputElement>("textbox", { name: "Lesson answer" });
  fireEvent.change(answer, { target: { value: "Resposta ação 42" } });
  fireEvent.click(screen.getByRole("button", { name: "Expand" }));
  const frame = within(screen.getByRole("region", { name: "Close" })).getByTitle<HTMLIFrameElement>("HTML content");
  expect(screen.getAllByTitle("HTML content")).toHaveLength(1);
  expect(frame.contentDocument?.body.textContent).toContain("Lesson answer");
  expect(frame.contentDocument?.querySelector("input")?.value).toBe("Resposta ação 42");
  fireEvent.change(answer, { target: { value: "Resposta 64" } });
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.getByTitle<HTMLIFrameElement>("HTML content").contentDocument?.querySelector("input")?.value).toBe("Resposta 64");
});

it("expands inline without modal behavior and restores focus and URL on Escape", () => {
  const onFullscreenOpen = vi.fn();
  const onFullscreenClose = vi.fn();
  render(<><button>Outside</button><HtmlContainer html="<p>Lesson</p>" language="en"
    fullscreenEnabled fullscreenExpandLabel="Expand" fullscreenCloseLabel="Close"
    onFullscreenOpen={onFullscreenOpen} onFullscreenClose={onFullscreenClose}
    pagination={{ content: <button>Next page</button> }} /></>);
  const outside = screen.getByRole<HTMLButtonElement>("button", { name: "Outside" });
  const originalOverflow = document.body.style.overflow;
  fireEvent.click(screen.getByRole("button", { name: "Expand" }));
  const close = screen.getByRole("button", { name: "Close" });
  expect(document.activeElement).toBe(close);
  expect(outside.inert).not.toBe(true);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(close.getAttribute("aria-expanded")).toBe("true");
  expect(document.body.style.overflow).toBe(originalOverflow);
  fireEvent.keyDown(close, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Expand" }));
  expect(outside.inert).not.toBe(true);
  expect(document.body.style.overflow).toBe(originalOverflow);
  expect(onFullscreenOpen).toHaveBeenCalledOnce();
  expect(onFullscreenClose).toHaveBeenCalledOnce();
});

function PaginatedVideo() {
  const [page, setPage] = useState(1);
  return <VideoContainer videoType="mp4" pathVideo={`/lesson-${page}.mp4`} language="en"
    fullscreenEnabled fullscreenExpandLabel="Expand" fullscreenCloseLabel="Close"
    pagination={{ content: <button onClick={() => setPage(2)}>Next page</button> }} />;
}

it("keeps the page selected inside the expanded video after closing and reopening", () => {
  render(<PaginatedVideo />);
  fireEvent.click(screen.getByRole("button", { name: "Expand" }));
  fireEvent.click(within(screen.getByRole("region")).getByRole("button", { name: "Next page" }));
  expect(screen.getByTestId("route-video").getAttribute("src")).toBe("/lesson-2.mp4");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.getByTestId("route-video").getAttribute("src")).toBe("/lesson-2.mp4");
  fireEvent.click(screen.getByRole("button", { name: "Expand" }));
  expect(within(screen.getByRole("region")).getByTestId("route-video").getAttribute("src")).toBe("/lesson-2.mp4");
});

it("preserves the disabled expansion option", () => {
  render(<VideoContainer videoType="mp4" pathVideo="/lesson.mp4" language="en"
    fullscreenEnabled={false} fullscreenExpandLabel="Expand" fullscreenCloseLabel="Close" />);
  expect(screen.queryByRole("button", { name: "Expand" })).toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByTestId("route-video").getAttribute("src")).toBe("/lesson.mp4");
});

it("keeps the same video in an inline expansion when the browser rejects fullscreen", async () => {
  const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  try {
    render(<VideoContainer videoType="mp4" pathVideo="/lesson-two.mp4" language="en"
      fullscreenEnabled fullscreenExpandLabel="Expand" fullscreenCloseLabel="Close" />);
    const expand = screen.getByRole("button", { name: "Expand" });
    const panel = document.getElementById(expand.getAttribute("aria-controls") ?? "");
    if (!panel) throw new Error("Expected the controlled media region");
    panel.requestFullscreen = vi.fn().mockRejectedValue(new Error("Fullscreen permission denied"));
    screen.getByTestId<HTMLVideoElement>("route-video").currentTime = 42;
    fireEvent.click(expand);
    const close = await screen.findByRole("button", { name: "Close" });
    expect(close.getAttribute("aria-expanded")).toBe("true");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByTestId<HTMLVideoElement>("route-video").currentTime).toBe(42);
    expect(warning).toHaveBeenCalledOnce();
    fireEvent.click(close);
    expect(screen.getByRole("button", { name: "Expand" }).getAttribute("aria-expanded")).toBe("false");
  } finally { warning.mockRestore(); }
});