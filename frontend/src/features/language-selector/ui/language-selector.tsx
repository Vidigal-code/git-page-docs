import { useEffect, useRef, useState } from "react";
import type { LanguageCode } from "@/entities/docs";
import { SelectionDialog } from "@/shared/ui/selection-dialog";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { SMALL_SCREEN_MEDIA_QUERY } from "@/shared/config/constants";
import styles from "./language-selector.module.css";

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

function supportsHover(): boolean {
  return window.matchMedia("(hover: hover)").matches;
}

export function LanguageSelector({
  languages,
  value,
  getLabel,
  onChange,
  className,
  ariaLabel,
  themeVarsStyle,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_MEDIA_QUERY);
  const label = ariaLabel ?? "Language";

  // Dropdown only: close on outside interaction (covers touch, where mouseleave
  // never fires) and on Escape, returning focus to the trigger for keyboard
  // users. The small-screen modal owns its own dismissal (backdrop + Escape).
  useEffect(() => {
    if (!isOpen || isSmallScreen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      // Only reclaim focus when it was inside the selector — an Escape aimed
      // at another surface must not steal focus.
      if (containerRef.current?.contains(document.activeElement)) {
        containerRef.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSmallScreen]);

  const handleMouseEnter = () => {
    if (!isSmallScreen && supportsHover()) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isSmallScreen && supportsHover()) {
      setIsOpen(false);
    }
  };

  const handleTriggerClick = () => {
    // On hover-capable desktop screens hover already opened the dropdown, so a
    // click must keep it open (a toggle would close it under the pointer);
    // small screens and touch toggle the modal.
    setIsOpen((prev) => (!isSmallScreen && supportsHover() ? true : !prev));
  };

  const handleFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    // The modal lives in a portal outside this container; leaving the trigger
    // to enter it must not close the selection.
    if (isSmallScreen) return;
    const next = event.relatedTarget as Node | null;
    if (!containerRef.current?.contains(next)) {
      setIsOpen(false);
    }
  };

  const closeAndRefocusTrigger = () => {
    setIsOpen(false);
    // The option list unmounts; keep keyboard focus on the trigger.
    containerRef.current?.querySelector("button")?.focus();
  };

  const selectLanguage = (lang: LanguageCode) => {
    onChange(lang);
    closeAndRefocusTrigger();
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleFocusOut}
    >
      <button
        type="button"
        className={`${className ?? ""} ${styles.trigger}`}
        onClick={handleTriggerClick}
        aria-label={label}
        aria-expanded={isOpen}
        aria-haspopup={isSmallScreen ? "dialog" : "true"}
        title={label}
      >
        <span>{getLabel(value)}</span>
      </button>

      {isOpen && !isSmallScreen && (
        <ul className={styles.menu} aria-label={label}>
          {languages.map((lang) => {
            const isSelected = lang === value;
            return (
              <li key={lang} className={styles.item}>
                <button
                  type="button"
                  aria-current={isSelected || undefined}
                  onClick={() => selectLanguage(lang)}
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                >
                  {getLabel(lang)}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && isSmallScreen && (
        <SelectionDialog
          title={label}
          options={languages.map((lang) => ({ id: lang, label: getLabel(lang) }))}
          selectedId={value}
          onSelect={(lang) => selectLanguage(lang as LanguageCode)}
          onClose={closeAndRefocusTrigger}
          themeVarsStyle={themeVarsStyle}
        />
      )}
    </div>
  );
}
