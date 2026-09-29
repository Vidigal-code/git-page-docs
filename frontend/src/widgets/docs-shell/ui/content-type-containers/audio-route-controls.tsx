"use client";

import { useMemo, type ReactNode } from "react";
import { CiPlay1, FaPause, FiRefreshCw, FiRepeat } from "@/shared/ui/fallback-icons";
import { renderAudioControlIcon, useAudioPlayer } from "@/features/audio-player";
import type { AudioTrackConfig, LanguageCode } from "@/entities/docs";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";
import { resolveCaptionsTrackProps, type CaptionsByLanguage } from "./captions-track";
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
  /** Per-language WebVTT captions of the route; the empty site track is used when absent. */
  captions?: CaptionsByLanguage;
}

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  /** Marks the button as on (playing, looping) for styling. */
  active?: boolean;
  /** Toggle state for assistive technology (loop). */
  pressed?: boolean;
  testId?: string;
  children: ReactNode;
}

function ControlButton({ label, onClick, active, pressed, testId, children }: Readonly<ControlButtonProps>) {
  return (
    <button
      type="button"
      className={styles.audioRouteControlButton}
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      data-active={active || undefined}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

export function AudioRouteControls({
  audioType,
  pathAudio,
  language,
  controls,
  captions,
}: Readonly<AudioRouteControlsProps>) {
  const tracks = useMemo<AudioTrackConfig[]>(
    () => [{ type: audioType, url: pathAudio, captions }],
    [audioType, pathAudio, captions],
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
        <ControlButton label={playStatusLabel} onClick={togglePlay} active={playing} testId="audio-route-toggle">
          {renderAudioControlIcon(
            playing ? controls.pauseIcon : controls.playIcon,
            playing ? <FaPause aria-hidden /> : <CiPlay1 aria-hidden />,
          )}
        </ControlButton>
        <ControlButton label={controls.restartLabel} onClick={restart}>
          {renderAudioControlIcon(controls.restartIcon, <FiRefreshCw aria-hidden />)}
        </ControlButton>
        <ControlButton label={loopStatusLabel} onClick={toggleLoop} active={loopEnabled} pressed={loopEnabled}>
          {renderAudioControlIcon(loopEnabled ? controls.loopOnIcon : controls.loopOffIcon, <FiRepeat aria-hidden />)}
        </ControlButton>
      </div>
      {isNativeTrack && audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          loop={loopEnabled}
          onEnded={onNativeEnded}
          className={styles.audioRouteHiddenMedia}
          tabIndex={-1}
        >
          <track kind="captions" {...resolveCaptionsTrackProps(captions, language)} />
        </audio>
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
