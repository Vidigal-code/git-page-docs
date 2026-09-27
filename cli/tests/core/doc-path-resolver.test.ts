import { describe, it, expect } from "vitest";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as resolver from "../../runtime/doc-path-resolver.mjs";

const { parseDocFileToKey, parseHtmlFileToKey, extractLanguageFromPath, withVersionBadge, normalizeToOutputPath } =
  resolver as {
    parseDocFileToKey(fileName: string): string | undefined;
    parseHtmlFileToKey(fileName: string): string | undefined;
    extractLanguageFromPath(docPath: string): string | undefined;
    withVersionBadge(content: unknown, versionId: string, language?: string): string;
    normalizeToOutputPath(outputDir: string, configPath: string): string;
  };

describe("parseDocFileToKey", () => {
  it.each([
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
  ])("maps %s to %s", (fileName, key) => {
    expect(parseDocFileToKey(fileName)).toBe(key);
  });

  it("returns undefined for unknown files", () => {
    expect(parseDocFileToKey("changelog.md")).toBeUndefined();
    expect(parseDocFileToKey("Index.md")).toBeUndefined();
    expect(parseDocFileToKey("")).toBeUndefined();
  });
});

describe("parseHtmlFileToKey", () => {
  it("recognizes the source viewer page with or without its extension", () => {
    expect(parseHtmlFileToKey("source-viewer.html")).toBe("sourceViewer");
    expect(parseHtmlFileToKey("source-viewer")).toBe("sourceViewer");
  });

  it("returns undefined for any other page", () => {
    expect(parseHtmlFileToKey("index.html")).toBeUndefined();
    expect(parseHtmlFileToKey("source-viewer.htm")).toBeUndefined();
  });
});

describe("extractLanguageFromPath", () => {
  it.each([
    ["gitpagedocs/docs/versions/1.0.0/en/index.md", "en"],
    ["gitpagedocs/docs/versions/1.0.0/pt/index.md", "pt"],
    ["docs/es/faq.md", "es"],
  ])("reads the language folder from %s", (docPath, language) => {
    expect(extractLanguageFromPath(docPath)).toBe(language);
  });

  it("returns undefined without a supported language folder", () => {
    expect(extractLanguageFromPath("docs/fr/index.md")).toBeUndefined();
    expect(extractLanguageFromPath("en/index.md")).toBeUndefined();
    expect(extractLanguageFromPath("docs/english/index.md")).toBeUndefined();
  });
});

describe("withVersionBadge", () => {
  it("appends a language-specific badge after the trimmed content", () => {
    expect(withVersionBadge("# Title\n\ntext  \n\n", "1.2.3", "en")).toBe("# Title\n\ntext\n\n> Version: 1.2.3\n");
    expect(withVersionBadge("# Titulo", "1.2.3", "pt")).toBe("# Titulo\n\n> Versao: 1.2.3\n");
    expect(withVersionBadge("# Titulo", "1.2.3", "es")).toBe("# Titulo\n\n> Version (ES): 1.2.3\n");
  });

  it("uses the English badge for unknown or missing languages", () => {
    expect(withVersionBadge("x", "9.9.9", "fr")).toBe("x\n\n> Version: 9.9.9\n");
    expect(withVersionBadge("x", "9.9.9")).toBe("x\n\n> Version: 9.9.9\n");
  });

  it("leaves already tagged content untouched, whichever language tagged it", () => {
    for (const tagged of ["body\n\n> Version: 1.0.0\n", "body\n\n> Versao: 1.0.0\n", "body\n\n> Version (ES): 1.0.0\n"]) {
      expect(withVersionBadge(tagged, "1.0.0", "en")).toBe(tagged);
    }
  });

  it("tags again when the badge belongs to a different version", () => {
    expect(withVersionBadge("body\n\n> Version: 1.0.0\n", "2.0.0", "en")).toBe("body\n\n> Version: 1.0.0\n\n> Version: 2.0.0\n");
  });

  it("returns blank input unchanged and treats non-strings as empty", () => {
    expect(withVersionBadge("", "1.0.0", "en")).toBe("");
    expect(withVersionBadge("   \n", "1.0.0", "en")).toBe("   \n");
    expect(withVersionBadge(undefined, "1.0.0", "en")).toBe("");
    expect(withVersionBadge(42, "1.0.0", "en")).toBe("");
  });
});

describe("normalizeToOutputPath", () => {
  it("re-roots a config path under the output dir, dropping the default gitpagedocs prefix", () => {
    expect(normalizeToOutputPath("out", "gitpagedocs/docs/versions/1.0.0/en/index.md")).toBe("out/docs/versions/1.0.0/en/index.md");
    expect(normalizeToOutputPath("gitpagedocs", "docs/en/index.md")).toBe("gitpagedocs/docs/en/index.md");
    expect(normalizeToOutputPath("out", "nested/gitpagedocs/a.md")).toBe("out/nested/gitpagedocs/a.md");
  });
});
