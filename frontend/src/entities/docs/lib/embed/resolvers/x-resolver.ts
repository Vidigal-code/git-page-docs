import type { EmbedResolver } from "../types";

const TWITTER_X_REGEX = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;

export const resolveXEmbed: EmbedResolver = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const id = TWITTER_X_REGEX.exec(trimmed)?.[1] ?? trimmed;
  return `https://platform.twitter.com/embed/tweet.html?id=${id}`;
};
