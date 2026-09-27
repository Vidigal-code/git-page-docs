import type { EmbedResolver } from "../types";

const SPOTIFY_REGEX = /open\.spotify\.com\/(track|album|playlist|show|episode|artist)\/([a-zA-Z0-9]+)/;

export const resolveSpotifyEmbed: EmbedResolver = (url) => {
  const match = SPOTIFY_REGEX.exec(url.trim());
  if (match) {
    const [, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}`;
  }
  // Anything else (including an already-built /embed/ url) is passed through.
  return url;
};
