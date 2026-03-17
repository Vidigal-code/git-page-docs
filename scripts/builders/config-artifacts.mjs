/** Orchestrate build of config artifacts for gitpagedocs */

import { OFFICIAL_LAYOUTS_CONFIG_URL, OFFICIAL_LAYOUTS_TEMPLATES_URL } from "../data/urls.mjs";
import { LAYOUTS, FALLBACK_LAYOUTS } from "../data/layouts.mjs";
import { DOCS } from "../content/docs.mjs";
import { HTML_PAGES } from "../content/html-pages.mjs";
import {
  ROUTE_META_ID1,
  ROUTE_META_ID2,
  ROUTE_META_ID3,
  ROUTE_META_ID4,
  VIDEO_META_ID1,
  VIDEO_META_ID2,
  VIDEO_META_ID3,
  VIDEO_META_ID4,
  AUDIO_META,
  DEFAULT_HIERARCHY,
} from "../data/route-metas.mjs";
import { buildMdRoute, buildHtmlRoute, buildVideoRoute, buildAudioRoute } from "./route-builders.mjs";
import { generateSourceViewerHtml } from "./source-viewer.mjs";

export function buildConfigArtifacts(options = {}) {
  const useLocalLayoutConfig = Boolean(options.useLocalLayoutConfig);
  const useOfficialLayouts = !useLocalLayoutConfig;
  const githubOwner = options.githubOwner;
  const githubRepo = options.githubRepo;
  const root = options.root ?? process.cwd();
  const repositorySearchHome = githubOwner && githubRepo ? false : true;
  const renderingUrl = githubOwner && githubRepo
    ? `https://${githubOwner}.github.io/${githubRepo}/`
    : "https://vidigal-code.github.io/git-page-docs/";
  const projectLink = githubOwner && githubRepo
    ? `https://github.com/${githubOwner}/${githubRepo}`
    : "https://github.com/Vidigal-code/git-page-docs";
  const ROUTE_PATHS = {
    1: { pt: "getting-started.md", en: "getting-started.md", es: "getting-started.md" },
    2: { pt: "project-overview.md", en: "project-overview.md", es: "project-overview.md" },
    3: { pt: "github-issues-projects.md", en: "github-issues-projects.md", es: "github-issues-projects.md" },
    4: { pt: "git-introduction.md", en: "git-introduction.md", es: "git-introduction.md" },
  };
  const HTML_PATHS = {
    1: { pt: "getting-started.html", en: "getting-started.html", es: "getting-started.html" },
  };
  const ROUTE_METAS = { 1: ROUTE_META_ID1, 2: ROUTE_META_ID2, 3: ROUTE_META_ID3, 4: ROUTE_META_ID4 };
  const VIDEO_METAS = { 1: VIDEO_META_ID1, 2: VIDEO_META_ID2, 3: VIDEO_META_ID3, 4: VIDEO_META_ID4 };
  const VIDEO_IDS = ["bdIJkGr2NV0", "c67GaAkf1BE", "N3my6W_Rdwg", "r8jQ9hVA2qs"];
  const AUDIO_YOUTUBE_ID = "xAR6N9N8e6U";

  const PAGE2_AUDIO = {
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

  function buildVersionMdRoutesSimple(versionId) {
    const base = `gitpagedocs/docs/versions/${versionId}`;
    return [1, 2, 3, 4].map((id) => {
      const paths = ROUTE_PATHS[id];
      const meta = ROUTE_METAS[id];
      const pathByLang = {
        pt: `${base}/pt/${paths.pt}`,
        en: `${base}/en/${paths.en}`,
        es: `${base}/es/${paths.es}`,
      };
      const options = id === 2 ? { audio: PAGE2_AUDIO } : {};
      return buildMdRoute(versionId, id, pathByLang, meta.titles, meta.descriptions, options);
    });
  }

  const SOURCE_VIEWER_META = {
    titles: { pt: "Código fonte", en: "Source code", es: "Código fuente" },
    descriptions: { pt: "Visualizar código-fonte do projeto", en: "View project source code", es: "Ver código fuente del proyecto" },
  };
  function buildVersionHtmlRoutesSimple(versionId) {
    const base = `gitpagedocs/docs/versions/${versionId}`;
    const pathByLang1 = {
      pt: `${base}/pt/${HTML_PATHS[1].pt}`,
      en: `${base}/en/${HTML_PATHS[1].en}`,
      es: `${base}/es/${HTML_PATHS[1].es}`,
    };
    const pathByLangSource = {
      pt: `${base}/pt/source-viewer.html`,
      en: `${base}/en/source-viewer.html`,
      es: `${base}/es/source-viewer.html`,
    };
    return [
      buildHtmlRoute(versionId, 1, pathByLang1, ROUTE_META_ID1.titles, ROUTE_META_ID1.descriptions),
      buildHtmlRoute(versionId, 2, pathByLangSource, SOURCE_VIEWER_META.titles, SOURCE_VIEWER_META.descriptions, { container: "full", blockLink: true }),
    ];
  }

  function buildVersionVideoRoutesSimple(versionId) {
    return [1, 2, 3, 4].map((id) =>
      buildVideoRoute(
        versionId,
        id,
        "youtube",
        VIDEO_IDS[id - 1],
        VIDEO_METAS[id].title,
        VIDEO_METAS[id].description,
      ),
    );
  }

  function buildVersionAudioRoutesSimple(versionId) {
    return [1, 2, 3, 4].map((id) =>
      buildAudioRoute(
        versionId,
        id,
        "youtube",
        AUDIO_YOUTUBE_ID,
        AUDIO_META.title,
        AUDIO_META.description,
      ),
    );
  }

  function buildVersionMenusSimple(versionId) {
    const base = `gitpagedocs/docs/versions/${versionId}`;
    const menuMd = [1, 2, 3, 4].map((id) => ({
      id: id,
      pt: { title: ROUTE_METAS[id].titles.pt, "path-click": `${base}/pt/${ROUTE_PATHS[id].pt}` },
      en: { title: ROUTE_METAS[id].titles.en, "path-click": `${base}/en/${ROUTE_PATHS[id].en}` },
      es: { title: ROUTE_METAS[id].titles.es, "path-click": `${base}/es/${ROUTE_PATHS[id].es}` },
    }));
    const menuHtml = [
      { id: 1, pt: { title: "Primeiros passos (HTML)", "path-click": `${base}/pt/getting-started.html` }, en: { title: "Getting Started (HTML)", "path-click": `${base}/en/getting-started.html` }, es: { title: "Primeros pasos (HTML)", "path-click": `${base}/es/getting-started.html` } },
      { id: 2, pt: { title: "Código fonte", "path-click": `${base}/pt/source-viewer.html` }, en: { title: "Source code", "path-click": `${base}/en/source-viewer.html` }, es: { title: "Código fuente", "path-click": `${base}/es/source-viewer.html` } },
    ];
    const menuVideo = [1, 2, 3, 4].map((id) => ({
      id: id,
      pt: { title: VIDEO_METAS[id].title.pt.slice(0, 40) + "...", "path-click": `page:${id}` },
      en: { title: VIDEO_METAS[id].title.en.slice(0, 40) + "...", "path-click": `page:${id}` },
      es: { title: VIDEO_METAS[id].title.es.slice(0, 40) + "...", "path-click": `page:${id}` },
    }));
    const menuAudio = [1, 2, 3, 4].map((id) => ({
      id: id,
      pt: { title: AUDIO_META.title.pt.slice(0, 40) + "...", "path-click": `page:${id}` },
      en: { title: AUDIO_META.title.en.slice(0, 40) + "...", "path-click": `page:${id}` },
      es: { title: AUDIO_META.title.es.slice(0, 40) + "...", "path-click": `page:${id}` },
    }));
    return { md: menuMd, html: menuHtml, video: menuVideo, audio: menuAudio };
  }

  const versionRoutes_1_0_0_md = buildVersionMdRoutesSimple("1.0.0");
  const versionRoutes_1_0_0_html = buildVersionHtmlRoutesSimple("1.0.0");
  const versionRoutes_1_0_0_video = buildVersionVideoRoutesSimple("1.0.0");
  const versionRoutes_1_0_0_audio = buildVersionAudioRoutesSimple("1.0.0");
  const versionMenus_1_0_0 = buildVersionMenusSimple("1.0.0");

  const versionRoutes_1_1_0_md = buildVersionMdRoutesSimple("1.1.0");
  const versionRoutes_1_1_0_html = buildVersionHtmlRoutesSimple("1.1.0");
  const versionRoutes_1_1_0_video = buildVersionVideoRoutesSimple("1.1.0");
  const versionRoutes_1_1_0_audio = buildVersionAudioRoutesSimple("1.1.0");
  const versionMenus_1_1_0 = buildVersionMenusSimple("1.1.0");

  const versionRoutes_1_1_1_md = buildVersionMdRoutesSimple("1.1.1");
  const versionRoutes_1_1_1_html = buildVersionHtmlRoutesSimple("1.1.1");
  const versionRoutes_1_1_1_video = buildVersionVideoRoutesSimple("1.1.1");
  const versionRoutes_1_1_1_audio = buildVersionAudioRoutesSimple("1.1.1");
  const versionMenus_1_1_1 = buildVersionMenusSimple("1.1.1");

  const rootConfig = {
    site: {
      name: "Git Pages Docs",
      defaultLanguage: "en",
      supportedLanguages: Object.keys(DOCS),
      HideThemeSelector: false,
      ThemeDefault: "aurora-dark",
      ThemeModeDefault: "dark",
      ActiveNavigation: true,
      FocusMode: true,
      FooterEnabled: true,
      FooterLinkName: "GitPageDocs",
      FooterLinkUrl: projectLink,
      FooterDateMode: "browser",
      FooterDateCustom: "",
      ProjectLink: projectLink,
      SiteIconPath: "/icon.svg",
      SiteHeaderName: "Git Pages Docs",
      IconImageMenuHeaderImgWidth: 20,
      IconImageMenuHeaderImgHeight: 20,
      IconImageMenuHeaderLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconImageMenuHeaderDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconImageMenuHeaderReactIcones: true,
      IconImageMenuHeaderReactIconesTag: "FaGithubAlt",
      IconImageMenuHeaderReactIconesTagColorDark: "White",
      IconImageMenuHeaderReactIconesTagColorLight: "black",
      IconImageMenuHeaderReactIconesTagSize: "25px",
      IconProjectLinkLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconProjectLinkDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconProjectLinkReactIcones: true,
      IconProjectLinkReactIconesTag: "FaGithubAlt",
      IconProjectLinkReactIconesTagColorDark: "White",
      IconProjectLinkReactIconesTagColorLight: "black",
      IconProjectLinkReactIconesTagSize: "25px",
      IconProjectLinkImgWidth: 20,
      IconProjectLinkImgHeight: 20,
      IconVersionLinksLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconVersionLinksDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconVersionLinksReactIcones: true,
      IconVersionLinksReactIconesTag: "FaCodeBranch",
      IconVersionLinksReactIconesTagColorDark: "White",
      IconVersionLinksReactIconesTagColorLight: "black",
      IconVersionLinksReactIconesTagSize: "25px",
      IconVersionLinksImgWidth: 20,
      IconVersionLinksImgHeight: 20,
      IconInfoHeaderMenuLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconInfoHeaderMenuDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconInfoHeaderMenuReactIcones: true,
      IconInfoHeaderMenuReactIconesTag: "BsInfoSquareFill",
      IconInfoHeaderMenuReactIconesTagColorDark: "White",
      IconInfoHeaderMenuReactIconesTagColorLight: "black",
      IconInfoHeaderMenuReactIconesTagSize: "25px",
      IconInfoHeaderMenuImgWidth: 20,
      IconInfoHeaderMenuImgHeight: 20,
      IconPreviewProjectLinkLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconPreviewProjectLinkDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconPreviewProjectLinkReactIcones: true,
      IconPreviewProjectLinkReactIconesTag: "CiGlobe",
      IconPreviewProjectLinkReactIconesTagColorDark: "White",
      IconPreviewProjectLinkReactIconesTagColorLight: "black",
      IconPreviewProjectLinkReactIconesTagSize: "25px",
      IconPreviewProjectLinkImgWidth: 20,
      IconPreviewProjectLinkImgHeight: 20,
      IconNavMenuOpenLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconNavMenuOpenDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconNavMenuOpenReactIcones: true,
      IconNavMenuOpenReactIconesTag: "FaBars",
      IconNavMenuOpenReactIconesTagColorDark: "White",
      IconNavMenuOpenReactIconesTagColorLight: "black",
      IconNavMenuOpenReactIconesTagSize: "25px",
      IconNavMenuOpenImgWidth: 20,
      IconNavMenuOpenImgHeight: 20,
      IconNavMenuCloseLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconNavMenuCloseDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconNavMenuCloseReactIcones: true,
      IconNavMenuCloseReactIconesTag: "IoMdClose",
      IconNavMenuCloseReactIconesTagColorDark: "White",
      IconNavMenuCloseReactIconesTagColorLight: "black",
      IconNavMenuCloseReactIconesTagSize: "25px",
      IconNavMenuCloseImgWidth: 20,
      IconNavMenuCloseImgHeight: 20,
      IconNavMenuMobileOpenLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconNavMenuMobileOpenDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconNavMenuMobileOpenReactIcones: true,
      IconNavMenuMobileOpenReactIconesTag: "FaBars",
      IconNavMenuMobileOpenReactIconesTagColorDark: "White",
      IconNavMenuMobileOpenReactIconesTagColorLight: "black",
      IconNavMenuMobileOpenReactIconesTagSize: "25px",
      IconNavMenuMobileOpenImgWidth: 20,
      IconNavMenuMobileOpenImgHeight: 20,
      IconNavMenuMobileCloseLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconNavMenuMobileCloseDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconNavMenuMobileCloseReactIcones: true,
      IconNavMenuMobileCloseReactIconesTag: "IoMdClose",
      IconNavMenuMobileCloseReactIconesTagColorDark: "White",
      IconNavMenuMobileCloseReactIconesTagColorLight: "black",
      IconNavMenuMobileCloseReactIconesTagSize: "25px",
      IconNavMenuMobileCloseImgWidth: 20,
      IconNavMenuMobileCloseImgHeight: 20,
      IconNavMenuBlockActiveLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconNavMenuBlockActiveDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconNavMenuBlockActiveReactIcones: true,
      IconNavMenuBlockActiveReactIconesTag: "FiLock",
      IconNavMenuBlockActiveReactIconesTagColorDark: "White",
      IconNavMenuBlockActiveReactIconesTagColorLight: "black",
      IconNavMenuBlockActiveReactIconesTagSize: "25px",
      IconNavMenuBlockActiveImgWidth: 20,
      IconNavMenuBlockActiveImgHeight: 20,
      IconNavMenuBlockInactiveLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconNavMenuBlockInactiveDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconNavMenuBlockInactiveReactIcones: true,
      IconNavMenuBlockInactiveReactIconesTag: "FiUnlock",
      IconNavMenuBlockInactiveReactIconesTagColorDark: "White",
      IconNavMenuBlockInactiveReactIconesTagColorLight: "black",
      IconNavMenuBlockInactiveReactIconesTagSize: "25px",
      IconNavMenuBlockInactiveImgWidth: 20,
      IconNavMenuBlockInactiveImgHeight: 20,
      RouteguideBrandPositionDefault: "center",
      RouteguideBrandContainerTopDefault: false,
      audioPlayerEnabled: true,
      audioAutoPlayOnLoad: false,
      audioLoopEnabled: false,
      audioTracks: [
        {
          url: "https://www.youtube.com/watch?v=xAR6N9N8e6U",
          type: "youtube",
          title: { pt: "Rádio", en: "Radio", es: "Radio" },
        },
        {
          url: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
          type: "spotify",
          title: { pt: "Spotify", en: "Spotify", es: "Spotify" },
        },
      ],
      IconAudioPlayReactIcones: true,
      IconAudioPlayReactIconesTag: "CiPlay1",
      IconAudioPlayReactIconesTagColorDark: "White",
      IconAudioPlayReactIconesTagColorLight: "black",
      IconAudioPlayReactIconesTagSize: "25px",
      IconAudioPauseReactIcones: true,
      IconAudioPauseReactIconesTag: "FaPause",
      IconAudioPauseReactIconesTagColorDark: "White",
      IconAudioPauseReactIconesTagColorLight: "black",
      IconAudioPauseReactIconesTagSize: "25px",
      IconAudioPlayerPopoverCloseLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconAudioPlayerPopoverCloseDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconAudioPlayerPopoverCloseReactIcones: true,
      IconAudioPlayerPopoverCloseReactIconesTag: "IoClose",
      IconAudioPlayerPopoverCloseReactIconesTagColorDark: "White",
      IconAudioPlayerPopoverCloseReactIconesTagColorLight: "black",
      IconAudioPlayerPopoverCloseReactIconesTagSize: "25px",
      IconAudioPlayerPopoverCloseImgWidth: 20,
      IconAudioPlayerPopoverCloseImgHeight: 20,
      IconAudioPlayerPopoverPlayLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconAudioPlayerPopoverPlayDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconAudioPlayerPopoverPlayReactIcones: true,
      IconAudioPlayerPopoverPlayReactIconesTag: "CiPlay1",
      IconAudioPlayerPopoverPlayReactIconesTagColorDark: "White",
      IconAudioPlayerPopoverPlayReactIconesTagColorLight: "black",
      IconAudioPlayerPopoverPlayReactIconesTagSize: "25px",
      IconAudioPlayerPopoverPlayImgWidth: 20,
      IconAudioPlayerPopoverPlayImgHeight: 20,
      IconAudioPlayerPopoverPauseLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconAudioPlayerPopoverPauseDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconAudioPlayerPopoverPauseReactIcones: true,
      IconAudioPlayerPopoverPauseReactIconesTag: "FaPause",
      IconAudioPlayerPopoverPauseReactIconesTagColorDark: "White",
      IconAudioPlayerPopoverPauseReactIconesTagColorLight: "black",
      IconAudioPlayerPopoverPauseReactIconesTagSize: "25px",
      IconAudioPlayerPopoverPauseImgWidth: 20,
      IconAudioPlayerPopoverPauseImgHeight: 20,
      IconAudioPlayerPopoverRestartLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconAudioPlayerPopoverRestartDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconAudioPlayerPopoverRestartReactIcones: true,
      IconAudioPlayerPopoverRestartReactIconesTag: "IoReload",
      IconAudioPlayerPopoverRestartReactIconesTagColorDark: "White",
      IconAudioPlayerPopoverRestartReactIconesTagColorLight: "black",
      IconAudioPlayerPopoverRestartReactIconesTagSize: "25px",
      IconAudioPlayerPopoverRestartImgWidth: 20,
      IconAudioPlayerPopoverRestartImgHeight: 20,
      IconAudioPlayerPopoverLoopOnLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconAudioPlayerPopoverLoopOnDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconAudioPlayerPopoverLoopOnReactIcones: true,
      IconAudioPlayerPopoverLoopOnReactIconesTag: "FiRepeat",
      IconAudioPlayerPopoverLoopOnReactIconesTagColorDark: "White",
      IconAudioPlayerPopoverLoopOnReactIconesTagColorLight: "black",
      IconAudioPlayerPopoverLoopOnReactIconesTagSize: "25px",
      IconAudioPlayerPopoverLoopOnImgWidth: 20,
      IconAudioPlayerPopoverLoopOnImgHeight: 20,
      IconAudioPlayerPopoverLoopOffLightImg: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconAudioPlayerPopoverLoopOffDarkImg: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconAudioPlayerPopoverLoopOffReactIcones: true,
      IconAudioPlayerPopoverLoopOffReactIconesTag: "FiRepeat",
      IconAudioPlayerPopoverLoopOffReactIconesTagColorDark: "White",
      IconAudioPlayerPopoverLoopOffReactIconesTagColorLight: "black",
      IconAudioPlayerPopoverLoopOffReactIconesTagSize: "25px",
      IconAudioPlayerPopoverLoopOffImgWidth: 20,
      IconAudioPlayerPopoverLoopOffImgHeight: 20,
      TocScrollMaxHeightDesktop: "min(65vh, 400px)",
      TocScrollMaxHeightMobile: "min(45vh, 280px)",
      layoutsConfigPathOficial: useOfficialLayouts,
      layoutsConfigPathTemplatesOficial: useOfficialLayouts ? OFFICIAL_LAYOUTS_TEMPLATES_URL : "",
      layoutsConfigPathOficialUrl: useOfficialLayouts ? OFFICIAL_LAYOUTS_CONFIG_URL : "",
      repositorySearchHome,
      rendering: renderingUrl,
      langmenu: {
        pt: {
          pt: "Portugues",
          en: "Ingles",
          es: "Espanhol",
          footerLabel: "Projeto",
          menuOpen: "Menu",
          menuClose: "Fechar",
          showMenu: "Abrir menu",
          hideMenu: "Fechar menu",
          quickNavigation: "Ctrl+K",
          searchOwnerLabel: "Usuario (ex: Vidigal-code)",
          searchRepoLabel: "Repositorio (ex: git-page-link-create)",
          searchButtonLabel: "Buscar",
          typeToNavigate: "Digite para navegar...",
          noNavigationResults: "Nenhum resultado de navegacao.",
          focusMode: "Modo foco",
          versionLinksLabel: "Links do repositorio",
          titleHeaderMenuMd: "Markdown",
          titleHeaderMenuVideo: "Vídeo",
          titleHeaderMenuAudio: "Áudio",
          titleHeaderMenuHtml: "Páginas",
          lastUpdateVersionLabel: "Ultima versao de atualizacao",
          darkMode: "Modo escuro",
          lightMode: "Modo claro",
          blockMenuOnNavActive: "Bloquear menu na navegação",
          blockMenuOnNavInactive: "Permitir menu na navegação",
          audioPlayLabel: "Reproduzir música de fundo",
          audioPauseLabel: "Pausar música de fundo",
          audioPlaylistTitle: "Escolher faixa",
          audioPlaylistDescription: "Selecione uma faixa para reproduzir da playlist.",
          audioPopoverNowPlaying: "Tocando",
          audioPopoverRestart: "Reiniciar",
          audioPopoverLoopOn: "Ativar loop",
          audioPopoverLoopOff: "Desativar loop",
          audioPopoverSource: "Arquivo",
        },
        en: {
          pt: "Portuguese",
          en: "English",
          es: "Spanish",
          footerLabel: "Project",
          menuOpen: "Menu",
          menuClose: "Close",
          showMenu: "Show menu",
          hideMenu: "Hide menu",
          quickNavigation: "Ctrl+K",
          searchOwnerLabel: "Owner (ex: Vidigal-code)",
          searchRepoLabel: "Repository (ex: git-page-link-create)",
          searchButtonLabel: "Search",
          typeToNavigate: "Type to navigate...",
          noNavigationResults: "No navigation results.",
          focusMode: "Focus mode",
          versionLinksLabel: "Repository links",
          titleHeaderMenuMd: "Markdown",
          titleHeaderMenuVideo: "Video",
          titleHeaderMenuAudio: "Audio",
          titleHeaderMenuHtml: "Pages",
          lastUpdateVersionLabel: "Last update version",
          darkMode: "Dark mode",
          lightMode: "Light mode",
          blockMenuOnNavActive: "Block menu on navigation",
          blockMenuOnNavInactive: "Allow menu on navigation",
          audioPlayLabel: "Play background music",
          audioPauseLabel: "Pause background music",
          audioPlaylistTitle: "Choose track",
          audioPlaylistDescription: "Select a track to play from the playlist.",
          audioPopoverNowPlaying: "Now playing",
          audioPopoverRestart: "Restart",
          audioPopoverLoopOn: "Loop on",
          audioPopoverLoopOff: "Loop off",
          audioPopoverSource: "File",
        },
        es: {
          pt: "Portugues",
          en: "Ingles",
          es: "Espanol",
          footerLabel: "Proyecto",
          menuOpen: "Menu",
          menuClose: "Cerrar",
          showMenu: "Abrir menu",
          hideMenu: "Cerrar menu",
          quickNavigation: "Ctrl+K",
          searchOwnerLabel: "Usuario (ej: Vidigal-code)",
          searchRepoLabel: "Repositorio (ej: git-page-link-create)",
          searchButtonLabel: "Buscar",
          typeToNavigate: "Escribe para navegar...",
          noNavigationResults: "Sin resultados de navegacion.",
          focusMode: "Modo foco",
          versionLinksLabel: "Enlaces del repositorio",
          titleHeaderMenuMd: "Markdown",
          titleHeaderMenuVideo: "Vídeo",
          titleHeaderMenuAudio: "Áudio",
          titleHeaderMenuHtml: "Páginas",
          lastUpdateVersionLabel: "Ultima version de actualizacion",
          darkMode: "Modo oscuro",
          lightMode: "Modo claro",
          blockMenuOnNavActive: "Bloquear menú en la navegación",
          blockMenuOnNavInactive: "Permitir menú en la navegación",
          audioPopoverNowPlaying: "Reproduciendo",
          audioPopoverRestart: "Reiniciar",
          audioPopoverLoopOn: "Activar loop",
          audioPopoverLoopOff: "Desactivar loop",
          audioPopoverSource: "Archivo",
          audioPlayLabel: "Reproducir música de fondo",
          audioPauseLabel: "Pausar música de fondo",
          audioPlaylistTitle: "Elegir pista",
          audioPlaylistDescription: "Seleccione una pista para reproducir de la playlist.",
        },
      },
    },
    VersionControl: {
      versions: [
        { id: "1.0.0", path: "gitpagedocs/docs/versions/1.0.0/config.json", ProjectLink: projectLink, PathConfig: "gitpagedocs/docs/versions/1.0.0/config.json", PreviewProject: "", UpdateDate: "", branch: "", release: "", commit: "" },
        { id: "1.1.0", path: "gitpagedocs/docs/versions/1.1.0/config.json", ProjectLink: projectLink, PathConfig: "gitpagedocs/docs/versions/1.1.0/config.json", PreviewProject: "", UpdateDate: "", branch: "", release: "", commit: "" },
        { id: "1.1.1", path: "gitpagedocs/docs/versions/1.1.1/config.json", ProjectLink: projectLink, PathConfig: "gitpagedocs/docs/versions/1.1.1/config.json", PreviewProject: "", UpdateDate: "", branch: "", release: "", commit: "" },
      ],
    },
    translations: {
      notFound: {
        title: { pt: "Pagina nao encontrada", en: "Page not found", es: "Pagina no encontrada" },
        description: {
          pt: "A pagina de documentacao solicitada nao existe neste contexto de repositorio.",
          en: "The requested documentation page does not exist in this repository context.",
          es: "La pagina de documentacion solicitada no existe en este contexto de repositorio.",
        },
        returnHome: { pt: "Voltar para inicio", en: "Return Home", es: "Volver al inicio" },
      },
      navigation: {
        previous: { pt: "Voltar", en: "Previous", es: "Volver" },
        next: { pt: "Proximo", en: "Next", es: "Siguiente" },
        menuOpen: { pt: "Menu", en: "Menu", es: "Menu" },
        menuClose: { pt: "Fechar", en: "Close", es: "Cerrar" },
        browsePrev: { pt: "Anterior", en: "Previous", es: "Anterior" },
        browseNext: { pt: "Proximo", en: "Next", es: "Siguiente" },
      },
      footer: { footerLabel: { pt: "Projeto", en: "Project", es: "Proyecto" } },
    },
  };

  const layoutsConfig = { layouts: LAYOUTS };
  const fallbackLayoutsConfig = { layouts: FALLBACK_LAYOUTS };

  const sourceViewerHtml = generateSourceViewerHtml(root);
  const docsHtml = {
    ...HTML_PAGES,
    sourceViewer: { pt: sourceViewerHtml, en: sourceViewerHtml, es: sourceViewerHtml },
  };

  return {
    rootConfig,
    layoutsConfig,
    fallbackLayoutsConfig,
    docs: DOCS,
    docsHtml,
    versionConfigs: {
      "1.0.0": {
        "routes-md": versionRoutes_1_0_0_md,
        "routes-html": versionRoutes_1_0_0_html,
        "routes-video": versionRoutes_1_0_0_video,
        "menus-header-md": versionMenus_1_0_0.md,
        "menus-header-html": versionMenus_1_0_0.html,
        "menus-header-video": versionMenus_1_0_0.video,
        hierarchyPage: DEFAULT_HIERARCHY,
        hierarchyMenu: DEFAULT_HIERARCHY,
      },
      "1.1.0": {
        "routes-md": versionRoutes_1_1_0_md,
        "routes-html": versionRoutes_1_1_0_html,
        "routes-video": versionRoutes_1_1_0_video,
        "menus-header-md": versionMenus_1_1_0.md,
        "menus-header-html": versionMenus_1_1_0.html,
        "menus-header-video": versionMenus_1_1_0.video,
        hierarchyPage: DEFAULT_HIERARCHY,
        hierarchyMenu: DEFAULT_HIERARCHY,
      },
      "1.1.1": {
        "routes-md": versionRoutes_1_1_1_md,
        "routes-html": versionRoutes_1_1_1_html,
        "routes-video": versionRoutes_1_1_1_video,
        "menus-header-md": versionMenus_1_1_1.md,
        "menus-header-html": versionMenus_1_1_1.html,
        "menus-header-video": versionMenus_1_1_1.video,
        hierarchyPage: DEFAULT_HIERARCHY,
        hierarchyMenu: DEFAULT_HIERARCHY,
      },
    },
  };
}
