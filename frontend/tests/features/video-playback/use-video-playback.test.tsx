// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { createPlaybackArbiter } from "@/shared/lib/media-playback";
import { useVideoPlayback, loadYoutubeIframeApi, YOUTUBE_IFRAME_API_URL } from "@/features/video-playback";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
  delete (window as { YT?: unknown }).YT;
  delete (window as { onYouTubeIframeAPIReady?: unknown }).onYouTubeIframeAPIReady;
});

function nativeVideo() {
  const video = document.createElement("video");
  const pause = vi.spyOn(video, "pause").mockImplementation(() => {});
  return { video, pause, ref: { current: video } };
}

describe("useVideoPlayback", () => {
  it("pauses the radio and audio tracks when the video plays, and pauses the video when they play", () => {
    const arbiter = createPlaybackArbiter();
    const radioPause = vi.fn();
    const trackPause = vi.fn();
    const unregisterRadio = arbiter.register({ id: "radio", pause: radioPause });
    const unregisterTrack = arbiter.register({ id: "audio-track", pause: trackPause });
    const { video, pause, ref } = nativeVideo();

    renderHook(() => useVideoPlayback(ref, { provider: "native", src: "clip.mp4", exclusive: true, arbiter }));

    video.dispatchEvent(new Event("play"));
    expect(radioPause).toHaveBeenCalledTimes(1);
    expect(trackPause).toHaveBeenCalledTimes(1);
    expect(pause).not.toHaveBeenCalled();

    arbiter.claim("radio");
    expect(pause).toHaveBeenCalledTimes(1);
    arbiter.claim("audio-track");
    expect(pause).toHaveBeenCalledTimes(2);
    unregisterRadio();
    unregisterTrack();
  });

  it("leaves a non-exclusive (muted) video out of the rule", () => {
    const arbiter = createPlaybackArbiter();
    const radioPause = vi.fn();
    arbiter.register({ id: "radio", pause: radioPause });
    const { video, pause, ref } = nativeVideo();

    renderHook(() => useVideoPlayback(ref, { provider: "native", src: "clip.mp4", exclusive: false, arbiter }));

    video.dispatchEvent(new Event("play"));
    arbiter.claim("radio");
    expect(radioPause).not.toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
  });

  it("stops following the video after unmount", () => {
    const arbiter = createPlaybackArbiter();
    const radioPause = vi.fn();
    arbiter.register({ id: "radio", pause: radioPause });
    const { video, pause, ref } = nativeVideo();

    const { unmount } = renderHook(() => useVideoPlayback(ref, { provider: "native", src: "clip.mp4", exclusive: true, arbiter }));
    unmount();

    video.dispatchEvent(new Event("play"));
    arbiter.claim("radio");
    expect(radioPause).not.toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
  });
});

describe("loadYoutubeIframeApi", () => {
  it("resolves at once when window.YT is already loaded", async () => {
    const Player = vi.fn();
    (window as { YT?: unknown }).YT = { Player };
    await expect(loadYoutubeIframeApi()).resolves.toEqual({ Player });
  });

  it("injects the official script once and resolves when the API calls back", async () => {
    const previousReady = vi.fn();
    (window as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady = previousReady;
    const first = loadYoutubeIframeApi();
    const second = loadYoutubeIframeApi();
    expect(second).toBe(first);
    const scripts = document.head.querySelectorAll(`script[src="${YOUTUBE_IFRAME_API_URL}"]`);
    expect(scripts).toHaveLength(1);

    const Player = vi.fn();
    (window as { YT?: unknown }).YT = { Player };
    (window as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady?.();
    await expect(first).resolves.toEqual({ Player });
    expect(previousReady).toHaveBeenCalledTimes(1);
  });

  it("rejects when the script fails and tries again on the next call", async () => {
    const failing = loadYoutubeIframeApi();
    const script = document.head.querySelector("script") as HTMLScriptElement;
    script.onerror?.(new Event("error"));
    await expect(failing).rejects.toThrow("failed to load");

    const retry = loadYoutubeIframeApi();
    expect(retry).not.toBe(failing);
    (window as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady?.();
    await expect(retry).rejects.toThrow("unavailable");
  });
});

describe("useVideoPlayback source changes", () => {
  it("rebuilds the controller for the new element when the source changes", () => {
    const arbiter = createPlaybackArbiter();
    const radioPause = vi.fn();
    arbiter.register({ id: "radio", pause: radioPause });
    const first = nativeVideo();
    const second = nativeVideo();
    const ref: { current: HTMLVideoElement } = { current: first.video };

    const { rerender } = renderHook(({ src }) => useVideoPlayback(ref, { provider: "native", src, exclusive: true, arbiter }), {
      initialProps: { src: "a.mp4" },
    });
    ref.current = second.video;
    rerender({ src: "b.mp4" });

    first.video.dispatchEvent(new Event("play"));
    expect(radioPause).not.toHaveBeenCalled();
    second.video.dispatchEvent(new Event("play"));
    expect(radioPause).toHaveBeenCalledTimes(1);
    arbiter.claim("radio");
    expect(second.pause).toHaveBeenCalledTimes(1);
    expect(first.pause).not.toHaveBeenCalled();
  });
});
