export type ThemeBackgroundKind = "stars" | "streaks" | "matrix" | "orbs" | "grid" | "waves";

export interface BackgroundRange {
  min: number;
  max: number;
}

export interface BackgroundVector {
  x: number;
  y: number;
}

export interface ThemeBackgroundLayer {
  id: string;
  kind: ThemeBackgroundKind;
  count?: number;
  colors?: string[];
  opacity?: number;
  size?: Partial<BackgroundRange>;
  duration?: Partial<BackgroundRange>;
  travel?: Partial<BackgroundVector>;
  blur?: number;
  glow?: number;
  rotation?: number;
  depth?: number;
  length?: number;
  characters?: string;
  rows?: number;
  seed?: number;
  position?: Partial<BackgroundVector>;
}

export interface ThemeBackgroundConfig {
  enabled?: boolean;
  surface?: string;
  opacity?: number;
  animation?: { enabled?: boolean; speed?: number };
  parallax?: { enabled?: boolean; pointer?: number; scroll?: number };
  accessibility?: { reducedMotion?: "static" | "hide"; showPauseButton?: boolean };
  layers?: ThemeBackgroundLayer[];
}

export interface SiteBackgroundEffectsConfig {
  enabled?: boolean;
  overrides?: ThemeBackgroundConfig;
  themes?: Record<string, ThemeBackgroundConfig>;
}

export interface ResolvedThemeBackgroundLayer extends Required<ThemeBackgroundLayer> {
  size: BackgroundRange;
  duration: BackgroundRange;
  travel: BackgroundVector;
  position: BackgroundVector;
}

export interface ResolvedThemeBackground {
  enabled: true;
  surface: string;
  opacity: number;
  animation: { enabled: boolean; speed: number };
  parallax: { enabled: boolean; pointer: number; scroll: number };
  accessibility: { reducedMotion: "static" | "hide"; showPauseButton: boolean };
  layers: ResolvedThemeBackgroundLayer[];
}
