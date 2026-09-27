"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./selection-dialog.module.css";

export interface SelectionDialogOption {
  id: string;
  label: string;
}

interface SelectionDialogProps {
  /** Visible dialog heading, also used as the accessible name. */
  title: string;
  options: ReadonlyArray<SelectionDialogOption>;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  /** Theme CSS variables - required when rendered via portal to body so the dialog inherits them */
  themeVarsStyle?: React.CSSProperties;
}

/**
 * Centered, theme-aware selection modal for small screens. Portaled to <body>
 * so transformed ancestors (e.g. the sliding mobile drawer) cannot capture the
 * fixed overlay and knock the dialog off-center; `themeVarsStyle` re-applies
 * the shell's theme tokens across the portal boundary, so the surface follows
 * the active theme exactly like the focus-mode overlay.
 */
export function SelectionDialog({
  title,
  options,
  selectedId,
  onSelect,
  onClose,
  themeVarsStyle,
}: SelectionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Land keyboard and screen-reader focus on the current choice so the list
  // scrolls to it even with many options.
  useEffect(() => {
    const current = dialogRef.current?.querySelector<HTMLButtonElement>("[aria-current]");
    const target = current ?? dialogRef.current?.querySelector<HTMLButtonElement>("button");
    target?.focus();
    target?.scrollIntoView({ block: "nearest" });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div style={themeVarsStyle}>
      <div className={styles.overlay}>
        {/* Pointer-only click-away surface (Escape covers keyboard users); it
            is out of the tab order and hidden from assistive tech, which reach
            the dialog itself instead. */}
        <button type="button" className={styles.backdrop} onClick={onClose} tabIndex={-1} aria-hidden />
        <dialog ref={dialogRef} open className={styles.dialog} aria-modal="true" aria-label={title}>
          <p className={styles.title}>{title}</p>
          <div className={styles.optionList}>
            {options.map((option) => {
              const isSelected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-current={isSelected || undefined}
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                  onClick={() => onSelect(option.id)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </dialog>
      </div>
    </div>,
    document.body,
  );
}
