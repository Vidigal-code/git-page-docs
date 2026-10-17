export const COMPOSED_PAGE_ID = 39;

export const COMPOSED_PAGE_MENU = {
  id: COMPOSED_PAGE_ID,
  pathClick: `page:${COMPOSED_PAGE_ID}`,
  titles: { en: "Multiple content blocks", pt: "Múltiplos blocos de conteúdo", es: "Múltiples bloques de contenido" },
};

export const COMPOSED_PAGES = [{
  id: COMPOSED_PAGE_ID,
  blocks: [
    { id: "getting-started", type: "md", routeId: 1 },
    { id: "project-overview", type: "md", routeId: 2 },
    { id: "html-guide", type: "md", routeId: 30 },
    { id: "doom-first", type: "html", routeId: 29 },
    { id: "doom-second", type: "html", routeId: 29 },
    { id: "video-first", type: "video", routeId: 11 },
    { id: "video-second", type: "video", routeId: 11 },
    { id: "audio-first", type: "audio", routeId: 12 },
    { id: "audio-second", type: "audio", routeId: 12 },
    { id: "pdf-first", type: "pdf", routeId: 23 },
    { id: "pdf-second", type: "pdf", routeId: 23 },
    { id: "pdf-third", type: "pdf", routeId: 23 },
  ],
}];
