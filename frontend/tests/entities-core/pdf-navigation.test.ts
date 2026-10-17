import { expect, it } from "vitest";
import { getPageIndexByPathClick, getPathClickByRouteId, getUrlParamsForPathClick } from "@/entities/docs/model/menu-utils";
import { resolvePageHierarchy } from "@/entities/docs/lib/hierarchy/resolve-page-hierarchy";
import { resolveRouteAuthorizationTarget } from "@/features/route-authorization";
import { makeDocsData, makeSite } from "./fixtures/docs-data";
import type { ContentTypeRouteConfig, LoadedPage } from "@/entities/docs";

const RAW_PATH = "docs/guide.pdf";
const RESOLVED_PATH = "/handbook/docs/guide.pdf";
const route: ContentTypeRouteConfig = { id: 8, title: { en: "Manual" }, pdf: { pathPdf: { en: RAW_PATH } }, authorization: { enabled: true, requiredRoles: ["reader"] } };
const page: LoadedPage = { id: 8, pdf: { routeId: 8, config: route, pathPdfByLanguage: { en: RESOLVED_PATH } } };

it("resolves PDF menu paths, direct links and page identifiers without Markdown", () => {
  const data = makeDocsData({ "routes-pdf": [route] }, { pages: [page] });
  expect(getPathClickByRouteId(data, 8, "en")).toBe("page:8");
  expect(getPathClickByRouteId(makeDocsData({ "routes-pdf": [route] }), 8, "en")).toBe("page:8");
  for (const pathClick of [RAW_PATH, RESOLVED_PATH, "page:8"]) {
    expect(getPageIndexByPathClick(data, pathClick)).toBe(0);
  }
  data.pathToPageMap = { [RAW_PATH]: { pageIndex: 0, contentType: "pdf" } };
  expect(getUrlParamsForPathClick(data, RAW_PATH, "en").get("id")).toBe("8");
});

it("orders PDF sections by the route hierarchy and respects the site master switch", () => {
  const mixedPage: LoadedPage = { ...page, md: { routeId: 8, config: { id: 8, path: { en: "guide.md" } }, markdownByLanguage: {} }, pdf: { ...page.pdf!, config: { ...route, hierarchyPage: { pdf: 0, md: 1, html: 2, video: 3 } } } };
  const data = makeDocsData();
  expect(resolvePageHierarchy(mixedPage, data.config)).toEqual(["pdf", "md"]);
  expect(resolvePageHierarchy(page, data.config, "pdf")).toEqual(["pdf"]);
  expect(resolvePageHierarchy(page, { ...data.config, site: makeSite({ pdf: { enabled: false } }) })).toEqual([]);
});

it("finds PDF authorization for page identifiers and both configured and resolved paths", () => {
  const data = makeDocsData({ "routes-pdf": [route] }, { pages: [page], pathToPageMap: { [RESOLVED_PATH]: { pageIndex: 0, contentType: "pdf" } } });
  for (const pathClick of [RAW_PATH, RESOLVED_PATH, "page:8"]) {
    expect(resolveRouteAuthorizationTarget(data, pathClick, "en")).toEqual({ routeId: 8, contentType: "pdf", title: "Manual", authorization: route.authorization });
  }
});
