import type { LanguageCode } from "@/entities/docs/model/types";
import { isAudioEmbed } from "@/shared/lib/media-types";
import { resolveYoutubeEmbed } from "./resolvers/youtube-resolver";
import { resolveVimeoEmbed } from "./resolvers/vimeo-resolver";
import { resolveSpotifyEmbed } from "./resolvers/spotify-resolver";
import { resolveLinkedInEmbed } from "./resolvers/linkedin-resolver";
import { resolveInstagramEmbed } from "./resolvers/instagram-resolver";
import { resolveSoundCloudEmbed } from "./resolvers/soundcloud-resolver";
import { resolveBandcampEmbed } from "./resolvers/bandcamp-resolver";
import { resolveDeezerEmbed } from "./resolvers/deezer-resolver";
import { resolveXEmbed } from "./resolvers/x-resolver";
import { resolveTiktokEmbed } from "./resolvers/tiktok-resolver";

const AUDIO_EMBED_RESOLVERS: Record<string, (url: string, lang: LanguageCode) => string> = {
  youtube: resolveYoutubeEmbed,
  vimeo: resolveVimeoEmbed,
  spotify: resolveSpotifyEmbed,
  linkedin: resolveLinkedInEmbed,
  instagram: resolveInstagramEmbed,
  soundcloud: resolveSoundCloudEmbed,
  bandcamp: resolveBandcampEmbed,
  deezer: resolveDeezerEmbed,
  x: resolveXEmbed,
  twitter: resolveXEmbed,
  tiktok: resolveTiktokEmbed,
};

/**
 * Resolves embed URL for audio-capable providers (YouTube, Vimeo, Spotify, LinkedIn, Instagram, SoundCloud).
 */
export function resolveAudioEmbedUrl(type: string, url: string, language: LanguageCode): string {
  const normalized = String(type).toLowerCase();
  const resolver = AUDIO_EMBED_RESOLVERS[normalized];
  if (resolver && isAudioEmbed(normalized)) {
    return resolver(url, language);
  }
  return url;
}
