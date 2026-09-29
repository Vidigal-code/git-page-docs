/** Drives one route video on behalf of the page-wide playback rule. */
export interface VideoPlaybackController {
  /** Pauses the video (called when another player claims the sound). */
  pause(): void;
  /** Stops listening; the element itself stays owned by React. */
  dispose(): void;
}

export interface VideoPlaybackControllerOptions {
  /** Called every time the video starts playing. */
  onPlay: () => void;
}
