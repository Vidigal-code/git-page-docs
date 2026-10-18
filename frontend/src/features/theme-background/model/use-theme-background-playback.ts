"use client";

import { useCallback, useState } from "react";
import type { ResolvedThemeBackground } from "@/entities/docs";
import { useBackgroundEnvironment } from "./use-background-environment";

interface ThemeBackgroundPlayback {
  paused: boolean;
  toggle: () => void;
  showControl: boolean;
}

export function useThemeBackgroundPlayback(config?: ResolvedThemeBackground): ThemeBackgroundPlayback {
  const [paused, setPaused] = useState(false);
  const environment = useBackgroundEnvironment();
  const toggle = useCallback(() => setPaused((previous) => !previous), []);
  const hasMovement = config?.animation.enabled || config?.parallax.enabled;
  const showControl = Boolean(config?.accessibility.showPauseButton && hasMovement
    && environment.ready && !environment.reduced);
  return { paused, toggle, showControl };
}
