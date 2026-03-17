"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { FiRefreshCw, FiRepeat, FiX } from "react-icons/fi";
import { FaPause } from "react-icons/fa";
import { CiPlay1 } from "react-icons/ci";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";
import type { AudioTrackConfig } from "@/entities/docs/model/types";

function renderIcon(icon: ResolvedNavMenuIconConfig | undefined, fallback: React.ReactNode) {
  if (!icon) return fallback;
  if (icon.useReactIcon) {
    return (
      <span style={icon.reactIconStyle}>
        <ReactIconByTag tag={icon.reactIconTag} style={icon.reactIconStyle} fallback={fallback} ariaHidden />
      </span>
    );
  }
  if (icon.iconImage) {
    return (
      <Image
        src={icon.iconImage}
        alt=""
        width={icon.iconImgWidth}
        height={icon.iconImgHeight}
        unoptimized
      />
    );
  }
  return fallback;
}

function getTrackLabel(track: AudioTrackConfig, language: string): string {
  const title = track.title as Record<string, string> | undefined;
  return title?.[language] ?? title?.en ?? track.url;
}

function getTrackSourceLabel(track: AudioTrackConfig): string {
  try {
    const url = track.url?.trim() || "";
    if (url.startsWith("http") || url.startsWith("//")) {
      const path = url.split("/").pop()?.split("?")[0];
      return path || url;
    }
    return url.split("/").pop() || url;
  } catch {
    return track.url || "";
  }
}

interface AudioPlayerPopoverProps {
  isOpen: boolean;
  tracks: AudioTrackConfig[];
  language: string;
  currentTrack: AudioTrackConfig | null;
  playing: boolean;
  loopEnabled: boolean;
  onSelect: (index: number) => void;
  onClose: () => void;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onToggleLoop: () => void;
  title: string;
  description: string;
  closeLabel: string;
  nowPlayingLabel: string;
  restartLabel: string;
  loopOnLabel: string;
  loopOffLabel: string;
  sourceLabel: string;
  playLabel: string;
  pauseLabel: string;
  closeIcon?: ResolvedNavMenuIconConfig;
  playIcon?: ResolvedNavMenuIconConfig;
  pauseIcon?: ResolvedNavMenuIconConfig;
  restartIcon?: ResolvedNavMenuIconConfig;
  loopOnIcon?: ResolvedNavMenuIconConfig;
  loopOffIcon?: ResolvedNavMenuIconConfig;
  className?: string;
  overlayClassName?: string;
  cardClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;
  controlButtonClassName?: string;
  /** Theme CSS variables - required when rendered via portal to body so the popover inherits them */
  themeVarsStyle?: React.CSSProperties;
}

export function AudioPlayerPopover({
  isOpen,
  tracks,
  language,
  currentTrack,
  playing,
  loopEnabled,
  onSelect,
  onClose,
  onPlay,
  onPause,
  onRestart,
  onToggleLoop,
  title,
  description,
  closeLabel,
  nowPlayingLabel,
  restartLabel,
  loopOnLabel,
  loopOffLabel,
  sourceLabel,
  playLabel,
  pauseLabel,
  closeIcon,
  playIcon,
  pauseIcon,
  restartIcon,
  loopOnIcon,
  loopOffIcon,
  className,
  overlayClassName,
  cardClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  closeButtonClassName,
  controlButtonClassName,
  themeVarsStyle,
}: AudioPlayerPopoverProps) {
  if (!isOpen || !tracks.length) return null;

  const closeButtonContent = renderIcon(closeIcon, <FiX aria-hidden />);

  const overlay = (
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
        <div className={headerClassName}>
          <strong>{title}</strong>
          <button
            type="button"
            className={closeButtonClassName}
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
          >
            {closeButtonContent}
          </button>
        </div>

        <div className={bodyClassName}>
          {currentTrack && (
            <div style={{ marginBottom: "12px", padding: "10px 12px", borderRadius: "8px", background: "color-mix(in srgb, var(--background) 60%, transparent)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>{nowPlayingLabel}</div>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>{getTrackLabel(currentTrack, language)}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {sourceLabel}: {getTrackSourceLabel(currentTrack)}
              </div>
            </div>
          )}
          {description && <p style={{ margin: "0 0 12px", fontSize: "0.9rem", opacity: 0.9 }}>{description}</p>}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {tracks.map((track, index) => {
              const label = getTrackLabel(track, language);
              const isActive = currentTrack && currentTrack.url === track.url;
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
                      border: isActive ? "1px solid var(--secondary)" : "1px solid transparent",
                      background: isActive ? "color-mix(in srgb, var(--secondary) 10%, transparent)" : "transparent",
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

        <div className={footerClassName}>
          <button
            type="button"
            className={controlButtonClassName}
            onClick={playing ? onPause : onPlay}
            aria-label={playing ? pauseLabel : playLabel}
            title={playing ? pauseLabel : playLabel}
          >
            {renderIcon(playing ? pauseIcon : playIcon, playing ? <FaPause aria-hidden /> : <CiPlay1 aria-hidden />)}
          </button>
          <button
            type="button"
            className={controlButtonClassName}
            onClick={onRestart}
            aria-label={restartLabel}
            title={restartLabel}
          >
            {renderIcon(restartIcon, <FiRefreshCw aria-hidden />)}
          </button>
          <button
            type="button"
            className={controlButtonClassName}
            onClick={onToggleLoop}
            aria-label={loopEnabled ? loopOffLabel : loopOnLabel}
            title={loopEnabled ? loopOffLabel : loopOnLabel}
          >
            {renderIcon(loopEnabled ? loopOnIcon : loopOffIcon, <FiRepeat aria-hidden />)}
          </button>
        </div>
      </div>
    </div>
  );

  const content = themeVarsStyle ? (
    <div style={themeVarsStyle}>{overlay}</div>
  ) : overlay;

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
}
