/** Path and media mappings for doc versions */

export const ROUTE_PATHS = {
  1: { pt: "getting-started.md", en: "getting-started.md", es: "getting-started.md" },
  2: { pt: "project-overview.md", en: "project-overview.md", es: "project-overview.md" },
  3: { pt: "github-issues-projects.md", en: "github-issues-projects.md", es: "github-issues-projects.md" },
  4: { pt: "git-introduction.md", en: "git-introduction.md", es: "git-introduction.md" },
};

export const HTML_PATHS = {
  1: { pt: "getting-started.html", en: "getting-started.html", es: "getting-started.html" },
};

export const VIDEO_IDS = ["bdIJkGr2NV0", "c67GaAkf1BE", "N3my6W_Rdwg", "r8jQ9hVA2qs"];

export const AUDIO_YOUTUBE_ID = "xAR6N9N8e6U";

export const PAGE2_AUDIO = {
  enabled: true,
  autoPlayOnLoad: true,
  loopEnabled: false,
  tracks: [
    {
      url: "https://www.youtube.com/watch?v=0w80F8FffQ4",
      type: "youtube",
      title: { pt: "Música página 2", en: "Page 2 music", es: "Música página 2" },
    },
  ],
};

export const SOURCE_VIEWER_META = {
  titles: { pt: "Código fonte", en: "Source code", es: "Código fuente" },
  descriptions: {
    pt: "Visualizar código-fonte do projeto",
    en: "View project source code",
    es: "Ver código fuente del proyecto",
  },
};
