import { expect, it } from "vitest";
import type { MenuEntry } from "@/entities/docs";
import { buildContainerSearchEntries } from "@/entities/docs/lib/pagination/container-search-entries";
import { resolveContainerPages } from "@/entities/docs/lib/pagination/resolve-container-pages";

it("indexes each paginated file with its own title and opens that item inside its owner container", () => {
  const owner: MenuEntry = { id: 1, key: "guide", title: "Guide", searchLabel: "Docs > Guide", pathClick: "docs/guide.md", ancestorKeys: ["docs"], active: true, level: 2 };
  const { containers } = resolveContainerPages({
    positions: {}, canAccess: () => true,
    pages: [
      { id: 1, md: { routeId: 1, config: { id: 1, pagination: { items: [{ routeId: 2, title: { en: "Second lesson" } }] } }, markdownByLanguage: { en: "First" } } },
      { id: 2, md: { routeId: 2, config: { id: 2 }, markdownByLanguage: { en: "Second" } } },
    ],
  });
  const entries = buildContainerSearchEntries({ containers, menuEntries: [owner], language: "en" });
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({ title: "Second lesson", pathClick: "docs/guide.md", containerPage: { key: "page-1-md", index: 0 } });
  expect(entries[0]?.searchLabel).toContain("Docs > Guide");
  expect(entries[0]?.searchLabel).toContain("Second lesson");
});
