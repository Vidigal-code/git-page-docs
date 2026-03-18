/** Build route objects for md, html, and video content types */

export function buildMdRoute(versionId, routeId, pathByLang, titles, descriptions, options = {}) {
  const {
    titleCss = "font-size: 1.85rem; font-weight: 700;",
    titleDarkCss = "font-size: 1.85rem; font-weight: 700; color: var(--text);",
    titleLightCss = "font-size: 1.85rem; font-weight: 700; color: var(--text);",
    titlePosition = "center",
    titleIsVisible = true,
    descriptionCss = "font-size: 1.2rem; font-weight: 500;",
    descriptionDarkCss = "font-size: 1.2rem; font-weight: 500; color: var(--text-secondary);",
    descriptionLightCss = "font-size: 1.2rem; font-weight: 500; color: var(--text-secondary);",
    descriptionPosition = "center",
    descriptionIsVisible = true,
    fullscreenEnabled = true,
    marginTop = "",
    marginBottom = "",
    blockLink = true,
    container,
    browseAll = false,
    RouteguideBrand = true,
    RouteGuideSpeciFicbrand = [],
    RouteguideBrandPosition = "center",
    RouteguideBrandContainerTop = false,
    audio,
  } = options;
  const out = {
    id: routeId,
    title: titles ?? { pt: "Documentação", en: "Documentation", es: "Documentación" },
    description: descriptions ?? { pt: "Descrição da página", en: "Page description", es: "Descripción de la página" },
    titleCss,
    titleDarkCss,
    titleLightCss,
    titlePosition,
    titleIsVisible,
    descriptionCss,
    descriptionDarkCss,
    descriptionLightCss,
    descriptionPosition,
    descriptionIsVisible,
    path: pathByLang,
    fullscreenEnabled,
    marginTop,
    marginBottom,
    blockLink,
    container,
    browseAll,
    RouteguideBrand,
    RouteGuideSpeciFicbrand,
    RouteguideBrandPosition,
    RouteguideBrandContainerTop,
  };
  if (container !== undefined) out.container = container;
  if (audio !== undefined) out.audio = audio;
  return out;
}

export function buildHtmlRoute(versionId, routeId, pathByLang, titles, descriptions, options = {}) {
  const base = buildMdRoute(versionId, routeId, pathByLang, titles, descriptions, options);
  return { ...base };
}

export function buildVideoRoute(versionId, routeId, videoType, pathVideo, titles, descriptions, options = {}) {
  const {
    titleCss = "font-size: 1.85rem; font-weight: 700;",
    titleDarkCss = "font-size: 1.85rem; font-weight: 700; color: var(--text);",
    titleLightCss = "font-size: 1.85rem; font-weight: 700; color: var(--text);",
    titlePosition = "center",
    titleIsVisible = true,
    descriptionCss = "font-size: 1.2rem; font-weight: 500;",
    descriptionDarkCss = "font-size: 1.2rem; font-weight: 500; color: var(--text-secondary);",
    descriptionLightCss = "font-size: 1.2rem; font-weight: 500; color: var(--text-secondary);",
    descriptionPosition = "center",
    descriptionIsVisible = true,
    fullscreenEnabled = true,
    marginTop = "",
    marginBottom = "",
    blockLink = true,
    container,
    browseAll = false,
  } = options;
  const videoTypeByLang = typeof videoType === "string" ? { pt: videoType, en: videoType, es: videoType } : videoType;
  const pathVideoByLang = typeof pathVideo === "string" ? { pt: pathVideo, en: pathVideo, es: pathVideo } : pathVideo;
  const obj = {
    id: routeId,
    title: titles ?? { pt: "Vídeo", en: "Video", es: "Vídeo" },
    description: descriptions ?? { pt: "Descrição do vídeo", en: "Video description", es: "Descripción del vídeo" },
    titleCss,
    titleDarkCss,
    titleLightCss,
    titlePosition,
    titleIsVisible,
    descriptionCss,
    descriptionDarkCss,
    descriptionLightCss,
    descriptionPosition,
    descriptionIsVisible,
    fullscreenEnabled,
    marginTop,
    marginBottom,
    blockLink,
    browseAll,
    video: { videoType: videoTypeByLang, pathVideo: pathVideoByLang },
  };
  if (container !== undefined) obj.container = container;
  return obj;
}
