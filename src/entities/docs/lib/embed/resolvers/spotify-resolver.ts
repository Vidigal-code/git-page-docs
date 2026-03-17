import type { EmbedResolver } from "../types";

const SPOTIFY_REGEX = /open\.spotify\.com\/(track|album|playlist|show|episode|artist)\/([a-zA-Z0-9]+)/;

export const resolveSpotifyEmbed: EmbedResolver = (url) => {
  const match = url.trim().match(SPOTIFY_REGEX);
  if (match) {
    const [, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}`;
  }
  if (url.includes("open.spotify.com/embed/")) {
    return url;
  }
  return url;
};
