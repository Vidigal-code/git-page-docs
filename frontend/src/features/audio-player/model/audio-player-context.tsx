"use client";

import { createContext, useContext } from "react";
import type { ResolvedBackgroundAudioConfig } from "@/entities/docs";
import { useAudioPlayer } from "./use-audio-player";

type AudioPlayerState = ReturnType<typeof useAudioPlayer>;

const AudioPlayerContext = createContext<AudioPlayerState | null>(null);

interface ActiveAudioPlayerProviderProps {
  config: ResolvedBackgroundAudioConfig;
  language: string;
  children: React.ReactNode;
}

function ActiveAudioPlayerProvider({ config, language, children }: ActiveAudioPlayerProviderProps) {
  const player = useAudioPlayer({
    tracks: config.tracks,
    language,
    autoPlayOnLoad: config.autoPlayOnLoad,
    loopEnabled: config.loopEnabled,
    allowUserChoice: config.allowUserChoice,
    sequentialPlayback: config.sequentialPlayback,
  });
  return <AudioPlayerContext.Provider value={player}>{children}</AudioPlayerContext.Provider>;
}

interface AudioPlayerProviderProps {
  config: ResolvedBackgroundAudioConfig | null | undefined;
  enabled?: boolean;
  language: string;
  children: React.ReactNode;
}

/**
 * Owns the single background-audio engine for a shell. Header and mobile
 * drawer controls mount in parallel, so playback state must live above both:
 * with per-control state each copy mounts its own <audio>/<iframe> and
 * pausing one leaves the other playing.
 */
export function AudioPlayerProvider({ config, enabled = true, language, children }: AudioPlayerProviderProps) {
  if (!enabled || !config || config.tracks.length === 0) {
    return <>{children}</>;
  }
  return (
    <ActiveAudioPlayerProvider config={config} language={language}>
      {children}
    </ActiveAudioPlayerProvider>
  );
}

/** The shared audio engine, or null when no provider is active (audio disabled). */
export function useSharedAudioPlayer(): AudioPlayerState | null {
  return useContext(AudioPlayerContext);
}
