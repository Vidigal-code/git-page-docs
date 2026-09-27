import type { EmbedResolver } from "../types";

const INSTAGRAM_REGEX = /instagram\.com\/p\/([a-zA-Z0-9_-]+)/;

export const resolveInstagramEmbed: EmbedResolver = (url) => {
  const trimmed = url.trim();
  const code = INSTAGRAM_REGEX.exec(trimmed)?.[1] ?? trimmed;
  return `https://www.instagram.com/p/${code}/embed`;
};
