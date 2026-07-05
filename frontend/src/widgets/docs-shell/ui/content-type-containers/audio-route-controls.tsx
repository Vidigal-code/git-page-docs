"use client";

import { useMemo } from "react";
import { CiPlay1 } from "react-icons/ci";
import { FaPause } from "react-icons/fa";
import { FiRefreshCw, FiRepeat } from "react-icons/fi";
import { renderAudioControlIcon, useAudioPlayer } from "@/features/audio-player";
import type { AudioTrackConfig, LanguageCode } from "@/entities/docs";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";
import styles from "../../docs-shell.module.css";

export interface AudioRouteControlsConfig {
  playIcon?: ResolvedNavMenuIconConfig;
  pauseIcon?: ResolvedNavMenuIconConfig;
  restartIcon?: ResolvedNavMenuIconConfig;
  loopOnIcon?: ResolvedNavMenuIconConfig;
  loopOffIcon?: ResolvedNavMenuIconConfig;
  playLabel: string;
  pauseLabel: string;
  restartLabel: string;
  loopOnLabel: string;
  loopOffLabel: string;
  statusPlayingLabel?: string;
  statusPausedLabel?: string;
  statusLoopOnLabel?: string;
  statusLoopOffLabel?: string;
}

interface AudioRouteControlsProps {
  audioType: string;
  pathAudio: string;
  language: LanguageCode;
  controls: AudioRouteControlsConfig;
}

export function AudioRouteControls({ audioType, pathAudio, language, controls }: AudioRouteControlsProps) {
  const tracks = useMemo<AudioTrackConfig[]>(
    () => [{ type: audioType, url: pathAudio }],
    [audioType, pathAudio],
  );

  const {
    playing,
    audioRef,
    onNativeEnded,
    audioSrc,
    embedUrl,
    restartKey,
    loopEnabled,
    toggleLoop,
    togglePlay,
    restart,
    isNativeTrack,
  } = useAudioPlayer({
    tracks,
    language,
    autoPlayOnLoad: false,
    loopEnabled: false,
    allowUserChoice: false,
    sequentialPlayback: false,
  });

  const playStatusLabel = playing
    ? (controls.statusPausedLabel ?? controls.pauseLabel)
    : (controls.statusPlayingLabel ?? controls.playLabel);
  const loopStatusLabel = loopEnabled
    ? (controls.statusLoopOffLabel ?? controls.loopOffLabel)
    : (controls.statusLoopOnLabel ?? controls.loopOnLabel);

  return (
    <div className={styles.audioRoutePlayer} aria-label={playStatusLabel}>
      <div className={styles.audioRouteControls}>
        <button
          type="button"
          className={styles.audioRouteControlButton}
          onClick={togglePlay}
          aria-label={playStatusLabel}
          title={playStatusLabel}
          data-active={playing || undefined}
        >
          {renderAudioControlIcon(
            playing ? controls.pauseIcon : controls.playIcon,
            playing ? <FaPause aria-hidden /> : <CiPlay1 aria-hidden />,
          )}
        </button>
        <button
          type="button"
          className={styles.audioRouteControlButton}
          onClick={restart}
          aria-label={controls.restartLabel}
          title={controls.restartLabel}
        >
          {renderAudioControlIcon(controls.restartIcon, <FiRefreshCw aria-hidden />)}
        </button>
        <button
          type="button"
          className={styles.audioRouteControlButton}
          onClick={toggleLoop}
          aria-label={loopStatusLabel}
          title={loopStatusLabel}
          data-active={loopEnabled || undefined}
        >
          {renderAudioControlIcon(loopEnabled ? controls.loopOnIcon : controls.loopOffIcon, <FiRepeat aria-hidden />)}
        </button>
      </div>
      {isNativeTrack && audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          loop={loopEnabled}
          onEnded={onNativeEnded}
          playsInline
          className={styles.audioRouteHiddenMedia}
          aria-hidden
        />
      )}
      {!isNativeTrack && embedUrl && playing && (
        <iframe
          key={restartKey}
          src={embedUrl}
          title="Route audio"
          allow="autoplay"
          className={styles.audioRouteHiddenMedia}
          aria-hidden
        />
      )}
    </div>
  );
}
