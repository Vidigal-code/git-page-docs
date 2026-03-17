import type { EmbedResolver } from "../types";

const VIMEO_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/;

export const resolveVimeoEmbed: EmbedResolver = (url) => {
  const match = url.match(VIMEO_REGEX);
  const id = match?.[1] ?? url;
  return `https://player.vimeo.com/video/${id}`;
};
