import { expect, it } from "vitest";
// @ts-expect-error .mjs runtime module is type-less in this package.
import { buildVersionConfig } from "../../builders/version-config-builder.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import { buildConfigArtifacts } from "../../builders/config-orchestrator.mjs";

interface MenuNode {
  id: number;
  en: { title: string; "path-click"?: string };
  pt: { title: string; "path-click"?: string };
  es: { title: string; "path-click"?: string };
  submenus?: MenuNode[];
}

function menuLeaves(nodes: MenuNode[]): MenuNode[] {
  return nodes.flatMap((node) => node.submenus ? menuLeaves(node.submenus) : [node]);
}

it("lets readers reach configuration through a section inside another section", () => {
  const config = buildVersionConfig("0.0.10", { githubOwner: "acme", githubRepo: "docs" });
  const menu = config["menus-header-md"] as MenuNode[];
  expect(menu.slice(0, 2).map((item) => item.id)).toEqual([1, 2]);
  const guides = menu.find((item) => item.en.title === "Guides");
  expect(guides?.en["path-click"]).toBeUndefined();
  const configuration = guides?.submenus?.find((item) => item.en.title === "Configure your site");
  const reference = configuration?.submenus?.find((item) => item.id === 13);
  expect(reference?.en["path-click"]).toBe("gitpagedocs/docs/versions/0.0.10/en/configuration.md");
  expect(reference?.pt["path-click"]).toBe("gitpagedocs/docs/versions/0.0.10/pt/configuration.md");
  expect(reference?.es["path-click"]).toBe("gitpagedocs/docs/versions/0.0.10/es/configuration.md");
});

it("ships practical recipes, migration, troubleshooting and contributing guides in every language", () => {
  const artifacts = buildConfigArtifacts({ githubOwner: "acme", githubRepo: "docs" }) as {
    versionConfigs: Record<string, { "routes-md": { id: number; path: Record<string, string> }[] }>;
    docs: Record<string, Record<string, string>>;
  };
  const [version, config] = Object.entries(artifacts.versionConfigs)[0];
  const guides = [
    { id: 25, file: "configuration-recipes", key: "configurationRecipes", required: "menus-header-md" },
    { id: 26, file: "migration", key: "migration", required: "0.0.1" },
    { id: 27, file: "troubleshooting", key: "troubleshooting", required: "CORS" },
    { id: 28, file: "contributing", key: "contributing", required: "pnpm run smoke:all" },
  ];
  for (const language of ["en", "pt", "es"]) {
    for (const guide of guides) {
      const route = config["routes-md"].find((candidate) => candidate.id === guide.id);
      expect(route?.path[language]).toBe(`gitpagedocs/docs/versions/${version}/${language}/${guide.file}.md`);
      expect(artifacts.docs[language][guide.key]).toContain(guide.required);
    }
  }
});

it("preserves each Markdown destination once when organizing nested categories", () => {
  const config = buildVersionConfig("0.0.10", { githubOwner: "acme", githubRepo: "docs" });
  const leaves = menuLeaves(config["menus-header-md"] as MenuNode[]);
  expect(leaves.map((item) => item.id).sort((left, right) => left - right)).toEqual([
    1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 30,
  ]);
  for (const language of ["en", "pt", "es"] as const) {
    const paths = leaves.map((item) => item[language]["path-click"]);
    expect(new Set(paths).size).toBe(22);
    expect(paths.every((value) => value?.includes(`/${language}/`) && value.endsWith(".md"))).toBe(true);
  }
});
