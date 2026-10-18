import { expect, it } from "vitest";
import { resolveContainerPages } from "@/entities/docs/lib/pagination/resolve-container-pages";
import type { LoadedPage, LoadedContentBlock } from "@/entities/docs";

it("reuses one Markdown container and updates file, title and description from the selected item", () => {
  const pages: LoadedPage[] = [
    { id: 1, md: { routeId: 1, config: { id: 1, pagination: { items: [{ routeId: 1 }, { routeId: 2, title: { en: "Second lesson" }, description: { en: "Next steps" } }] } }, markdownByLanguage: { en: "<p>First file</p>" } } },
    { id: 2, md: { routeId: 2, config: { id: 2, title: { en: "Original title" } }, markdownByLanguage: { en: "<p>Second file</p>" } } },
  ];
  const result = resolveContainerPages({ pages, positions: { "page-1-md": 1 }, defaults: {}, canAccess: () => true });
  expect(result.pages[0]?.id).toBe(1);
  expect(result.pages[0]?.md?.markdownByLanguage.en).toBe("<p>Second file</p>");
  expect(result.pages[0]?.md?.config).toMatchObject({ title: { en: "Second lesson" }, description: { en: "Next steps" }, browseAll: false });
  expect(result.containers[0]).toMatchObject({ key: "page-1-md", index: 1, type: "md", ownerPageId: 1 });
  expect(result.containers[0]?.items).toHaveLength(2);
  expect(result.issues).toEqual([]);
});

it("supports disabling pagination and merges per-document controls with site defaults", () => {
  const pages: LoadedPage[] = [{ id: 1, md: { routeId: 1, config: { id: 1, pagination: { items: [{ routeId: 1 }], controls: { last: false } } }, markdownByLanguage: { en: "One" } } }];
  expect(resolveContainerPages({ pages, positions: {}, defaults: { enabled: false }, canAccess: () => true }).containers).toEqual([]);
  const result = resolveContainerPages({ pages, positions: {}, defaults: { controls: { first: false, next: true }, alignment: "left" }, canAccess: () => true });
  expect(result.containers[0]?.options.controls).toEqual({ first: false, next: true, last: false });
  expect(result.containers[0]?.options.alignment).toBe("left");
});

it("filters protected content, reports missing routes and clamps selection after available pages change", () => {
  const pages: LoadedPage[] = [
    { id: 1, md: { routeId: 1, config: { id: 1, pagination: { items: [{ routeId: 1 }, { routeId: 2 }, { routeId: 999 }] } }, markdownByLanguage: { en: "Public" } } },
    { id: 2, md: { routeId: 2, config: { id: 2, authorization: { requiredRoles: ["private"] } }, markdownByLanguage: { en: "Private" } } },
  ];
  const result = resolveContainerPages({ pages, positions: { "page-1-md": 99 }, canAccess: (auth) => !auth?.requiredRoles?.length });
  expect(result.containers[0]?.items.map((item) => item.block.content.routeId)).toEqual([1]);
  expect(result.containers[0]?.index).toBe(0);
  expect(result.pages[0]?.md?.markdownByLanguage.en).toBe("Public");
  expect(result.issues).toHaveLength(1);
});

it("paginates HTML, video, audio and PDF blocks independently inside the same page", () => {
  const ownerConfig = { id: 10, pagination: { items: [{ routeId: 10 }, { routeId: 20 }] } };
  const sources: LoadedContentBlock[] = [
    { id: "html", type: "html", content: { routeId: 20, config: { id: 20 }, htmlByLanguage: { en: "<p>Second HTML</p>" } } },
    { id: "video", type: "video", content: { routeId: 20, config: { id: 20 }, pathVideoByLanguage: { en: "second.mp4" }, videoTypeByLanguage: { en: "mp4" } } },
    { id: "audio", type: "audio", content: { routeId: 20, config: { id: 20 }, pathAudioByLanguage: { en: "second.mp3" }, audioTypeByLanguage: { en: "mp3" } } },
    { id: "pdf", type: "pdf", content: { routeId: 20, config: { id: 20 }, pathPdfByLanguage: { en: "second.pdf" } } },
  ];
  const owners = sources.map((block) => ({ ...block, content: { ...block.content, routeId: 10, config: ownerConfig } })) as LoadedContentBlock[];
  const result = resolveContainerPages({
    pages: [{ id: 1, blocks: owners }, { id: 2, blocks: sources }], defaults: {}, canAccess: () => true,
    positions: { "page-1-html": 1, "page-1-video": 0, "page-1-audio": 1, "page-1-pdf": 1 },
  });
  expect(result.pages[0]?.blocks?.map((block) => block.content.routeId)).toEqual([20, 10, 20, 20]);
  expect(result.containers.map((container) => container.index)).toEqual([1, 0, 1, 1]);
});

it("does not expose a source whose containing page requires authorization", () => {
  const pages: LoadedPage[] = [
    { id: 1, md: { routeId: 1, config: { id: 1, pagination: { items: [{ routeId: 1 }, { routeId: 2 }] } }, markdownByLanguage: { en: "Public" } } },
    { id: 2, authorization: { requiredRoles: ["private"] }, md: { routeId: 2, config: { id: 2 }, markdownByLanguage: { en: "Protected page" } } },
  ];
  const result = resolveContainerPages({ pages, positions: { "page-1-md": 1 }, canAccess: auth => !auth?.requiredRoles?.length });
  expect(result.pages[0]?.md?.markdownByLanguage.en).toBe("Public");
  expect(result.containers[0]?.items).toHaveLength(1);
});

it("reports malformed pagination from JSON while leaving valid content available", () => {
  const pages = JSON.parse('[{"id":1,"md":{"routeId":1,"config":{"id":1,"pagination":{"items":[null,{"routeId":"1"},{"routeId":1}]}},"markdownByLanguage":{"en":"Public"}}}]') as LoadedPage[];
  const result = resolveContainerPages({ pages, positions: {}, canAccess: () => true });
  expect(result.containers[0]?.items).toHaveLength(1);
  expect(result.issues).toHaveLength(2);
  expect(result.pages[0]?.md?.markdownByLanguage.en).toBe("Public");
});

it.each([null, {}, "items"])("keeps the original content when the items collection is invalid: %j", items => {
  const pages = JSON.parse(JSON.stringify([{ id: 1, md: { routeId: 1, config: { id: 1, pagination: { items } }, markdownByLanguage: { en: "Original" } } }])) as LoadedPage[];
  const result = resolveContainerPages({ pages, positions: {}, canAccess: () => true });
  expect(result.containers).toEqual([]);
  expect(result.pages[0]?.md?.markdownByLanguage.en).toBe("Original");
  expect(result.issues).toHaveLength(1);
});

it.each([Number.NaN, Number.POSITIVE_INFINITY, 0.5])("resets an invalid stored position %s to the first item", position => {
  const pages: LoadedPage[] = [{ id: 1, md: { routeId: 1, config: { id: 1, pagination: { items: [{ routeId: 1 }, { routeId: 1 }] } }, markdownByLanguage: { en: "First" } } }];
  const result = resolveContainerPages({ pages, positions: { "page-1-md": position }, canAccess: () => true });
  expect(result.containers[0]?.index).toBe(0);
  expect(result.pages[0]?.md?.markdownByLanguage.en).toBe("First");
});

it("uses the markers of the selected file instead of carrying targets from the previous document", () => {
  const pages: LoadedPage[] = [
    { id: 1, md: { routeId: 1, config: { id: 1, markdownMarkers: { items: [{ id: "first", text: "First" }] }, pagination: { items: [{ routeId: 1 }, { routeId: 2 }] } }, markdownByLanguage: { en: "First" } } },
    { id: 2, md: { routeId: 2, config: { id: 2 }, markdownByLanguage: { en: "Second" } } },
  ];
  const result = resolveContainerPages({ pages, positions: { "page-1-md": 1 }, canAccess: () => true });
  expect(result.pages[0]?.md?.config).not.toHaveProperty("markdownMarkers.items");
});
