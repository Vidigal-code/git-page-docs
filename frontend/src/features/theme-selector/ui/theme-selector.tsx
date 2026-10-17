"use client";

import { DropdownSelector } from "@/shared/ui/dropdown-selector";
import { BsSunFill } from "@/shared/ui/fallback-icons";
import { ControlIcon, type ControlIconConfig } from "@/shared/ui/control-icon";

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
  icon?: ControlIconConfig;
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
  icon,
  themeVarsStyle,
}: Readonly<ThemeSelectorProps>) {
  return (
    <DropdownSelector
      label={ariaLabel ?? "Theme selector"}
      options={layouts.map((layout) => ({ id: layout.id, label: layout.name }))}
      selectedId={value}
      onSelect={onChange}
      className={className}
      triggerIcon={icon && <ControlIcon icon={icon} fallback={<BsSunFill aria-hidden />} />}
      themeVarsStyle={themeVarsStyle}
    />
  );
}
