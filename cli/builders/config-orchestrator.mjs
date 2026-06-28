/** Orchestrate build of config artifacts for gitpagedocs */

import { LAYOUTS, FALLBACK_LAYOUTS } from "../data/layouts.mjs";
import { DOCS } from "../content/docs.mjs";
import { DOC_VERSIONS } from "../data/version-constants.mjs";
import { buildRootConfig } from "./root-config-builder.mjs";
import { buildVersionConfig } from "./version-config-builder.mjs";

/**
 * Build all config artifacts (root, layouts, versions, docs).
 * @param {object} options - { useLocalLayoutConfig, githubOwner, githubRepo, root }
 * @returns {object} { rootConfig, layoutsConfig, fallbackLayoutsConfig, docs, docsHtml, versionConfigs }
 */
export function buildConfigArtifacts(options = {}) {
  const root = options.root ?? process.cwd();

  const rootConfig = buildRootConfig(options);
  const layoutsConfig = { layouts: LAYOUTS };
  const fallbackLayoutsConfig = { layouts: FALLBACK_LAYOUTS };

  const versionConfigs = {};
  for (const versionId of DOC_VERSIONS) {
    versionConfigs[versionId] = buildVersionConfig(versionId);
  }

  return {
    rootConfig,
    layoutsConfig,
    fallbackLayoutsConfig,
    docs: DOCS,
    docsHtml: {},
    versionConfigs,
  };
}
