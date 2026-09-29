/** Subset of the YouTube IFrame Player API used to follow and pause a video. */
export interface YoutubePlayer {
  pauseVideo(): void;
}

export interface YoutubePlayerOptions {
  events?: { onStateChange?: (event: { data: number }) => void };
}

export interface YoutubeIframeApi {
  Player: new (element: HTMLIFrameElement, options: YoutubePlayerOptions) => YoutubePlayer;
}

interface YoutubeApiWindow extends Window {
  YT?: Partial<YoutubeIframeApi>;
  onYouTubeIframeAPIReady?: () => void;
}

export const YOUTUBE_IFRAME_API_URL = "https://www.youtube.com/iframe_api";
const YOUTUBE_API_TIMEOUT_MS = 10_000;

let pendingApi: Promise<YoutubeIframeApi> | undefined;

function readyApi(view: YoutubeApiWindow): YoutubeIframeApi | undefined {
  return typeof view.YT?.Player === "function" ? (view.YT as YoutubeIframeApi) : undefined;
}

function requestApi(view: YoutubeApiWindow): Promise<YoutubeIframeApi> {
  return new Promise<YoutubeIframeApi>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("YouTube IFrame API timed out")), YOUTUBE_API_TIMEOUT_MS);
    const previousReady = view.onYouTubeIframeAPIReady;
    view.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      clearTimeout(timeout);
      const api = readyApi(view);
      if (api) resolve(api);
      else reject(new Error("YouTube IFrame API is unavailable"));
    };
    const script = view.document.createElement("script");
    script.src = YOUTUBE_IFRAME_API_URL;
    script.async = true;
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("YouTube IFrame API failed to load"));
    };
    view.document.head.appendChild(script);
  });
}

/**
 * Loads the official IFrame Player API script once per page and resolves with
 * `window.YT`. Rejects when the script fails or does not answer in time, so
 * callers can fall back; a later call then tries again. Concurrent calls share
 * the pending request.
 */
export function loadYoutubeIframeApi(view: YoutubeApiWindow = window): Promise<YoutubeIframeApi> {
  const loaded = readyApi(view);
  if (loaded) return Promise.resolve(loaded);
  pendingApi ??= requestApi(view).finally(() => {
    pendingApi = undefined;
  });
  return pendingApi;
}
