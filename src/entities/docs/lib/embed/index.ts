import type { LanguageCode } from "@/entities/docs/model/types";
import { isAudioEmbed } from "@/shared/lib/media-types";
import { resolveYoutubeEmbed } from "./resolvers/youtube-resolver";
import { resolveVimeoEmbed } from "./resolvers/vimeo-resolver";
import { resolveSpotifyEmbed } from "./resolvers/spotify-resolver";

const AUDIO_EMBED_RESOLVERS: Record<string, (url: string, lang: LanguageCode) => string> = {
  youtube: resolveYoutubeEmbed,
  vimeo: resolveVimeoEmbed,
  spotify: resolveSpotifyEmbed,
};

/**
 * Resolves embed URL for audio-capable providers (YouTube, Vimeo, Spotify).
 */
export function resolveAudioEmbedUrl(type: string, url: string, language: LanguageCode): string {
  const normalized = String(type).toLowerCase();
  const resolver = AUDIO_EMBED_RESOLVERS[normalized];
  if (resolver && isAudioEmbed(normalized)) {
    return resolver(url, language);
  }
  return url;
}
