export interface VideoExclusivityInput {
  /** `site.mediaExclusivePlayback` from config.json; unset means on. */
  siteExclusive: boolean | undefined;
  /** `video.muted` of the route: a picture-only video never competes for sound. */
  muted: boolean | undefined;
}

/**
 * Whether a route video takes part in the page-wide playback rule: playing it
 * pauses the radio and audio tracks, and playing those pauses it.
 */
export function isVideoExclusive({ siteExclusive, muted }: VideoExclusivityInput): boolean {
  return siteExclusive !== false && muted !== true;
}
