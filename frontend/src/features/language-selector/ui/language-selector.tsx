import { useState } from "react";
import type { LanguageCode } from "@/entities/docs";

interface LanguageSelectorProps {
  languages: LanguageCode[];
  value: LanguageCode;
  getLabel: (lang: LanguageCode) => string;
  onChange: (lang: LanguageCode) => void;
  className?: string;
  ariaLabel?: string;
}

export function LanguageSelector({ languages, value, getLabel, onChange, className, ariaLabel }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setIsOpen(false);
    }
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        type="button"
        className={className}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel ?? "Language"}
        title={ariaLabel ?? "Language"}
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
              <li
                key={lang}
                onClick={() => {
                  onChange(lang);
                  setIsOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  textAlign: "center",
                  backgroundColor: isSelected ? "rgba(127, 127, 127, 0.25)" : "transparent",
                  transition: "background-color 0.1s"
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}