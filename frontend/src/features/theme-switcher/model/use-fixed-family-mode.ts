"use client";

import { useEffect, useState } from "react";
import type { ThemeMode } from "@/entities/docs";
import { useIsomorphicLayoutEffect } from "@/shared/lib/use-isomorphic-layout-effect";

interface FixedFamilyModeOptions {
  selectionMode: "fixed" | "selectable";
  defaultMode: ThemeMode;
  storageKey: string;
  requestedMode: ThemeMode | null;
}

interface FixedFamilyModeState {
  mode: ThemeMode;
  selectMode: (mode: ThemeMode) => void;
}

export function parseThemeMode(value: string | null): ThemeMode | null {
  return value === "dark" || value === "light" ? value : null;
}

export function useFixedFamilyMode({ selectionMode, defaultMode, storageKey, requestedMode }: FixedFamilyModeOptions): FixedFamilyModeState {
  const [selectedMode, setSelectedMode] = useState<ThemeMode | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (selectionMode !== "fixed") return;
    let restoredMode = requestedMode;
    try {
      restoredMode ??= parseThemeMode(window.localStorage.getItem(storageKey));
    } catch {
      // A blocked browser store leaves the URL or configured mode available.
    }
    setSelectedMode(restoredMode ?? defaultMode);
  }, [selectionMode, requestedMode, defaultMode, storageKey]);

  useEffect(() => {
    if (selectionMode !== "fixed" || !selectedMode) return;
    try {
      window.localStorage.setItem(storageKey, selectedMode);
    } catch {
      // The selected mode still applies when browser storage is unavailable.
    }
  }, [selectionMode, selectedMode, storageKey]);

  return { mode: selectedMode ?? defaultMode, selectMode: setSelectedMode };
}
