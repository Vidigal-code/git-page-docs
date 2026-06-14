"use client";

import { AudioPlayerButton, AudioPlayerPopover, useAudioPlayer } from "@/features/audio-player";
import type { ResolvedBackgroundAudioConfig } from "@/entities/docs";
import styles from "../docs-shell.module.css";

interface DocsShellAudioPlayerProps {
  config: ResolvedBackgroundAudioConfig;
  language: string;
  themeVarsStyle?: React.CSSProperties;
  playIconTag?: string;
  pauseIconTag?: string;
  iconStyle?: React.CSSProperties;
  playLabel: string;
  pauseLabel: string;
  playlistTitle: string;
  playlistDescription: string;
  closeLabel: string;
  closeIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  playIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  pauseIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  restartIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  loopOnIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  loopOffIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  nowPlayingLabel?: string;
  restartLabel?: string;
  loopOnLabel?: string;
  loopOffLabel?: string;
  sourceLabel?: string;
  hideSource?: boolean;
  customSourceLabel?: Record<string, string>;
  showMinutes?: boolean;
  statusPlayingLabel?: string;
  statusPausedLabel?: string;
  statusLoopOnLabel?: string;
  statusLoopOffLabel?: string;
}

export function DocsShellAudioPlayer({
  config,
  language,
  themeVarsStyle,
  playIconTag = "CiPlay1",
  pauseIconTag = "FaPause",
  iconStyle,
  playLabel,
  pauseLabel,
  playlistTitle,
  playlistDescription,
  closeLabel,
  closeIcon,
  playIcon,
  pauseIcon,
  restartIcon,
  loopOnIcon,
  loopOffIcon,
  nowPlayingLabel = "Now playing",
  restartLabel = "Restart",
  loopOnLabel = "Loop on",
  loopOffLabel = "Loop off",
  sourceLabel = "File",
  hideSource = false,
  customSourceLabel,
  showMinutes = true,
  statusPlayingLabel,
  statusPausedLabel,
  statusLoopOnLabel,
  statusLoopOffLabel,
}: DocsShellAudioPlayerProps) {
  const {
    playing,
    popoverOpen,
    audioRef,
    onNativeEnded,
    audioSrc,
    embedUrl,
    restartKey,
    loopEnabled,
    toggleLoop,
    togglePlay,
    play,
    pause,
    restart,
    selectTrack,
    closePopover,
    currentTrack,
    tracks,
    language: lang,
    formattedTime,
    formattedDuration,
    isNativeTrack,
  } = useAudioPlayer({
    tracks: config.tracks,
    language,
    autoPlayOnLoad: config.autoPlayOnLoad,
    loopEnabled: config.loopEnabled,
    allowUserChoice: config.allowUserChoice,
    sequentialPlayback: config.sequentialPlayback,
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
        currentTrack={currentTrack}
        playing={playing}
        loopEnabled={loopEnabled}
        onSelect={selectTrack}
        onClose={closePopover}
        onPlay={play}
        onPause={pause}
        onRestart={restart}
        onToggleLoop={toggleLoop}
        title={playlistTitle}
        description={playlistDescription}
        closeLabel={closeLabel}
        nowPlayingLabel={nowPlayingLabel}
        restartLabel={restartLabel}
        loopOnLabel={loopOnLabel}
        loopOffLabel={loopOffLabel}
        sourceLabel={sourceLabel}
        playLabel={playLabel}
        pauseLabel={pauseLabel}
        hideSource={hideSource}
        customSourceLabel={customSourceLabel}
        showMinutes={showMinutes}
        formattedTime={formattedTime}
        formattedDuration={formattedDuration}
        isNativeTrack={isNativeTrack}
        statusPlayingLabel={statusPlayingLabel}
        statusPausedLabel={statusPausedLabel}
        statusLoopOnLabel={statusLoopOnLabel}
        statusLoopOffLabel={statusLoopOffLabel}
        closeIcon={closeIcon}
        playIcon={playIcon}
        pauseIcon={pauseIcon}
        restartIcon={restartIcon}
        loopOnIcon={loopOnIcon}
        loopOffIcon={loopOffIcon}
        overlayClassName={styles.focusModeOverlay}
        cardClassName={styles.focusModeCard}
        headerClassName={styles.focusModeHeader}
        bodyClassName={styles.focusModeBody}
        footerClassName={`${styles.focusModeFooter} ${styles.audioPlayerPopoverFooter}`}
        closeButtonClassName={`${styles.button} ${styles.focusModeCloseButton}`}
        controlButtonClassName={`${styles.button} ${styles.audioPlayerPopoverControlButton}`}
        themeVarsStyle={themeVarsStyle}
      />
      {isNative && (
        <audio
          ref={audioRef}
          src={audioSrc}
          loop={loopEnabled}
          onEnded={onNativeEnded}
          playsInline
          style={{ display: "none" }}
          aria-hidden
        />
      )}
      {isEmbed && playing && (
        <iframe
          key={restartKey}
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
