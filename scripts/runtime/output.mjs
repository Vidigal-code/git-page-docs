import { existsSync, rmSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

async function writeJson(root, relativePath, data) {
  const absolutePath = path.join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export async function writeText(root, relativePath, data) {
  const absolutePath = path.join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, data, "utf-8");
}

function normalizeToOutputPath(outputDir, configPath) {
  const normalized = configPath.replace(/^gitpagedocs\//, "");
  return `${outputDir}/${normalized}`;
}

function parseDocFileToKey(fileName) {
  if (fileName === "index.md") return "index";
  if (fileName === "getting-started.md") return "gettingStarted";
  if (fileName === "configuration.md") return "configuration";
  if (fileName === "deployment.md") return "deployment";
  if (fileName === "architecture.md") return "architecture";
  if (fileName === "themes.md") return "themes";
  if (fileName === "faq.md") return "faq";
  return undefined;
}

function extractLanguageFromPath(docPath) {
  const match = docPath.match(/\/(pt|en|es)\//);
  return match?.[1];
}

function withVersionBadge(content, versionId, language) {
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

export async function writeConfigOnlyOutput(options) {
  const {
    root,
    pkgRoot,
    outputDir,
    artifacts,
    useLocalLayoutConfig,
    layouts,
    createThemeTemplate,
  } = options;

  // Keep only versioned docs output in docs/, removing legacy root language folders.
  for (const legacyLanguageDir of ["en", "pt", "es"]) {
    const legacyPath = path.join(root, outputDir, "docs", legacyLanguageDir);
    if (existsSync(legacyPath)) {
      rmSync(legacyPath, { recursive: true, force: true });
    }
  }

  await writeJson(root, `${outputDir}/config.json`, artifacts.rootConfig);
  const layoutsPath = path.join(root, outputDir, "layouts");
  if (useLocalLayoutConfig) {
    await writeJson(root, `${outputDir}/layouts/layoutsConfig.json`, artifacts.layoutsConfig);
    await writeJson(root, `${outputDir}/layouts/layoutsFallbackConfig.json`, artifacts.fallbackLayoutsConfig);
    for (const layout of layouts) {
      const template = createThemeTemplate(layout);
      await writeJson(root, `${outputDir}/layouts/${layout.file}`, template);
    }
  } else if (existsSync(layoutsPath) && root !== pkgRoot) {
    rmSync(layoutsPath, { recursive: true, force: true });
  }

  for (const [versionId, versionConfig] of Object.entries(artifacts.versionConfigs)) {
    await writeJson(root, `${outputDir}/docs/versions/${versionId}/config.json`, versionConfig);
  }

  for (const [versionId, versionConfig] of Object.entries(artifacts.versionConfigs)) {
    const versionRoutes = versionConfig.routes ?? [];
    for (const route of versionRoutes) {
      for (const docPath of Object.values(route.path ?? {})) {
        const fileName = path.basename(docPath);
        const key = parseDocFileToKey(fileName);
        const language = extractLanguageFromPath(docPath);
        const content = key && language ? artifacts.docs?.[language]?.[key] : undefined;
        if (!content) continue;
        const versionedContent = withVersionBadge(content, versionId, language);
        await writeText(root, normalizeToOutputPath(outputDir, docPath), versionedContent);
      }
    }

    // Ensure version folders always include an index file.
    for (const language of ["pt", "en", "es"]) {
      const fallbackIndex = artifacts.docs?.[language]?.index;
      if (!fallbackIndex) continue;
      const versionIndexPath = `${outputDir}/docs/versions/${versionId}/${language}/index.md`;
      if (!existsSync(path.join(root, versionIndexPath))) {
        const versionedFallbackIndex = withVersionBadge(fallbackIndex, versionId, language);
        await writeText(root, versionIndexPath, versionedFallbackIndex);
      }
    }
  }
}
