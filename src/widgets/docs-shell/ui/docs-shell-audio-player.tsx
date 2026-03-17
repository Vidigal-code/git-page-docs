"use client";

import { AudioPlayerButton, AudioPlayerPopover, useAudioPlayer } from "@/features/audio-player";
import type { ResolvedBackgroundAudioConfig } from "@/entities/docs/lib/audio";
import styles from "../docs-shell.module.css";

interface DocsShellAudioPlayerProps {
  config: ResolvedBackgroundAudioConfig;
  language: string;
  playIconTag?: string;
  pauseIconTag?: string;
  iconStyle?: React.CSSProperties;
  playLabel: string;
  pauseLabel: string;
  playlistTitle: string;
  playlistDescription: string;
  closeLabel: string;
}

export function DocsShellAudioPlayer({
  config,
  language,
  playIconTag = "CiPlay1",
  pauseIconTag = "FaPause",
  iconStyle,
  playLabel,
  pauseLabel,
  playlistTitle,
  playlistDescription,
  closeLabel,
}: DocsShellAudioPlayerProps) {
  const {
    playing,
    popoverOpen,
    audioRef,
    audioSrc,
    embedUrl,
    togglePlay,
    selectTrack,
    closePopover,
    currentTrack,
    tracks,
    language: lang,
  } = useAudioPlayer({
    tracks: config.tracks,
    language,
    autoPlayOnLoad: config.autoPlayOnLoad,
    loopEnabled: config.loopEnabled,
    allowUserChoice: config.allowUserChoice,
  });

  const isEmbed = currentTrack && embedUrl;
  const isNative = currentTrack && audioSrc && !isEmbed;

  return (
    <>
      <AudioPlayerButton
        isPlaying={playing}
        onToggle={togglePlay}
        playIconTag={playIconTag}
        pauseIconTag={pauseIconTag}
        iconStyle={iconStyle}
        playLabel={playLabel}
        pauseLabel={pauseLabel}
        className={`${styles.button} ${styles.headerIconButton}`}
      />
      <AudioPlayerPopover
        isOpen={popoverOpen}
        tracks={tracks}
        language={lang}
        onSelect={selectTrack}
        onClose={closePopover}
        title={playlistTitle}
        description={playlistDescription}
        closeLabel={closeLabel}
        overlayClassName={styles.versionLinksOverlay}
        cardClassName={styles.versionLinksCard}
      />
      {isNative && (
        <audio
          ref={audioRef}
          src={audioSrc}
          loop={config.loopEnabled}
          playsInline
          style={{ display: "none" }}
          aria-hidden
        />
      )}
      {isEmbed && playing && (
        <iframe
          src={embedUrl}
          title="Background audio"
          allow="autoplay"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "1px",
            height: "1px",
            border: "none",
            opacity: 0,
            pointerEvents: "none",
          }}
          aria-hidden
        />
      )}
    </>
  );
}
