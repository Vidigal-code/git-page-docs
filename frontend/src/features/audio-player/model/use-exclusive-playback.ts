"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { sharedPlaybackArbiter, type PlaybackArbiter } from "./playback-arbiter";

/**
 * Enrolls a player in the page-wide playback arbiter. Returns `claimPlayback`,
 * to be called right before this player starts, so every other enrolled
 * player pauses first. `pause` may change between renders; the arbiter always
 * invokes the latest one.
 */
export function useExclusivePlayback(
  pause: () => void,
  arbiter: PlaybackArbiter = sharedPlaybackArbiter,
): () => void {
  const ownerId = useId();
  const pauseRef = useRef(pause);

  useEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  useEffect(
    () => arbiter.register({ id: ownerId, pause: () => pauseRef.current() }),
    [arbiter, ownerId],
  );

  return useCallback(() => arbiter.claim(ownerId), [arbiter, ownerId]);
}
