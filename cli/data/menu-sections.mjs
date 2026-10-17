export const MARKDOWN_MENU_SECTIONS = [
  1,
  2,
  {
    id: 1000,
    titles: { en: "Guides", pt: "Guias", es: "Guías" },
    submenus: [
      {
        id: 1001,
        titles: { en: "Configure your site", pt: "Configure seu site", es: "Configura tu sitio" },
        submenus: [13, 25, 16, 20],
      },
      {
        id: 1002,
        titles: { en: "Read and explore", pt: "Leia e explore", es: "Lee y explora" },
        submenus: [22, 21, 24, 30],
      },
      {
        id: 1003,
        titles: { en: "Automate and integrate", pt: "Automatize e integre", es: "Automatiza e integra" },
        submenus: [18, 19, 6],
      },
    ],
  },
  {
    id: 1100,
    titles: { en: "Operations and development", pt: "Operação e desenvolvimento", es: "Operación y desarrollo" },
    submenus: [
      {
        id: 1101,
        titles: { en: "Ship and maintain", pt: "Publique e mantenha", es: "Publica y mantén" },
        submenus: [14, 26, 27, 17],
      },
      {
        id: 1102,
        titles: { en: "Develop the project", pt: "Desenvolva o projeto", es: "Desarrolla el proyecto" },
        submenus: [15, 28, 3],
      },
    ],
  },
  {
    id: 1200,
    titles: { en: "Git and GitHub", pt: "Git e GitHub", es: "Git y GitHub" },
    submenus: [5, 4],
  },
];
