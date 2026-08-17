/**
 * Regenerates the documentation of the `gitpagelayouts/` folder — the
 * canonical home of the official layout themes:
 *
 *   gitpagelayouts/
 *     layoutsConfig.json          (canonical layout index)
 *     layoutsFallbackConfig.json  (minimal fallback set)
 *     templates/*.json            (one JSON theme template per layout)
 *     README.md                   (generated index of every layout)
 *     docs/<id>.md                (generated documentation per layout)
 *
 * The JSON files are the source of truth; this script derives the markdown
 * catalog from them. Run it after changing any layout JSON:
 * `npm run layouts:sync`.
 */
import fs from "node:fs";
import path from "node:path";

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
  \`npx gitpagedocs --layoutconfig\`) and the viewer resolves it automatically.

The JSON files here are the source of truth. After changing any of them,
regenerate this catalog with \`npm run layouts:sync\`.

## Files

- [\`layoutsConfig.json\`](layoutsConfig.json) — index of every layout.
- [\`layoutsFallbackConfig.json\`](layoutsFallbackConfig.json) — minimal fallback set.
- [\`templates/\`](templates) — one JSON theme template per layout.
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

const layoutsCount = generateDocs();
console.log(`[gitpagelayouts] documented ${layoutsCount} layouts in gitpagelayouts/`);
