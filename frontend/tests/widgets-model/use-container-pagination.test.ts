// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useContainerPagination } from "@/widgets/docs-shell/model/use-container-pagination";
import { makeDocsData } from "./fixtures";

afterEach(cleanup);

it("keeps the selected container page synchronized and resets it when the language changes", () => {
  const data = makeDocsData();
  const config = data.pages?.[0]?.md?.config;
  if (!config) throw new Error("A Markdown fixture is required");
  Object.assign(config, { pagination: { items: [{ routeId: 1 }, { routeId: 2 }] } });
  const { result, rerender } = renderHook(({ language }) => useContainerPagination({ data, language, canAccess: () => true }), { initialProps: { language: "en" } });
  act(() => result.current.select({ key: "page-1-md", index: 1 }));
  expect(result.current.pages[0]?.md?.routeId).toBe(2);
  expect(result.current.containers[0]?.index).toBe(1);
  act(() => result.current.select({ key: "page-1-md", index: 99 }));
  expect(result.current.containers[0]?.index).toBe(1);
  rerender({ language: "pt" });
  expect(result.current.containers[0]?.index).toBe(0);
});
