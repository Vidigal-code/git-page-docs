import type { VideoPlaybackController, VideoPlaybackControllerOptions } from "./types";

export const VIMEO_PLAYER_ORIGIN = "https://player.vimeo.com";

interface VimeoMessage {
  event?: string;
}

function parseVimeoMessage(data: unknown): VimeoMessage | undefined {
  if (typeof data === "object" && data !== null) return data as VimeoMessage;
  if (typeof data !== "string") return undefined;
  try {
    const parsed: unknown = JSON.parse(data);
    return typeof parsed === "object" && parsed !== null ? (parsed as VimeoMessage) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Vimeo embeds through the player's documented postMessage protocol: listen to
 * `play` once the player is `ready`, and send the `pause` method.
 */
export function createVimeoController(
  iframe: HTMLIFrameElement,
  { onPlay }: VideoPlaybackControllerOptions,
): VideoPlaybackController {
  const view = iframe.ownerDocument.defaultView ?? window;
  const send = (message: { method: string; value?: string }) =>
    iframe.contentWindow?.postMessage(JSON.stringify(message), VIMEO_PLAYER_ORIGIN);
  const subscribe = () => send({ method: "addEventListener", value: "play" });

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== VIMEO_PLAYER_ORIGIN || event.source !== iframe.contentWindow) return;
    const message = parseVimeoMessage(event.data);
    if (message?.event === "ready") subscribe();
    if (message?.event === "play") onPlay();
  };

  view.addEventListener("message", onMessage);
  // The player may already be ready when this controller attaches.
  iframe.addEventListener("load", subscribe);

  return {
    pause: () => send({ method: "pause" }),
    dispose: () => {
      view.removeEventListener("message", onMessage);
      iframe.removeEventListener("load", subscribe);
    },
  };
}
