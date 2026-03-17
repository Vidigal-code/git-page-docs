import type { AudioTrackConfig, LanguageCode } from "@/entities/docs/model/types";

/** Friendly display names for embed platform types */
const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  spotify: "Spotify",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  soundcloud: "SoundCloud",
  bandcamp: "Bandcamp",
  deezer: "Deezer",
  x: "X",
  twitter: "X",
  tiktok: "TikTok",
};

function getRawTrackSourceLabel(track: AudioTrackConfig): string {
  try {
    const url = track.url?.trim() || "";
    if (url.startsWith("http") || url.startsWith("//")) {
      const path = url.split("/").pop()?.split("?")[0];
      return path || url;
    }
    return url.split("/").pop() || url;
  } catch {
    return track.url || "";
  }
}

function getPlatformDisplayName(type: string): string | null {
  const normalized = String(type).toLowerCase();
  return PLATFORM_DISPLAY_NAMES[normalized] ?? null;
}

export interface GetDisplaySourceLabelInput {
  track: AudioTrackConfig;
  language: string;
  hideSource: boolean;
  customLabel?: Record<string, string>;
}

/**
 * Resolves the displayed source label for the audio popover "Now playing" block.
 * Priority: hideSource > customLabel > track.sourceLabel > raw ID from URL.
 */
export function getDisplaySourceLabel(input: GetDisplaySourceLabelInput): string | null {
  const { track, language, hideSource, customLabel } = input;

  if (hideSource) {
    return null;
  }

  const langKey = language as LanguageCode;
  const custom = customLabel?.[langKey]?.trim();
  if (custom) {
    return custom;
  }

  const trackSource = track.sourceLabel?.[langKey] ?? track.sourceLabel?.en;
  if (trackSource?.trim()) {
    return trackSource.trim();
  }

  const platformName = getPlatformDisplayName(track.type ?? "");
  if (platformName) {
    return platformName;
  }

  return getRawTrackSourceLabel(track);
}
