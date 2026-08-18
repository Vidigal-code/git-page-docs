import type { LanguageCode, ResolvedBackgroundAudioConfig } from "@/entities/docs";
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
  audioPlayIconTag,
  audioPlayIconStyle,
  audioPauseIconTag,
  audioPlayLabel = "Play",
  audioPauseLabel = "Pause",
}: DocsShellControlsAudioProps) {
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
