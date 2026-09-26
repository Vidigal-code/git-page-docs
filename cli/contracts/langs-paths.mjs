/**
 * Canonical locations for the language artifacts inside the docs output dir:
 *
 *   <outputDir>/langs.json         manifest listing the shipped languages
 *   <outputDir>/langs/<lang>.json  UI strings (langmenu + translations) of one language
 *
 * The file names come from @gitpagedocs/tools so the generator and the viewer
 * never disagree about where the bundles live.
 */
import { LANGS_DIRNAME, LANGS_MANIFEST_FILENAME } from "@gitpagedocs/tools/i18n";

/**
 * Repo-relative POSIX paths of the language artifacts for a docs output dir.
 *
 * @param {string} outputDir Docs output dir (e.g. `gitpagedocs`).
 * @returns {{ manifest: string, dir: string, bundle: (language: string) => string }}
 */
export function languageArtifactPaths(outputDir) {
  const dir = `${outputDir}/${LANGS_DIRNAME}`;
  return {
    manifest: `${outputDir}/${LANGS_MANIFEST_FILENAME}`,
    dir,
    bundle: (language) => `${dir}/${language}.json`,
  };
}
