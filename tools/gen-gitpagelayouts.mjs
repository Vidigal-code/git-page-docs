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

${typographySection(template?.typography)}

## Usage

Set it as the default theme in \`gitpagedocs/config.json\`:

\`\`\`json
{ "site": { "ThemeDefault": "${layout.id}" } }
\`\`\`

Or preview it on any Git Page Docs site via the URL parameter \`?theme=${layout.id}\`.
`;
}

function readmeIndex(layouts) {
  const rows = layouts
    .map((layout) => `| [\`${layout.id}\`](docs/${layout.id}.md) | ${layout.name} | \`${layout.mode}\` | ${layout.supportsLightAndDarkModesReference ? `\`${layout.supportsLightAndDarkModesReference}\`` : "—"} | ${layout.preview} |`)
    .join("\n");
  return `# Git Page Layouts

Canonical home of the official Git Page Docs layout themes. Any repository can
consume these layouts:

- **Official remote (default):** generated \`gitpagedocs/config.json\` files
  point at this folder's \`layoutsConfig.json\` and \`templates/\`.
- **Self-hosted:** copy this folder to the root of your repository as
  \`gitpagelayouts/\` (or generate a local \`gitpagedocs/layouts/\` with
  \`npx @gitpagedocs/cli --layoutconfig\`) and the viewer resolves it automatically.

The source of truth is \`v2/\`. \`v2/base.json\` holds every value the layouts share
(typography, component sizes, dark/light defaults and the rules that derive control
colors from each palette), and \`v2/layouts/<id>.json\` holds only the layout's
identity, colors and the few values that differ. \`npm run layouts:sync\` expands
them into the full \`templates/<id>.json\` files (the format viewers read, unchanged)
and regenerates this catalog. Edit \`v2/\`, never \`templates/\`.

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
const layoutsCount = generateDocs();
console.log(`[gitpagelayouts] documented ${layoutsCount} layouts in gitpagelayouts/`);
