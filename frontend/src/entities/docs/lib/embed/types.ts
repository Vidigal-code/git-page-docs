import type { LanguageCode } from "@/entities/docs/model/types";

export type EmbedProvider = "youtube" | "vimeo" | "spotify" | "linkedin" | "instagram" | "soundcloud";

export type EmbedResolver = (url: string, language: LanguageCode) => string;
