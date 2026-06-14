import type { EmbedResolver } from "../types";

const TIKTOK_REGEX = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;

export const resolveTiktokEmbed: EmbedResolver = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const fullUrl = trimmed.startsWith("http") ? trimmed : `https://www.tiktok.com/${trimmed.replace(/^\//, "")}`;
  const match = fullUrl.match(TIKTOK_REGEX);
  const id = match?.[1] ?? fullUrl.split("/").pop() ?? trimmed;
  return `https://www.tiktok.com/embed/v2/${id}`;
};
