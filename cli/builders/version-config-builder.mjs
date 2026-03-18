/** Build version config (routes, menus) for each doc version */

import {
  ROUTE_PATHS,
  VIDEO_IDS,
  PAGE2_AUDIO,
  SOURCE_VIEWER_META,
} from "../data/path-mappings.mjs";
import {
  ROUTE_META_ID1,
  ROUTE_META_ID2,
  ROUTE_META_ID3,
  ROUTE_META_ID4,
  ROUTE_META_ID5,
  VIDEO_META_ID1,
  VIDEO_META_ID2,
  VIDEO_META_ID3,
  VIDEO_META_ID4,
  DEFAULT_HIERARCHY,
} from "../data/route-metas.mjs";
import { buildMdRoute, buildHtmlRoute, buildVideoRoute } from "./route-builders.mjs";

const ROUTE_METAS = { 1: ROUTE_META_ID1, 2: ROUTE_META_ID2, 3: ROUTE_META_ID3, 4: ROUTE_META_ID4, 5: ROUTE_META_ID5 };
const VIDEO_METAS = { 1: VIDEO_META_ID1, 2: VIDEO_META_ID2, 3: VIDEO_META_ID3, 4: VIDEO_META_ID4 };

function buildVersionMdRoutes(versionId) {
  const base = `gitpagedocs/docs/versions/${versionId}`;
  return [1, 2, 3, 4, 5].map((id) => {
    const paths = ROUTE_PATHS[id];
    const meta = ROUTE_METAS[id];
    const pathByLang = {
      pt: `${base}/pt/${paths.pt}`,
      en: `${base}/en/${paths.en}`,
      es: `${base}/es/${paths.es}`,
    };
    const routeOptions = id === 2 ? { audio: PAGE2_AUDIO } : {};
    return buildMdRoute(versionId, id, pathByLang, meta.titles, meta.descriptions, routeOptions);
  });
}

function buildVersionHtmlRoutes(versionId) {
  const base = `gitpagedocs/docs/versions/${versionId}`;
  const pathByLangSource = {
    pt: `${base}/pt/source-viewer`,
    en: `${base}/en/source-viewer`,
    es: `${base}/es/source-viewer`,
  };
  return [
    buildHtmlRoute(versionId, 1, pathByLangSource, SOURCE_VIEWER_META.titles, SOURCE_VIEWER_META.descriptions, {
      container: "full",
      blockLink: true,
    }),
  ];
}

function buildVersionVideoRoutes(versionId) {
  return [1, 2, 3, 4].map((id) =>
    buildVideoRoute(
      versionId,
      id,
      "youtube",
      VIDEO_IDS[id - 1],
      VIDEO_METAS[id].title,
      VIDEO_METAS[id].description
    )
  );
}

function buildVersionMenus(versionId) {
  const base = `gitpagedocs/docs/versions/${versionId}`;
  const menuMd = [1, 2, 3, 4, 5].map((id) => ({
    id: id,
    pt: { title: ROUTE_METAS[id].titles.pt, "path-click": `${base}/pt/${ROUTE_PATHS[id].pt}` },
    en: { title: ROUTE_METAS[id].titles.en, "path-click": `${base}/en/${ROUTE_PATHS[id].en}` },
    es: { title: ROUTE_METAS[id].titles.es, "path-click": `${base}/es/${ROUTE_PATHS[id].es}` },
  }));
  const menuHtml = [
    {
      id: 1,
      pt: { title: "Código fonte", "path-click": `${base}/pt/source-viewer` },
      en: { title: "Source code", "path-click": `${base}/en/source-viewer` },
      es: { title: "Código fuente", "path-click": `${base}/es/source-viewer` },
    },
  ];
  const menuVideo = [1, 2, 3, 4].map((id) => ({
    id: id,
    pt: { title: VIDEO_METAS[id].title.pt.slice(0, 40) + "...", "path-click": `page:${id}` },
    en: { title: VIDEO_METAS[id].title.en.slice(0, 40) + "...", "path-click": `page:${id}` },
    es: { title: VIDEO_METAS[id].title.es.slice(0, 40) + "...", "path-click": `page:${id}` },
  }));
  return { md: menuMd, html: menuHtml, video: menuVideo };
}

/**
 * Build version config for a single doc version.
 * @param {string} versionId - e.g. "1.0.0", "1.1.0", "1.1.1"
 * @returns {object} Version config with routes-md, routes-html, routes-video, menus, hierarchy
 */
export function buildVersionConfig(versionId) {
  return {
    "routes-md": buildVersionMdRoutes(versionId),
    "routes-html": buildVersionHtmlRoutes(versionId),
    "routes-video": buildVersionVideoRoutes(versionId),
    "menus-header-md": buildVersionMenus(versionId).md,
    "menus-header-html": buildVersionMenus(versionId).html,
    "menus-header-video": buildVersionMenus(versionId).video,
    hierarchyPage: DEFAULT_HIERARCHY,
    hierarchyMenu: DEFAULT_HIERARCHY,
  };
}
