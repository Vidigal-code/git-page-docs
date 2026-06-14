import type { LanguageCode } from "@/entities/docs/model/types";

export type EmbedProvider = "youtube" | "vimeo" | "spotify" | "linkedin" | "instagram" | "soundcloud";

export interface EmbedResolver {
  (url: string, _language: LanguageCode): string;
}
