import type { LayoutItem, ThemeMode } from "@/entities/docs/model/types";

export function resolveThemeByMode(layouts: LayoutItem[], active: LayoutItem, mode: ThemeMode): LayoutItem {
  if (!active.supportsLightAndDarkModes || !active.supportsLightAndDarkModesReference) {
    return active;
  }
  const maybePair = layouts.find(
    (item) => item.supportsLightAndDarkModes
      && item.supportsLightAndDarkModesReference === active.supportsLightAndDarkModesReference && item.mode === mode,
  );
  return maybePair ?? active;
}
