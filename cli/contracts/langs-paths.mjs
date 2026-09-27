/**
 * Canonical locations for the language artifacts inside the docs output dir:
 *
 *   <outputDir>/config.json        `site.languages` — enable (true) / disable (false) each language
 *   <outputDir>/langs/<lang>.json  UI strings (langmenu + translations) of one language
 *
 * `<outputDir>/langs.json` was the 1.1.68 manifest; `site.languages` replaced
 * it, so the generator deletes a stale copy. The file names come from
 * @gitpagedocs/tools so the generator and the viewer never disagree about where
 * the bundles live.
 */
import { LANGS_DIRNAME, LANGS_MANIFEST_FILENAME } from "@gitpagedocs/tools/i18n";

/**
 * Repo-relative POSIX paths of the language artifacts for a docs output dir.
 *
 * @param {string} outputDir Docs output dir (e.g. `gitpagedocs`).
 * @returns {{ config: string, legacyManifest: string, dir: string, bundle: (language: string) => string }}
 */
export function languageArtifactPaths(outputDir) {
  const dir = `${outputDir}/${LANGS_DIRNAME}`;
  return {
    config: `${outputDir}/config.json`,
    legacyManifest: `${outputDir}/${LANGS_MANIFEST_FILENAME}`,
    dir,
    bundle: (language) => `${dir}/${language}.json`,
  };
}
