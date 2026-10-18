import type { ResolvedThemeBackground, ThemeTemplate } from "../../model/types";
import { resolveBackgroundLayers } from "./background-layers";
import { backgroundNumber, backgroundRecord, backgroundText } from "./background-values";

const OPACITY_BOUNDS = { min: 0, max: 1, fallback: 1 };
const SPEED_BOUNDS = { min: 0.05, max: 4, fallback: 1 };
const POINTER_BOUNDS = { min: 0, max: 80, fallback: 16 };
const SCROLL_BOUNDS = { min: 0, max: 0.3, fallback: 0.08 };

interface ResolveThemeBackgroundOptions {
  theme?: Pick<ThemeTemplate, "id" | "backgroundEffects">;
  settings?: unknown;
}

function mergeBackgroundConfig(baseValue: unknown, overrideValue: unknown): Record<string, unknown> {
  const base = backgroundRecord(baseValue);
  const override = backgroundRecord(overrideValue);
  return {
    ...base,
    ...override,
    animation: { ...backgroundRecord(base.animation), ...backgroundRecord(override.animation) },
    parallax: { ...backgroundRecord(base.parallax), ...backgroundRecord(override.parallax) },
    accessibility: { ...backgroundRecord(base.accessibility), ...backgroundRecord(override.accessibility) },
  };
}

export function resolveThemeBackground({ theme, settings }: ResolveThemeBackgroundOptions): ResolvedThemeBackground | undefined {
  const siteSettings = backgroundRecord(settings);
  if (!theme || siteSettings.enabled === false) return undefined;
  const shared = mergeBackgroundConfig(theme.backgroundEffects, siteSettings.overrides);
  const themeOverrides = backgroundRecord(siteSettings.themes);
  const config = mergeBackgroundConfig(shared, themeOverrides[theme.id]);
  if (config.enabled !== true) return undefined;
  const layers = resolveBackgroundLayers(config.layers);
  if (!layers.length) return undefined;
  const animation = backgroundRecord(config.animation);
  const parallax = backgroundRecord(config.parallax);
  const accessibility = backgroundRecord(config.accessibility);
  return {
    enabled: true,
    surface: backgroundText(config.surface, "transparent"),
    opacity: backgroundNumber(config.opacity, OPACITY_BOUNDS),
    animation: { enabled: animation.enabled !== false, speed: backgroundNumber(animation.speed, SPEED_BOUNDS) },
    parallax: {
      enabled: parallax.enabled !== false,
      pointer: backgroundNumber(parallax.pointer, POINTER_BOUNDS),
      scroll: backgroundNumber(parallax.scroll, SCROLL_BOUNDS),
    },
    accessibility: {
      reducedMotion: accessibility.reducedMotion === "hide" ? "hide" : "static",
      showPauseButton: accessibility.showPauseButton !== false,
    },
    layers,
  };
}
