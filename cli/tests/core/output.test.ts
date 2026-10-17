import { describe, it, expect, afterEach } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { applyRouteDefaults, expandSiteIcons } from "@gitpagedocs/tools/config-format";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as output from "../../runtime/output.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as orchestrator from "../../builders/config-orchestrator.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as themeTemplate from "../../builders/theme-template.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as layoutsData from "../../data/layouts.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as docVersions from "../../contracts/doc-versions.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as languages from "../../contracts/languages.mjs";

interface Layout {
  id: string;
  file: string;
  mode: string;
}

interface Route {
  path?: Record<string, string>;
  url?: string;
}

interface VersionConfig {
  routes?: Route[];
  "routes-md"?: Route[];
  "routes-html"?: Route[];
  [key: string]: unknown;
}

interface Artifacts {
  rootConfig: Record<string, unknown>;
  languageBundles: Record<string, unknown>;
  layoutsConfig: unknown;
  fallbackLayoutsConfig: unknown;
  docs?: Record<string, Record<string, string>>;
  docsHtml?: Record<string, Record<string, string>>;
  versionConfigs: Record<string, VersionConfig>;
}

interface WriteOptions {
  root: string;
  pkgRoot: string;
  outputDir: string;
  layoutsDir: string;
  artifacts: Artifacts;
  useLocalLayoutConfig: boolean;
  layouts: Layout[];
  createThemeTemplate: (layout: Layout) => unknown;
}

const { writeConfigOnlyOutput, writeText } = output as {
  writeConfigOnlyOutput(options: WriteOptions): Promise<void>;
  writeText(root: string, relativePath: string, data: string): Promise<void>;
};
const { buildConfigArtifacts } = orchestrator as { buildConfigArtifacts(options?: Record<string, unknown>): Artifacts };
const { createThemeTemplate } = themeTemplate as { createThemeTemplate(layout: Layout): unknown };
const { LAYOUTS } = layoutsData as { LAYOUTS: Layout[] };
const { DOC_VERSIONS } = docVersions as { DOC_VERSIONS: string[] };
const { SUPPORTED_LANGUAGES } = languages as { SUPPORTED_LANGUAGES: readonly string[] };

const BADGES: Record<string, string> = { en: "> Version: ", pt: "> Versao: ", es: "> Version (ES): " };
const PACKAGE_ROOT = path.resolve(__dirname, "../..");

const temporaryRoots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-output-"));
  temporaryRoots.push(root);
  return root;
}

function at(root: string, relative: string): string {
  return path.join(root, ...relative.split("/"));
}

function seed(root: string, relative: string, content = ""): void {
  const absolute = at(root, relative);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, content);
}

function readJson(root: string, relative: string): unknown {
  return JSON.parse(readFileSync(at(root, relative), "utf8"));
}

afterEach(() => {
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

// Writes every shipped layout template plus all docs; give it room under CI load.
describe("writeConfigOnlyOutput with the real artifacts", { timeout: 30_000 }, () => {
  it("writes the localized HTML example, matching menus and its Markdown guide", async () => {
    const root = makeRoot();
    const artifacts = buildConfigArtifacts({ githubOwner: "acme", githubRepo: "docs" });
    await writeConfigOnlyOutput({
      root, pkgRoot: PACKAGE_ROOT, outputDir: "gitpagedocs", layoutsDir: "gitpagelayouts",
      artifacts, useLocalLayoutConfig: false, layouts: [], createThemeTemplate,
    });
    for (const versionId of DOC_VERSIONS) {
      const config = readJson(root, `gitpagedocs/docs/versions/${versionId}/config.json`) as {
        "routes-html": { id: number; path: Record<string, string> }[];
        "menus-header-html": Record<string, { title: string; "path-click": string }>[];
      };
      const route = config["routes-html"].find((entry) => entry.id === 29);
      expect(route).toBeDefined();
      for (const language of SUPPORTED_LANGUAGES) {
        const destination = `gitpagedocs/docs/versions/${versionId}/${language}/doom.html`;
        expect(route?.path[language]).toBe(destination);
        expect(config["menus-header-html"][0][language]["path-click"]).toBe(destination);
        const html = readFileSync(at(root, destination), "utf8");
        expect(html.toLowerCase()).toContain("<!doctype html>");
        expect(html).toContain(`lang="${language}"`);
        expect(html).toContain("DOOM");
        expect(readFileSync(at(root, `gitpagedocs/docs/versions/${versionId}/${language}/html-containers.md`), "utf8")).toContain("menus-header-html");
      }
    }
  });

  it("copies the bundled PDF bytes into a custom output directory", async () => {
    const root = makeRoot();
    const pkgRoot = makeRoot();
    const source = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x00, 0xff, 0x80]);
    const filename = "gitpagedocs-project-guide.pdf";
    const sourcePath = at(pkgRoot, `content/assets/${filename}`);
    mkdirSync(path.dirname(sourcePath), { recursive: true });
    writeFileSync(sourcePath, source);
    const artifacts = buildConfigArtifacts();
    const [versionId] = DOC_VERSIONS;

    await writeConfigOnlyOutput({
      root, pkgRoot, outputDir: "custom-docs", layoutsDir: "gitpagelayouts",
      artifacts, useLocalLayoutConfig: false, layouts: [], createThemeTemplate,
    });

    expect(readFileSync(at(root, `custom-docs/docs/versions/${versionId}/en/${filename}`))).toEqual(source);
  });

  it("reports a missing bundled PDF instead of silently publishing a broken link", async () => {
    const root = makeRoot();
    await expect(writeConfigOnlyOutput({
      root, pkgRoot: root, outputDir: "docs", layoutsDir: "layouts",
      artifacts: buildConfigArtifacts(), useLocalLayoutConfig: false, layouts: [], createThemeTemplate,
    })).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("publishes all user references in every language", async () => {
    const root = makeRoot();
    const artifacts = buildConfigArtifacts();
    const [versionId] = DOC_VERSIONS;

    await writeConfigOnlyOutput({
      root,
      pkgRoot: PACKAGE_ROOT,
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      artifacts,
      useLocalLayoutConfig: false,
      layouts: LAYOUTS,
      createThemeTemplate,
    });

    for (const language of SUPPORTED_LANGUAGES) {
      for (const page of ["configuration", "deployment", "architecture", "themes", "faq", "cli", "mcp", "navigation", "accessibility", "focus-mode", "pdf"]) {
        const markdown = readFileSync(at(root, `gitpagedocs/docs/versions/${versionId}/${language}/${page}.md`), "utf8");
        const contentKey = page === "focus-mode" ? "focusMode" : page;
        expect(markdown).toContain(artifacts.docs?.[language][contentKey].trim());
      }
    }
  });

  it("writes the complete docs output and local layouts home", async () => {
    const root = makeRoot();
    const artifacts = buildConfigArtifacts({ useLocalLayoutConfig: true, layoutsDir: "gitpagelayouts" });
    const [versionId] = DOC_VERSIONS;

    await writeConfigOnlyOutput({
      root,
      pkgRoot: PACKAGE_ROOT,
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      artifacts,
      useLocalLayoutConfig: true,
      layouts: LAYOUTS,
      createThemeTemplate,
    });

    const rootConfigText = readFileSync(at(root, "gitpagedocs/config.json"), "utf8");
    expect(rootConfigText.endsWith("\n")).toBe(true);
    // Stored compact (icons written once); expanding it gives back the generated config.
    const storedRoot = JSON.parse(rootConfigText);
    expect(storedRoot.site.icons).toBeDefined();
    expect({ ...storedRoot, site: expandSiteIcons(storedRoot.site) }).toEqual(artifacts.rootConfig);
    expect(readFileSync(at(root, "gitpagedocs/icon.svg"), "utf8").startsWith("<?xml")).toBe(true);

    for (const language of SUPPORTED_LANGUAGES) {
      expect(readJson(root, `gitpagedocs/langs/${language}.json`)).toEqual(artifacts.languageBundles[language]);
    }

    expect(readJson(root, "gitpagelayouts/layoutsConfig.json")).toEqual(artifacts.layoutsConfig);
    expect(readJson(root, "gitpagelayouts/layoutsFallbackConfig.json")).toEqual(artifacts.fallbackLayoutsConfig);
    for (const layout of LAYOUTS) {
      expect(readJson(root, `gitpagelayouts/${layout.file}`)).toEqual(createThemeTemplate(layout));
    }

    for (const id of DOC_VERSIONS) {
      expect(applyRouteDefaults(readJson(root, `gitpagedocs/docs/versions/${id}/config.json`))).toEqual(artifacts.versionConfigs[id]);
      for (const language of SUPPORTED_LANGUAGES) {
        const badge = `${BADGES[language]}${id}`;
        const gettingStarted = readFileSync(at(root, `gitpagedocs/docs/versions/${id}/${language}/getting-started.md`), "utf8");
        expect(gettingStarted).toContain(artifacts.docs?.[language].gettingStarted.trim());
        expect(gettingStarted.endsWith(`\n\n${badge}\n`)).toBe(true);
        // No route serves index.md, so the fallback index is written from the docs content.
        const index = readFileSync(at(root, `gitpagedocs/docs/versions/${id}/${language}/index.md`), "utf8");
        expect(index).toContain(artifacts.docs?.[language].index.trim());
        expect(index.endsWith(`\n\n${badge}\n`)).toBe(true);
      }
    }
  });

  it("does not touch the layouts home when official layouts are used", async () => {
    const root = makeRoot();
    const artifacts = buildConfigArtifacts();
    seed(root, "gitpagelayouts/templates/hand-made.json", "{}");

    await writeConfigOnlyOutput({
      root,
      pkgRoot: PACKAGE_ROOT,
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      artifacts,
      useLocalLayoutConfig: false,
      layouts: LAYOUTS,
      createThemeTemplate,
    });

    expect(existsSync(at(root, "gitpagedocs/config.json"))).toBe(true);
    expect(existsSync(at(root, "gitpagelayouts/layoutsConfig.json"))).toBe(false);
    expect(readFileSync(at(root, "gitpagelayouts/templates/hand-made.json"), "utf8")).toBe("{}");
  });
});

describe("writeConfigOnlyOutput with synthetic artifacts", () => {
  const versionId = "9.9.9";

  function syntheticArtifacts(): Artifacts {
    return {
      rootConfig: { site: { name: "Synthetic" } },
      languageBundles: { en: { langmenu: { en: "English" }, translations: {} } },
      layoutsConfig: { layouts: [] },
      fallbackLayoutsConfig: { layouts: [] },
      docs: {
        en: { index: `# Hello\n\n> Version: ${versionId}\n`, faq: "# FAQ\n" },
        pt: {},
      },
      docsHtml: { sourceViewer: { en: "<html>viewer</html>" } },
      versionConfigs: {
        [versionId]: {
          // Legacy `routes` key instead of `routes-md`; one route without any path.
          routes: [
            { path: { en: `gitpagedocs/docs/versions/${versionId}/en/index.md`, pt: `gitpagedocs/docs/versions/${versionId}/pt/index.md` } },
            { path: { en: `gitpagedocs/docs/versions/${versionId}/en/faq.md`, fr: `gitpagedocs/docs/versions/${versionId}/fr/faq.md` } },
            { path: { en: `gitpagedocs/docs/versions/${versionId}/en/unknown-page.md` } },
            {},
          ],
          "routes-html": [
            { url: "https://example.com/external" },
            {
              path: {
                en: `gitpagedocs/docs/versions/${versionId}/en/source-viewer`,
                pt: `gitpagedocs/docs/versions/${versionId}/pt/other.html`,
                es: `gitpagedocs/docs/versions/${versionId}/es/source-viewer.html`,
              },
            },
            {},
          ],
        },
        "0.0.1": {},
      },
    };
  }

  it("writes markdown from the legacy routes key, html aliases and only the available fallback indexes", async () => {
    const root = makeRoot();
    const artifacts = syntheticArtifacts();

    await writeConfigOnlyOutput({
      root,
      pkgRoot: root,
      outputDir: "out",
      layoutsDir: "gitpagelayouts",
      artifacts,
      useLocalLayoutConfig: false,
      layouts: [],
      createThemeTemplate,
    });

    expect(readJson(root, "out/config.json")).toEqual(artifacts.rootConfig);
    expect(readJson(root, "out/langs/en.json")).toEqual(artifacts.languageBundles.en);
    expect(applyRouteDefaults(readJson(root, `out/docs/versions/${versionId}/config.json`))).toEqual(artifacts.versionConfigs[versionId]);
    expect(readJson(root, "out/docs/versions/0.0.1/config.json")).toEqual({});

    // Already tagged content is written unchanged; unknown keys and languages are skipped.
    expect(readFileSync(at(root, `out/docs/versions/${versionId}/en/index.md`), "utf8")).toBe(`# Hello\n\n> Version: ${versionId}\n`);
    expect(readFileSync(at(root, `out/docs/versions/${versionId}/en/faq.md`), "utf8")).toBe(`# FAQ\n\n> Version: ${versionId}\n`);
    expect(existsSync(at(root, `out/docs/versions/${versionId}/en/unknown-page.md`))).toBe(false);
    expect(existsSync(at(root, `out/docs/versions/${versionId}/fr`))).toBe(false);
    expect(existsSync(at(root, `out/docs/versions/${versionId}/pt`))).toBe(false);

    // Extension-less html pages get a ".html" alias; other html pages and external urls are skipped.
    expect(readFileSync(at(root, `out/docs/versions/${versionId}/en/source-viewer`), "utf8")).toBe("<html>viewer</html>");
    expect(readFileSync(at(root, `out/docs/versions/${versionId}/en/source-viewer.html`), "utf8")).toBe("<html>viewer</html>");
    expect(existsSync(at(root, `out/docs/versions/${versionId}/pt/other.html`))).toBe(false);
    expect(existsSync(at(root, `out/docs/versions/${versionId}/es`))).toBe(false);

    // The fallback index only exists for languages that have index content; 0.0.1 gets the en one,
    // badged for its own version since the content was tagged for another one.
    expect(readFileSync(at(root, "out/docs/versions/0.0.1/en/index.md"), "utf8")).toBe(
      `# Hello\n\n> Version: ${versionId}\n\n> Version: 0.0.1\n`,
    );
    expect(existsSync(at(root, "out/docs/versions/0.0.1/pt"))).toBe(false);
  });

  it("tolerates artifacts without docs, html or version routes", async () => {
    const root = makeRoot();
    const artifacts: Artifacts = {
      rootConfig: {},
      languageBundles: {},
      layoutsConfig: {},
      fallbackLayoutsConfig: {},
      versionConfigs: { "1.0.0": { "routes-md": [{ path: { en: "gitpagedocs/docs/versions/1.0.0/en/index.md" } }] } },
    };

    await writeConfigOnlyOutput({
      root,
      pkgRoot: root,
      outputDir: "out",
      layoutsDir: "gitpagelayouts",
      artifacts,
      useLocalLayoutConfig: false,
      layouts: [],
      createThemeTemplate,
    });

    expect(readJson(root, "out/config.json")).toEqual({});
    expect(existsSync(at(root, "out/langs"))).toBe(false);
    expect(existsSync(at(root, "out/docs/versions/1.0.0/config.json"))).toBe(true);
    expect(existsSync(at(root, "out/docs/versions/1.0.0/en"))).toBe(false);
  });
});

describe("writeText", () => {
  it("creates missing parent folders and writes UTF-8 content", async () => {
    const root = makeRoot();
    await writeText(root, "deep/nested/file.txt", "olá\n");
    expect(readFileSync(at(root, "deep/nested/file.txt"), "utf8")).toBe("olá\n");
  });
});
