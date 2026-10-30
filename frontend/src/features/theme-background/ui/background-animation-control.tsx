"use client";

import { FiPause } from "@react-icons/all-files/fi/FiPause";
import { FiPlay } from "@react-icons/all-files/fi/FiPlay";
import { ControlIcon, type ControlIconConfig } from "@/shared/ui/control-icon";
import styles from "./background-animation-control.module.css";

interface BackgroundAnimationControlProps {
  paused: boolean;
  onToggle: () => void;
  label: string;
  icon?: ControlIconConfig;
  className?: string;
  disabled?: boolean;
}

export function BackgroundAnimationControl({ paused, onToggle, label, icon, className, disabled = false }: Readonly<BackgroundAnimationControlProps>) {
  const Icon = paused ? FiPlay : FiPause;
  return (
    <button type="button" className={className ?? styles.control} aria-label={label} title={label}
      aria-pressed={paused} disabled={disabled} onClick={onToggle}>
      {icon ? <ControlIcon icon={icon} fallback={<Icon size={22} aria-hidden="true" />} /> : label}
    </button>
  );
}
