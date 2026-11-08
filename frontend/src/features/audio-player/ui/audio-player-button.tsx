"use client";

import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { CiPlay1, FaPause } from "@/shared/ui/fallback-icons";
import type { CSSProperties, ReactElement } from "react";

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
}: Readonly<AudioPlayerButtonProps>): ReactElement {
  const label = isPlaying ? pauseLabel : playLabel;
  const iconTag = isPlaying ? pauseIconTag : playIconTag;
  const FallbackIcon = isPlaying ? FaPause : CiPlay1;

  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-label={label}
      title={label}
      data-testid="audio-player-toggle"
    >
      <ReactIconByTag tag={iconTag} style={iconStyle} fallback={<FallbackIcon aria-hidden style={iconStyle} />} />
    </button>
  );
}
