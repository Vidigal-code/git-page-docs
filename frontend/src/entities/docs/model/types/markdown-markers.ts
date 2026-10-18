import type { LanguageCode } from "./site";

export type MarkdownMarkerText = string | Record<LanguageCode, string>;

export interface MarkdownMarkerStyle {
  background?: string;
  color?: string;
  outlineColor?: string;
}

export interface MarkdownMarkersOptions {
  enabled?: boolean;
  style?: MarkdownMarkerStyle;
}

export interface MarkdownMarker extends MarkdownMarkersOptions {
  id: string;
  label?: MarkdownMarkerText;
  text?: MarkdownMarkerText;
  selector?: MarkdownMarkerText;
  occurrence?: number;
}

export interface MarkdownMarkersConfig extends MarkdownMarkersOptions {
  items?: MarkdownMarker[];
}
