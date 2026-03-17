import type { ResolvedBackgroundAudioConfig } from "@/entities/docs/lib/audio";
import type { LanguageCode } from "@/entities/docs/model/types";
import { DocsShellAudioPlayer } from "./docs-shell-audio-player";

export interface DocsShellControlsAudioProps {
  showAudioPlayer?: boolean;
  audioPlayerConfig?: ResolvedBackgroundAudioConfig | null;
  language: LanguageCode;
  audioPlayIconTag?: string;
  audioPlayIconStyle?: React.CSSProperties;
  audioPauseIconTag?: string;
  audioPauseIconStyle?: React.CSSProperties;
  audioPlayLabel?: string;
  audioPauseLabel?: string;
  audioPlaylistTitle?: string;
  audioPlaylistDescription?: string;
  audioPopoverCloseLabel?: string;
}

export function DocsShellControlsAudio({
  showAudioPlayer,
  audioPlayerConfig,
  language,
  audioPlayIconTag,
  audioPlayIconStyle,
  audioPauseIconTag,
  audioPauseIconStyle,
  audioPlayLabel = "Play",
  audioPauseLabel = "Pause",
  audioPlaylistTitle = "Choose track",
  audioPlaylistDescription = "",
  audioPopoverCloseLabel = "Close",
}: DocsShellControlsAudioProps) {
  if (!showAudioPlayer || !audioPlayerConfig) {
    return null;
  }

  return (
    <DocsShellAudioPlayer
      config={audioPlayerConfig}
      language={language}
      playIconTag={audioPlayIconTag}
      pauseIconTag={audioPauseIconTag}
      iconStyle={audioPlayIconStyle}
      playLabel={audioPlayLabel}
      pauseLabel={audioPauseLabel}
      playlistTitle={audioPlaylistTitle}
      playlistDescription={audioPlaylistDescription}
      closeLabel={audioPopoverCloseLabel}
    />
  );
}
