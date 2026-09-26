/** Orchestrate build of config artifacts for gitpagedocs */

import { LAYOUTS, FALLBACK_LAYOUTS } from "../data/layouts.mjs";
import { DOCS } from "../content/docs.mjs";
import { DOC_VERSIONS } from "../data/version-constants.mjs";
import { buildRootConfig } from "./root-config-builder.mjs";
import { buildVersionConfig } from "./version-config-builder.mjs";
import { buildLanguageArtifacts } from "./language-bundles-builder.mjs";

/**
 * Build all config artifacts (root, languages, layouts, versions, docs).
 * @param {object} options - { useLocalLayoutConfig, githubOwner, githubRepo, root }
 * @returns {object} { rootConfig, languageManifest, languageBundles, layoutsConfig, fallbackLayoutsConfig, docs, docsHtml, versionConfigs }
 */
export function buildConfigArtifacts(options = {}) {
  const root = options.root ?? process.cwd();

  const rootConfig = buildRootConfig(options);
  const { languageManifest, languageBundles } = buildLanguageArtifacts();
  const layoutsConfig = { layouts: LAYOUTS };
  const fallbackLayoutsConfig = { layouts: FALLBACK_LAYOUTS };

  const versionConfigs = {};
  for (const versionId of DOC_VERSIONS) {
    versionConfigs[versionId] = buildVersionConfig(versionId, options);
  }

  return {
    rootConfig,
    languageManifest,
    languageBundles,
    layoutsConfig,
    fallbackLayoutsConfig,
    docs: DOCS,
    docsHtml: {},
    versionConfigs,
  };
}
