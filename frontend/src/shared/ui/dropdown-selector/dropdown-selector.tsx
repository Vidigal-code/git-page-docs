"use client";

import { useEffect, useRef, useState } from "react";
import { SelectionDialog } from "@/shared/ui/selection-dialog";
import type { SelectionDialogOption } from "@/shared/ui/selection-dialog";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { SMALL_SCREEN_MEDIA_QUERY } from "@/shared/config/constants";
import styles from "./dropdown-selector.module.css";

export type DropdownSelectorOption = SelectionDialogOption;

interface DropdownSelectorProps {
  /** Accessible name for the trigger, the dropdown list and the small-screen dialog. */
  label: string;
  options: ReadonlyArray<DropdownSelectorOption>;
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
  /** Theme CSS variables forwarded to the small-screen modal (portaled to <body>). */
  themeVarsStyle?: React.CSSProperties;
}

function supportsHover(): boolean {
  return window.matchMedia("(hover: hover)").matches;
}

/**
 * Theme-aware option picker shared by the shell selectors (language, theme):
 * a hover-friendly dropdown on pointer-first screens and a centered modal on
 * small screens, both styled by the active theme tokens.
 */
export function DropdownSelector({
  label,
  options,
  selectedId,
  onSelect,
  className,
  themeVarsStyle,
}: DropdownSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_MEDIA_QUERY);

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

  // Long option sets scroll inside the panel; bring the current choice into
  // view on open without stealing focus (hover must not hijack the keyboard).
  useEffect(() => {
    if (!isOpen || isSmallScreen) return;
    listRef.current
      ?.querySelector("[aria-current]")
      ?.scrollIntoView({ block: "nearest" });
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

  const selectOption = (id: string) => {
    onSelect(id);
    closeAndRefocusTrigger();
  };

  const selectedLabel = options.find((option) => option.id === selectedId)?.label ?? selectedId;

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
        <span>{selectedLabel}</span>
      </button>

      {isOpen && !isSmallScreen && (
        <div className={styles.menu}>
          <ul ref={listRef} className={styles.list} aria-label={label}>
            {options.map((option) => {
              const isSelected = option.id === selectedId;
              return (
                <li key={option.id} className={styles.item}>
                  <button
                    type="button"
                    aria-current={isSelected || undefined}
                    onClick={() => selectOption(option.id)}
                    className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isOpen && isSmallScreen && (
        <SelectionDialog
          title={label}
          options={options}
          selectedId={selectedId}
          onSelect={selectOption}
          onClose={closeAndRefocusTrigger}
          themeVarsStyle={themeVarsStyle}
        />
      )}
    </div>
  );
}
