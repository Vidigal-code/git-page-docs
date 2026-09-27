/**
 * Language bundles — the UI strings of a gitpagedocs site, one JSON file per
 * language, switched on and off from `config.json`:
 *
 *   gitpagedocs/config.json         { "site": { "languages": { "en": true, "pt": true, "es": false } } }
 *   gitpagedocs/langs/<lang>.json   { "langmenu": {...}, "translations": {...} }
 *
 * `site.languages` is the only place a language is enabled (`true`) or disabled
 * (`false`): a disabled language has its bundle skipped and is hidden from the
 * language selector, even when its docs exist. A language the map does not
 * mention stays enabled, so old configs keep every content language they ship.
 *
 * `applyLanguageBundles` folds the loaded bundles into `site.langmenu` (keyed
 * by language) and `translations.<section>.<key>` (keyed by language), the
 * shape every consumer reads.
 */

export const LANGS_DIRNAME = "langs";
export const DEFAULT_LANGS_DIR = `gitpagedocs/${LANGS_DIRNAME}`;

/** Language codes become file names, so they are kept to a safe alphabet. */
const LANGUAGE_CODE_PATTERN = /^[A-Za-z0-9]{2,8}(?:[-_][A-Za-z0-9]{1,8})?$/;

export type LanguageStrings = Record<string, string>;
export type TranslationSections = Record<string, LanguageStrings>;

/** `site.languages`: language code → enabled flag, in menu order. */
export type LanguageToggles = Record<string, boolean>;

export interface LanguageBundle {
  langmenu?: LanguageStrings;
  translations?: TranslationSections;
}

export type LanguageBundleMap = Record<string, LanguageBundle>;

/**
 * Folded shapes: `langmenu[lang][key]` and `translations[section][key][lang]`.
 * Sections and keys may be absent, matching the optional fields of typed configs.
 */
export type InlineLangMenu = Record<string, LanguageStrings>;
export type InlineTranslationSection = { [key: string]: LanguageStrings | undefined };
export type InlineTranslations = { [section: string]: InlineTranslationSection | undefined };

export interface LocalizableSite {
  defaultLanguage?: string;
  languages?: LanguageToggles;
  langmenu?: InlineLangMenu;
  supportedLanguages?: string[];
}

export interface LocalizableConfig {
  site?: LocalizableSite;
  translations?: InlineTranslations;
}

/** Reads a repo-relative JSON file; resolves null when it is missing or invalid. */
export type JsonReader = (relativePath: string) => Promise<unknown>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is LanguageStrings {
  return isPlainObject(value) && Object.values(value).every((entry) => typeof entry === "string");
}

export function isLanguageCode(value: unknown): value is string {
  return typeof value === "string" && LANGUAGE_CODE_PATTERN.test(value);
}

export function getLanguageBundlePath(language: string, langsDir: string = DEFAULT_LANGS_DIR): string {
  return `${langsDir}/${language}.json`;
}

/** `{ en: true, pt: true }` for a language list; the generator's view of `site.languages`. */
export function buildLanguageToggles(languages: readonly string[], enabled = true): LanguageToggles {
  const toggles: LanguageToggles = {};
  for (const language of languages) toggles[language] = enabled;
  return toggles;
}

/**
 * Parses `site.languages`. Only valid codes with a boolean flag are kept, in
 * key order; resolves null when nothing usable is there (legacy configs).
 */
export function parseLanguageToggles(raw: unknown): LanguageToggles | null {
  if (!isPlainObject(raw)) return null;
  const toggles: LanguageToggles = {};
  for (const [language, enabled] of Object.entries(raw)) {
    if (isLanguageCode(language) && typeof enabled === "boolean") toggles[language] = enabled;
  }
  return Object.keys(toggles).length > 0 ? toggles : null;
}

export function getEnabledLanguages(toggles: LanguageToggles | null | undefined): string[] {
  return Object.entries(toggles ?? {})
    .filter(([, enabled]) => enabled)
    .map(([language]) => language);
}

/** Only an explicit `false` disables a language; unknown codes stay enabled. */
export function isLanguageEnabled(toggles: LanguageToggles | null | undefined, language: string): boolean {
  return toggles?.[language] !== false;
}

/**
 * Drops the disabled languages from a content-derived list, keeping its order.
 * A site can never end up without a language: when every entry is disabled the
 * preferred (default) language survives, else the first one.
 */
export function filterEnabledLanguages<T extends string>(
  languages: readonly T[],
  toggles: LanguageToggles | null | undefined,
  preferred?: T,
): T[] {
  const enabled = languages.filter((language) => isLanguageEnabled(toggles, language));
  if (enabled.length > 0 || languages.length === 0) return enabled;
  const fallback = preferred !== undefined && languages.includes(preferred) ? preferred : languages[0];
  return [fallback];
}

export function getSiteLanguageToggles(config: LocalizableConfig): LanguageToggles | null {
  return parseLanguageToggles(config.site?.languages);
}

/** The bundles a config asks for: its enabled toggles, or null when it has none. */
export function resolveBundleLanguages(config: LocalizableConfig): string[] | null {
  const toggles = getSiteLanguageToggles(config);
  return toggles ? getEnabledLanguages(toggles) : null;
}

function parseTranslationSections(raw: unknown): TranslationSections | undefined {
  if (!isPlainObject(raw)) return undefined;
  const sections: TranslationSections = {};
  for (const [section, strings] of Object.entries(raw)) {
    if (isStringRecord(strings)) sections[section] = strings;
  }
  return sections;
}

export function parseLanguageBundle(raw: unknown): LanguageBundle | null {
  if (!isPlainObject(raw)) return null;
  const bundle: LanguageBundle = {};
  if (isStringRecord(raw.langmenu)) bundle.langmenu = raw.langmenu;
  const translations = parseTranslationSections(raw.translations);
  if (translations) bundle.translations = translations;
  return bundle;
}

export interface LoadLanguageBundlesOptions {
  /** Languages to load (the enabled `site.languages`). */
  languages?: readonly string[];
  langsDir?: string;
}

/**
 * Loads one bundle per requested language. Resolves null when nothing is
 * requested; bundles that are missing or malformed are skipped so one broken
 * file never takes the other languages down.
 */
export async function loadLanguageBundles(
  readJson: JsonReader,
  options: LoadLanguageBundlesOptions = {},
): Promise<LanguageBundleMap | null> {
  const { languages } = options;
  if (!languages || languages.length === 0) return null;

  const entries = await Promise.all(
    languages.filter(isLanguageCode).map(async (language) => {
      const bundle = parseLanguageBundle(await readJson(getLanguageBundlePath(language, options.langsDir)));
      return [language, bundle] as const;
    }),
  );

  const bundles: LanguageBundleMap = {};
  for (const [language, bundle] of entries) {
    if (bundle) bundles[language] = bundle;
  }
  return Object.keys(bundles).length > 0 ? bundles : null;
}

/** Loads the bundles `config.json` enables through `site.languages`. */
export function loadConfigLanguageBundles(
  config: LocalizableConfig,
  readJson: JsonReader,
  options: Omit<LoadLanguageBundlesOptions, "languages"> = {},
): Promise<LanguageBundleMap | null> {
  return loadLanguageBundles(readJson, { ...options, languages: resolveBundleLanguages(config) ?? undefined });
}

function mergeLangMenu(inline: InlineLangMenu | undefined, bundles: LanguageBundleMap): InlineLangMenu {
  const merged: InlineLangMenu = { ...inline };
  for (const [language, bundle] of Object.entries(bundles)) {
    merged[language] = { ...inline?.[language], ...bundle.langmenu };
  }
  return merged;
}

function cloneTranslations(inline: InlineTranslations | undefined): Record<string, InlineTranslationSection> {
  const cloned: Record<string, InlineTranslationSection> = {};
  for (const [section, keys] of Object.entries(inline ?? {})) {
    if (!keys) continue;
    cloned[section] = {};
    for (const [key, byLanguage] of Object.entries(keys)) {
      if (byLanguage) cloned[section][key] = { ...byLanguage };
    }
  }
  return cloned;
}

function mergeTranslations(inline: InlineTranslations | undefined, bundles: LanguageBundleMap): InlineTranslations {
  const merged = cloneTranslations(inline);
  for (const [language, bundle] of Object.entries(bundles)) {
    for (const [section, strings] of Object.entries(bundle.translations ?? {})) {
      const target = (merged[section] ??= {});
      for (const [key, text] of Object.entries(strings)) {
        target[key] = { ...target[key], [language]: text };
      }
    }
  }
  return merged;
}

/**
 * Folds bundles into the legacy inline shape. The loaded bundles define
 * `site.supportedLanguages`; `site.languages` and inline strings survive (the
 * latter only for keys a bundle does not provide).
 */
export function applyLanguageBundles<T extends LocalizableConfig>(config: T, bundles: LanguageBundleMap | null): T {
  if (!bundles || Object.keys(bundles).length === 0) return config;
  return {
    ...config,
    site: {
      ...config.site,
      langmenu: mergeLangMenu(config.site?.langmenu, bundles),
      supportedLanguages: Object.keys(bundles),
    },
    translations: mergeTranslations(config.translations, bundles),
  };
}

/** The generator-side inverse of `applyLanguageBundles`: one bundle per language. */
export function splitLanguageBundles(
  languages: readonly string[],
  langmenu: InlineLangMenu,
  translations: InlineTranslations,
): LanguageBundleMap {
  const bundles: LanguageBundleMap = {};
  for (const language of languages) {
    const sections: TranslationSections = {};
    for (const [section, keys] of Object.entries(translations)) {
      const strings: LanguageStrings = {};
      for (const [key, byLanguage] of Object.entries(keys ?? {})) {
        const text = byLanguage?.[language];
        if (typeof text === "string") strings[key] = text;
      }
      if (Object.keys(strings).length > 0) sections[section] = strings;
    }
    bundles[language] = { langmenu: { ...langmenu[language] }, translations: sections };
  }
  return bundles;
}
