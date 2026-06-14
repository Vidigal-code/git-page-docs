"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioTrackConfig, LanguageCode } from "@/entities/docs";
import {
  getAudioSrc,
  getEmbedUrlWithAutoplay,
  isEmbedTrack,
  isNativePlayableTrack,
} from "./get-audio-src";

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

  const play = useCallback(() => {
    if (!currentTrack) return;
    if (isNativePlayableTrack(currentTrack.type)) {
      const el = audioRef.current;
      if (el) {
        el.loop = loopEnabled;
        el.play().then(() => setPlaying(true)).catch(() => {});
      }
    } else if (isEmbedTrack(currentTrack.type)) {
      setPlaying(true);
    }
  }, [currentTrack, loopEnabled]);

  const pause = useCallback(() => {
    if (isNativePlayableTrack(currentTrack?.type ?? "")) {
      audioRef.current?.pause();
    }
    setPlaying(false);
  }, [currentTrack?.type]);

  const shouldPlayAfterSelectRef = useRef(false);

  const selectTrack = useCallback(
    (index: number) => {
      setPopoverOpen(false);
      setPlaying(false);
      setCurrentIndex(index);
      const track = tracks[index];
      if (track && isEmbedTrack(track.type)) {
        setPlaying(true);
      } else {
        shouldPlayAfterSelectRef.current = true;
      }
    },
    [tracks]
  );

  useEffect(() => {
    if (!shouldPlayAfterSelectRef.current || !currentTrack) return;
    if (isNativePlayableTrack(currentTrack.type)) {
      const el = audioRef.current;
      if (el) {
        el.loop = loopEnabled;
        el.play().then(() => setPlaying(true)).catch(() => {});
      }
    }
    shouldPlayAfterSelectRef.current = false;
  }, [currentIndex, currentTrack, loopEnabled]);

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
        if (playing) {
          el.loop = loopEnabled;
          el.play().then(() => setPlaying(true)).catch(() => {});
        }
      }
    } else if (isEmbedTrack(currentTrack.type)) {
      setRestartKey((k) => k + 1);
    }
  }, [currentTrack, playing, loopEnabled]);

  useEffect(() => {
    if (!autoPlayOnLoad || !currentTrack || tracks.length === 0) return;
    const t = setTimeout(() => {
      if (isNativePlayableTrack(currentTrack.type)) {
        const el = audioRef.current;
        if (el) {
          el.loop = loopEnabled;
          el.play().then(() => setPlaying(true)).catch(() => {});
        }
      } else if (isEmbedTrack(currentTrack.type)) {
        setPlaying(true);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [autoPlayOnLoad, currentTrack, loopEnabled, tracks.length]);

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
      ? getEmbedUrlWithAutoplay(audioSrc, playing)
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
