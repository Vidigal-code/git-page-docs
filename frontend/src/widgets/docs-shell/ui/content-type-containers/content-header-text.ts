import type { CSSProperties } from "react";
import type { ContentTypeRouteConfig, LanguageCode } from "@/entities/docs";

/** Title and description of a route, ready to render in the current language and theme mode. */
export interface ContentHeaderText {
  title?: string;
  description?: string;
  showTitle: boolean;
  showDescription: boolean;
  titleCss?: string;
  descriptionCss?: string;
}

const TEXT_ALIGNS: ReadonlySet<string> = new Set(["center", "left", "right"]);
const DEFAULT_TEXT_ALIGN: CSSProperties["textAlign"] = "center";

export function resolveContentHeaderText(
  config: ContentTypeRouteConfig | undefined,
  language: LanguageCode,
  isDarkMode: boolean,
): ContentHeaderText {
  const title = config?.title?.[language] ?? config?.title?.en;
  const description = config?.description?.[language] ?? config?.description?.en;
  const modeTitleCss = isDarkMode ? config?.titleDarkCss : config?.titleLightCss;
  const modeDescriptionCss = isDarkMode ? config?.descriptionDarkCss : config?.descriptionLightCss;
  return {
    title,
    description,
    showTitle: Boolean(config?.titleIsVisible && title),
    showDescription: Boolean(config?.descriptionIsVisible && description),
    titleCss: modeTitleCss ?? config?.titleCss,
    descriptionCss: modeDescriptionCss ?? config?.descriptionCss,
  };
}

/** Route `titlePosition` / `descriptionPosition` as a CSS text alignment (center unless left or right). */
export function toTextAlign(position: string | undefined): CSSProperties["textAlign"] {
  return position && TEXT_ALIGNS.has(position) ? (position as CSSProperties["textAlign"]) : DEFAULT_TEXT_ALIGN;
}
