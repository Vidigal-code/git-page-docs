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

export interface ThemeTemplate {
  id: string;
  name: string;
  author: string;
  version: string;
  mode: ThemeMode;
  supportsLightAndDarkModes: boolean;
  colors: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
  };
  components: Record<string, unknown>;
  animations: Record<string, unknown>;
}
