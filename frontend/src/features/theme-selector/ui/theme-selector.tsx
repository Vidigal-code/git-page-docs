"use client";

import { useRef, useState } from "react";
import { SelectionDialog } from "@/shared/ui/selection-dialog";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { SMALL_SCREEN_MEDIA_QUERY } from "@/shared/config/constants";

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
 * Theme picker: a native <select> on pointer-first screens, and a centered
 * theme-aware modal on small screens (mirroring the language selector and the
 * focus-mode overlay).
 */
export function ThemeSelector({
  layouts,
  value,
  onChange,
  className,
  ariaLabel,
  themeVarsStyle,
}: ThemeSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_MEDIA_QUERY);
  const label = ariaLabel ?? "Theme selector";

  if (!isSmallScreen) {
    return (
      <select
        className={className}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {layouts.map((layout) => (
          <option key={layout.id} value={layout.id}>
            {layout.name}
          </option>
        ))}
      </select>
    );
  }

  const activeLayout = layouts.find((layout) => layout.id === value);

  const closeModal = () => {
    setIsModalOpen(false);
    // The dialog unmounts; keep keyboard focus on the trigger.
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        onClick={() => setIsModalOpen(true)}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
        title={label}
      >
        <span>{activeLayout?.name ?? value}</span>
      </button>
      {isModalOpen && (
        <SelectionDialog
          title={label}
          options={layouts.map((layout) => ({ id: layout.id, label: layout.name }))}
          selectedId={value}
          onSelect={(themeId) => {
            onChange(themeId);
            closeModal();
          }}
          onClose={closeModal}
          themeVarsStyle={themeVarsStyle}
        />
      )}
    </>
  );
}
