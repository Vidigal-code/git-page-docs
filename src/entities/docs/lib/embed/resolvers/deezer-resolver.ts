import type { EmbedResolver } from "../types";

const DEEZER_TRACK_REGEX = /deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/i;
const DEEZER_ALBUM_REGEX = /deezer\.com\/(?:[a-z]{2}\/)?album\/(\d+)/i;
const DEEZER_PLAYLIST_REGEX = /deezer\.com\/(?:[a-z]{2}\/)?playlist\/(\d+)/i;

export const resolveDeezerEmbed: EmbedResolver = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const fullUrl = trimmed.startsWith("http") ? trimmed : `https://www.deezer.com/${trimmed.replace(/^\//, "")}`;
  const trackMatch = fullUrl.match(DEEZER_TRACK_REGEX);
  if (trackMatch) {
    return `https://widget.deezer.com/widget/dark/track/${trackMatch[1]}`;
  }
  const albumMatch = fullUrl.match(DEEZER_ALBUM_REGEX);
  if (albumMatch) {
    return `https://widget.deezer.com/widget/dark/album/${albumMatch[1]}`;
  }
  const playlistMatch = fullUrl.match(DEEZER_PLAYLIST_REGEX);
  if (playlistMatch) {
    return `https://widget.deezer.com/widget/dark/playlist/${playlistMatch[1]}`;
  }
  return fullUrl;
};
