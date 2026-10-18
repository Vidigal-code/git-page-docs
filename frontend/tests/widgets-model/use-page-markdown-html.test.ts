// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { usePageMarkdownHtml } from "@/entities/docs/lib/markdown/use-page-markdown-html";
import type { LoadedPage } from "@/entities/docs";

afterEach(cleanup);

it("keeps configured highlights in focus content with separate IDs from the underlying document", () => {
  const page: LoadedPage = { id: 1, md: { routeId: 1, config: {
    id: 1, path: { en: "one.md" }, markdownMarkers: { items: [{ id: "note", text: "Important", label: "Important detail" }] },
  }, markdownByLanguage: { en: "<h2>Read</h2><p>Important note.</p>" } } };
  const { result } = renderHook(() => usePageMarkdownHtml(page, { language: "en", pageIndex: 0, legacyDocs: [], markerDefaults: {} }));
  expect(result.current).toContain('id="focus-1--markdown-marker-note"');
  expect(result.current).toContain('data-markdown-marker-label="Important detail"');
  expect(result.current).toContain(">Important</mark> note.");
});
