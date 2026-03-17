import type { AudioTrackConfig, LanguageCode } from "@/entities/docs/model/types";

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

  return getRawTrackSourceLabel(track);
}
