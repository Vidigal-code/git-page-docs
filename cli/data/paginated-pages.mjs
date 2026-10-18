import { SUPPORTED_LANGUAGES } from "../contracts/languages.mjs";

export const PAGINATED_PAGE_MENU = {
  id: 50,
  pathClick: "page:50",
  titles: { en: "Paginated containers example", pt: "Exemplo de containers paginados", es: "Ejemplo de contenedores paginados" },
};

export const PAGINATED_PAGE = {
  id: PAGINATED_PAGE_MENU.id,
  blocks: [
    { id: "lessons", type: "md", routeId: 51 },
    { id: "html-pages", type: "html", routeId: 52 },
    { id: "video-files", type: "video", routeId: 53 },
    { id: "audio-files", type: "audio", routeId: 54 },
    { id: "pdf-files", type: "pdf", routeId: 55 },
  ],
};

export const PAGINATION_ASSETS = ["pagination-low.wav", "pagination-high.wav", "pagination-reference.pdf"];
const VIDEO_EXAMPLE_ROOT = "https://developer.mozilla.org/shared-assets/videos";

function localizedPath(base, name) {
  return Object.fromEntries(SUPPORTED_LANGUAGES.map(language => [language, `${base}/${language}/${name}`]));
}

function sharedPath(path) {
  return Object.fromEntries(SUPPORTED_LANGUAGES.map(language => [language, path]));
}

function frame(id, title) {
  return {
    id, title, titleIsVisible: true, titlePosition: "center",
    descriptionIsVisible: true, descriptionPosition: "center", fullscreenEnabled: true,
  };
}

export function buildPaginatedRoutes(versionId) {
  const base = `gitpagedocs/docs/versions/${versionId}`;
  return {
    "routes-md": [{
      ...frame(51, { en: "Paginated Markdown", pt: "Markdown paginado", es: "Markdown paginado" }),
      path: localizedPath(base, "pagination-first.md"),
      RouteguideBrand: true,
      markdownMarkers: { items: [{
        id: "reading-target",
        text: { en: "This highlighted sentence is a navigation target.", pt: "Esta frase realçada é um destino de navegação.", es: "Esta frase resaltada es un destino de navegación." },
        label: { en: "Highlighted example", pt: "Exemplo realçado", es: "Ejemplo resaltado" },
      }] },
      pagination: { items: [
        { routeId: 51, title: { en: "Lesson 1: try the controls", pt: "Lição 1: experimente os controles", es: "Lección 1: prueba los controles" }, description: { en: "Three files in one Markdown container.", pt: "Três arquivos em um container Markdown.", es: "Tres archivos en un contenedor Markdown." } },
        { routeId: 1, title: { en: "Lesson 2: getting started", pt: "Lição 2: primeiros passos", es: "Lección 2: primeros pasos" } },
        { routeId: 13, title: { en: "Lesson 3: configuration", pt: "Lição 3: configuração", es: "Lección 3: configuración" } },
      ] },
    }],
    "routes-html": [
      { ...frame(52, { en: "HTML: first file", pt: "HTML: primeiro arquivo", es: "HTML: primer archivo" }), path: localizedPath(base, "pagination-first.html"), pagination: { items: [{ routeId: 52 }, { routeId: 62 }] } },
      { ...frame(62, { en: "HTML: second file", pt: "HTML: segundo arquivo", es: "HTML: segundo archivo" }), path: localizedPath(base, "pagination-second.html") },
    ],
    "routes-video": [
      { ...frame(53, { en: "Flower video: MP4", pt: "Vídeo de flores: MP4", es: "Vídeo de flores: MP4" }), video: { pathVideo: sharedPath(`${VIDEO_EXAMPLE_ROOT}/flower.mp4`), videoType: sharedPath("mp4") }, pagination: { items: [{ routeId: 53 }, { routeId: 63 }] } },
      { ...frame(63, { en: "Flower video: WebM", pt: "Vídeo de flores: WebM", es: "Vídeo de flores: WebM" }), video: { pathVideo: sharedPath(`${VIDEO_EXAMPLE_ROOT}/flower.webm`), videoType: sharedPath("webm") } },
    ],
    "routes-audio": [
      { ...frame(54, { en: "Low tone", pt: "Tom grave", es: "Tono grave" }), audio: { pathAudio: sharedPath(`${base}/en/pagination-low.wav`), audioType: sharedPath("wav") }, pagination: { items: [{ routeId: 54 }, { routeId: 64 }] } },
      { ...frame(64, { en: "High tone", pt: "Tom agudo", es: "Tono agudo" }), audio: { pathAudio: sharedPath(`${base}/en/pagination-high.wav`), audioType: sharedPath("wav") } },
    ],
    "routes-pdf": [{
      ...frame(55, { en: "Pagination quick reference", pt: "Referência rápida de paginação", es: "Referencia rápida de paginación" }),
      pdf: { pathPdf: sharedPath(`${base}/en/pagination-reference.pdf`) },
      pagination: { items: [
        { routeId: 23, title: { en: "Project guide", pt: "Guia do projeto", es: "Guía del proyecto" } },
        { routeId: 55, description: { en: "A second PDF in the same container.", pt: "Um segundo PDF no mesmo container.", es: "Un segundo PDF en el mismo contenedor." } },
      ] },
    }],
  };
}
