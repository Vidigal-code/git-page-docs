/** Build route objects for md, html, and video content types */

/** Title/description styling every content route starts from (key order is part of the output). */
const ROUTE_TEXT_DEFAULTS = {
  titleCss: "font-size: 1.85rem; font-weight: 700;",
  titleDarkCss: "font-size: 1.85rem; font-weight: 700; color: var(--text);",
  titleLightCss: "font-size: 1.85rem; font-weight: 700; color: var(--text);",
  titlePosition: "center",
  titleIsVisible: true,
  descriptionCss: "font-size: 1.2rem; font-weight: 500;",
  descriptionDarkCss: "font-size: 1.2rem; font-weight: 500; color: var(--text-secondary);",
  descriptionLightCss: "font-size: 1.2rem; font-weight: 500; color: var(--text-secondary);",
  descriptionPosition: "center",
  descriptionIsVisible: true,
};

/** Container frame settings every content route starts from. */
const ROUTE_FRAME_DEFAULTS = {
  fullscreenEnabled: true,
  marginTop: "",
  marginBottom: "",
  blockLink: true,
};

/** Each default key, taking the option value when it is set. */
function withDefaults(defaults, options) {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [key, options[key] === undefined ? value : options[key]]),
  );
}

/** A single value becomes the same value for every language. */
function perLanguage(value) {
  return typeof value === "string" ? { pt: value, en: value, es: value } : value;
}

/** Copies only the fields that are set. */
function assignDefined(target, fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) target[key] = value;
  }
  return target;
}

export function buildMdRoute(versionId, routeId, pathByLang, titles, descriptions, options = {}) {
  const {
    container,
    browseAll = false,
    RouteguideBrand = true,
    RouteGuideSpeciFicbrand = [],
    RouteguideBrandPosition = "center",
    RouteguideBrandContainerTop = false,
    audio,
    authorization,
    hierarchyPage,
  } = options;
  const out = {
    id: routeId,
    title: titles ?? { pt: "Documentação", en: "Documentation", es: "Documentación" },
    description: descriptions ?? { pt: "Descrição da página", en: "Page description", es: "Descripción de la página" },
    ...withDefaults(ROUTE_TEXT_DEFAULTS, options),
    path: pathByLang,
    ...withDefaults(ROUTE_FRAME_DEFAULTS, options),
    container,
    browseAll,
    RouteguideBrand,
    RouteGuideSpeciFicbrand,
    RouteguideBrandPosition,
    RouteguideBrandContainerTop,
  };
  return assignDefined(out, { container, audio, authorization, hierarchyPage });
}

export function buildHtmlRoute(versionId, routeId, pathByLang, titles, descriptions, options = {}) {
  const base = buildMdRoute(versionId, routeId, pathByLang, titles, descriptions, options);
  return { ...base };
}

export function buildVideoRoute(versionId, routeId, videoType, pathVideo, titles, descriptions, options = {}) {
  const { container, browseAll = false, authorization } = options;
  const obj = {
    id: routeId,
    title: titles ?? { pt: "Vídeo", en: "Video", es: "Vídeo" },
    description: descriptions ?? { pt: "Descrição do vídeo", en: "Video description", es: "Descripción del vídeo" },
    ...withDefaults(ROUTE_TEXT_DEFAULTS, options),
    ...withDefaults(ROUTE_FRAME_DEFAULTS, options),
    browseAll,
    video: { videoType: perLanguage(videoType), pathVideo: perLanguage(pathVideo) },
  };
  return assignDefined(obj, { container, authorization });
}

export function buildAudioRoute(versionId, routeId, audioType, pathAudio, titles, descriptions, options = {}) {
  const base = buildVideoRoute(versionId, routeId, audioType, pathAudio, titles, descriptions, options);
  const { video, ...rest } = base;
  return {
    ...rest,
    audio: { audioType: perLanguage(audioType), pathAudio: perLanguage(pathAudio) },
  };
}

export function buildSourceViewerRoute(routeId, sourceViewerPath, titles, descriptions, options = {}) {
  const base = buildMdRoute("", routeId, {}, titles, descriptions, {
    ...options,
    fullscreenEnabled: false,
    RouteguideBrand: false,
  });
  delete base.path;
  return {
    ...base,
    "source-viewer": true,
    "source-viewer-path": sourceViewerPath,
  };
}
