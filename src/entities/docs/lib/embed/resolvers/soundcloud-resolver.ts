import type { EmbedResolver } from "../types";

export const resolveSoundCloudEmbed: EmbedResolver = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const encoded = encodeURIComponent(trimmed.startsWith("http") ? trimmed : `https://soundcloud.com/${trimmed}`);
  return `https://w.soundcloud.com/player/?url=${encoded}&auto_play=false`;
};
