import type { EmbedResolver } from "../types";

const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export const resolveYoutubeEmbed: EmbedResolver = (url) => {
  const id = YOUTUBE_REGEX.exec(url)?.[1] ?? url;
  return `https://www.youtube.com/embed/${id}`;
};
