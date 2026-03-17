import type { LanguageCode } from "@/entities/docs/model/types";
import { isAudioEmbed } from "@/shared/lib/media-types";
import { getEmbedResolver } from "./embed-resolver-registry";

import "./bootstrap-resolvers";

/**
 * Resolves embed URL for audio-capable providers (YouTube, Vimeo, Spotify, LinkedIn, Instagram, SoundCloud).
 */
export function resolveAudioEmbedUrl(type: string, url: string, language: LanguageCode): string {
  const normalized = String(type).toLowerCase();
  const resolver = getEmbedResolver(normalized);
  if (resolver && isAudioEmbed(normalized)) {
    return resolver(url, language);
  }
  return url;
}

export { registerEmbedResolver, getEmbedResolver, hasEmbedResolver } from "./embed-resolver-registry";
export type { EmbedResolver } from "./embed-resolver-registry";
