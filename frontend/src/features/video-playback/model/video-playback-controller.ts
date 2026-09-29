import { createIframeFocusController } from "./controllers/iframe-focus-controller";
import { createNativeMediaController } from "./controllers/native-media-controller";
import { createVimeoController } from "./controllers/vimeo-controller";
import { createYoutubeController } from "./controllers/youtube-controller";
import type { VideoPlaybackController, VideoPlaybackControllerOptions } from "./controllers/types";
import { loadYoutubeIframeApi, type YoutubeIframeApi } from "./youtube-iframe-api";
import type { VideoProvider } from "./video-provider";

export type VideoPlaybackElement = HTMLIFrameElement | HTMLMediaElement;

export interface CreateVideoPlaybackControllerOptions extends VideoPlaybackControllerOptions {
  /** Injectable for tests; defaults to the official IFrame Player API loader. */
  loadYoutubeApi?: () => Promise<YoutubeIframeApi>;
}

type ControllerFactory = (
  element: VideoPlaybackElement,
  options: CreateVideoPlaybackControllerOptions,
) => VideoPlaybackController;

const CONTROLLER_FACTORIES: Readonly<Record<VideoProvider, ControllerFactory>> = {
  native: (element, { onPlay }) => createNativeMediaController(element as HTMLMediaElement, { onPlay }),
  vimeo: (element, { onPlay }) => createVimeoController(element as HTMLIFrameElement, { onPlay }),
  youtube: (element, { onPlay, loadYoutubeApi = loadYoutubeIframeApi }) =>
    createYoutubeController(element as HTMLIFrameElement, { onPlay, loadYoutubeApi }),
  iframe: (element, { onPlay }) => createIframeFocusController(element as HTMLIFrameElement, { onPlay }),
};

/** Picks the controller that can follow and pause this provider's player. */
export function createVideoPlaybackController(
  provider: VideoProvider,
  element: VideoPlaybackElement,
  options: CreateVideoPlaybackControllerOptions,
): VideoPlaybackController {
  return CONTROLLER_FACTORIES[provider](element, options);
}
