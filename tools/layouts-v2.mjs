/**
 * gitpagelayouts v2: the de-duplicated source of the official layouts.
 *
 *   gitpagelayouts/v2/base.json          shared values, per-mode defaults and
 *                                        palette-derived rules (written once)
 *   gitpagelayouts/v2/layouts/<id>.json  identity + colors + the few values that
 *                                        differ from the base (`overrides`)
 *
 * `expandLayout(base, layout)` rebuilds the full v1 template
 * (gitpagelayouts/templates/<id>.json) that viewers and the CLI keep reading,
 * so the published format does not change.
 */
import fs from "node:fs";
import path from "node:path";

export const V2_DIR = "v2";
export const V2_BASE_FILE = "base.json";
export const V2_LAYOUTS_DIR = "layouts";

const IDENTITY_KEYS = ["id", "name", "author", "version", "mode", "supportsLightAndDarkModes"];

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** `#RGB` / `#RRGGBB` -> `rgba(r, g, b, alpha)`. */
export function hexToRgba(hex, alpha) {
  const digits = String(hex).replace("#", "");
  const full = digits.length === 3 ? digits.replace(/./g, (c) => c + c) : digits.slice(0, 6);
  const value = Number.parseInt(full, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

/**
 * Resolves a derived rule against the palette. Placeholders: `{token}` inserts
 * `colors.token`; `{token|alpha}` inserts it as rgba with that alpha.
 */
export function resolveRule(rule, colors) {
  return rule.replace(/\{(\w+)(?:\|([\d.]+))?\}/g, (_, token, alpha) => {
    const color = colors[token];
    if (color === undefined) throw new Error(`Unknown palette token "${token}" in rule "${rule}"`);
    return alpha === undefined ? color : hexToRgba(color, alpha);
  });
}

function setPath(target, dotted, value) {
  const parts = dotted.split(".");
  let node = target;
  for (const part of parts.slice(0, -1)) {
    if (!isPlainObject(node[part])) node[part] = {};
    node = node[part];
  }
  node[parts.at(-1)] = value;
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (isPlainObject(value)) {
      if (!isPlainObject(target[key])) target[key] = {};
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

/** Key order of the v1 template schema, so expanded files keep their familiar layout. */
const V1_KEY_ORDER = {
  "": ["id", "name", "author", "version", "mode", "supportsLightAndDarkModes", "colors", "typography", "components", "animations"],
  colors: ["background", "primary", "secondary", "text", "textSecondary", "cardBackground", "cardBorder", "error", "success"],
  typography: ["fontFamily", "fontSize"],
  "typography.fontSize": ["small", "base", "medium", "large", "xlarge"],
  components: ["header", "footer", "card", "button", "select", "checkbox"],
  "components.header": ["height", "backgroundColor", "borderBottom"],
  "components.footer": ["height", "backgroundColor", "borderTop"],
  "components.card": ["borderRadius", "padding", "boxShadow"],
  "components.button": ["borderRadius", "padding", "border", "hoverGlow"],
  "components.select": ["borderRadius", "padding", "border", "backgroundColor", "textAlign", "iconColor", "hoverBorderColor", "focusBorderColor", "focusGlow"],
  "components.checkbox": ["width", "height", "accentColor", "borderColor", "hoverBorderColor", "checkMarkColor", "borderRadius"],
  animations: ["enableTypingEffect", "enableGlow", "transitionDuration"],
};

/** Known keys first, in schema order; any extra key keeps its insertion order after them. */
function orderKeys(value, at = "") {
  if (!isPlainObject(value)) return value;
  const known = V1_KEY_ORDER[at] ?? [];
  const keys = [...known.filter((key) => key in value), ...Object.keys(value).filter((key) => !known.includes(key))];
  return Object.fromEntries(keys.map((key) => [key, orderKeys(value[key], at ? `${at}.${key}` : key)]));
}

/** Full v1 template for one v2 layout. Precedence: shared < mode < derived < overrides. */
export function expandLayout(base, layout) {
  return orderKeys(expandUnordered(base, layout));
}

function expandUnordered(base, layout) {
  const modeDefaults = base.modes?.[layout.mode];
  if (!modeDefaults) throw new Error(`Layout "${layout.id}" has unknown mode "${layout.mode}"`);
  const template = {};
  for (const key of IDENTITY_KEYS) {
    template[key] = key in layout ? layout[key] : base.shared[key];
  }
  template.colors = { ...layout.colors };
  const body = deepMerge(deepMerge({}, stripIdentity(base.shared)), modeDefaults);
  for (const [dotted, rule] of Object.entries(base.derived ?? {})) {
    setPath(body, dotted, resolveRule(rule, layout.colors));
  }
  deepMerge(body, layout.overrides);
  return { ...template, ...body };
}

function stripIdentity(shared) {
  const rest = { ...shared };
  for (const key of IDENTITY_KEYS) delete rest[key];
  return rest;
}

export function readV2(layoutsRoot) {
  const dir = path.join(layoutsRoot, V2_DIR);
  const base = JSON.parse(fs.readFileSync(path.join(dir, V2_BASE_FILE), "utf8"));
  const layoutsDir = path.join(dir, V2_LAYOUTS_DIR);
  const layouts = fs
    .readdirSync(layoutsDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(fs.readFileSync(path.join(layoutsDir, file), "utf8")));
  return { base, layouts };
}

/** Writes every expanded template to `<layoutsRoot>/templates/<id>.json`; returns the ids written. */
export function writeExpandedTemplates(layoutsRoot) {
  const { base, layouts } = readV2(layoutsRoot);
  const templatesDir = path.join(layoutsRoot, "templates");
  fs.mkdirSync(templatesDir, { recursive: true });
  for (const layout of layouts) {
    const file = path.join(templatesDir, `${layout.id}.json`);
    fs.writeFileSync(file, `${JSON.stringify(expandLayout(base, layout), null, 2)}\n`);
  }
  return layouts.map((layout) => layout.id);
}
