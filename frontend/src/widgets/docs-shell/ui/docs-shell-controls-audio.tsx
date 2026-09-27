import type { ResolvedBackgroundAudioConfig } from "@/entities/docs";
import { DocsShellAudioPlayer } from "./docs-shell-audio-player";

/**
 * Toggle-button props. The playlist popover's labels and icons are consumed
 * by DocsShellAudioSurface, the single render site of the shared engine.
 */
export interface DocsShellControlsAudioProps {
  showAudioPlayer?: boolean;
  audioPlayerConfig?: ResolvedBackgroundAudioConfig | null;
  audioPlayIconTag?: string;
  audioPlayIconStyle?: React.CSSProperties;
  audioPauseIconTag?: string;
  audioPlayLabel?: string;
  audioPauseLabel?: string;
}

export function DocsShellControlsAudio({
  showAudioPlayer,
  audioPlayerConfig,
  audioPlayIconTag,
  audioPlayIconStyle,
  audioPauseIconTag,
  audioPlayLabel = "Play",
  audioPauseLabel = "Pause",
}: Readonly<DocsShellControlsAudioProps>) {
  if (!showAudioPlayer || !audioPlayerConfig) {
    return null;
  }

  // Only the toggle button renders per controls instance (header + drawer).
  // The engine, popover and media elements live once in DocsShellAudioSurface.
  return (
    <DocsShellAudioPlayer
      playIconTag={audioPlayIconTag}
      pauseIconTag={audioPauseIconTag}
      iconStyle={audioPlayIconStyle}
      playLabel={audioPlayLabel}
      pauseLabel={audioPauseLabel}
    />
  );
}
