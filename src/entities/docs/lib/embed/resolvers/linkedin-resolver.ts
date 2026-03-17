import type { EmbedResolver } from "../types";

export const resolveLinkedInEmbed: EmbedResolver = (url) => {
  const trimmed = url.trim();
  if (trimmed.startsWith("http")) {
    return trimmed;
  }
  return `https://www.linkedin.com/embed/${trimmed}`;
};
