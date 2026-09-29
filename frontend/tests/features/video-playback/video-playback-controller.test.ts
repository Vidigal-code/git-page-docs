// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { createVideoPlaybackController, withVideoPlaybackParams, type YoutubeIframeApi } from "@/features/video-playback";

const VIMEO_ORIGIN = "https://player.vimeo.com";

function mountIframe(src: string): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.src = src;
  document.body.appendChild(iframe);
  return iframe;
}

function messageFrom(iframe: HTMLIFrameElement, data: unknown, origin = VIMEO_ORIGIN): MessageEvent {
  return new MessageEvent("message", { data: JSON.stringify(data), origin, source: iframe.contentWindow });
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("native media controller", () => {
  it("reports play and pauses the element", () => {
    const video = document.createElement("video");
    const pauseSpy = vi.spyOn(video, "pause").mockImplementation(() => {});
    const onPlay = vi.fn();
    const controller = createVideoPlaybackController("native", video, { onPlay });

    video.dispatchEvent(new Event("play"));
    expect(onPlay).toHaveBeenCalledTimes(1);
    controller.pause();
    expect(pauseSpy).toHaveBeenCalledTimes(1);

    controller.dispose();
    video.dispatchEvent(new Event("play"));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});

describe("vimeo controller", () => {
  it("subscribes to play once ready, reports play and sends pause", () => {
    const iframe = mountIframe("https://player.vimeo.com/video/1?api=1");
    const post = vi.spyOn(iframe.contentWindow as Window, "postMessage").mockImplementation(() => {});
    const onPlay = vi.fn();
    const controller = createVideoPlaybackController("vimeo", iframe, { onPlay });

    window.dispatchEvent(messageFrom(iframe, { event: "ready" }));
    expect(post).toHaveBeenCalledWith(JSON.stringify({ method: "addEventListener", value: "play" }), VIMEO_ORIGIN);

    window.dispatchEvent(messageFrom(iframe, { event: "play", data: { seconds: 0 } }));
    expect(onPlay).toHaveBeenCalledTimes(1);

    controller.pause();
    expect(post).toHaveBeenCalledWith(JSON.stringify({ method: "pause" }), VIMEO_ORIGIN);
    controller.dispose();
  });

  it("ignores messages from other origins, other frames and invalid payloads", () => {
    const iframe = mountIframe("https://player.vimeo.com/video/1?api=1");
    const other = mountIframe("https://player.vimeo.com/video/2?api=1");
    const onPlay = vi.fn();
    const controller = createVideoPlaybackController("vimeo", iframe, { onPlay });

    window.dispatchEvent(messageFrom(iframe, { event: "play" }, "https://evil.example"));
    window.dispatchEvent(messageFrom(other, { event: "play" }));
    window.dispatchEvent(new MessageEvent("message", { data: "{not json", origin: VIMEO_ORIGIN, source: iframe.contentWindow }));
    window.dispatchEvent(new MessageEvent("message", { data: { event: "play" }, origin: VIMEO_ORIGIN, source: iframe.contentWindow }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    controller.dispose();
  });
});

describe("youtube controller", () => {
  function fakeApi() {
    const pauseVideo = vi.fn();
    let onStateChange: ((event: { data: number }) => void) | undefined;
    const api: YoutubeIframeApi = {
      Player: vi.fn(function (this: unknown, _el: HTMLIFrameElement, options: { events?: { onStateChange?: (event: { data: number }) => void } }) {
        onStateChange = options.events?.onStateChange;
        return { pauseVideo };
      }) as unknown as YoutubeIframeApi["Player"],
    };
    return { api, pauseVideo, stateChange: (data: number) => onStateChange?.({ data }) };
  }

  it("attaches the IFrame API player, reports the playing state and pauses the video", async () => {
    const iframe = mountIframe("https://www.youtube.com/embed/x?enablejsapi=1");
    const { api, pauseVideo, stateChange } = fakeApi();
    const onPlay = vi.fn();
    const controller = createVideoPlaybackController("youtube", iframe, { onPlay, loadYoutubeApi: () => Promise.resolve(api) });
    await vi.waitFor(() => expect(api.Player).toHaveBeenCalledWith(iframe, expect.anything()));

    stateChange(2);
    expect(onPlay).not.toHaveBeenCalled();
    stateChange(1);
    expect(onPlay).toHaveBeenCalledTimes(1);
    controller.pause();
    expect(pauseVideo).toHaveBeenCalledTimes(1);

    controller.dispose();
    stateChange(1);
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("does not attach after dispose and falls back to the iframe rule when the API fails", async () => {
    const iframe = mountIframe("https://www.youtube.com/embed/x?enablejsapi=1");
    const { api } = fakeApi();
    const disposed = createVideoPlaybackController("youtube", iframe, { onPlay: vi.fn(), loadYoutubeApi: () => Promise.resolve(api) });
    disposed.dispose();
    await Promise.resolve();
    expect(api.Player).not.toHaveBeenCalled();

    const onPlay = vi.fn();
    const fallback = createVideoPlaybackController("youtube", iframe, { onPlay, loadYoutubeApi: () => Promise.reject(new Error("blocked")) });
    await new Promise((resolve) => setTimeout(resolve, 0));
    iframe.focus();
    window.dispatchEvent(new Event("blur"));
    await vi.waitFor(() => expect(onPlay).toHaveBeenCalledTimes(1));
    fallback.dispose();
  });
});

describe("generic iframe controller", () => {
  it("treats focus moving into the iframe as play and reloads the player to pause it", async () => {
    const iframe = mountIframe("https://www.tiktok.com/embed/v2/1");
    const onPlay = vi.fn();
    const controller = createVideoPlaybackController("iframe", iframe, { onPlay });

    window.dispatchEvent(new Event("blur"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onPlay).not.toHaveBeenCalled();

    iframe.focus();
    window.dispatchEvent(new Event("blur"));
    await vi.waitFor(() => expect(onPlay).toHaveBeenCalledTimes(1));

    const setAttribute = vi.spyOn(iframe, "setAttribute");
    controller.pause();
    expect(setAttribute).toHaveBeenCalledWith("src", "https://www.tiktok.com/embed/v2/1");

    controller.dispose();
    window.dispatchEvent(new Event("blur"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});

describe("withVideoPlaybackParams without an origin", () => {
  it("omits the origin while the page origin is not known yet (static render)", () => {
    const url = new URL(withVideoPlaybackParams("https://www.youtube.com/embed/x", { provider: "youtube", muted: false, origin: "" }));
    expect(url.searchParams.has("origin")).toBe(false);
    expect(url.searchParams.get("enablejsapi")).toBe("1");
  });
});
