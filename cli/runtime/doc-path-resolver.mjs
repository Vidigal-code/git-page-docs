/** Map doc paths to content keys and apply version badges */

export function parseDocFileToKey(fileName) {
  if (fileName === "index.md") return "index";
  if (fileName === "getting-started.md") return "gettingStarted";
  if (fileName === "configuration.md") return "configuration";
  if (fileName === "deployment.md") return "deployment";
  if (fileName === "architecture.md") return "architecture";
  if (fileName === "themes.md") return "themes";
  if (fileName === "faq.md") return "faq";
  if (fileName === "project-overview.md") return "projectOverview";
  if (fileName === "github-issues-projects.md") return "githubIssuesProjects";
  if (fileName === "git-introduction.md") return "gitIntroduction";
  return undefined;
}

export function parseHtmlFileToKey(fileName) {
  const base = fileName.replace(/\.html$/, "");
  if (base === "getting-started") return "gettingStarted";
  if (base === "source-viewer") return "sourceViewer";
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

  const label =
    language === "pt"
      ? `> Versao: ${versionId}`
      : language === "es"
        ? `> Version (ES): ${versionId}`
        : `> Version: ${versionId}`;

  return `${normalized.trimEnd()}\n\n${label}\n`;
}

export function normalizeToOutputPath(outputDir, configPath) {
  const normalized = configPath.replace(/^gitpagedocs\//, "");
  return `${outputDir}/${normalized}`;
}
