import { useEffect, useRef, useState } from "react";
import type { LanguageCode } from "@/entities/docs";

interface LanguageSelectorProps {
  languages: LanguageCode[];
  value: LanguageCode;
  getLabel: (lang: LanguageCode) => string;
  onChange: (lang: LanguageCode) => void;
  className?: string;
  ariaLabel?: string;
}

function supportsHover(): boolean {
  return window.matchMedia("(hover: hover)").matches;
}

export function LanguageSelector({ languages, value, getLabel, onChange, className, ariaLabel }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const label = ariaLabel ?? "Language";

  // Close on outside interaction (covers touch, where mouseleave never fires)
  // and on Escape, returning focus to the trigger for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      // Only reclaim focus when it was inside the menu — an Escape aimed at
      // another surface (filter input, chat drawer) must not steal focus.
      if (containerRef.current?.contains(document.activeElement)) {
        containerRef.current.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (supportsHover()) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (supportsHover()) {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={className}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={label}
        aria-expanded={isOpen}
        title={label}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <span>{getLabel(value)}</span>
      </button>

      {isOpen && (
        <ul
          aria-label={label}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: "none",
            zIndex: 50,
            backgroundColor: "rgba(127, 127, 127, 0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "inherit",
            borderRight: "1px solid rgba(127, 127, 127, 0.3)",
            borderBottom: "1px solid rgba(127, 127, 127, 0.3)",
            borderLeft: "1px solid rgba(127, 127, 127, 0.3)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {languages.map((lang) => {
            const isSelected = lang === value;

            return (
              <li key={lang} style={{ margin: 0, padding: 0 }}>
                <button
                  type="button"
                  aria-current={isSelected || undefined}
                  onClick={() => {
                    onChange(lang);
                    setIsOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    border: "none",
                    padding: "8px 12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    color: "inherit",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                    textAlign: "center",
                    backgroundColor: isSelected ? "rgba(127, 127, 127, 0.25)" : "transparent",
                    transition: "background-color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "rgba(127, 127, 127, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {getLabel(lang)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
