import type { VideoPlaybackController, VideoPlaybackControllerOptions } from "./types";

/** `<video>`/`<audio>` elements: the standard `play` event and `pause()`. */
export function createNativeMediaController(
  element: HTMLMediaElement,
  { onPlay }: VideoPlaybackControllerOptions,
): VideoPlaybackController {
  element.addEventListener("play", onPlay);
  return {
    pause: () => element.pause(),
    dispose: () => element.removeEventListener("play", onPlay),
  };
}
