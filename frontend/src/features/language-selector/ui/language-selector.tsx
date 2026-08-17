import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LanguageCode } from "@/entities/docs";
import styles from "./language-selector.module.css";

interface LanguageSelectorProps {
  languages: LanguageCode[];
  value: LanguageCode;
  getLabel: (lang: LanguageCode) => string;
  onChange: (lang: LanguageCode) => void;
  className?: string;
  ariaLabel?: string;
}

/** Below this width the selector opens as a centered modal instead of a dropdown. */
const SMALL_SCREEN_QUERY = "(max-width: 640px)";

function supportsHover(): boolean {
  return window.matchMedia("(hover: hover)").matches;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const sync = () => setMatches(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, [query]);
  return matches;
}

export function LanguageSelector({ languages, value, getLabel, onChange, className, ariaLabel }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_QUERY);
  const label = ariaLabel ?? "Language";

  // Close on outside interaction (covers touch, where mouseleave never fires)
  // and on Escape, returning focus to the trigger for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const insideDialog = dialogRef.current?.contains(event.target as Node);
      if (!containerRef.current?.contains(event.target as Node) && !insideDialog) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      // Only reclaim focus when it was inside the selector — an Escape aimed
      // at another surface must not steal focus.
      if (
        containerRef.current?.contains(document.activeElement) ||
        dialogRef.current?.contains(document.activeElement)
      ) {
        containerRef.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Move focus into the modal so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (isOpen && isSmallScreen) {
      dialogRef.current?.querySelector("button")?.focus();
    }
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
    const next = event.relatedTarget as Node | null;
    if (!containerRef.current?.contains(next) && !dialogRef.current?.contains(next)) {
      setIsOpen(false);
    }
  };

  const selectLanguage = (lang: LanguageCode) => {
    onChange(lang);
    setIsOpen(false);
    // The option list unmounts; keep keyboard focus on the trigger.
    containerRef.current?.querySelector("button")?.focus();
  };

  const renderOption = (lang: LanguageCode, extraClassName?: string) => {
    const isSelected = lang === value;
    return (
      <button
        type="button"
        aria-current={isSelected || undefined}
        onClick={() => selectLanguage(lang)}
        className={`${styles.option} ${isSelected ? styles.optionSelected : ""} ${extraClassName ?? ""}`}
      >
        {getLabel(lang)}
      </button>
    );
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
          {languages.map((lang) => (
            <li key={lang} className={styles.item}>
              {renderOption(lang)}
            </li>
          ))}
        </ul>
      )}

      {isOpen &&
        isSmallScreen &&
        // Portaled to <body> so transformed/filtered ancestors (e.g. the
        // sliding mobile drawer) cannot capture the fixed overlay and knock
        // the dialog off-center.
        createPortal(
          <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <div
              ref={dialogRef}
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              onClick={(event) => event.stopPropagation()}
            >
              <p className={styles.dialogTitle}>{label}</p>
              {languages.map((lang) => (
                <span key={lang}>{renderOption(lang, styles.dialogOption)}</span>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
