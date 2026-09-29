import type { VideoProvider } from "./video-provider";

export interface VideoPlaybackParamsOptions {
  provider: VideoProvider;
  /** Plays only the picture: the provider starts the video without sound. */
  muted: boolean;
  /** Page origin for the YouTube IFrame API (`window.location.origin`); empty while rendering statically. */
  origin: string;
}

/** Query parameters that let the page pause the player and hear when it starts. */
const PROVIDER_PARAMS: Readonly<Record<VideoProvider, (options: VideoPlaybackParamsOptions) => Record<string, string>>> = {
  youtube: ({ muted, origin }) => ({
    enablejsapi: "1",
    ...(origin ? { origin } : {}),
    ...(muted ? { mute: "1" } : {}),
  }),
  vimeo: ({ muted }) => ({ api: "1", ...(muted ? { muted: "1" } : {}) }),
  native: () => ({}),
  iframe: () => ({}),
};

/**
 * Adds the provider's playback-control parameters to an embed URL. URLs that
 * cannot be parsed, and providers without parameters, are returned unchanged.
 */
export function withVideoPlaybackParams(embedUrl: string, options: VideoPlaybackParamsOptions): string {
  const params = Object.entries(PROVIDER_PARAMS[options.provider](options));
  if (params.length === 0) return embedUrl;
  let url: URL;
  try {
    url = new URL(embedUrl);
  } catch {
    return embedUrl;
  }
  for (const [key, value] of params) url.searchParams.set(key, value);
  return url.toString();
}
