/** Map doc paths to content keys and apply version badges */

const DOC_FILE_KEYS = new Map([
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
]);

export function parseDocFileToKey(fileName) {
  return DOC_FILE_KEYS.get(fileName);
}

export function parseHtmlFileToKey(fileName) {
  const base = fileName.replace(/\.html$/, "");
  if (base === "source-viewer") return "sourceViewer";
  if (base === "doom") return "doom";
  return undefined;
}

export function extractLanguageFromPath(docPath) {
  const match = docPath.match(/\/(pt|en|es)\//);
  return match?.[1];
}

export function withVersionBadge(content, versionId, language) {
  const normalized = typeof content === "string" ? content : "";
  if (!normalized.trim()) {
    return normalized;
  }

  const alreadyTagged =
    normalized.includes(`Version: ${versionId}`) ||
    normalized.includes(`Versao: ${versionId}`) ||
    normalized.includes(`Version (ES): ${versionId}`);
  if (alreadyTagged) {
    return normalized;
  }

  const label = `> ${versionLabelPrefix(language)}: ${versionId}`;

  return `${normalized.trimEnd()}\n\n${label}\n`;
}

/** Badge wording per language; every other language reads the English form. */
const VERSION_LABEL_PREFIXES = { pt: "Versao", es: "Version (ES)" };

function versionLabelPrefix(language) {
  return VERSION_LABEL_PREFIXES[language] ?? "Version";
}

export function normalizeToOutputPath(outputDir, configPath) {
  const normalized = configPath.replace(/^gitpagedocs\//, "");
  return `${outputDir}/${normalized}`;
}
