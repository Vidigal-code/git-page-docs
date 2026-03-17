"use client";

import { FiX } from "react-icons/fi";
import type { AudioTrackConfig } from "@/entities/docs/model/types";

interface AudioPlayerPopoverProps {
  isOpen: boolean;
  tracks: AudioTrackConfig[];
  language: string;
  onSelect: (index: number) => void;
  onClose: () => void;
  title: string;
  description: string;
  closeLabel: string;
  className?: string;
  overlayClassName?: string;
  cardClassName?: string;
}

export function AudioPlayerPopover({
  isOpen,
  tracks,
  language,
  onSelect,
  onClose,
  title,
  description,
  closeLabel,
  className,
  overlayClassName,
  cardClassName,
}: AudioPlayerPopoverProps) {
  if (!isOpen || !tracks.length) return null;

  return (
    <div
      className={overlayClassName}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`${cardClassName ?? ""} ${className ?? ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <strong>{title}</strong>
          <button type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel}>
            <FiX aria-hidden />
          </button>
        </div>
        {description && <p style={{ margin: "0 0 12px", fontSize: "0.9rem", opacity: 0.9 }}>{description}</p>}
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
          {tracks.map((track, index) => {
            const label = (track.title as Record<string, string>)?.[language] ?? (track.title as Record<string, string>)?.en ?? track.url;
            return (
              <li key={`${track.url}-${index}`}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    textAlign: "left",
                    borderRadius: "8px",
                    border: "1px solid transparent",
                    background: "transparent",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
