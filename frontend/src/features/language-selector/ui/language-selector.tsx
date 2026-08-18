"use client";

import type { LanguageCode } from "@/entities/docs";
import { DropdownSelector } from "@/shared/ui/dropdown-selector";

interface LanguageSelectorProps {
  languages: LanguageCode[];
  value: LanguageCode;
  getLabel: (lang: LanguageCode) => string;
  onChange: (lang: LanguageCode) => void;
  className?: string;
  ariaLabel?: string;
  /** Theme CSS variables forwarded to the small-screen modal (portaled to <body>). */
  themeVarsStyle?: React.CSSProperties;
}

/**
 * Language picker: delegates to the shared theme-aware dropdown (hover
 * dropdown on pointer-first screens, centered modal on small screens).
 */
export function LanguageSelector({
  languages,
  value,
  getLabel,
  onChange,
  className,
  ariaLabel,
  themeVarsStyle,
}: LanguageSelectorProps) {
  return (
    <DropdownSelector
      label={ariaLabel ?? "Language"}
      options={languages.map((lang) => ({ id: lang, label: getLabel(lang) }))}
      selectedId={value}
      onSelect={(lang) => onChange(lang as LanguageCode)}
      className={className}
      themeVarsStyle={themeVarsStyle}
    />
  );
}
