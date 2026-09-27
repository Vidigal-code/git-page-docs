import type { EmbedResolver } from "../types";

const VIMEO_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/;

export const resolveVimeoEmbed: EmbedResolver = (url) => {
  const id = VIMEO_REGEX.exec(url)?.[1] ?? url;
  return `https://player.vimeo.com/video/${id}`;
};
