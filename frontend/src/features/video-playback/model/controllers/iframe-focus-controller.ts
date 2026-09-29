import type { VideoPlaybackController, VideoPlaybackControllerOptions } from "./types";

/**
 * Any embed without a player API (TikTok, Instagram, …). Clicking play inside a
 * cross-origin iframe moves focus into it, which blurs the page window: that is
 * read as "started playing". Pausing reloads the embed, which stops it.
 */
export function createIframeFocusController(
  iframe: HTMLIFrameElement,
  { onPlay }: VideoPlaybackControllerOptions,
): VideoPlaybackController {
  const view = iframe.ownerDocument.defaultView ?? window;
  let pendingCheck: ReturnType<typeof setTimeout> | undefined;

  // Focus reaches the iframe right after the window blurs, so check on the next task.
  const onWindowBlur = () => {
    clearTimeout(pendingCheck);
    pendingCheck = setTimeout(() => {
      if (iframe.ownerDocument.activeElement === iframe) onPlay();
    }, 0);
  };
  view.addEventListener("blur", onWindowBlur);

  return {
    pause: () => {
      const src = iframe.getAttribute("src");
      if (src) iframe.setAttribute("src", src);
    },
    dispose: () => {
      clearTimeout(pendingCheck);
      view.removeEventListener("blur", onWindowBlur);
    },
  };
}
