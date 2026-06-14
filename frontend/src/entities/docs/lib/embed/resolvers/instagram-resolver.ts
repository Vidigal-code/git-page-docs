import type { EmbedResolver } from "../types";

const INSTAGRAM_REGEX = /instagram\.com\/p\/([a-zA-Z0-9_-]+)/;

export const resolveInstagramEmbed: EmbedResolver = (url) => {
  const match = url.trim().match(INSTAGRAM_REGEX);
  const code = match?.[1] ?? url.trim();
  return `https://www.instagram.com/p/${code}/embed`;
};
