import fs from "node:fs";
import path from "node:path";
import { expandLayout, readV2 } from "./layouts-v2.mjs";

/** Compile the optional backgrounds into package-local data for standalone CLI installs. */
export function writeAnimatedLayoutData(layoutsRoot, outputFile) {
  const { base, layouts } = readV2(layoutsRoot);
  const catalog = JSON.parse(fs.readFileSync(path.join(layoutsRoot, "layoutsConfig.json"), "utf8"));
  const metadata = new Map(catalog.layouts.map((layout) => [layout.id, layout]));
  const animated = layouts.filter((layout) => layout.overrides?.backgroundEffects);
  const entries = animated.map((layout) => {
    const item = metadata.get(layout.id);
    if (!item) throw new Error(`Animated layout "${layout.id}" is missing from layoutsConfig.json`);
    const template = expandLayout(base, layout);
    return { layout: item, colors: template.colors, backgroundEffects: template.backgroundEffects };
  });
  const source = [
    "// Compiled from gitpagelayouts/v2 by pnpm run layouts:sync. Edit the v2 sources.",
    `const themes = ${JSON.stringify(entries, null, 2)};`,
    "",
    "export const ANIMATED_LAYOUTS = themes.map(({ layout }) => layout);",
    "export const ANIMATED_THEME_COLORS = Object.fromEntries(themes.map(({ layout, colors }) => [layout.id, colors]));",
    "export const ANIMATED_BACKGROUNDS = Object.fromEntries(themes.map(({ layout, backgroundEffects }) => [layout.id, backgroundEffects]));",
    "",
  ].join("\n");
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, source, "utf8");
  return entries.map(({ layout }) => layout.id);
}
