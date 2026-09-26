/** Build the language manifest + per-language UI string bundles for gitpagedocs */
import { buildLanguageManifest, splitLanguageBundles } from "@gitpagedocs/tools/i18n";
import { SUPPORTED_LANGUAGES } from "../contracts/languages.mjs";
import { defaultLangMenu } from "../data/i18n-langmenu.mjs";
import { defaultTranslations } from "../data/i18n-translations.mjs";

function assertLanguageStrings(languages) {
  const missing = languages.filter((language) => !defaultLangMenu[language]);
  if (missing.length > 0) {
    throw new Error(`No UI strings (i18n-langmenu) for supported language(s): ${missing.join(", ")}`);
  }
}

/**
 * @returns {{ languageManifest: { languages: string[] }, languageBundles: Record<string, object> }}
 */
export function buildLanguageArtifacts() {
  const languages = [...SUPPORTED_LANGUAGES];
  assertLanguageStrings(languages);
  return {
    languageManifest: buildLanguageManifest(languages),
    languageBundles: splitLanguageBundles(languages, defaultLangMenu, defaultTranslations),
  };
}
