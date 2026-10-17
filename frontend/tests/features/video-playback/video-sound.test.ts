// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { createVideoPlaybackController, type YoutubeIframeApi } from "@/features/video-playback";

it("starts a sound-enabled YouTube route without stale mute and preserves later user mute", async () => {
  let muted = true;
  const player = { pauseVideo: vi.fn(), mute: () => { muted = true; }, unMute: () => { muted = false; } };
  let ready: ((event: { target: typeof player }) => void) | undefined;
  let state: ((event: { data: number }) => void) | undefined;
  const api: YoutubeIframeApi = { Player: class {
    constructor(_element: HTMLIFrameElement, options: { events?: { onReady?: typeof ready; onStateChange?: typeof state } }) {
      ready = options.events?.onReady;
      state = options.events?.onStateChange;
      return player;
    }
    pauseVideo = player.pauseVideo;
    mute = player.mute;
    unMute = player.unMute;
  } };
  const onPlay = vi.fn();
  const controller = createVideoPlaybackController("youtube", document.createElement("iframe"), { onPlay, loadYoutubeApi: async () => api });
  await Promise.resolve();
  ready?.({ target: player });
  state?.({ data: 1 });
  expect(onPlay).toHaveBeenCalledOnce();
  expect(muted).toBe(false);
  player.mute();
  state?.({ data: 1 });
  expect(muted).toBe(true);
  controller.dispose();
});

it("honors an explicitly muted route and ignores late readiness after disposal", async () => {
  const player = { pauseVideo: vi.fn(), mute: vi.fn(), unMute: vi.fn() };
  let ready: ((event: { target: typeof player }) => void) | undefined;
  const api: YoutubeIframeApi = { Player: class {
    constructor(_element: HTMLIFrameElement, options: { events?: { onReady?: typeof ready } }) {
      ready = options.events?.onReady;
    }
    pauseVideo = player.pauseVideo;
    mute = player.mute;
    unMute = player.unMute;
  } };
  const controller = createVideoPlaybackController("youtube", document.createElement("iframe"), { onPlay: vi.fn(), muted: true, loadYoutubeApi: async () => api });
  await Promise.resolve();
  ready?.({ target: player });
  expect(player.mute).toHaveBeenCalledOnce();
  expect(player.unMute).not.toHaveBeenCalled();
  controller.dispose();
  ready?.({ target: player });
  expect(player.mute).toHaveBeenCalledOnce();
});
