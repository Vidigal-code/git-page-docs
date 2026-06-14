import type { LanguageCode } from "@/entities/docs/model/types";

export type EmbedResolver = (url: string, lang: LanguageCode) => string;

const registry = new Map<string, EmbedResolver>();

export function registerEmbedResolver(type: string, resolver: EmbedResolver): void {
  registry.set(type.toLowerCase(), resolver);
}

export function getEmbedResolver(type: string): EmbedResolver | undefined {
  return registry.get(type.toLowerCase());
}
