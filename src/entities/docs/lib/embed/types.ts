import type { LanguageCode } from "@/entities/docs/model/types";

export type EmbedProvider = "youtube" | "vimeo" | "spotify";

export interface EmbedResolver {
  (url: string, _language: LanguageCode): string;
}
