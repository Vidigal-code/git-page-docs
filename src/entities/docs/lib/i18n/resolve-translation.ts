import type { LanguageCode } from "@/entities/docs/model/types";

export function resolveTranslation(
  entry: Record<string, string> | undefined,
  language: LanguageCode,
  fallback: string,
): string {
  return entry?.[language] ?? entry?.en ?? fallback;
}
