/** Route and video metadata for doc versions */

export const DEFAULT_HIERARCHY = { md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 };
/** Page order that puts the video container above the markdown. */
export const VIDEO_FIRST_HIERARCHY = { video: 0, md: 1, "source-viewer": 2, html: 3, audio: 4, pdf: 5 };

export const ROUTE_META_ID1 = {
  titles: { pt: "Primeiros passos", en: "Getting Started", es: "Primeros pasos" },
  descriptions: { pt: "Configure o repositório do zero", en: "Configure repository from zero", es: "Configura el repositorio desde cero" },
};

export const ROUTE_META_ID2 = {
  titles: { pt: "Visão geral do projeto", en: "Project overview", es: "Visión general del proyecto" },
  descriptions: { pt: "Stack, objetivo e estrutura do Git Page Docs", en: "Stack, goals and structure of Git Page Docs", es: "Stack, objetivos y estructura de Git Page Docs" },
};

export const ROUTE_META_ID3 = {
  titles: { pt: "Funcionalidades", en: "Functionalities", es: "Funcionalidades" },
  descriptions: { pt: "CLI, opções, configuração e recursos", en: "CLI, options, configuration and features", es: "CLI, opciones, configuración y funciones" },
};

export const ROUTE_META_ID4 = {
  titles: { pt: "GitHub Issues e Projects", en: "GitHub issues and projects", es: "GitHub issues y projects" },
  descriptions: { pt: "Como usar Issues e Projects no GitHub", en: "How to use GitHub Issues and Projects", es: "Cómo usar GitHub Issues y Projects" },
};

export const ROUTE_META_ID5 = {
  titles: { pt: "Introdução ao Git", en: "Introduction to Git", es: "Introducción a Git" },
  descriptions: { pt: "Conceitos básicos de Git para iniciantes", en: "Basic Git concepts for beginners", es: "Conceptos básicos de Git para principiantes" },
};

export const ROUTE_META_ID6 = {
  titles: { pt: "Rotas autorizadas", en: "Authorized routes", es: "Rutas autorizadas" },
  descriptions: {
    pt: "Controle acesso por chave, roles e provedores externos",
    en: "Control access by key, roles and external providers",
    es: "Controla acceso por clave, roles y proveedores externos",
  },
};

export const REFERENCE_ROUTE_METAS = {
  13: {
    titles: { pt: "Configuração", en: "Configuration", es: "Configuración" },
    descriptions: { pt: "Idiomas, ícones, navegação, foco e acessibilidade", en: "Languages, icons, navigation, focus and accessibility", es: "Idiomas, iconos, navegación, foco y accesibilidad" },
  },
  14: {
    titles: { pt: "Publicação", en: "Deployment", es: "Publicación" },
    descriptions: { pt: "Execução local e publicação no GitHub Pages", en: "Local runtime and GitHub Pages deployment", es: "Ejecución local y publicación en GitHub Pages" },
  },
  15: {
    titles: { pt: "Arquitetura", en: "Architecture", es: "Arquitectura" },
    descriptions: { pt: "Pacotes, contratos e fluxo de dados", en: "Packages, contracts and data flow", es: "Paquetes, contratos y flujo de datos" },
  },
  16: {
    titles: { pt: "Temas e layouts", en: "Themes and layouts", es: "Temas y diseños" },
    descriptions: { pt: "Personalize templates e tokens visuais", en: "Customize templates and visual tokens", es: "Personaliza plantillas y tokens visuales" },
  },
  17: {
    titles: { pt: "Perguntas frequentes", en: "FAQ", es: "Preguntas frecuentes" },
    descriptions: { pt: "Diagnóstico e solução de problemas", en: "Diagnostics and troubleshooting", es: "Diagnóstico y solución de problemas" },
  },
  18: {
    titles: { pt: "Referência da CLI", en: "CLI reference", es: "Referencia de la CLI" },
    descriptions: { pt: "Instalação, comandos, opções e exemplos", en: "Installation, commands, options and examples", es: "Instalación, comandos, opciones y ejemplos" },
  },
  19: {
    titles: { pt: "Servidor MCP", en: "MCP server", es: "Servidor MCP" },
    descriptions: { pt: "Instalação, clientes, tools, resources e provedores", en: "Installation, clients, tools, resources and providers", es: "Instalación, clientes, tools, resources y proveedores" },
  },
  20: {
    titles: { pt: "Navegação e submenus", en: "Navigation and nested menus", es: "Navegación y submenús" },
    descriptions: { pt: "Árvores recursivas, URLs e breadcrumbs", en: "Recursive trees, URLs and breadcrumbs", es: "Árboles recursivos, URLs y breadcrumbs" },
  },
  21: {
    titles: { pt: "Acessibilidade e narração", en: "Accessibility and narration", es: "Accesibilidad y narración" },
    descriptions: { pt: "Leitura com vozes nativas do navegador", en: "Reading with native browser voices", es: "Lectura con voces nativas del navegador" },
  },
  22: {
    titles: { pt: "Modo foco", en: "Focus mode", es: "Modo foco" },
    descriptions: { pt: "Leitura, cópia, download e navegação entre documentos", en: "Reading, copy, download and document navigation", es: "Lectura, copia, descarga y navegación entre documentos" },
  },
  24: {
    titles: { pt: "Documentos PDF", en: "PDF documents", es: "Documentos PDF" },
    descriptions: { pt: "Rotas, prévia, download e publicação de anexos PDF", en: "Routes, previews, downloads and publishing PDF attachments", es: "Rutas, vista previa, descarga y publicación de anexos PDF" },
  },
  25: {
    titles: { pt: "Receitas de configuração", en: "Configuration recipes", es: "Recetas de configuración" },
    descriptions: { pt: "Exemplos completos de configuração e seções aninhadas", en: "Complete configuration and nested-section examples", es: "Ejemplos completos de configuración y secciones anidadas" },
  },
  26: {
    titles: { pt: "Migração e compatibilidade", en: "Migration and compatibility", es: "Migración y compatibilidad" },
    descriptions: { pt: "Atualize preservando conteúdo e personalizações", en: "Upgrade while preserving content and customizations", es: "Actualiza conservando contenido y personalizaciones" },
  },
  27: {
    titles: { pt: "Solução de problemas", en: "Troubleshooting", es: "Solución de problemas" },
    descriptions: { pt: "Diagnostique configuração, publicação, PDF e integrações", en: "Diagnose configuration, deployment, PDF and integrations", es: "Diagnostica configuración, publicación, PDF e integraciones" },
  },
  28: {
    titles: { pt: "Contribuição e testes", en: "Contributing and testing", es: "Contribución y pruebas" },
    descriptions: { pt: "Fontes autorais, contratos, testes e publicação", en: "Authoring sources, contracts, tests and releases", es: "Fuentes, contratos, pruebas y publicación" },
  },
  30: {
    titles: { pt: "Containers HTML", en: "HTML containers", es: "Contenedores HTML" },
    descriptions: { pt: "Páginas HTML, URLs externas e o exemplo interativo DOOM", en: "HTML pages, external URLs and the interactive DOOM example", es: "Páginas HTML, URLs externas y el ejemplo interactivo DOOM" },
  },
};

export const HTML_DOOM_META = {
  id: 29,
  titles: { pt: "DOOM: exemplo HTML", en: "DOOM: HTML example", es: "DOOM: ejemplo HTML" },
  descriptions: {
    pt: "Um container HTML com título, descrição e um jogo carregado apenas ao clicar.",
    en: "An HTML container with a title, description and a game loaded only after clicking.",
    es: "Un contenedor HTML con título, descripción y un juego que se carga solo al hacer clic.",
  },
};

export const SOURCE_VIEWER_META = {
  id: 7,
  titles: { pt: "Codigo fonte", en: "Source code", es: "Codigo fuente" },
  descriptions: {
    pt: "Explore a arvore do repositorio, navegue por pastas e visualize arquivos diretamente na documentacao.",
    en: "Explore the repository tree, browse folders, and preview files directly inside the documentation.",
    es: "Explora el arbol del repositorio, navega por carpetas y previsualiza archivos directamente en la documentacion.",
  },
};

export const AUDIO_META_ID12 = {
  id: 12,
  title: { pt: "Trilha de audio", en: "Audio track", es: "Pista de audio" },
  description: {
    pt: "Ouça uma faixa de exemplo diretamente na documentacao.",
    en: "Listen to a sample track directly inside the documentation.",
    es: "Escucha una pista de ejemplo directamente en la documentacion.",
  },
};

export const PDF_GUIDE_META = {
  id: 23,
  titles: { pt: "Guia do projeto em PDF (inglês)", en: "Project guide PDF (English)", es: "Guía del proyecto en PDF (inglés)" },
  descriptions: {
    pt: "Visualize ou baixe o guia do GitPageDocs em inglês.",
    en: "Preview or download the GitPageDocs project guide in English.",
    es: "Visualiza o descarga la guía de GitPageDocs en inglés.",
  },
};

export const VIDEO_META_ID1 = {
  title: { pt: "Interactive vs non-interactive modes | Copilot CLI for beginners", en: "Interactive vs non-interactive modes | Copilot CLI for beginners", es: "Interactive vs non-interactive modes | Copilot CLI for beginners" },
  description: {
    pt: "Quer saber a forma mais rápida de usar o GitHub Copilot no terminal? Neste tutorial, exploramos os dois modos principais do Copilot CLI.",
    en: "Want to know the fastest way to prompt GitHub Copilot from your terminal? In this beginner tutorial, we explore the two main modes of the Copilot CLI. Discover how to use the interactive mode to have GitHub Copilot run your project locally or use the non-interactive mode with the -p flag for quick summaries without leaving your shell context.",
    es: "¿Quieres conocer la forma más rápida de usar GitHub Copilot desde tu terminal? En este tutorial exploramos los dos modos principales del Copilot CLI.",
  },
};

export const VIDEO_META_ID2 = {
  title: { pt: "How to use GitHub issues and projects | GitHub for Beginners", en: "How to use GitHub issues and projects | GitHub for Beginners", es: "How to use GitHub issues and projects | GitHub for Beginners" },
  description: {
    pt: "Aprenda a usar GitHub Issues e Projects para gerenciar seu trabalho.",
    en: "Learn how to use GitHub Issues and Projects to manage your work effectively.",
    es: "Aprende a usar GitHub Issues y Projects para gestionar tu trabajo.",
  },
};

export const VIDEO_META_ID3 = {
  title: { pt: "How I built an AI Python tutor with the GitHub Copilot SDK", en: "How I built an AI Python tutor with the GitHub Copilot SDK", es: "How I built an AI Python tutor with the GitHub Copilot SDK" },
  description: {
    pt: "Construindo um tutor de Python com IA usando o GitHub Copilot SDK.",
    en: "Building an AI Python tutor using the GitHub Copilot SDK.",
    es: "Construyendo un tutor de Python con IA usando el GitHub Copilot SDK.",
  },
};

export const VIDEO_META_ID4 = {
  title: { pt: "A brief introduction to Git for beginners | GitHub", en: "A brief introduction to Git for beginners | GitHub", es: "A brief introduction to Git for beginners | GitHub" },
  description: {
    pt: "Introdução ao Git para iniciantes.",
    en: "A brief introduction to Git for beginners.",
    es: "Una breve introducción a Git para principiantes.",
  },
};
