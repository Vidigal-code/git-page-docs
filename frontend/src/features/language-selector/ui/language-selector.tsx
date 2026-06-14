import type { LanguageCode } from "@/entities/docs";

interface LanguageSelectorProps {
  languages: LanguageCode[];
  value: LanguageCode;
  getLabel: (lang: LanguageCode) => string;
  onChange: (lang: LanguageCode) => void;
  className?: string;
  ariaLabel?: string;
}

export function LanguageSelector({ languages, value, getLabel, onChange, className, ariaLabel }: LanguageSelectorProps) {
  return (
    <select
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value as LanguageCode)}
      aria-label={ariaLabel ?? "Language"}
    >
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {getLabel(lang)}
        </option>
      ))}
    </select>
  );
}
