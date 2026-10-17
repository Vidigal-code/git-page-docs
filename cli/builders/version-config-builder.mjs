/** Build version config (routes, menus) for each doc version */

import {
  ROUTE_PATHS,
  VIDEO_IDS,
  AUDIO_IDS,
  PAGE2_AUDIO,
  PDF_GUIDE_FILENAME,
  HTML_DOOM_FILENAME,
} from "../data/path-mappings.mjs";
import {
  ROUTE_META_ID1,
  ROUTE_META_ID2,
  ROUTE_META_ID3,
  ROUTE_META_ID4,
  ROUTE_META_ID5,
  ROUTE_META_ID6,
  REFERENCE_ROUTE_METAS,
  VIDEO_META_ID1,
  VIDEO_META_ID2,
  VIDEO_META_ID3,
  VIDEO_META_ID4,
  AUDIO_META_ID12,
  PDF_GUIDE_META,
  HTML_DOOM_META,
  SOURCE_VIEWER_META,
  DEFAULT_HIERARCHY,
  VIDEO_FIRST_HIERARCHY,
} from "../data/route-metas.mjs";
import { buildAudioRoute, buildMdRoute, buildPdfRoute, buildSourceViewerRoute, buildVideoRoute } from "./route-builders.mjs";
import { resolveSourceViewerPath } from "./project-links.mjs";
import { MARKDOWN_MENU_SECTIONS } from "../data/menu-sections.mjs";
import { SUPPORTED_LANGUAGES } from "../contracts/languages.mjs";
import { COMPOSED_PAGES } from "../data/composed-pages.mjs";

/** Demo route protections showcasing the "Authorized Routes" feature. They are
 * applied only to the official (non-parameterized) scaffold — user sites
 * generated with --owner/--repo stay public, since visitors of those sites
 * have no discoverable unlock recipe. */
const EXTERNAL_AUTH_PROVIDERS = ["authjs", "clerk", "firebase", "jwt"];
const DOCS_ACCESS_KEY_ID = "docs-key";
const MAINTAINER_ROLE = "maintainer";
const VIDEO_ROUTE_AUTHORIZATION = {
  requireExternalAuth: true,
  allowedProviders: EXTERNAL_AUTH_PROVIDERS,
};
/** Video route left open so the scaffold always shows a playable video (GitHub's introduction to Git). */
const PUBLIC_VIDEO_ROUTE_ID = 11;
/** Video routes follow the six markdown pages and the source viewer (ids 8-11). */
const VIDEO_ROUTE_ID_OFFSET = 7;
/** Markdown page that also shows the public video, in a video container above its text. */
const VIDEO_PAGE_ROUTE_ID = 5;
/** VIDEO_IDS / VIDEO_METAS entry of the public video (GitHub's introduction to Git). */
const PUBLIC_VIDEO_INDEX = PUBLIC_VIDEO_ROUTE_ID - VIDEO_ROUTE_ID_OFFSET;

const ROUTE_METAS = {
  1: ROUTE_META_ID1,
  2: ROUTE_META_ID2,
  3: ROUTE_META_ID3,
  4: ROUTE_META_ID4,
  5: ROUTE_META_ID5,
  6: ROUTE_META_ID6,
  ...REFERENCE_ROUTE_METAS,
};
const MARKDOWN_ROUTE_IDS = Object.keys(ROUTE_PATHS).map(Number);
const VIDEO_METAS = { 1: VIDEO_META_ID1, 2: VIDEO_META_ID2, 3: VIDEO_META_ID3, 4: VIDEO_META_ID4 };

function buildVersionMdRoutes(versionId, includeDemoAuthorization) {
  const base = `gitpagedocs/docs/versions/${versionId}`;
  return MARKDOWN_ROUTE_IDS.map((id) => {
    const paths = ROUTE_PATHS[id];
    const meta = ROUTE_METAS[id];
    const pathByLang = {
      pt: `${base}/pt/${paths.pt}`,
      en: `${base}/en/${paths.en}`,
      es: `${base}/es/${paths.es}`,
    };
    const routeOptions = {
      ...(id === 2 ? { audio: PAGE2_AUDIO } : {}),
      ...(id === VIDEO_PAGE_ROUTE_ID ? { hierarchyPage: VIDEO_FIRST_HIERARCHY } : {}),
      ...(includeDemoAuthorization && id === 3
        ? { authorization: { requiredRoles: [MAINTAINER_ROLE] } }
        : {}),
      ...(includeDemoAuthorization && id === 6
        ? {
            authorization: {
              accessKeyId: DOCS_ACCESS_KEY_ID,
              requiredRoles: [MAINTAINER_ROLE],
              requireExternalAuth: true,
              allowedProviders: EXTERNAL_AUTH_PROVIDERS,
            },
          }
        : {}),
    };
    return buildMdRoute(versionId, id, pathByLang, meta.titles, meta.descriptions, routeOptions);
  });
}

/** Video container shown on the markdown page VIDEO_PAGE_ROUTE_ID (no menu entry of its own). */
function buildPageVideoRoute(versionId) {
  return buildVideoRoute(
    versionId,
    VIDEO_PAGE_ROUTE_ID,
    "youtube",
    VIDEO_IDS[PUBLIC_VIDEO_INDEX - 1],
    VIDEO_METAS[PUBLIC_VIDEO_INDEX].title,
    VIDEO_METAS[PUBLIC_VIDEO_INDEX].description,
  );
}

function buildVersionVideoRoutes(versionId, includeDemoAuthorization) {
  const menuVideoRoutes = [1, 2, 3, 4].map((id) => {
    const routeId = id + VIDEO_ROUTE_ID_OFFSET;
    const isGuarded = includeDemoAuthorization && routeId !== PUBLIC_VIDEO_ROUTE_ID;
    return buildVideoRoute(
      versionId,
      routeId,
      "youtube",
      VIDEO_IDS[id - 1],
      VIDEO_METAS[id].title,
      VIDEO_METAS[id].description,
      isGuarded ? { authorization: VIDEO_ROUTE_AUTHORIZATION } : {},
    );
  });
  return [buildPageVideoRoute(versionId), ...menuVideoRoutes];
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

function buildVersionSourceViewerRoutes(options = {}) {
  return [
    buildSourceViewerRoute(
      SOURCE_VIEWER_META.id,
      resolveSourceViewerPath(options.githubOwner, options.githubRepo),
      SOURCE_VIEWER_META.titles,
      SOURCE_VIEWER_META.descriptions,
    ),
  ];
}

function buildMarkdownMenus(entries, base) {
  return entries.map((entry) => {
    if (typeof entry === "number") {
      return {
        id: entry,
        pt: { title: ROUTE_METAS[entry].titles.pt, "path-click": `${base}/pt/${ROUTE_PATHS[entry].pt}` },
        en: { title: ROUTE_METAS[entry].titles.en, "path-click": `${base}/en/${ROUTE_PATHS[entry].en}` },
        es: { title: ROUTE_METAS[entry].titles.es, "path-click": `${base}/es/${ROUTE_PATHS[entry].es}` },
      };
    }
    const parentPaths = ROUTE_PATHS[entry.routeId];
    const parentLabels = Object.fromEntries(SUPPORTED_LANGUAGES.map((language) => [language, {
      title: entry.titles[language],
      ...(parentPaths ? { "path-click": `${base}/${language}/${parentPaths[language]}` } : {}),
      ...(entry.pathClick ? { "path-click": entry.pathClick } : {}),
    }]));
    return {
      id: entry.id,
      ...parentLabels,
      ...(entry.submenus ? { submenus: buildMarkdownMenus(entry.submenus, base) } : {}),
    };
  });
}

function htmlExamplePaths(versionId) {
  return Object.fromEntries(SUPPORTED_LANGUAGES.map((language) => [
    language, `gitpagedocs/docs/versions/${versionId}/${language}/${HTML_DOOM_FILENAME}`,
  ]));
}

function buildVersionHtmlRoutes(versionId) {
  return [{
    id: HTML_DOOM_META.id,
    title: HTML_DOOM_META.titles,
    description: HTML_DOOM_META.descriptions,
    titleIsVisible: true,
    descriptionIsVisible: true,
    path: htmlExamplePaths(versionId),
    fullscreenEnabled: true,
    blockLink: true,
  }];
}

function buildVersionMenus(versionId) {
  const base = `gitpagedocs/docs/versions/${versionId}`;
  const menuMd = buildMarkdownMenus(MARKDOWN_MENU_SECTIONS, base);
  const menuVideo = [1, 2, 3, 4].map((id) => {
    const routeId = id + VIDEO_ROUTE_ID_OFFSET;
    return {
      id: routeId,
      pt: { title: `${VIDEO_METAS[id].title.pt.slice(0, 40)}...`, "path-click": `page:${routeId}` },
      en: { title: `${VIDEO_METAS[id].title.en.slice(0, 40)}...`, "path-click": `page:${routeId}` },
      es: { title: `${VIDEO_METAS[id].title.es.slice(0, 40)}...`, "path-click": `page:${routeId}` },
    };
  });
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
  const menuPdf = [{
    id: PDF_GUIDE_META.id,
    pt: { title: PDF_GUIDE_META.titles.pt, "path-click": `page:${PDF_GUIDE_META.id}` },
    en: { title: PDF_GUIDE_META.titles.en, "path-click": `page:${PDF_GUIDE_META.id}` },
    es: { title: PDF_GUIDE_META.titles.es, "path-click": `page:${PDF_GUIDE_META.id}` },
  }];
  const htmlPaths = htmlExamplePaths(versionId);
  const menuHtml = [{
    id: HTML_DOOM_META.id,
    ...Object.fromEntries(SUPPORTED_LANGUAGES.map((language) => [language, {
      title: HTML_DOOM_META.titles[language], "path-click": htmlPaths[language],
    }])),
  }];
  return { md: menuMd, sourceViewer: menuSourceViewer, html: menuHtml, video: menuVideo, audio: menuAudio, pdf: menuPdf };
}

/**
 * Build version config for a single doc version.
 * @param {string} versionId - e.g. "1.1.54"
 * @param {object} [options] - { githubOwner, githubRepo } for the source-viewer link
 * @returns {object} Version config with routes, menus, and hierarchy
 */
export function buildVersionConfig(versionId, options = {}) {
  const includeDemoAuthorization = !options.githubOwner && !options.githubRepo;
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
    "routes-md": buildVersionMdRoutes(versionId, includeDemoAuthorization),
    "routes-source-viewer": buildVersionSourceViewerRoutes(options),
    "routes-html": buildVersionHtmlRoutes(versionId),
    "routes-video": buildVersionVideoRoutes(versionId, includeDemoAuthorization),
    "routes-audio": buildVersionAudioRoutes(versionId),
    "routes-pdf": [buildPdfRoute(PDF_GUIDE_META, `gitpagedocs/docs/versions/${versionId}/en/${PDF_GUIDE_FILENAME}`)],
    pages: structuredClone(COMPOSED_PAGES),
    "menus-header-md": menus.md,
    "menus-header-source-viewer": menus.sourceViewer,
    "menus-header-html": menus.html,
    "menus-header-video": menus.video,
    "menus-header-audio": menus.audio,
    "menus-header-pdf": menus.pdf,
    hierarchyPage: DEFAULT_HIERARCHY,
    hierarchyMenu: DEFAULT_HIERARCHY,
  };
}
