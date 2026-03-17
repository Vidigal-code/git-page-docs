import { getEmbedUrl } from "@/entities/docs/lib/video/embed-url";
import type { AudioTrackConfig } from "@/entities/docs/model/types";
import type { LanguageCode } from "@/entities/docs/model/types";
import { getBasePath } from "@/shared/lib/base-path";

const NATIVE_AUDIO = new Set(["mp3", "wav", "ogg"]);
const NATIVE_VIDEO_AS_AUDIO = new Set(["mp4", "webm"]);
const EMBED_TYPES = new Set(["youtube", "vimeo"]);

export function isNativePlayableTrack(type: string): boolean {
  const t = String(type).toLowerCase();
  return NATIVE_AUDIO.has(t) || NATIVE_VIDEO_AS_AUDIO.has(t);
}

export function isEmbedTrack(type: string): boolean {
  return EMBED_TYPES.has(String(type).toLowerCase());
}

/**
 * Resolves playback URL for a track. Native audio/video: direct URL (resolved for relative paths).
 * YouTube/Vimeo: embed URL for iframe.
 */
export function getAudioSrc(track: AudioTrackConfig, language: LanguageCode): string {
  const type = String(track.type).toLowerCase();
  const url = track.url?.trim() || "";

  if (isNativePlayableTrack(type)) {
    if (url.startsWith("http") || url.startsWith("//")) return url;
    const base = getBasePath();
    return base ? `${base}/${url.replace(/^\//, "")}` : `/${url.replace(/^\//, "")}`;
  }

  if (isEmbedTrack(type)) {
    return getEmbedUrl(type, url, language);
  }

  return url;
}

/**
 * Appends autoplay param to embed URL if needed.
 */
export function getEmbedUrlWithAutoplay(embedUrl: string, autoplay: boolean): string {
  if (!autoplay) return embedUrl;
  const sep = embedUrl.includes("?") ? "&" : "?";
  return `${embedUrl}${sep}autoplay=1`;
}
