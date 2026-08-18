"use client";

import { AudioPlayerPopover, useSharedAudioPlayer } from "@/features/audio-player";
import type { DocsShellControlsAudioProps } from "./docs-shell-controls-audio";
import styles from "../docs-shell.module.css";

type DocsShellAudioSurfaceProps = Omit<DocsShellControlsAudioProps, "showAudioPlayer" | "audioPlayerConfig">;

/**
 * The single render site for the shared audio engine's output: the playlist
 * popover and the hidden media elements. Rendered once per shell — the
 * header/drawer buttons only toggle the shared state — so pausing always
 * pauses the one real <audio>/<iframe> regardless of screen size.
 */
export function DocsShellAudioSurface({
  language: _language,
  themeVarsStyle,
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
}: DocsShellAudioSurfaceProps) {
  const player = useSharedAudioPlayer();
  if (!player) {
    return null;
  }

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
    play,
    pause,
    restart,
    selectTrack,
    closePopover,
    currentTrack,
    tracks,
    language,
    formattedTime,
    formattedDuration,
    isNativeTrack,
  } = player;

  const isEmbed = currentTrack && embedUrl;
  const isNative = currentTrack && audioSrc && !isEmbed;

  return (
    <>
      <AudioPlayerPopover
        isOpen={popoverOpen}
        tracks={tracks}
        language={language}
        currentTrack={currentTrack}
        playing={playing}
        loopEnabled={loopEnabled}
        onSelect={selectTrack}
        onClose={closePopover}
        onPlay={play}
        onPause={pause}
        onRestart={restart}
        onToggleLoop={toggleLoop}
        title={audioPlaylistTitle}
        description={audioPlaylistDescription}
        closeLabel={audioPopoverCloseLabel}
        nowPlayingLabel={audioPopoverNowPlayingLabel}
        restartLabel={audioPopoverRestartLabel}
        loopOnLabel={audioPopoverLoopOnLabel}
        loopOffLabel={audioPopoverLoopOffLabel}
        sourceLabel={audioPopoverSourceLabel}
        playLabel={audioPlayLabel}
        pauseLabel={audioPauseLabel}
        hideSource={audioPopoverHideSource}
        customSourceLabel={audioPopoverSourceCustomLabel}
        showMinutes={audioPopoverShowMinutes}
        formattedTime={formattedTime}
        formattedDuration={formattedDuration}
        isNativeTrack={isNativeTrack}
        statusPlayingLabel={audioPopoverStatusPlayingLabel}
        statusPausedLabel={audioPopoverStatusPausedLabel}
        statusLoopOnLabel={audioPopoverStatusLoopOnLabel}
        statusLoopOffLabel={audioPopoverStatusLoopOffLabel}
        closeIcon={audioPopoverCloseIcon}
        playIcon={audioPopoverPlayIcon}
        pauseIcon={audioPopoverPauseIcon}
        restartIcon={audioPopoverRestartIcon}
        loopOnIcon={audioPopoverLoopOnIcon}
        loopOffIcon={audioPopoverLoopOffIcon}
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
