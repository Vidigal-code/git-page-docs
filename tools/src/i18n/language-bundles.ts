/**
 * Language bundles — the UI strings of a gitpagedocs site, one JSON file per
 * language, listed by a manifest:
 *
 *   gitpagedocs/langs.json          { "languages": ["en", "pt", "es"] }
 *   gitpagedocs/langs/<lang>.json   { "langmenu": {...}, "translations": {...} }
 *
 * Historically these strings lived inline in `config.json` (`site.langmenu`
 * keyed by language and `translations.<section>.<key>` keyed by language).
 * `applyLanguageBundles` folds the bundles back into that legacy shape, so
 * every consumer keeps reading `site.langmenu` / `translations` unchanged and
 * old inline configs keep working. Bundles win over inline strings.
 */

export const LANGS_MANIFEST_FILENAME = "langs.json";
export const LANGS_DIRNAME = "langs";
export const DEFAULT_LANGS_MANIFEST_PATH = `gitpagedocs/${LANGS_MANIFEST_FILENAME}`;
export const DEFAULT_LANGS_DIR = `gitpagedocs/${LANGS_DIRNAME}`;

/** Language codes become file names, so they are kept to a safe alphabet. */
const LANGUAGE_CODE_PATTERN = /^[A-Za-z0-9]{2,8}(?:[-_][A-Za-z0-9]{1,8})?$/;

export type LanguageStrings = Record<string, string>;
export type TranslationSections = Record<string, LanguageStrings>;

export interface LanguageManifest {
  languages: string[];
}

export interface LanguageBundle {
  langmenu?: LanguageStrings;
  translations?: TranslationSections;
}

export type LanguageBundleMap = Record<string, LanguageBundle>;

/**
 * Legacy inline shapes: `langmenu[lang][key]` and `translations[section][key][lang]`.
 * Sections and keys may be absent, matching the optional fields of typed configs.
 */
export type InlineLangMenu = Record<string, LanguageStrings>;
export type InlineTranslationSection = { [key: string]: LanguageStrings | undefined };
export type InlineTranslations = { [section: string]: InlineTranslationSection | undefined };

export interface LocalizableSite {
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

export function parseLanguageManifest(raw: unknown): LanguageManifest | null {
  if (!isPlainObject(raw) || !Array.isArray(raw.languages)) return null;
  const languages = Array.from(new Set(raw.languages.filter(isLanguageCode)));
  return languages.length > 0 ? { languages } : null;
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
  manifestPath?: string;
  langsDir?: string;
}

/**
 * Loads the manifest and every bundle it lists. Resolves null when there is
 * no manifest (legacy inline config); bundles that are missing or malformed
 * are skipped so one broken file never takes the other languages down.
 */
export async function loadLanguageBundles(
  readJson: JsonReader,
  options: LoadLanguageBundlesOptions = {},
): Promise<LanguageBundleMap | null> {
  const manifest = parseLanguageManifest(await readJson(options.manifestPath ?? DEFAULT_LANGS_MANIFEST_PATH));
  if (!manifest) return null;

  const entries = await Promise.all(
    manifest.languages.map(async (language) => {
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
 * Folds bundles into the legacy inline shape. The manifest order defines
 * `site.supportedLanguages`; inline strings survive only for keys a bundle
 * does not provide.
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
  languages: string[],
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

export function buildLanguageManifest(languages: string[]): LanguageManifest {
  return { languages: [...languages] };
}
