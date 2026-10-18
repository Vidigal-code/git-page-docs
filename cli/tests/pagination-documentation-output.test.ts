import { afterEach, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

interface Route { id: number; path?: Record<string, string> }
interface VersionConfig { "routes-md": Route[]; "routes-html": Route[]; "menus-header-md": unknown[] }
interface Artifacts {
  rootConfig: Record<string, unknown>;
  languageBundles: Record<string, unknown>;
  versionConfigs: Record<string, VersionConfig>;
  docs: Record<string, Record<string, string>>;
  docsHtml: Record<string, Record<string, string>>;
}
interface OutputOptions {
  root: string; pkgRoot: string; outputDir: string; layoutsDir: string;
  artifacts: Artifacts; useLocalLayoutConfig: boolean; layouts: readonly unknown[];
  createThemeTemplate: () => Record<string, never>;
}
const packageRoot = path.resolve(__dirname, "..");
const generatorPath = pathToFileURL(path.join(packageRoot, "builders/config-orchestrator.mjs")).href;
const outputPath = pathToFileURL(path.join(packageRoot, "runtime/output.mjs")).href;
const { buildConfigArtifacts } = await import(generatorPath) as { buildConfigArtifacts(): Artifacts };
const { writeConfigOnlyOutput } = await import(outputPath) as { writeConfigOnlyOutput(options: OutputOptions): Promise<void> };
const temporaryRoots: string[] = [];
afterEach(() => { for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true }); });

async function generateDocumentation(): Promise<{ root: string; config: VersionConfig }> {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-pagination-docs-"));
  temporaryRoots.push(root);
  const artifacts = buildConfigArtifacts();
  const version = "0.0.13";
  const config = artifacts.versionConfigs[version];
  artifacts.versionConfigs = { [version]: config };
  await writeConfigOnlyOutput({ root, pkgRoot: packageRoot, outputDir: "gitpagedocs", layoutsDir: "layouts", artifacts, useLocalLayoutConfig: false, layouts: [], createThemeTemplate: () => ({}) });
  return { root, config };
}

it("writes localized pagination and marker guides reachable through their generated routes and menus", async () => {
  const { root, config } = await generateDocumentation();
  for (const guide of [{ id: 41, file: "container-pagination.md" }, { id: 42, file: "markdown-markers.md" }]) {
    const route = config["routes-md"].find(candidate => candidate.id === guide.id);
    expect(route).toBeDefined();
    for (const language of ["en", "pt", "es"]) {
      const expectedPath = `gitpagedocs/docs/versions/0.0.13/${language}/${guide.file}`;
      expect(route?.path?.[language]).toBe(expectedPath);
      expect(JSON.stringify(config["menus-header-md"])).toContain(expectedPath);
      expect(readFileSync(path.join(root, expectedPath), "utf8")).toMatch(/^# .+/);
    }
  }
});
it("writes both localized HTML pages, the first Markdown lesson and unchanged local media assets", async () => {
  const { root } = await generateDocumentation();
  const versionRoot = path.join(root, "gitpagedocs/docs/versions/0.0.13");
  for (const language of ["en", "pt", "es"]) {
    const first = readFileSync(path.join(versionRoot, language, "pagination-first.html"), "utf8");
    const second = readFileSync(path.join(versionRoot, language, "pagination-second.html"), "utf8");
    expect(first).toContain(`lang="${language}"`);
    expect(second).toContain(`lang="${language}"`);
    expect(first).not.toBe(second);
    expect(readFileSync(path.join(versionRoot, language, "pagination-first.md"), "utf8")).toMatch(/^# .+\n/);
  }
  for (const file of ["pagination-low.wav", "pagination-high.wav", "pagination-reference.pdf"]) {
    expect(readFileSync(path.join(versionRoot, "en", file))).toEqual(readFileSync(path.join(packageRoot, "content/assets", file)));
  }
});
it("preserves pagination on every content route builder and keeps Markdown marker options separate from the heading filter", async () => {
  const buildersPath = pathToFileURL(path.join(packageRoot, "builders/route-builders.mjs")).href;
  const builders = await import(buildersPath) as Record<string, (...args: unknown[]) => Record<string, unknown>>;
  const pagination = { items: [{ routeId: 1 }, { routeId: 2 }], placement: "both", alignment: "center" };
  const markdownMarkers = { items: [{ id: "note", text: "Important", label: "Note" }] };
  const paths = { en: "first.md" };
  const titles = { en: "First" };
  const descriptions = { en: "Description" };
  const options = { pagination, markdownMarkers, RouteGuideSpeciFicbrand: ["setup"] };
  const markdown = builders.buildMdRoute("0.0.13", 1, paths, titles, descriptions, options);
  const routes = [
    markdown,
    builders.buildHtmlRoute("0.0.13", 1, { en: "first.html" }, titles, descriptions, options),
    builders.buildVideoRoute("0.0.13", 1, "mp4", "first.mp4", titles, descriptions, options),
    builders.buildAudioRoute("0.0.13", 1, "wav", "first.wav", titles, descriptions, options),
    builders.buildPdfRoute({ id: 1, titles, descriptions }, "first.pdf", options),
  ];
  for (const route of routes) expect(route.pagination).toEqual(pagination);
  expect(markdown.markdownMarkers).toEqual(markdownMarkers);
  expect(markdown.RouteGuideSpeciFicbrand).toEqual(["setup"]);
});