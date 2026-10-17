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
  expect(guides?.en["path-click"]).toBe("gitpagedocs/docs/versions/0.0.10/en/guides.md");
  const configuration = guides?.submenus?.find((item) => item.en.title === "Configure your site");
  expect(configuration?.en["path-click"]).toBe("gitpagedocs/docs/versions/0.0.10/en/configure-your-site.md");
  const reference = configuration?.submenus?.find((item) => item.id === 13);
  expect(reference?.en["path-click"]).toBe("gitpagedocs/docs/versions/0.0.10/en/configuration.md");
  expect(reference?.pt["path-click"]).toBe("gitpagedocs/docs/versions/0.0.10/pt/configuration.md");
  expect(reference?.es["path-click"]).toBe("gitpagedocs/docs/versions/0.0.10/es/configuration.md");
});

it("gives every parent menu a localized Markdown route while preserving its children", () => {
  const config = buildVersionConfig("0.0.11", { githubOwner: "acme", githubRepo: "docs" });
  const parents = (nodes: MenuNode[]): MenuNode[] => nodes.flatMap((node) =>
    node.submenus ? [node, ...parents(node.submenus)] : []);
  const groups = parents(config["menus-header-md"] as MenuNode[]);
  expect(groups.map((node) => node.id)).toEqual([1000, 1001, 1002, 1003, 1100, 1101, 1102, 1200]);
  for (const group of groups) {
    expect(group.submenus?.length).toBeGreaterThan(0);
    for (const language of ["en", "pt", "es"] as const) {
      const destination = group[language]["path-click"];
      expect(destination).toMatch(new RegExp(`/0\\.0\\.11/${language}/.+\\.md$`));
      expect(config["routes-md"].some((route: { path: Record<string, string> }) => route.path[language] === destination)).toBe(true);
    }
  }
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
    1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 30, 39, 40,
  ]);
  for (const language of ["en", "pt", "es"] as const) {
    const paths = leaves.map((item) => item[language]["path-click"]);
    expect(new Set(paths).size).toBe(24);
    expect(paths.every((value) => value === "page:39" || (value?.includes(`/${language}/`) && value.endsWith(".md")))).toBe(true);
  }
});

it("preserves correct Portuguese and Spanish accents in public language bundles and docs", () => {
  const artifacts = buildConfigArtifacts();
  expect(artifacts.languageBundles.pt.langmenu.pt).toBe("Português");
  expect(artifacts.languageBundles.pt.langmenu.en).toBe("Inglês");
  expect(artifacts.docs.pt.configuration).toMatch(/^# Configuração/);
  expect(artifacts.docs.es.configuration).toMatch(/^# Configuración/);
});

it("generates one ordered page containing repeated Markdown, HTML, video, audio and PDF blocks", () => {
  const config = buildVersionConfig("0.0.11", { githubOwner: "acme", githubRepo: "docs" });
  const page = config.pages.find((item: { id: number }) => item.id === 39);
  expect(page.blocks.map((block: { type: string }) => block.type)).toEqual([
    "md", "md", "md", "html", "html", "video", "video", "audio", "audio", "pdf", "pdf", "pdf",
  ]);
  expect(new Set(page.blocks.map((block: { id: string }) => block.id)).size).toBe(12);
  for (const block of page.blocks as { type: string; routeId: number }[]) {
    expect(config[`routes-${block.type}`].some((route: { id: number }) => route.id === block.routeId)).toBe(true);
  }
});
