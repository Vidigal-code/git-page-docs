"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { sharedPlaybackArbiter, useExclusivePlayback, type PlaybackArbiter } from "@/shared/lib/media-playback";
import { createVideoPlaybackController, type VideoPlaybackElement } from "./video-playback-controller";
import type { VideoProvider } from "./video-provider";

export interface UseVideoPlaybackOptions {
  provider: VideoProvider;
  /** Player source: a new source reloads the player, so the controller is rebuilt. */
  src: string;
  /** From `isVideoExclusive`: false keeps the video out of the page-wide rule. */
  exclusive: boolean;
  /** Injectable for tests; defaults to the page-wide arbiter. */
  arbiter?: PlaybackArbiter;
}

const noop = (): void => undefined;

/**
 * Enrolls a route video in the page-wide playback rule: when it starts it
 * pauses the radio and the audio tracks, and when one of those starts it is
 * paused. The controller is rebuilt when the provider or the source changes.
 */
export function useVideoPlayback(
  elementRef: RefObject<VideoPlaybackElement | null>,
  { provider, src, exclusive, arbiter = sharedPlaybackArbiter }: UseVideoPlaybackOptions,
): void {
  const pauseRef = useRef<() => void>(noop);
  const pause = useCallback(() => pauseRef.current(), []);
  const claimPlayback = useExclusivePlayback(pause, arbiter);

  useEffect(() => {
    const element = elementRef.current;
    if (!exclusive || !element) return;
    const controller = createVideoPlaybackController(provider, element, { onPlay: claimPlayback });
    pauseRef.current = controller.pause;
    return () => {
      pauseRef.current = noop;
      controller.dispose();
    };
  }, [elementRef, provider, src, exclusive, claimPlayback]);
}
