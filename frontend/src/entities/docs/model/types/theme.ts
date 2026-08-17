import type { ThemeMode } from "./site";

export interface LayoutItem {
  id: string;
  name: string;
  author: string;
  file: string;
  preview: string;
  supportsLightAndDarkModes: boolean;
  supportsLightAndDarkModesReference?: string;
  mode: ThemeMode;
}

export interface LayoutsConfig {
  layouts: LayoutItem[];
}

/** Palette keys every template ships; extra custom keys stay allowed. */
export interface ThemeColors {
  background?: string;
  primary?: string;
  secondary?: string;
  text?: string;
  textSecondary?: string;
  cardBackground?: string;
  cardBorder?: string;
  error?: string;
  success?: string;
  scrollbarTrack?: string;
  scrollbarThumb?: string;
  scrollbarThumbHover?: string;
  [colorKey: string]: string | undefined;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: Record<string, string>;
}

export interface ThemeHeaderComponent {
  height?: string;
  backgroundColor?: string;
  borderBottom?: string;
}

export interface ThemeFooterComponent {
  height?: string;
  backgroundColor?: string;
  borderTop?: string;
}

export interface ThemeCardComponent {
  borderRadius?: string;
  padding?: string;
  boxShadow?: string;
}

export interface ThemeButtonComponent {
  borderRadius?: string;
  padding?: string;
  border?: string;
  hoverGlow?: string;
}

export interface ThemeSelectComponent {
  borderRadius?: string;
  padding?: string;
  border?: string;
  backgroundColor?: string;
  textAlign?: string;
  iconColor?: string;
  hoverBorderColor?: string;
  focusBorderColor?: string;
  focusGlow?: string;
}

export interface ThemeCheckboxComponent {
  width?: string;
  height?: string;
  accentColor?: string;
  borderColor?: string;
  hoverBorderColor?: string;
  checkMarkColor?: string;
  borderRadius?: string;
}

/** Optional header-control overrides (used by the built-in fallback theme). */
export interface ThemeHeaderControlsComponent {
  common?: {
    borderRadius?: string;
    border?: string;
    backgroundColor?: string;
  };
}

export interface ThemeComponents {
  header?: ThemeHeaderComponent;
  footer?: ThemeFooterComponent;
  card?: ThemeCardComponent;
  button?: ThemeButtonComponent;
  select?: ThemeSelectComponent;
  checkbox?: ThemeCheckboxComponent;
  headerControls?: ThemeHeaderControlsComponent;
}

export interface ThemeAnimations {
  enableTypingEffect?: boolean;
  enableGlow?: boolean;
  transitionDuration?: string;
}

export interface ThemeTemplate {
  id: string;
  name: string;
  author: string;
  version: string;
  mode: ThemeMode;
  supportsLightAndDarkModes: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  components: ThemeComponents;
  animations: ThemeAnimations;
}
