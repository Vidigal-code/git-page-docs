"use client";

import { DropdownSelector } from "@/shared/ui/dropdown-selector";

export interface ThemeSelectorOption {
  id: string;
  name: string;
}

interface ThemeSelectorProps {
  layouts: ReadonlyArray<ThemeSelectorOption>;
  value: string;
  onChange: (themeId: string) => void;
  className?: string;
  ariaLabel?: string;
  /** Theme CSS variables forwarded to the small-screen modal (portaled to <body>). */
  themeVarsStyle?: React.CSSProperties;
}

/**
 * Theme picker: delegates to the shared theme-aware dropdown so it behaves
 * exactly like the language selector (hover dropdown on pointer-first screens,
 * centered modal on small screens) instead of the unthemed native <select>.
 */
export function ThemeSelector({
  layouts,
  value,
  onChange,
  className,
  ariaLabel,
  themeVarsStyle,
}: ThemeSelectorProps) {
  return (
    <DropdownSelector
      label={ariaLabel ?? "Theme selector"}
      options={layouts.map((layout) => ({ id: layout.id, label: layout.name }))}
      selectedId={value}
      onSelect={onChange}
      className={className}
      themeVarsStyle={themeVarsStyle}
    />
  );
}
