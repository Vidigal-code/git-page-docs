/** Build version config (routes, menus) for each doc version */

import {
  ROUTE_PATHS,
  VIDEO_IDS,
  AUDIO_IDS,
  PAGE2_AUDIO,
} from "../data/path-mappings.mjs";
import {
  ROUTE_META_ID1,
  ROUTE_META_ID2,
  ROUTE_META_ID3,
  ROUTE_META_ID4,
  ROUTE_META_ID5,
  ROUTE_META_ID6,
  VIDEO_META_ID1,
  VIDEO_META_ID2,
  VIDEO_META_ID3,
  VIDEO_META_ID4,
  AUDIO_META_ID12,
  SOURCE_VIEWER_META,
  DEFAULT_HIERARCHY,
} from "../data/route-metas.mjs";
import { buildAudioRoute, buildMdRoute, buildSourceViewerRoute, buildVideoRoute } from "./route-builders.mjs";

const ROUTE_METAS = {
  1: ROUTE_META_ID1,
  2: ROUTE_META_ID2,
  3: ROUTE_META_ID3,
  4: ROUTE_META_ID4,
  5: ROUTE_META_ID5,
  6: ROUTE_META_ID6,
};
const VIDEO_METAS = { 1: VIDEO_META_ID1, 2: VIDEO_META_ID2, 3: VIDEO_META_ID3, 4: VIDEO_META_ID4 };

function buildVersionMdRoutes(versionId) {
  const base = `gitpagedocs/docs/versions/${versionId}`;
  return [1, 2, 3, 4, 5, 6].map((id) => {
    const paths = ROUTE_PATHS[id];
    const meta = ROUTE_METAS[id];
    const pathByLang = {
      pt: `${base}/pt/${paths.pt}`,
      en: `${base}/en/${paths.en}`,
      es: `${base}/es/${paths.es}`,
    };
    const routeOptions = {
      ...(id === 2 ? { audio: PAGE2_AUDIO } : {}),
    };
    return buildMdRoute(versionId, id, pathByLang, meta.titles, meta.descriptions, routeOptions);
  });
}

function buildVersionVideoRoutes(versionId) {
  return [1, 2, 3, 4].map((id) =>
    buildVideoRoute(
      versionId,
      id + 7,
      "youtube",
      VIDEO_IDS[id - 1],
      VIDEO_METAS[id].title,
      VIDEO_METAS[id].description,
    )
  );
}

function buildVersionAudioRoutes(versionId) {
  return [
    buildAudioRoute(
      versionId,
      AUDIO_META_ID12.id,
      "youtube",
      AUDIO_IDS[0],
      AUDIO_META_ID12.title,
      AUDIO_META_ID12.description,
    ),
  ];
}

function buildVersionSourceViewerRoutes() {
  return [
    buildSourceViewerRoute(
      SOURCE_VIEWER_META.id,
      "https://github.com/Vidigal-code/git-page-docs/tree/main",
      SOURCE_VIEWER_META.titles,
      SOURCE_VIEWER_META.descriptions,
    ),
  ];
}

function buildVersionMenus(versionId) {
  const base = `gitpagedocs/docs/versions/${versionId}`;
  const menuMd = [1, 2, 3, 4, 5, 6].map((id) => ({
    id,
    pt: { title: ROUTE_METAS[id].titles.pt, "path-click": `${base}/pt/${ROUTE_PATHS[id].pt}` },
    en: { title: ROUTE_METAS[id].titles.en, "path-click": `${base}/en/${ROUTE_PATHS[id].en}` },
    es: { title: ROUTE_METAS[id].titles.es, "path-click": `${base}/es/${ROUTE_PATHS[id].es}` },
  }));
  const menuVideo = [1, 2, 3, 4].map((id) => ({
    id: id + 7,
    pt: { title: `${VIDEO_METAS[id].title.pt.slice(0, 40)}...`, "path-click": `page:${id + 7}` },
    en: { title: `${VIDEO_METAS[id].title.en.slice(0, 40)}...`, "path-click": `page:${id + 7}` },
    es: { title: `${VIDEO_METAS[id].title.es.slice(0, 40)}...`, "path-click": `page:${id + 7}` },
  }));
  const menuAudio = [
    {
      id: AUDIO_META_ID12.id,
      pt: { title: AUDIO_META_ID12.title.pt, "path-click": `page:${AUDIO_META_ID12.id}` },
      en: { title: AUDIO_META_ID12.title.en, "path-click": `page:${AUDIO_META_ID12.id}` },
      es: { title: AUDIO_META_ID12.title.es, "path-click": `page:${AUDIO_META_ID12.id}` },
    },
  ];
  const menuSourceViewer = [
    {
      id: SOURCE_VIEWER_META.id,
      pt: { title: SOURCE_VIEWER_META.titles.pt, "path-click": `page:${SOURCE_VIEWER_META.id}` },
      en: { title: SOURCE_VIEWER_META.titles.en, "path-click": `page:${SOURCE_VIEWER_META.id}` },
      es: { title: SOURCE_VIEWER_META.titles.es, "path-click": `page:${SOURCE_VIEWER_META.id}` },
    },
  ];
  return { md: menuMd, sourceViewer: menuSourceViewer, html: [], video: menuVideo, audio: menuAudio };
}

/**
 * Build version config for a single doc version.
 * @param {string} versionId - e.g. "1.1.54"
 * @returns {object} Version config with routes, menus, and hierarchy
 */
export function buildVersionConfig(versionId) {
  const menus = buildVersionMenus(versionId);

  return {
    auth: {
      accessKeys: {
        "docs-key": "open-gitpagedocs-docs",
      },
      rolesStorageKey: "git-page-docs:route-auth:roles",
      providers: [
        { type: "authjs", enabled: true, sessionEndpoint: "/api/auth/session", rolesClaimPath: "user.roles" },
        { type: "clerk", enabled: true, rolesClaimPath: "claims.publicMetadata.roles" },
        { type: "firebase", enabled: true, tokenStorageKey: "git-page-docs:firebase-token", rolesClaimPath: "roles" },
        { type: "jwt", enabled: true, tokenStorageKey: "git-page-docs:jwt-token", rolesClaimPath: "roles" },
      ],
    },
    "routes-md": buildVersionMdRoutes(versionId),
    "routes-source-viewer": buildVersionSourceViewerRoutes(),
    "routes-html": [],
    "routes-video": buildVersionVideoRoutes(versionId),
    "routes-audio": buildVersionAudioRoutes(versionId),
    "menus-header-md": menus.md,
    "menus-header-source-viewer": menus.sourceViewer,
    "menus-header-html": menus.html,
    "menus-header-video": menus.video,
    "menus-header-audio": menus.audio,
    hierarchyPage: DEFAULT_HIERARCHY,
    hierarchyMenu: DEFAULT_HIERARCHY,
  };
}
