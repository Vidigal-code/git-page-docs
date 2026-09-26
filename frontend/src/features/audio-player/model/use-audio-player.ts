"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioTrackConfig, LanguageCode } from "@/entities/docs";
import {
  getAudioSrc,
  getEmbedUrlWithPlaybackParams,
  isEmbedTrack,
  isNativePlayableTrack,
} from "./get-audio-src";
import { useExclusivePlayback } from "./use-exclusive-playback";

/** Lets the media element mount before the autoplay attempt. */
const AUTOPLAY_DELAY_MS = 300;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface UseAudioPlayerOptions {
  tracks: AudioTrackConfig[];
  language: string;
  autoPlayOnLoad: boolean;
  loopEnabled: boolean;
  allowUserChoice: boolean;
  sequentialPlayback: boolean;
}

export function useAudioPlayer({
  tracks,
  language,
  autoPlayOnLoad,
  loopEnabled: initialLoopEnabled,
  allowUserChoice,
  sequentialPlayback,
}: UseAudioPlayerOptions) {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(initialLoopEnabled);
  const [restartKey, setRestartKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentIndex] ?? null;
  const isSingleTrack = tracks.length <= 1;
  const needsPopoverForPlay = !isSingleTrack && allowUserChoice;

  const toggleLoop = useCallback(() => setLoopEnabled((prev) => !prev), []);

  const pause = useCallback(() => {
    if (isNativePlayableTrack(currentTrack?.type ?? "")) {
      audioRef.current?.pause();
    }
    setPlaying(false);
  }, [currentTrack?.type]);

  const claimPlayback = useExclusivePlayback(pause);

  const playNativeElement = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.loop = loopEnabled;
    el.play().then(() => setPlaying(true)).catch(() => {});
  }, [loopEnabled]);

  // Every path that starts sound goes through here, so the other players on
  // the page are paused before this one makes a noise.
  const play = useCallback(() => {
    if (!currentTrack) return;
    const isNative = isNativePlayableTrack(currentTrack.type);
    if (!isNative && !isEmbedTrack(currentTrack.type)) return;
    claimPlayback();
    if (isNative) {
      playNativeElement();
    } else {
      setPlaying(true);
    }
  }, [currentTrack, claimPlayback, playNativeElement]);

  const shouldPlayAfterSelectRef = useRef(false);

  const selectTrack = useCallback(
    (index: number) => {
      setPopoverOpen(false);
      setPlaying(false);
      setCurrentIndex(index);
      const track = tracks[index];
      if (track && isEmbedTrack(track.type)) {
        claimPlayback();
        setPlaying(true);
      } else {
        shouldPlayAfterSelectRef.current = true;
      }
    },
    [tracks, claimPlayback]
  );

  useEffect(() => {
    if (!shouldPlayAfterSelectRef.current || !currentTrack) return;
    if (isNativePlayableTrack(currentTrack.type)) {
      claimPlayback();
      playNativeElement();
    }
    shouldPlayAfterSelectRef.current = false;
  }, [currentIndex, currentTrack, claimPlayback, playNativeElement]);

  const togglePlay = useCallback(() => {
    if (needsPopoverForPlay) {
      setPopoverOpen((o) => !o);
      return;
    }
    if (playing) {
      pause();
    } else {
      play();
    }
  }, [needsPopoverForPlay, playing, play, pause]);

  const closePopover = useCallback(() => setPopoverOpen(false), []);

  const onNativeEnded = useCallback(() => {
    if (sequentialPlayback && currentIndex + 1 < tracks.length) {
      selectTrack(currentIndex + 1);
    }
  }, [sequentialPlayback, currentIndex, tracks.length, selectTrack]);

  const restart = useCallback(() => {
    if (!currentTrack) return;
    if (isNativePlayableTrack(currentTrack.type)) {
      const el = audioRef.current;
      if (el) {
        el.currentTime = 0;
        if (playing) playNativeElement();
      }
    } else if (isEmbedTrack(currentTrack.type)) {
      setRestartKey((k) => k + 1);
    }
  }, [currentTrack, playing, playNativeElement]);

  useEffect(() => {
    if (!autoPlayOnLoad || !currentTrack || tracks.length === 0) return;
    const t = setTimeout(play, AUTOPLAY_DELAY_MS);
    return () => clearTimeout(t);
  }, [autoPlayOnLoad, currentTrack, tracks.length, play]);

  const isNativeTrack = Boolean(currentTrack && isNativePlayableTrack(currentTrack.type));

  useEffect(() => {
    if (!isNativeTrack || !currentTrack) {
      setCurrentTime(0);
      setDuration(0);
      return;
    }
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => setDuration(el.duration);
    const onDurationChange = () => setDuration(el.duration);
    const onCanPlay = () => setDuration(el.duration);

    setCurrentTime(el.currentTime);
    setDuration(el.duration);

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("durationchange", onDurationChange);
    el.addEventListener("canplay", onCanPlay);

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("durationchange", onDurationChange);
      el.removeEventListener("canplay", onCanPlay);
    };
  }, [currentIndex, currentTrack, isNativeTrack]);

  const audioSrc = currentTrack
    ? getAudioSrc(currentTrack, language as LanguageCode)
    : "";
  const embedUrl =
    currentTrack && isEmbedTrack(currentTrack.type)
      ? getEmbedUrlWithPlaybackParams(audioSrc, { autoplay: playing, loop: loopEnabled })
      : "";

  return {
    playing,
    currentIndex,
    currentTrack,
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
    togglePlay,
    selectTrack,
    closePopover,
    needsPopoverForPlay,
    tracks,
    language,
    currentTime,
    duration,
    formattedTime: formatTime(currentTime),
    formattedDuration: isNativeTrack ? formatTime(duration) : "—:—",
    isNativeTrack,
  };
}
