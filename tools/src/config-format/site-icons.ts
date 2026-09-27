/**
 * Compact form of the `site` icon settings.
 *
 * Flat form (what the viewer reads): nine keys per icon, e.g.
 *   IconSearchReactIcones, IconSearchReactIconesTag, IconSearchReactIconesTagColorDark, …
 * Compact form (what config.json stores): the values every icon shares once, and
 * per icon only what differs:
 *   "icons": { "defaults": { "reactIcon": true, "size": "25px", … }, "Search": { "tag": "FiSearch" } }
 *
 * A field set to `null` in an icon entry means "this icon has no such key", so
 * `expandSiteIcons(compactSiteIcons(site))` reproduces the flat site exactly.
 */

type SiteRecord = Record<string, unknown>;

/** Compact field name -> suffix of the flat key (`Icon<Name><Suffix>`). */
const ICON_FIELD_SUFFIX = {
  reactIcon: "ReactIcones",
  tag: "ReactIconesTag",
  colorDark: "ReactIconesTagColorDark",
  colorLight: "ReactIconesTagColorLight",
  size: "ReactIconesTagSize",
  imgDark: "DarkImg",
  imgLight: "LightImg",
  imgWidth: "ImgWidth",
  imgHeight: "ImgHeight",
} as const;

export type SiteIconField = keyof typeof ICON_FIELD_SUFFIX;
export type SiteIconValue = string | number | boolean | null;
export type SiteIconSpec = Partial<Record<SiteIconField, SiteIconValue>>;

export interface CompactSiteIcons {
  defaults: SiteIconSpec;
  [iconName: string]: SiteIconSpec;
}

export const SITE_ICONS_KEY = "icons";
const DEFAULTS_KEY = "defaults";
const ICON_KEY_PREFIX = "Icon";
/** A value becomes a shared default only when at least this many icons use it. */
const MIN_SHARED_COUNT = 2;
/** Fields that identify the icon: always written on the icon, never shared. */
const ICON_IDENTITY_FIELDS: ReadonlySet<SiteIconField> = new Set<SiteIconField>(["tag"]);

const FIELDS = Object.keys(ICON_FIELD_SUFFIX) as SiteIconField[];
/** Longest suffix first, so `ReactIconesTagColorDark` never matches as `ReactIcones`. */
const FIELDS_BY_SUFFIX_LENGTH = [...FIELDS].sort((a, b) => ICON_FIELD_SUFFIX[b].length - ICON_FIELD_SUFFIX[a].length);

function isPlainObject(value: unknown): value is SiteRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIconValue(value: unknown): value is SiteIconValue {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

/** `IconSearchReactIconesTag` -> `{ name: "Search", field: "tag" }`; undefined for any other key. */
function parseIconKey(key: string): { name: string; field: SiteIconField } | undefined {
  if (!key.startsWith(ICON_KEY_PREFIX)) return undefined;
  const body = key.slice(ICON_KEY_PREFIX.length);
  const field = FIELDS_BY_SUFFIX_LENGTH.find((candidate) => body.endsWith(ICON_FIELD_SUFFIX[candidate]));
  if (!field) return undefined;
  const name = body.slice(0, -ICON_FIELD_SUFFIX[field].length);
  return name ? { name, field } : undefined;
}

function iconKey(name: string, field: SiteIconField): string {
  return `${ICON_KEY_PREFIX}${name}${ICON_FIELD_SUFFIX[field]}`;
}

/** Most frequent value shared by at least two icons; the first one seen wins a tie. */
function mostCommonValue(values: SiteIconValue[]): SiteIconValue | undefined {
  const counts = new Map<string, { value: SiteIconValue; count: number }>();
  for (const value of values) {
    const key = JSON.stringify(value);
    const entry = counts.get(key) ?? { value, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  let best: { value: SiteIconValue; count: number } | undefined;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) best = entry;
  }
  return best && best.count >= MIN_SHARED_COUNT ? best.value : undefined;
}

function collectIcons(site: SiteRecord): Map<string, SiteIconSpec> {
  const icons = new Map<string, SiteIconSpec>();
  for (const [key, value] of Object.entries(site)) {
    const parsed = parseIconKey(key);
    if (!parsed || !isIconValue(value)) continue;
    const spec = icons.get(parsed.name) ?? {};
    spec[parsed.field] = value;
    icons.set(parsed.name, spec);
  }
  return icons;
}

function sharedDefaults(icons: Map<string, SiteIconSpec>): SiteIconSpec {
  const defaults: SiteIconSpec = {};
  for (const field of FIELDS) {
    if (ICON_IDENTITY_FIELDS.has(field)) continue;
    const values = [...icons.values()].flatMap((spec) => (field in spec ? [spec[field] as SiteIconValue] : []));
    const common = mostCommonValue(values);
    if (common !== undefined) defaults[field] = common;
  }
  return defaults;
}

function iconDifferences(spec: SiteIconSpec, defaults: SiteIconSpec): SiteIconSpec {
  const entry: SiteIconSpec = {};
  for (const field of FIELDS) {
    const hasOwn = field in spec;
    if (!hasOwn && field in defaults) entry[field] = null;
    else if (hasOwn && spec[field] !== defaults[field]) entry[field] = spec[field];
  }
  return entry;
}

/** Replaces the flat `Icon*` keys with one `icons` object (placed where the first icon key was). */
export function compactSiteIcons<T>(site: T): SiteRecord | T {
  if (!isPlainObject(site)) return site;
  const icons = collectIcons(site);
  if (icons.size === 0) return site;
  const defaults = sharedDefaults(icons);
  const compact: CompactSiteIcons = { defaults };
  for (const [name, spec] of icons) compact[name] = iconDifferences(spec, defaults);

  const out: SiteRecord = {};
  for (const [key, value] of Object.entries(site)) {
    if (parseIconKey(key) && isIconValue(value)) {
      if (!(SITE_ICONS_KEY in out)) out[SITE_ICONS_KEY] = compact;
      continue;
    }
    out[key] = value;
  }
  return out;
}

function expandIcon(name: string, entry: SiteIconSpec, defaults: SiteIconSpec): SiteRecord {
  const flat: SiteRecord = {};
  for (const field of FIELDS) {
    const value = field in entry ? entry[field] : defaults[field];
    if (value !== null && value !== undefined) flat[iconKey(name, field)] = value;
  }
  return flat;
}

/**
 * Turns `site.icons` back into the flat `Icon*` keys the viewer reads. Flat keys
 * already present in the site win over the compact form.
 */
export function expandSiteIcons<T>(site: T): SiteRecord | T {
  if (!isPlainObject(site)) return site;
  const compact = site[SITE_ICONS_KEY];
  if (!isPlainObject(compact)) return site;
  const defaults = isPlainObject(compact[DEFAULTS_KEY]) ? (compact[DEFAULTS_KEY] as SiteIconSpec) : {};

  const expanded: SiteRecord = {};
  for (const [name, entry] of Object.entries(compact)) {
    if (name === DEFAULTS_KEY || !isPlainObject(entry)) continue;
    Object.assign(expanded, expandIcon(name, entry as SiteIconSpec, defaults));
  }

  const out: SiteRecord = {};
  for (const [key, value] of Object.entries(site)) {
    if (key !== SITE_ICONS_KEY) {
      out[key] = value;
      continue;
    }
    for (const [flatKey, flatValue] of Object.entries(expanded)) {
      if (!(flatKey in site)) out[flatKey] = flatValue;
    }
  }
  return out;
}
