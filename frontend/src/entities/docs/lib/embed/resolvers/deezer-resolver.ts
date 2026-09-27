import type { EmbedResolver } from "../types";

const DEEZER_WIDGET_BASE = "https://widget.deezer.com/widget/dark";

const DEEZER_RESOURCE_PATTERNS: Array<[kind: "track" | "album" | "playlist", pattern: RegExp]> = [
  ["track", /deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/i],
  ["album", /deezer\.com\/(?:[a-z]{2}\/)?album\/(\d+)/i],
  ["playlist", /deezer\.com\/(?:[a-z]{2}\/)?playlist\/(\d+)/i],
];

export const resolveDeezerEmbed: EmbedResolver = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const fullUrl = trimmed.startsWith("http") ? trimmed : `https://www.deezer.com/${trimmed.replace(/^\//, "")}`;
  for (const [kind, pattern] of DEEZER_RESOURCE_PATTERNS) {
    const id = pattern.exec(fullUrl)?.[1];
    if (id) {
      return `${DEEZER_WIDGET_BASE}/${kind}/${id}`;
    }
  }
  return fullUrl;
};
