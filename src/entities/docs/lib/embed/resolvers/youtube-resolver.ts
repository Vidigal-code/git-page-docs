import type { EmbedResolver } from "../types";

const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export const resolveYoutubeEmbed: EmbedResolver = (url) => {
  const match = url.match(YOUTUBE_REGEX);
  const id = match?.[1] ?? url;
  return `https://www.youtube.com/embed/${id}`;
};
