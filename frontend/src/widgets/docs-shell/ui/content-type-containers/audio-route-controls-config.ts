import type { DocsShellControlsProps } from "../docs-shell-controls";
import type { AudioRouteControlsConfig } from "./audio-route-controls";

export function buildAudioRouteControlsConfig(controlsProps: DocsShellControlsProps): AudioRouteControlsConfig {
  return {
    playIcon: controlsProps.audioPopoverPlayIcon,
    pauseIcon: controlsProps.audioPopoverPauseIcon,
    restartIcon: controlsProps.audioPopoverRestartIcon,
    loopOnIcon: controlsProps.audioPopoverLoopOnIcon,
    loopOffIcon: controlsProps.audioPopoverLoopOffIcon,
    playLabel: controlsProps.audioPlayLabel ?? "Play",
    pauseLabel: controlsProps.audioPauseLabel ?? "Pause",
    restartLabel: controlsProps.audioPopoverRestartLabel ?? "Restart",
    loopOnLabel: controlsProps.audioPopoverLoopOnLabel ?? "Loop on",
    loopOffLabel: controlsProps.audioPopoverLoopOffLabel ?? "Loop off",
    statusPlayingLabel: controlsProps.audioPopoverStatusPlayingLabel,
    statusPausedLabel: controlsProps.audioPopoverStatusPausedLabel,
    statusLoopOnLabel: controlsProps.audioPopoverStatusLoopOnLabel,
    statusLoopOffLabel: controlsProps.audioPopoverStatusLoopOffLabel,
  };
}
