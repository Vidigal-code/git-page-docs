/**
 * Regenerates the documentation of the `gitpagelayouts/` folder — the
 * canonical home of the official layout themes:
 *
 *   gitpagelayouts/
 *     layoutsConfig.json          (canonical layout index)
 *     layoutsFallbackConfig.json  (minimal fallback set)
 *     v2/base.json                (shared values, per-mode defaults, palette rules)
 *     v2/layouts/<id>.json        (identity + colors + overrides: the source of truth)
 *     templates/*.json            (full JSON theme template per layout, expanded from v2)
 *     README.md                   (generated index of every layout)
 *     docs/<id>.md                (generated documentation per layout)
 *
 * `v2/` is the source of truth; this script expands it into `templates/` and
 * derives the markdown catalog. Run it after changing any layout:
 * `npm run layouts:sync`.
 */
import fs from "node:fs";
import path from "node:path";
import { writeExpandedTemplates } from "./layouts-v2.mjs";
import { writeAnimatedLayoutData } from "./animated-layout-data.mjs";

const ROOT = process.cwd();
const LAYOUTS_DIR = path.join(ROOT, "gitpagelayouts");
const DOCS_DIR = path.join(LAYOUTS_DIR, "docs");
const CONFIG_FILENAME = "layoutsConfig.json";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function colorTable(colors) {
  const rows = Object.entries(colors ?? {})
    .map(([name, value]) => `| \`${name}\` | \`${value}\` |`)
    .join("\n");
  return ["| Token | Value |", "| --- | --- |", rows].join("\n");
}

function typographySection(typography) {
  if (!typography) return "_Not specified._";
  const sizes = Object.entries(typography.fontSize ?? {})
    .map(([name, value]) => `| \`${name}\` | \`${value}\` |`)
    .join("\n");
  return [
    `- Font family: \`${typography.fontFamily ?? "inherit"}\``,
    "",
    "| Size token | Value |",
    "| --- | --- |",
    sizes,
  ].join("\n");
}

function inlineCode(value) {
  return "`" + value + "`";
}

function backgroundLayerRow(layer) {
  const colors = layer.colors.map(inlineCode).join(", ");
  return `| \`${layer.id}\` | \`${layer.kind}\` | ${layer.count} | ${colors} |`;
}

function backgroundSection(background) {
  if (!background) return "";
  const layers = background.layers.map(backgroundLayerRow);
  return [
    "", "", "## Animated background", "",
    "This preset uses Motion for decorative depth and continuous movement. It respects reduced-motion preferences and includes a pause/resume control. Its palette and content remain usable without animation.",
    "", "| Layer | Kind | Count | Colors |", "| --- | --- | --- | --- |", ...layers,
    "", "### Editable preset", "",
    "The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.",
    "", "```json", JSON.stringify(background, null, 2), "```", "",
    "`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.",
  ].join("\n");
}

function layoutDoc(layout, template) {
  const paired = layout.supportsLightAndDarkModesReference
    ? `Paired light/dark group: \`${layout.supportsLightAndDarkModesReference}\``
    : "Standalone (single mode)";
  return `# ${layout.name}

${layout.preview}

| Field | Value |
| --- | --- |
| Id | \`${layout.id}\` |
| Mode | \`${layout.mode}\` |
| Author | ${layout.author} |
| Template | [\`${layout.file}\`](../${layout.file}) |
| Light/dark pairing | ${paired} |

## Colors

${colorTable(template?.colors)}

## Typography

${typographySection(template?.typography)}${backgroundSection(template?.backgroundEffects)}

## Usage

Set it as the default theme in \`gitpagedocs/config.json\`:

\`\`\`json
{ "site": { "ThemeDefault": "${layout.id}" } }
\`\`\`

Or preview it on any Git Page Docs site via the URL parameter \`?theme=${layout.id}\`.
`;
}

function readmeRow(layout) {
  const pair = layout.supportsLightAndDarkModesReference ? inlineCode(layout.supportsLightAndDarkModesReference) : "—";
  return `| [\`${layout.id}\`](docs/${layout.id}.md) | ${layout.name} | \`${layout.mode}\` | ${pair} | ${layout.preview} |`;
}

function readmeIndex(layouts) {
  const rows = layouts.map(readmeRow).join("\n");
  return `# Git Page Layouts

Canonical home of the official Git Page Docs layout themes. Any repository can
consume these layouts:

- **Official remote (default):** generated \`gitpagedocs/config.json\` files
  point at this folder's \`layoutsConfig.json\` and \`templates/\`.
- **Self-hosted:** generate \`gitpagelayouts/\` with
  \`npx @gitpagedocs/cli --layoutconfig\`, which sets local layout paths and disables
  the official source in your site config. If copying this folder manually, set
  \`site.layoutsConfigPathOficial: false\` and the corresponding local paths.

The source of truth is \`v2/\`. \`v2/base.json\` holds every value the layouts share
(typography, component sizes, dark/light defaults and the rules that derive control
colors from each palette), and \`v2/layouts/<id>.json\` holds only the layout's
identity, colors and the few values that differ. \`npm run layouts:sync\` expands
them into the full \`templates/<id>.json\` files (the format viewers read, unchanged)
and regenerates this catalog. Edit \`v2/\`, never \`templates/\`.

## Animated presets

The additional animated themes combine stars, meteor streaks, falling Matrix
characters, orbs, grids and waves. Each preset defines
\`overrides.backgroundEffects\` in its v2 source; expansion places
\`backgroundEffects\` at the template root. Synchronization also compiles these
presets into \`cli/data/animated-layouts.mjs\`, so local CLI generation offers the
same palettes and backgrounds without reading files outside its package.

Choose a theme with \`site.ThemeDefault\` or the theme selector. Customize speed,
colors, density and parallax through \`site.backgroundEffects.overrides\` or
\`site.backgroundEffects.themes[themeId]\` in \`gitpagedocs/config.json\`.
Resolution order is template, global overrides, then per-theme overrides;
\`layers\` replaces the full array. The master \`site.backgroundEffects.enabled:
false\` disables every background. All new presets honor reduced motion and
include a pause control. Existing themes retain their original appearance.

The catalog combines 64 original themes, 20 standalone animated presets and
20 additional parallax families with dark and light variants. Paired entries use
the same \`supportsLightAndDarkModesReference\`, allowing the mode toggle to switch
within the family. For example, choose \`aurora-borealis-dark\` or
\`aurora-borealis-light\`; customize either ID independently through \`themes\`.

Pause/resume appears beside the navigation lock in the documentation menu and in
the search-page header. A manual pause survives menu and theme changes.
\`site.backgroundEffects.overrides.accessibility.showPauseButton\` defaults to
\`true\`; \`false\` hides the button without disabling motion. Configure
\`site.icons.BackgroundAnimationPause\` and \`BackgroundAnimationResume\` with
\`reactIcon\`, \`tag\`, \`size\`, \`colorDark\` and \`colorLight\`;
\`reactIcon: false\` shows localized text. Use the master switch to disable effects.

## Files

- [\`layoutsConfig.json\`](layoutsConfig.json) — index of every layout.
- [\`layoutsFallbackConfig.json\`](layoutsFallbackConfig.json) — minimal fallback set.
- [\`v2/base.json\`](v2/base.json) — shared values and palette rules (source).
- [\`v2/layouts/\`](v2/layouts) — one small file per layout (source).
- [\`templates/\`](templates) — one full JSON theme template per layout (generated from \`v2/\`).
- [\`docs/\`](docs) — one markdown page per layout (generated).

## Layouts (${layouts.length})

| Id | Name | Mode | Pair | Description |
| --- | --- | --- | --- | --- |
${rows}
`;
}

function generateDocs() {
  const { layouts } = readJson(path.join(LAYOUTS_DIR, CONFIG_FILENAME));
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  const expectedDocs = new Set(layouts.map((layout) => `${layout.id}.md`));
  for (const name of fs.readdirSync(DOCS_DIR)) {
    if (!expectedDocs.has(name)) fs.rmSync(path.join(DOCS_DIR, name));
  }
  for (const layout of layouts) {
    const templatePath = path.join(LAYOUTS_DIR, layout.file);
    const template = fs.existsSync(templatePath) ? readJson(templatePath) : null;
    fs.writeFileSync(path.join(DOCS_DIR, `${layout.id}.md`), layoutDoc(layout, template), "utf8");
  }
  fs.writeFileSync(path.join(LAYOUTS_DIR, "README.md"), readmeIndex(layouts), "utf8");
  return layouts.length;
}

const expanded = writeExpandedTemplates(LAYOUTS_DIR);
console.log(`[gitpagelayouts] expanded ${expanded.length} templates from gitpagelayouts/v2`);
const animated = writeAnimatedLayoutData(LAYOUTS_DIR, path.join(ROOT, "cli/data/animated-layouts.mjs"));
console.log(`[gitpagelayouts] compiled ${animated.length} animated layouts for the CLI`);
const layoutsCount = generateDocs();
console.log(`[gitpagelayouts] documented ${layoutsCount} layouts in gitpagelayouts/`);
