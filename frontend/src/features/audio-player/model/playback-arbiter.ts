export type PlaybackOwnerId = string;

export interface PlaybackRegistration {
  id: PlaybackOwnerId;
  pause: () => void;
}

/**
 * Coordinates every audio engine on the page so only one plays at a time:
 * claiming playback for one owner pauses all the others. The background
 * "radio" and the audio-route players are separate hook instances, so
 * without this they would happily play over each other.
 */
export interface PlaybackArbiter {
  /** Registers a pausable player and returns its unregister function. */
  register(registration: PlaybackRegistration): () => void;
  /** Pauses every registered player except the one identified by `ownerId`. */
  claim(ownerId: PlaybackOwnerId): void;
}

export function createPlaybackArbiter(): PlaybackArbiter {
  const pauseByOwner = new Map<PlaybackOwnerId, () => void>();

  return {
    register({ id, pause }) {
      pauseByOwner.set(id, pause);
      return () => {
        if (pauseByOwner.get(id) === pause) {
          pauseByOwner.delete(id);
        }
      };
    },
    claim(ownerId) {
      pauseByOwner.forEach((pause, id) => {
        if (id !== ownerId) pause();
      });
    },
  };
}

/** Page-wide arbiter: a browser tab has one audio output, so one arbiter. */
export const sharedPlaybackArbiter: PlaybackArbiter = createPlaybackArbiter();
