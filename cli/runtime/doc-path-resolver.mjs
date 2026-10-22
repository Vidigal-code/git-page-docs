/** Map doc paths to content keys and apply version badges */

import { PACKAGE_VERSION } from "../contracts/doc-versions.mjs";

const DOC_FILE_KEYS = new Map([
  ["container-pagination.md", "containerPagination"],
  ["pagination-first.md", "paginationFirst"],
  ["markdown-markers.md", "markdownMarkers"],
  ["content-blocks.md", "contentBlocks"],
  ["index.md", "index"],
  ["getting-started.md", "gettingStarted"],
  ["configuration.md", "configuration"],
  ["deployment.md", "deployment"],
  ["architecture.md", "architecture"],
  ["themes.md", "themes"],
  ["faq.md", "faq"],
  ["project-overview.md", "projectOverview"],
  ["functionalities.md", "functionalities"],
  ["github-issues-projects.md", "githubIssuesProjects"],
  ["git-introduction.md", "gitIntroduction"],
  ["authorized-routes.md", "authorizedRoutes"],
  ["cli.md", "cli"],
  ["mcp.md", "mcp"],
  ["navigation.md", "navigation"],
  ["accessibility.md", "accessibility"],
  ["focus-mode.md", "focusMode"],
  ["pdf.md", "pdf"],
  ["configuration-recipes.md", "configurationRecipes"],
  ["migration.md", "migration"],
  ["troubleshooting.md", "troubleshooting"],
  ["contributing.md", "contributing"],
  ["html-containers.md", "htmlContainers"],
  ["guides.md", "guides"],
  ["configure-your-site.md", "configureYourSite"],
  ["read-and-explore.md", "readAndExplore"],
  ["automate-and-integrate.md", "automateAndIntegrate"],
  ["operations-and-development.md", "operationsAndDevelopment"],
  ["ship-and-maintain.md", "shipAndMaintain"],
  ["develop-the-project.md", "developTheProject"],
  ["git-and-github.md", "gitAndGitHub"],
]);

export function parseDocFileToKey(fileName) {
  return DOC_FILE_KEYS.get(fileName);
}

export function parseHtmlFileToKey(fileName) {
  const base = fileName.replace(/\.html$/, "");
  if (base === "source-viewer") return "sourceViewer";
  if (base === "doom") return "doom";
  if (base === "pagination-first") return "paginationFirst";
  if (base === "pagination-second") return "paginationSecond";
  return undefined;
}

export function extractLanguageFromPath(docPath) {
  const match = docPath.match(/\/(pt|en|es)\//);
  return match?.[1];
}

export function withVersionBadge(content, versionId, language) {
  const normalized = typeof content === "string"
    ? withDocumentVersion(content, versionId)
    : "";
  if (!normalized.trim()) {
    return normalized;
  }

  const alreadyTagged =
    normalized.includes(`Version: ${versionId}`) ||
    normalized.includes(`Versão: ${versionId}`) ||
    normalized.includes(`Versión: ${versionId}`) ||
    normalized.includes(`Versao: ${versionId}`) ||
    normalized.includes(`Version (ES): ${versionId}`);
  if (alreadyTagged) {
    return normalized;
  }

  const label = `> ${versionLabelPrefix(language)}: ${versionId}`;

  return `${normalized.trimEnd()}\n\n${label}\n`;
}

function withDocumentVersion(content, versionId) {
  const replaceVersionField = (field, currentVersion) => currentVersion === PACKAGE_VERSION
    ? field.replace(`"${currentVersion}"`, `"${versionId}"`)
    : field;

  return content
    .replaceAll(/"docsVersion"\s*:\s*"([^"\r\n]+)"/g, replaceVersionField)
    .replaceAll(/"id"\s*:\s*"([^"\r\n]+)"(?=\s*,\s*"path"\s*:\s*"gitpagedocs\/docs\/versions\/\1\/config\.json")/g, replaceVersionField)
    .replaceAll(`/versions/${PACKAGE_VERSION}/`, `/versions/${versionId}/`);
}

/** Badge wording per language; every other language reads the English form. */
const VERSION_LABEL_PREFIXES = { pt: "Versão", es: "Versión" };

function versionLabelPrefix(language) {
  return VERSION_LABEL_PREFIXES[language] ?? "Version";
}

export function normalizeToOutputPath(outputDir, configPath) {
  const normalized = configPath.replace(/^gitpagedocs\//, "");
  return `${outputDir}/${normalized}`;
}
