"use client";

import type { VersionEntry } from "@/entities/docs";
import { DropdownSelector } from "@/shared/ui/dropdown-selector";
import { ControlIcon, type ControlIconConfig } from "@/shared/ui/control-icon";
import { FiGitBranch } from "@react-icons/all-files/fi/FiGitBranch";

interface VersionSelectorProps {
  versions: VersionEntry[];
  value: string;
  onChange: (versionId: string) => void;
  className?: string;
  ariaLabel?: string;
  icon?: ControlIconConfig;
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
  icon,
  themeVarsStyle,
}: Readonly<VersionSelectorProps>) {
  return (
    <DropdownSelector
      label={ariaLabel ?? "Version"}
      options={versions.map((version) => ({ id: version.id, label: version.id }))}
      selectedId={value}
      onSelect={onChange}
      className={className}
      triggerIcon={icon && <ControlIcon icon={icon} fallback={<FiGitBranch aria-hidden />} />}
      themeVarsStyle={themeVarsStyle}
    />
  );
}
