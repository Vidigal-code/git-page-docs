"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioTrackConfig, LanguageCode } from "@/entities/docs/model/types";
import {
  getAudioSrc,
  getEmbedUrlWithAutoplay,
  isEmbedTrack,
  isNativePlayableTrack,
} from "./get-audio-src";

interface UseAudioPlayerOptions {
  tracks: AudioTrackConfig[];
  language: string;
  autoPlayOnLoad: boolean;
  loopEnabled: boolean;
  allowUserChoice: boolean;
}

export function useAudioPlayer({
  tracks,
  language,
  autoPlayOnLoad,
  loopEnabled: initialLoopEnabled,
  allowUserChoice,
}: UseAudioPlayerOptions) {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(initialLoopEnabled);
  const [restartKey, setRestartKey] = useState(0);
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
  };
}
