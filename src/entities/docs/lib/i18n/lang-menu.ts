import type { LanguageCode } from "@/entities/docs/model/types";

export function getLanguageLabelFromMenu(
  langMenu: Record<LanguageCode, Record<LanguageCode, string>>,
  selectedLanguage: LanguageCode,
  target: LanguageCode,
): string {
  const labels = langMenu[selectedLanguage];
  return labels?.[target] ?? target.toUpperCase();
}

export function getLangMenuLabelFromMenu(
  langMenu: Record<LanguageCode, Record<LanguageCode, string>>,
  selectedLanguage: LanguageCode,
  key: string,
  fallback: string,
): string {
  const labels = langMenu[selectedLanguage] as Record<string, string> | undefined;
  return labels?.[key] ?? fallback;
}
