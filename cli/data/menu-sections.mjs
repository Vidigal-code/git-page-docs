import { COMPOSED_PAGE_MENU } from "./composed-pages.mjs";

export const MARKDOWN_MENU_SECTIONS = [
  1,
  2,
  {
    id: 1000,
    routeId: 31,
    titles: { en: "Guides", pt: "Guias", es: "Guías" },
    submenus: [
      {
        id: 1001,
        routeId: 32,
        titles: { en: "Configure your site", pt: "Configure seu site", es: "Configura tu sitio" },
        submenus: [13, 25, 16, 20],
      },
      {
        id: 1002,
        routeId: 33,
        titles: { en: "Read and explore", pt: "Leia e explore", es: "Lee y explora" },
        submenus: [22, 21, 24, 30, 40, COMPOSED_PAGE_MENU],
      },
      {
        id: 1003,
        routeId: 34,
        titles: { en: "Automate and integrate", pt: "Automatize e integre", es: "Automatiza e integra" },
        submenus: [18, 19, 6],
      },
    ],
  },
  {
    id: 1100,
    routeId: 35,
    titles: { en: "Operations and development", pt: "Operação e desenvolvimento", es: "Operación y desarrollo" },
    submenus: [
      {
        id: 1101,
        routeId: 36,
        titles: { en: "Ship and maintain", pt: "Publique e mantenha", es: "Publica y mantén" },
        submenus: [14, 26, 27, 17],
      },
      {
        id: 1102,
        routeId: 37,
        titles: { en: "Develop the project", pt: "Desenvolva o projeto", es: "Desarrolla el proyecto" },
        submenus: [15, 28, 3],
      },
    ],
  },
  {
    id: 1200,
    routeId: 38,
    titles: { en: "Git and GitHub", pt: "Git e GitHub", es: "Git y GitHub" },
    submenus: [5, 4],
  },
];
