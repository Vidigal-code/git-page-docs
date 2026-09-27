/**
 * Canonical locations for the language artifacts inside the docs output dir:
 *
 *   <outputDir>/config.json        `site.languages` — enable (true) / disable (false) each language
 *   <outputDir>/langs/<lang>.json  UI strings (langmenu + translations) of one language
 *
 * The file names come from @gitpagedocs/tools so the generator and the viewer
 * never disagree about where the bundles live.
 */
import { LANGS_DIRNAME } from "@gitpagedocs/tools/i18n";

/**
 * Repo-relative POSIX paths of the language artifacts for a docs output dir.
 *
 * @param {string} outputDir Docs output dir (e.g. `gitpagedocs`).
 * @returns {{ config: string, dir: string, bundle: (language: string) => string }}
 */
export function languageArtifactPaths(outputDir) {
  const dir = `${outputDir}/${LANGS_DIRNAME}`;
  return {
    config: `${outputDir}/config.json`,
    dir,
    bundle: (language) => `${dir}/${language}.json`,
  };
}
