"use client";

import type { VersionEntry } from "@/entities/docs";
import { DropdownSelector } from "@/shared/ui/dropdown-selector";

interface VersionSelectorProps {
  versions: VersionEntry[];
  value: string;
  onChange: (versionId: string) => void;
  className?: string;
  ariaLabel?: string;
  /** Theme CSS variables forwarded to the small-screen modal (portaled to <body>). */
  themeVarsStyle?: React.CSSProperties;
}

/**
 * Version picker: delegates to the shared theme-aware dropdown so it matches
 * the language and theme selectors sitting beside it in the shell controls.
 */
export function VersionSelector({
  versions,
  value,
  onChange,
  className,
  ariaLabel,
  themeVarsStyle,
}: VersionSelectorProps) {
  return (
    <DropdownSelector
      label={ariaLabel ?? "Version"}
      options={versions.map((version) => ({ id: version.id, label: version.id }))}
      selectedId={value}
      onSelect={onChange}
      className={className}
      themeVarsStyle={themeVarsStyle}
    />
  );
}
