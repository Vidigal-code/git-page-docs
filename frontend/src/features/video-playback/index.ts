export { resolveVideoProvider, type VideoProvider } from "./model/video-provider";
export { withVideoPlaybackParams, type VideoPlaybackParamsOptions } from "./model/video-embed-params";
export { isVideoExclusive, type VideoExclusivityInput } from "./model/video-exclusivity";
export {
  createVideoPlaybackController,
  type CreateVideoPlaybackControllerOptions,
  type VideoPlaybackElement,
} from "./model/video-playback-controller";
export type { VideoPlaybackController } from "./model/controllers/types";
export {
  loadYoutubeIframeApi,
  YOUTUBE_IFRAME_API_URL,
  type YoutubeIframeApi,
  type YoutubePlayer,
} from "./model/youtube-iframe-api";
export { useVideoPlayback, type UseVideoPlaybackOptions } from "./model/use-video-playback";
