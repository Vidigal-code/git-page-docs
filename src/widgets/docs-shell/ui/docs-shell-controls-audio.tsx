import type { ResolvedBackgroundAudioConfig } from "@/entities/docs/lib/audio";
import type { LanguageCode } from "@/entities/docs/model/types";
import { DocsShellAudioPlayer } from "./docs-shell-audio-player";

export interface DocsShellControlsAudioProps {
  showAudioPlayer?: boolean;
  audioPlayerConfig?: ResolvedBackgroundAudioConfig | null;
  language: LanguageCode;
  themeVarsStyle?: React.CSSProperties;
  audioPlayIconTag?: string;
  audioPlayIconStyle?: React.CSSProperties;
  audioPauseIconTag?: string;
  audioPauseIconStyle?: React.CSSProperties;
  audioPlayLabel?: string;
  audioPauseLabel?: string;
  audioPlaylistTitle?: string;
  audioPlaylistDescription?: string;
  audioPopoverCloseLabel?: string;
  audioPopoverCloseIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverPlayIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverPauseIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverRestartIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverLoopOnIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverLoopOffIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverNowPlayingLabel?: string;
  audioPopoverRestartLabel?: string;
  audioPopoverLoopOnLabel?: string;
  audioPopoverLoopOffLabel?: string;
  audioPopoverSourceLabel?: string;
  audioPopoverHideSource?: boolean;
  audioPopoverSourceCustomLabel?: Record<string, string>;
  audioPopoverShowMinutes?: boolean;
  audioPopoverStatusPlayingLabel?: string;
  audioPopoverStatusPausedLabel?: string;
  audioPopoverStatusLoopOnLabel?: string;
  audioPopoverStatusLoopOffLabel?: string;
}

export function DocsShellControlsAudio({
  showAudioPlayer,
  audioPlayerConfig,
  language,
  themeVarsStyle,
  audioPlayIconTag,
  audioPlayIconStyle,
  audioPauseIconTag,
  audioPauseIconStyle,
  audioPlayLabel = "Play",
  audioPauseLabel = "Pause",
  audioPlaylistTitle = "Choose track",
  audioPlaylistDescription = "",
  audioPopoverCloseLabel = "Close",
  audioPopoverCloseIcon,
  audioPopoverPlayIcon,
  audioPopoverPauseIcon,
  audioPopoverRestartIcon,
  audioPopoverLoopOnIcon,
  audioPopoverLoopOffIcon,
  audioPopoverNowPlayingLabel = "Now playing",
  audioPopoverRestartLabel = "Restart",
  audioPopoverLoopOnLabel = "Loop on",
  audioPopoverLoopOffLabel = "Loop off",
  audioPopoverSourceLabel = "File",
  audioPopoverHideSource = false,
  audioPopoverSourceCustomLabel,
  audioPopoverShowMinutes = true,
  audioPopoverStatusPlayingLabel,
  audioPopoverStatusPausedLabel,
  audioPopoverStatusLoopOnLabel,
  audioPopoverStatusLoopOffLabel,
}: DocsShellControlsAudioProps) {
  if (!showAudioPlayer || !audioPlayerConfig) {
    return null;
  }

  return (
    <DocsShellAudioPlayer
      config={audioPlayerConfig}
      language={language}
      themeVarsStyle={themeVarsStyle}
      playIconTag={audioPlayIconTag}
      pauseIconTag={audioPauseIconTag}
      iconStyle={audioPlayIconStyle}
      playLabel={audioPlayLabel}
      pauseLabel={audioPauseLabel}
      playlistTitle={audioPlaylistTitle}
      playlistDescription={audioPlaylistDescription}
      closeLabel={audioPopoverCloseLabel}
      closeIcon={audioPopoverCloseIcon}
      playIcon={audioPopoverPlayIcon}
      pauseIcon={audioPopoverPauseIcon}
      restartIcon={audioPopoverRestartIcon}
      loopOnIcon={audioPopoverLoopOnIcon}
      loopOffIcon={audioPopoverLoopOffIcon}
      nowPlayingLabel={audioPopoverNowPlayingLabel}
      restartLabel={audioPopoverRestartLabel}
      loopOnLabel={audioPopoverLoopOnLabel}
      loopOffLabel={audioPopoverLoopOffLabel}
      sourceLabel={audioPopoverSourceLabel}
      hideSource={audioPopoverHideSource}
      customSourceLabel={audioPopoverSourceCustomLabel}
      showMinutes={audioPopoverShowMinutes}
      statusPlayingLabel={audioPopoverStatusPlayingLabel}
      statusPausedLabel={audioPopoverStatusPausedLabel}
      statusLoopOnLabel={audioPopoverStatusLoopOnLabel}
      statusLoopOffLabel={audioPopoverStatusLoopOffLabel}
    />
  );
}
