import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { buildRootConfig } from "../builders/root-config-builder.mjs";
// @ts-expect-error .mjs content module has no declaration file.
import { DOCS as documentationTemplates } from "../content/docs.mjs";
// @ts-expect-error .mjs output module has no declaration file.
import { writeConfigOnlyOutput as writeOutput } from "../runtime/output.mjs";

it("offers documentation versions from 0.0.9 through the current release in descending order", () => {
  expect(buildRootConfig().VersionControl.versions).toMatchObject([
    { id: "0.0.16", path: "gitpagedocs/docs/versions/0.0.16/config.json" },
    { id: "0.0.15", path: "gitpagedocs/docs/versions/0.0.15/config.json" },
    { id: "0.0.14", path: "gitpagedocs/docs/versions/0.0.14/config.json" },
    { id: "0.0.13", path: "gitpagedocs/docs/versions/0.0.13/config.json" },
    { id: "0.0.12", path: "gitpagedocs/docs/versions/0.0.12/config.json" },
    { id: "0.0.11", path: "gitpagedocs/docs/versions/0.0.11/config.json" },
    { id: "0.0.10", path: "gitpagedocs/docs/versions/0.0.10/config.json" },
    { id: "0.0.9", path: "gitpagedocs/docs/versions/0.0.9/config.json" },
  ]);
});

interface RecipeConfig {
  site: { docsVersion: string };
  VersionControl: { versions: { id: string; path: string }[] };
}

interface RecipeOutputOptions {
  root: string;
  outputDir: string;
  artifacts: {
    rootConfig: ReturnType<typeof buildRootConfig>;
    languageBundles: Record<string, unknown>;
    docs: Record<string, Record<string, string>>;
    versionConfigs: Record<string, { "routes-md": { path: Record<string, string> }[] }>;
  };
  useLocalLayoutConfig: boolean;
}

const DOCS = documentationTemplates as Record<string, Record<string, string>>;
const writeConfigOnlyOutput = writeOutput as (options: RecipeOutputOptions) => Promise<void>;
const LANGUAGES = ["en", "pt", "es"] as const;
const RECIPE_FILE = "configuration-recipes.md";
const CURRENT_PACKAGE = "@gitpagedocs/cli@0.0.16";
const HISTORICAL_VERSIONS = ["0.0.16", "0.0.15", "0.0.14", "0.0.13", "0.0.12", "0.0.11", "0.0.10", "0.0.9"];

it.each(["0.0.16", "0.0.15", "0.0.14", "0.0.9"])(
  "generates coherent recipe configuration for documentation %s without changing package versions",
  async (versionId) => {
    const root = await mkdtemp(path.join(tmpdir(), "gpd-recipe-version-"));
    try {
      const documentationPaths = Object.fromEntries(LANGUAGES.map((language) => [
        language, `gitpagedocs/docs/versions/${versionId}/${language}/${RECIPE_FILE}`,
      ]));
      await writeConfigOnlyOutput({
        root,
        outputDir: "gitpagedocs",
        artifacts: {
          rootConfig: buildRootConfig(),
          languageBundles: {},
          docs: Object.fromEntries(LANGUAGES.map((language) => [
            language, { configurationRecipes: DOCS[language].configurationRecipes },
          ])),
          versionConfigs: { [versionId]: { "routes-md": [{ path: documentationPaths }] } },
        },
        useLocalLayoutConfig: false,
      });

      for (const language of LANGUAGES) {
        const content = await readFile(path.join(root, documentationPaths[language]), "utf8");
        const jsonExample = content.match(/```json\r?\n([\s\S]*?)\r?\n```/)?.[1];
        expect(jsonExample).toBeDefined();
        const recipe = JSON.parse(jsonExample!) as RecipeConfig;
        expect(recipe.site.docsVersion).toBe(versionId);
        expect(recipe.VersionControl.versions).toEqual([
          { id: versionId, path: `gitpagedocs/docs/versions/${versionId}/config.json` },
        ]);
        expect(content).toContain(CURRENT_PACKAGE);
        const introduction = content.slice(0, content.indexOf("```json"));
        for (const historicalVersion of HISTORICAL_VERSIONS) {
          expect(introduction).toContain(historicalVersion);
        }
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
