import { PACKAGE_VERSION } from "../contracts/doc-versions.mjs";

const docsDirectory = `gitpagedocs/docs/versions/${PACKAGE_VERSION}`;
const localizedPath = (file) => Object.fromEntries(["en", "pt", "es"].map((language) => [language, `${docsDirectory}/${language}/${file}`]));

export const HTML_ROUTE_JSON = JSON.stringify({
  id: 29,
  title: { en: "DOOM: HTML example", pt: "DOOM: exemplo HTML", es: "DOOM: ejemplo HTML" },
  description: { en: "An interactive HTML container", pt: "Um container HTML interativo", es: "Un contenedor HTML interactivo" },
  titleIsVisible: true,
  descriptionIsVisible: true,
  path: localizedPath("doom.html"),
  container: "full",
  fullscreenEnabled: true,
  blockLink: true,
}, null, 2);

export const RECIPE_ROOT_JSON = JSON.stringify({
  site: {
    name: "Documentação • Guía • Documentation",
    docsVersion: PACKAGE_VERSION,
    languages: { en: true, pt: true, es: true },
    nestedMenusEnabled: true,
    ActiveNavigation: true,
    RouteGuide: true,
    FocusMode: true,
    focusMode: { copyEnabled: true, downloadEnabled: true, sectionNavigationEnabled: true, documentNavigationEnabled: true },
    icons: {
      defaults: { reactIcon: true, size: "22px", colorDark: "currentColor", colorLight: "currentColor" },
      LanguageSelector: { tag: "FiGlobe" },
      ThemeSelector: { tag: "BsSunFill" },
      FocusMode: { tag: "MdFullscreen" },
      QuickNavigation: { tag: "FiSearch" },
      PdfDownload: { tag: "FiDownload" },
      PdfOpenInNewTab: { tag: "FiExternalLink" },
      DocumentPrevious: { tag: "FiChevronLeft" },
      DocumentNext: { tag: "FiChevronRight" },
    },
    pdf: { enabled: true, previewEnabled: true, downloadEnabled: true, openInNewTabEnabled: true },
  },
  VersionControl: { versions: [{ id: PACKAGE_VERSION, path: `${docsDirectory}/config.json` }] },
}, null, 2);

export const RECIPE_VERSION_JSON = JSON.stringify({
  routeDefaults: { RouteGuide: true },
  "routes-md": [
    { id: 101, title: { en: "Start", pt: "Início", es: "Inicio" }, path: localizedPath("start.md") },
    { id: 102, title: { en: "Next steps", pt: "Próximos passos", es: "Próximos pasos" }, path: localizedPath("next-steps.md") },
  ],
  "menus-header-md": [{
    id: 3100,
    en: { title: "Guides" }, pt: { title: "Guias" }, es: { title: "Guías" },
    submenus: [{
      id: 3101,
      en: { title: "Getting started" }, pt: { title: "Primeiros passos" }, es: { title: "Primeros pasos" },
      submenus: [
        { id: 101, en: { title: "Start", "path-click": `${docsDirectory}/en/start.md` }, pt: { title: "Início", "path-click": `${docsDirectory}/pt/start.md` }, es: { title: "Inicio", "path-click": `${docsDirectory}/es/start.md` } },
        { id: 102, en: { title: "Next steps", "path-click": `${docsDirectory}/en/next-steps.md` }, pt: { title: "Próximos passos", "path-click": `${docsDirectory}/pt/next-steps.md` }, es: { title: "Próximos pasos", "path-click": `${docsDirectory}/es/next-steps.md` } },
      ],
    }],
  }],
}, null, 2);
