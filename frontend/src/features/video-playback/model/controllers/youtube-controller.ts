import { createIframeFocusController } from "./iframe-focus-controller";
import type { VideoPlaybackController, VideoPlaybackControllerOptions } from "./types";
import type { YoutubeIframeApi, YoutubePlayer } from "../youtube-iframe-api";

/** `YT.PlayerState.PLAYING` of the IFrame Player API. */
const YOUTUBE_PLAYING_STATE = 1;

export interface YoutubeControllerOptions extends VideoPlaybackControllerOptions {
  loadYoutubeApi: () => Promise<YoutubeIframeApi>;
}

/**
 * YouTube embeds (`enablejsapi=1`) through the official IFrame Player API,
 * attached to the existing iframe. When the API cannot load, the generic
 * iframe rule takes over so the video still follows the playback rule.
 */
export function createYoutubeController(
  iframe: HTMLIFrameElement,
  { onPlay, loadYoutubeApi }: YoutubeControllerOptions,
): VideoPlaybackController {
  let disposed = false;
  let player: YoutubePlayer | undefined;
  let fallback: VideoPlaybackController | undefined;

  loadYoutubeApi().then(
    (api) => {
      if (disposed) return;
      player = new api.Player(iframe, {
        events: {
          onStateChange: ({ data }) => {
            if (!disposed && data === YOUTUBE_PLAYING_STATE) onPlay();
          },
        },
      });
    },
    () => {
      if (!disposed) fallback = createIframeFocusController(iframe, { onPlay });
    },
  );

  return {
    pause: () => {
      player?.pauseVideo();
      fallback?.pause();
    },
    dispose: () => {
      disposed = true;
      fallback?.dispose();
    },
  };
}
