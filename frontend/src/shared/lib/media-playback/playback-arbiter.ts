export interface PlaybackRegistration {
  id: string;
  pause: () => void;
}

/**
 * Coordinates every audio and video player on the page so only one plays at a time:
 * claiming playback for one owner pauses all the others. The background
 * "radio", the audio-route players and the route videos are separate hook
 * instances, so without this they would happily play over each other.
 */
export interface PlaybackArbiter {
  /** Registers a pausable player and returns its unregister function. */
  register(registration: PlaybackRegistration): () => void;
  /** Pauses every registered player except the one identified by `ownerId`. */
  claim(ownerId: string): void;
}

export function createPlaybackArbiter(): PlaybackArbiter {
  const pauseByOwner = new Map<string, () => void>();

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
