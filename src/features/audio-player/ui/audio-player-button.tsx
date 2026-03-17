"use client";

import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { CSSProperties } from "react";

interface AudioPlayerButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  playIconTag?: string;
  pauseIconTag?: string;
  iconStyle?: CSSProperties;
  playLabel: string;
  pauseLabel: string;
  className?: string;
}

export function AudioPlayerButton({
  isPlaying,
  onToggle,
  playIconTag = "CiPlay1",
  pauseIconTag = "FaPause",
  iconStyle,
  playLabel,
  pauseLabel,
  className,
}: AudioPlayerButtonProps) {
  const label = isPlaying ? pauseLabel : playLabel;
  const iconTag = isPlaying ? pauseIconTag : playIconTag;

  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <ReactIconByTag tag={iconTag} style={iconStyle} />
    </button>
  );
}
