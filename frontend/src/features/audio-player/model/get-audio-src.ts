import { getEmbedUrl, type AudioTrackConfig, type LanguageCode } from "@/entities/docs";
import { getBasePath } from "@/shared/lib/base-path";
import {
  isNativeAudio,
  isNativeVideoAsAudio,
  isAudioEmbed,
} from "@/shared/lib/media-types";

export function isNativePlayableTrack(type: string): boolean {
  const t = String(type).toLowerCase();
  return isNativeAudio(t) || isNativeVideoAsAudio(t);
}

export function isEmbedTrack(type: string): boolean {
  return isAudioEmbed(String(type));
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

interface EmbedPlaybackParams {
  autoplay: boolean;
  loop?: boolean;
}

function getYouTubeEmbedId(embedUrl: string): string | null {
  const match = embedUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

/**
 * Appends playback params used by iframe-based audio providers.
 */
export function getEmbedUrlWithPlaybackParams(embedUrl: string, { autoplay, loop = false }: EmbedPlaybackParams): string {
  if (!autoplay && !loop) return embedUrl;

  const sep = embedUrl.includes("?") ? "&" : "?";
  const params = new URLSearchParams();
  const youtubeId = getYouTubeEmbedId(embedUrl);

  if (autoplay) params.set("autoplay", "1");
  if (loop) {
    params.set("loop", "1");
    if (youtubeId) params.set("playlist", youtubeId);
  }

  return `${embedUrl}${sep}${params.toString()}`;
}

/**
 * Appends autoplay param to embed URL if needed.
 */
export function getEmbedUrlWithAutoplay(embedUrl: string, autoplay: boolean): string {
  return getEmbedUrlWithPlaybackParams(embedUrl, { autoplay });
}
