"use client";

import { AudioPlayerButton, useSharedAudioPlayer } from "@/features/audio-player";
import styles from "../docs-shell.module.css";

interface DocsShellAudioPlayerProps {
  playIconTag?: string;
  pauseIconTag?: string;
  iconStyle?: React.CSSProperties;
  playLabel: string;
  pauseLabel: string;
}

/**
 * Header/drawer toggle button bound to the shared audio engine. The engine and
 * its media elements live once in DocsShellAudioSurface, so this button can be
 * rendered in several places (header, mobile drawer) without duplicating
 * playback state.
 */
export function DocsShellAudioPlayer({
  playIconTag = "CiPlay1",
  pauseIconTag = "FaPause",
  iconStyle,
  playLabel,
  pauseLabel,
}: DocsShellAudioPlayerProps) {
  const player = useSharedAudioPlayer();
  if (!player) {
    return null;
  }

  return (
    <AudioPlayerButton
      isPlaying={player.playing}
      onToggle={player.togglePlay}
      playIconTag={playIconTag}
      pauseIconTag={pauseIconTag}
      iconStyle={iconStyle}
      playLabel={playLabel}
      pauseLabel={pauseLabel}
      className={`${styles.button} ${styles.headerIconButton}`}
    />
  );
}
