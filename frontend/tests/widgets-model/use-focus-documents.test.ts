// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { MenuEntry } from "@/entities/docs";
import { useFocusDocuments } from "@/widgets/docs-shell/model/use-focus-documents";
import { GUIDE, INTRO, LANDING, makeDocsData } from "./fixtures";

afterEach(cleanup);

function entry(pathClick: string, id: number): MenuEntry {
  return { key: String(id), id, title: pathClick, pathClick, active: false, level: 3, searchLabel: pathClick, ancestorKeys: ["nested"] };
}

it("follows menu order through readable authorized markdown only", () => {
  const data = makeDocsData();
  const entries = [entry(GUIDE, 1), entry(LANDING, 2), entry(INTRO, 3), entry(GUIDE, 4)];
  const { result, rerender } = renderHook(({ language, deniedPath }) => useFocusDocuments({
    data, entries, language, currentPageIndex: 1, isPathAllowed: (path) => path !== deniedPath,
  }), { initialProps: { language: "en", deniedPath: "" } });

  expect(result.current.documents.map((document) => document.pathClick)).toEqual([GUIDE, INTRO]);
  expect(result.current.previousDocument).toBeUndefined();
  expect(result.current.nextDocument?.pathClick).toBe(INTRO);
  rerender({ language: "en", deniedPath: INTRO });
  expect(result.current.nextDocument).toBeUndefined();
  rerender({ language: "pt", deniedPath: "" });
  expect(result.current.documents).toEqual([]);
});

it("skips loader placeholders for unreadable documents and missing translations", () => {
  const data = makeDocsData();
  const intro = data.pages?.[0]?.md;
  const guide = data.pages?.[1]?.md;
  if (!intro || !guide) throw new Error("Markdown fixtures are required");
  intro.sourceByLanguage = { en: "# Introduction" };
  intro.markdownByLanguage.pt = "<p>Missing language file path in config.</p>";
  guide.sourceByLanguage = {};
  guide.markdownByLanguage.en = "<p>Unable to load local markdown file.</p>";
  const entries = [entry(INTRO, 1), entry(GUIDE, 2)];
  const { result, rerender } = renderHook(({ language }) => useFocusDocuments({
    data, entries, language, currentPageIndex: 0, isPathAllowed: () => true,
  }), { initialProps: { language: "en" } });
  expect(result.current.documents.map((document) => document.pathClick)).toEqual([INTRO]);
  expect(result.current.nextDocument).toBeUndefined();
  rerender({ language: "pt" });
  expect(result.current.documents).toEqual([]);
});
