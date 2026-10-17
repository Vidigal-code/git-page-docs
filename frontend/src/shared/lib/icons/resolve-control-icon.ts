import type { ControlIconConfig } from "@/shared/ui/control-icon";
import type { IconConfigFields } from "./icon-config-fields";

const CONTROL_ICON_TAGS = {
  QuickNavigation: "FiSearch",
  LanguageSelector: "FiGlobe",
  ThemeSelector: "BsSunFill",
  FocusMode: "MdFullscreen",
  PdfDownload: "FiDownload",
  PdfOpenInNewTab: "FiExternalLink",
  DocumentPrevious: "FiChevronLeft",
  DocumentNext: "FiChevronRight",
} as const;

export type ControlIconName = keyof typeof CONTROL_ICON_TAGS;
export type ControlIconSettings = IconConfigFields<ControlIconName>;

interface ControlIconOptions {
  name: ControlIconName;
  mode: "dark" | "light";
}

function readText(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

export function resolveControlIcon(
  site: ControlIconSettings | null | undefined,
  { name, mode }: ControlIconOptions,
): ControlIconConfig | undefined {
  if (site?.[`Icon${name}ReactIcones`] !== true) return undefined;
  const colorKey = mode === "dark" ? `Icon${name}ReactIconesTagColorDark` as const : `Icon${name}ReactIconesTagColorLight` as const;
  return {
    tag: readText(site[`Icon${name}ReactIconesTag`]) ?? CONTROL_ICON_TAGS[name],
    style: {
      color: readText(site[colorKey]),
      fontSize: readText(site[`Icon${name}ReactIconesTagSize`]),
    },
  };
}
