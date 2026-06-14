import type { LanguageCode } from "@/entities/docs/model/types";

export function getLanguageLabelFromMenu(
  langMenu: Record<LanguageCode, Record<LanguageCode, string>>,
  selectedLanguage: LanguageCode,
  target: LanguageCode,
): string {
  const labels = langMenu[selectedLanguage];
  if (labels?.[target]) return labels[target];
  const enLabels = langMenu["en"];
  return enLabels?.[target] ?? target.toUpperCase();
}

export function getLangMenuLabelFromMenu(
  langMenu: Record<LanguageCode, Record<string, string>>,
  selectedLanguage: LanguageCode,
  key: string,
  fallback: string,
): string {
  const labels = langMenu[selectedLanguage] as Record<string, string> | undefined;
  if (labels?.[key] !== undefined && labels?.[key] !== "") {
    return labels[key] as string;
  }
  const enLabels = langMenu["en"] as Record<string, string> | undefined;
  return enLabels?.[key] ?? fallback;
}
