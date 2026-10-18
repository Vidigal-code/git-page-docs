import { expect, it } from "vitest";
type ContentType = "md" | "html" | "video" | "audio" | "pdf";
interface PaginatedRoute { id: number; pagination?: { items: { routeId: number }[] } }
interface ComposedPage { id: number; blocks: { type: ContentType; routeId: number }[] }
type VersionConfig = Record<`routes-${ContentType}`, PaginatedRoute[]> & { pages: ComposedPage[] };
interface SiteConfig {
  containerPagination: { labels: { next: Record<string, string> } };
  markdownMarkers: { enabled: boolean };
}

const defaultsPath = new URL("../data/default-site-config.mjs", import.meta.url).href;
const builderPath = new URL("../builders/version-config-builder.mjs", import.meta.url).href;
const { getDefaultSiteConfig } = await import(defaultsPath) as { getDefaultSiteConfig(baseUrl: string): SiteConfig };
const { buildVersionConfig } = await import(builderPath) as { buildVersionConfig(version: string): VersionConfig };

it("scaffolds configurable pagination with four icon controls, a counter and bottom-right alignment", () => {
  const site = getDefaultSiteConfig("https://example.com/project");
  expect(site.containerPagination).toMatchObject({
    enabled: true, alignment: "right", placement: "bottom", display: "icon", showCount: true,
    controls: { first: true, previous: true, next: true, last: true },
  });
  expect(site.containerPagination.labels.next).toEqual({ en: "Next page", pt: "Próxima página", es: "Página siguiente" });
  expect(site.markdownMarkers.enabled).toBe(true);
});

it("includes a working page with independent paginated containers for all five file types", () => {
  const config = buildVersionConfig("0.0.13");
  const example = config.pages.find(page => page.id === 50);
  expect(example?.blocks.map(block => block.type)).toEqual(["md", "html", "video", "audio", "pdf"]);
  for (const block of example?.blocks ?? []) {
    const routes = config[`routes-${block.type}`];
    const owner = routes.find(route => route.id === block.routeId);
    expect(owner?.pagination?.items.length).toBeGreaterThanOrEqual(2);
    for (const item of owner?.pagination?.items ?? []) expect(routes.some(route => route.id === item.routeId)).toBe(true);
  }
});
