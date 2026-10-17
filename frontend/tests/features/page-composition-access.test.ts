// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { useRouteAuthorization } from "@/features/route-authorization/model/use-route-authorization";
import { makeDocsData } from "../widgets-model/fixtures";

afterEach(() => { cleanup(); localStorage.clear(); });

it("excludes a protected composition from the initial accessible page until its requirements are met", async () => {
  const data = makeDocsData();
  data.pages = [{ id: 39, authorization: { requiredRoles: ["reader"] }, blocks: [] }, ...data.pages];
  const { result, rerender } = renderHook(({ query }) => useRouteAuthorization(data, "en", new URLSearchParams(query)), {
    initialProps: { query: "" },
  });
  await waitFor(() => expect(result.current.providersResolved).toBe(true));
  expect(result.current.isPageAccessible(0)).toBe(false);
  expect(result.current.firstAccessiblePageIndex).toBe(1);
  rerender({ query: "authRoles=reader" });
  await waitFor(() => expect(result.current.isPageAccessible(0)).toBe(true));
  expect(result.current.firstAccessiblePageIndex).toBe(0);
});
