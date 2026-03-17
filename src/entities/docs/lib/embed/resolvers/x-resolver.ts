import type { EmbedResolver } from "../types";

const TWITTER_X_REGEX = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;

export const resolveXEmbed: EmbedResolver = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const match = trimmed.match(TWITTER_X_REGEX);
  const id = match?.[1] ?? trimmed;
  return `https://platform.twitter.com/embed/tweet.html?id=${id}`;
};
