#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.join(SCRIPT_DIR, "..");
const PREBUILT_DIR = path.join(PKG_ROOT, "prebuilt");

const LAYOUTS = [
  {
    id: "matrix-dark",
    name: "Matrix Dark",
    author: "Kauan Vidigal",
    file: "templates/matrix-dark.json",
    preview: "Dark theme with neon green accents inspired by The Matrix",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "matrix-1",
    mode: "dark",
  },
  {
    id: "matrix-light",
    name: "Matrix Light",
    author: "Kauan Vidigal",
    file: "templates/matrix-light.json",
    preview: "Light theme with green accents inspired by The Matrix",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "matrix-1",
    mode: "light",
  },
  {
    id: "default",
    name: "Default Theme",
    author: "Kauan Vidigal",
    file: "templates/default.json",
    preview: "Clean and minimal default theme",
    supportsLightAndDarkModes: false,
    mode: "light",
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    author: "Kauan Vidigal",
    file: "templates/github-dark.json",
    preview: "GitHub-inspired dark theme",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "github-1",
    mode: "dark",
  },
  {
    id: "github-light",
    name: "GitHub Light",
    author: "Kauan Vidigal",
    file: "templates/github-light.json",
    preview: "GitHub-inspired light theme",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "github-1",
    mode: "light",
  },
  {
    id: "cyberpunk-dark",
    name: "Cyberpunk Dark",
    author: "Kauan Vidigal",
    file: "templates/cyberpunk-dark.json",
    preview: "Futuristic dark theme with neon pink and cyan accents",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "cyberpunk-1",
    mode: "dark",
  },
  {
    id: "cyberpunk-light",
    name: "Cyberpunk Light",
    author: "Kauan Vidigal",
    file: "templates/cyberpunk-light.json",
    preview: "Futuristic light theme with bright pink and cyan accents",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "cyberpunk-1",
    mode: "light",
  },
  {
    id: "aurora-dark",
    name: "Aurora Dark",
    author: "Kauan Vidigal",
    file: "templates/aurora-dark.json",
    preview: "Modern dark theme with purple + cyan accents and glassy cards",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "aurora-1",
    mode: "dark",
  },
  {
    id: "aurora-light",
    name: "Aurora Light",
    author: "Kauan Vidigal",
    file: "templates/aurora-light.json",
    preview: "Modern light theme with purple + teal accents and soft shadows",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "aurora-1",
    mode: "light",
  },
  {
    id: "nord-dark",
    name: "Nord Dark",
    author: "Kauan Vidigal",
    file: "templates/nord-dark.json",
    preview: "Calm Nord-inspired dark theme (icy blues, low contrast glare)",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "nord-1",
    mode: "dark",
  },
  {
    id: "nord-light",
    name: "Nord Light",
    author: "Kauan Vidigal",
    file: "templates/nord-light.json",
    preview: "Calm Nord-inspired light theme (clean, readable, modern)",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "nord-1",
    mode: "light",
  },
  {
    id: "sunset-dark",
    name: "Sunset Dark",
    author: "Kauan Vidigal",
    file: "templates/sunset-dark.json",
    preview: "Warm dark theme with orange + pink accents (sunset vibe)",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "sunset-1",
    mode: "dark",
  },
  {
    id: "sunset-light",
    name: "Sunset Light",
    author: "Kauan Vidigal",
    file: "templates/sunset-light.json",
    preview: "Warm light theme with orange + rose accents (soft, modern UI)",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "sunset-1",
    mode: "light",
  },
  {
    id: "mono-dark",
    name: "Mono Pro Dark",
    author: "Kauan Vidigal",
    file: "templates/mono-dark.json",
    preview: "Minimal dark theme with lime accent and high readability",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "mono-1",
    mode: "dark",
  },
  {
    id: "mono-light",
    name: "Mono Pro Light",
    author: "Kauan Vidigal",
    file: "templates/mono-light.json",
    preview: "Minimal light theme with lime accent and clean surfaces",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "mono-1",
    mode: "light",
  },
];

const FALLBACK_LAYOUTS = LAYOUTS.filter((layout) => layout.id === "aurora-dark" || layout.id === "aurora-light");

const THEME_COLORS = {
  "matrix-dark": {
    background: "#030606",
    primary: "#22C55E",
    secondary: "#4ADE80",
    text: "#DCFCE7",
    textSecondary: "#86EFAC",
    cardBackground: "#04120A",
    cardBorder: "#14532D",
    error: "#F87171",
    success: "#22C55E",
  },
  "matrix-light": {
    background: "#F0FDF4",
    primary: "#15803D",
    secondary: "#16A34A",
    text: "#052E16",
    textSecondary: "#166534",
    cardBackground: "#FFFFFF",
    cardBorder: "#BBF7D0",
    error: "#DC2626",
    success: "#16A34A",
  },
  default: {
    background: "#FFFFFF",
    primary: "#0EA5E9",
    secondary: "#2563EB",
    text: "#0F172A",
    textSecondary: "#334155",
    cardBackground: "#FFFFFF",
    cardBorder: "#E2E8F0",
    error: "#DC2626",
    success: "#16A34A",
  },
  "github-dark": {
    background: "#0D1117",
    primary: "#58A6FF",
    secondary: "#2EA043",
    text: "#E6EDF3",
    textSecondary: "#8B949E",
    cardBackground: "#161B22",
    cardBorder: "#30363D",
    error: "#F85149",
    success: "#3FB950",
  },
  "github-light": {
    background: "#FFFFFF",
    primary: "#0969DA",
    secondary: "#1A7F37",
    text: "#1F2328",
    textSecondary: "#57606A",
    cardBackground: "#FFFFFF",
    cardBorder: "#D0D7DE",
    error: "#D1242F",
    success: "#1A7F37",
  },
  "cyberpunk-dark": {
    background: "#090014",
    primary: "#F472B6",
    secondary: "#22D3EE",
    text: "#F5D0FE",
    textSecondary: "#C4B5FD",
    cardBackground: "#160024",
    cardBorder: "#7E22CE",
    error: "#FB7185",
    success: "#2DD4BF",
  },
  "cyberpunk-light": {
    background: "#FFF1F8",
    primary: "#DB2777",
    secondary: "#0891B2",
    text: "#4A044E",
    textSecondary: "#6D28D9",
    cardBackground: "#FFFFFF",
    cardBorder: "#F5D0FE",
    error: "#E11D48",
    success: "#0D9488",
  },
  "aurora-dark": {
    background: "#070A14",
    primary: "#7C3AED",
    secondary: "#22D3EE",
    text: "#E5E7EB",
    textSecondary: "#B8C3D6",
    cardBackground: "#101726",
    cardBorder: "#334155",
    error: "#FB7185",
    success: "#34D399",
  },
  "aurora-light": {
    background: "#F8FAFC",
    primary: "#6D28D9",
    secondary: "#0891B2",
    text: "#0F172A",
    textSecondary: "#475569",
    cardBackground: "#FFFFFF",
    cardBorder: "#E2E8F0",
    error: "#E11D48",
    success: "#059669",
  },
  "nord-dark": {
    background: "#2E3440",
    primary: "#88C0D0",
    secondary: "#81A1C1",
    text: "#ECEFF4",
    textSecondary: "#D8DEE9",
    cardBackground: "#3B4252",
    cardBorder: "#4C566A",
    error: "#BF616A",
    success: "#A3BE8C",
  },
  "nord-light": {
    background: "#ECEFF4",
    primary: "#5E81AC",
    secondary: "#81A1C1",
    text: "#2E3440",
    textSecondary: "#4C566A",
    cardBackground: "#FFFFFF",
    cardBorder: "#D8DEE9",
    error: "#BF616A",
    success: "#5E81AC",
  },
  "sunset-dark": {
    background: "#1A0F0C",
    primary: "#FB923C",
    secondary: "#F472B6",
    text: "#FFE4D6",
    textSecondary: "#FDBA74",
    cardBackground: "#2A1611",
    cardBorder: "#7C2D12",
    error: "#FB7185",
    success: "#4ADE80",
  },
  "sunset-light": {
    background: "#FFF7ED",
    primary: "#EA580C",
    secondary: "#DB2777",
    text: "#431407",
    textSecondary: "#9A3412",
    cardBackground: "#FFFFFF",
    cardBorder: "#FED7AA",
    error: "#E11D48",
    success: "#16A34A",
  },
  "mono-dark": {
    background: "#0B0F0C",
    primary: "#A3E635",
    secondary: "#65A30D",
    text: "#ECFCCB",
    textSecondary: "#BEF264",
    cardBackground: "#141A16",
    cardBorder: "#365314",
    error: "#F87171",
    success: "#84CC16",
  },
  "mono-light": {
    background: "#F7FEE7",
    primary: "#4D7C0F",
    secondary: "#65A30D",
    text: "#1A2E05",
    textSecondary: "#3F6212",
    cardBackground: "#FFFFFF",
    cardBorder: "#D9F99D",
    error: "#DC2626",
    success: "#4D7C0F",
  },
};

const DOCS = {
  en: {
    index: `# Welcome to Git Page Docs

This project was generated by \`npm run gitpagedocs\`.

## What is this?

Git Page Docs is a multilingual markdown renderer with:

- Theme catalog with dark/light support
- Language switcher
- Responsive sidebar + mobile hamburger menu
- Search-by-repository rendering when enabled

## How to publish

1. Push this project to your GitHub repository.
2. Configure deployment (Vercel, self-hosted Next.js, or compatible platform).
3. Keep your markdown files in \`gitpagedocs/docs/en\`, \`gitpagedocs/docs/pt\`, and \`gitpagedocs/docs/es\`.
`,
    gettingStarted: `# Getting Started

This guide helps you run and customize the project quickly.

## Requirements

- Node.js 20+
- npm or pnpm

## First run

1. Install dependencies: \`npm install\`
2. Generate project base: \`npm run gitpagedocs\`
3. Start development: \`npm run dev\`
`,
    configuration: `# Configuration

All runtime options are configured in \`gitpagedocs/config.json\`.

## Site settings

- \`defaultLanguage\`
- \`HideThemeSelector\`
- \`ThemeDefault\`
- \`ActiveNavigation\`
- \`IconImageMenuHeader\`
`,
    deployment: `# Deployment

This project is ready to deploy as a Next.js application.

## Production build

1. Run: \`npm run build\`
2. Start server: \`npm start\` or \`pnpm start\`
`,
    architecture: `# Architecture

This project uses a modular architecture to keep rendering, theme loading and UI concerns isolated.

## Core layers

- \`src/app\`: Next.js routes and shell
- \`src/entities/docs\`: models and loading logic
- \`src/widgets/docs-shell\`: layout and interactions
`,
    themes: `# Themes and layouts

Themes are defined by JSON templates and loaded dynamically.

## Locations

- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`
`,
    faq: `# FAQ

## Why is my repository not rendering?

Check \`GITPAGEDOCS_REPOSITORY_SEARCH\`, remote \`gitpagedocs/config.json\`, and route paths.
`,
  },
  pt: {
    index: `# Bem-vindo ao Git Page Docs

Este projeto foi gerado por \`npm run gitpagedocs\`.

## O que e isto?

Git Page Docs e um renderizador de markdown multi-idioma com:

- Catalogo de temas com suporte dark/light
- Seletor de idioma
- Sidebar responsiva + menu hamburguer no mobile
- Renderizacao via busca de repositorio quando habilitado

## Como publicar

1. Envie este projeto para o seu repositorio GitHub.
2. Configure o deploy (Vercel, Next.js self-hosted ou plataforma compativel).
3. Mantenha seus markdowns em \`gitpagedocs/docs/en\`, \`gitpagedocs/docs/pt\` e \`gitpagedocs/docs/es\`.
`,
    gettingStarted: `# Primeiros passos

Este guia ajuda voce a rodar e personalizar o projeto rapidamente.

## Requisitos

- Node.js 20+
- npm ou pnpm

## Primeiro uso

1. Instale dependencias: \`npm install\`
2. Gere a base do projeto: \`npm run gitpagedocs\`
3. Inicie desenvolvimento: \`npm run dev\`
`,
    configuration: `# Configuracao

Todas as opcoes de execucao ficam em \`gitpagedocs/config.json\`.

## Configuracoes do site

- \`defaultLanguage\`
- \`HideThemeSelector\`
- \`ThemeDefault\`
- \`ActiveNavigation\`
- \`IconImageMenuHeader\`
`,
    deployment: `# Publicacao

Este projeto esta pronto para deploy como aplicacao Next.js.

## Build de producao

1. Execute: \`npm run build\`
2. Inicie servidor: \`npm start\` ou \`pnpm start\`
`,
    architecture: `# Arquitetura

Este projeto usa arquitetura modular para separar renderizacao, temas e interface.

## Camadas

- \`src/app\`
- \`src/entities/docs\`
- \`src/widgets/docs-shell\`
`,
    themes: `# Temas e layouts

Temas sao definidos em JSON e carregados dinamicamente.

## Locais

- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`
`,
    faq: `# FAQ

## Por que o repositorio nao renderiza?

Verifique \`GITPAGEDOCS_REPOSITORY_SEARCH\`, \`gitpagedocs/config.json\` remoto e caminhos em \`routes\`.
`,
  },
  es: {
    index: `# Bienvenido a Git Page Docs

Este proyecto fue generado con \`npm run gitpagedocs\`.

## Que es esto?

Git Page Docs es un renderizador markdown multilenguaje con:

- Catalogo de temas con soporte dark/light
- Selector de idioma
- Sidebar responsiva + menu hamburguesa en mobile
- Renderizado por busqueda de repositorio cuando esta activo

## Como publicar

1. Sube este proyecto a tu repositorio de GitHub.
2. Configura el deploy (Vercel, Next.js self-hosted o plataforma compatible).
3. Mantiene tus markdowns en \`gitpagedocs/docs/en\`, \`gitpagedocs/docs/pt\` y \`gitpagedocs/docs/es\`.
`,
    gettingStarted: `# Primeros pasos

Esta guia te ayuda a ejecutar y personalizar el proyecto rapidamente.

## Requisitos

- Node.js 20+
- npm o pnpm

## Primer uso

1. Instala dependencias: \`npm install\`
2. Genera la base del proyecto: \`npm run gitpagedocs\`
3. Inicia desarrollo: \`npm run dev\`
`,
    configuration: `# Configuracion

Todas las opciones de ejecucion estan en \`gitpagedocs/config.json\`.

## Configuracion del sitio

- \`defaultLanguage\`
- \`HideThemeSelector\`
- \`ThemeDefault\`
- \`ActiveNavigation\`
- \`IconImageMenuHeader\`
`,
    deployment: `# Publicacion

Este proyecto esta listo para despliegue como aplicacion Next.js.

## Build de produccion

1. Ejecuta: \`npm run build\`
2. Inicia servidor: \`npm start\` o \`pnpm start\`
`,
    architecture: `# Arquitectura

Este proyecto usa arquitectura modular para separar renderizado, temas e interfaz.

## Capas

- \`src/app\`
- \`src/entities/docs\`
- \`src/widgets/docs-shell\`
`,
    themes: `# Temas y layouts

Los temas se definen en JSON y se cargan dinamicamente.

## Ubicaciones

- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`
`,
    faq: `# FAQ

## Por que el repositorio no renderiza?

Verifica \`GITPAGEDOCS_REPOSITORY_SEARCH\`, \`gitpagedocs/config.json\` remoto y rutas en \`routes\`.
`,
  },
};

function createThemeTemplate(layout) {
  const colors = THEME_COLORS[layout.id] ?? THEME_COLORS.default;
  const dark = layout.mode === "dark";
  return {
    id: layout.id,
    name: layout.name,
    author: layout.author,
    version: "1.0.0",
    mode: layout.mode,
    supportsLightAndDarkModes: layout.supportsLightAndDarkModes,
    colors,
    typography: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif",
      fontSize: {
        small: "0.875rem",
        base: "1rem",
        medium: "1.125rem",
        large: "1.25rem",
        xlarge: "2rem",
      },
    },
    components: {
      header: {
        height: "80px",
        backgroundColor: dark ? "#0B1220" : "#FFFFFF",
        borderBottom: dark ? "1px solid #334155" : "1px solid #E2E8F0",
      },
      footer: {
        height: "60px",
        backgroundColor: dark ? "#0B1220" : "#FFFFFF",
        borderTop: dark ? "1px solid #334155" : "1px solid #E2E8F0",
      },
      card: {
        borderRadius: "16px",
        padding: "24px",
        boxShadow: dark ? "0 18px 60px rgba(0, 0, 0, 0.45)" : "0 18px 50px rgba(15, 23, 42, 0.08)",
      },
      button: {
        borderRadius: "12px",
        padding: "10px 18px",
        border: dark ? "1px solid #334155" : "1px solid #E2E8F0",
        hoverGlow: dark ? "0 0 0 3px rgba(124, 58, 237, 0.18)" : "0 0 0 4px rgba(109, 40, 217, 0.15)",
      },
      select: {
        borderRadius: "12px",
        padding: "10px 40px 10px 16px",
        border: dark ? "1px solid #334155" : "1px solid #E2E8F0",
        backgroundColor: dark ? "#0F172A" : "#FFFFFF",
        textAlign: "center",
        iconColor: colors.secondary,
        hoverBorderColor: dark ? "rgba(34, 211, 238, 0.7)" : "rgba(8, 145, 178, 0.7)",
        focusBorderColor: dark ? "rgba(124, 58, 237, 0.8)" : "rgba(109, 40, 217, 0.8)",
        focusGlow: dark ? "0 0 0 4px rgba(124, 58, 237, 0.18)" : "0 0 0 4px rgba(109, 40, 217, 0.15)",
      },
      checkbox: {
        width: "20px",
        height: "20px",
        accentColor: colors.primary,
        borderColor: dark ? "#475569" : "#CBD5E1",
        hoverBorderColor: dark ? "rgba(34, 211, 238, 0.75)" : "rgba(8, 145, 178, 0.7)",
        checkMarkColor: colors.background,
        borderRadius: "6px",
      },
    },
    animations: {
      enableTypingEffect: false,
      enableGlow: dark,
      transitionDuration: "0.22s",
    },
  };
}

async function writeJson(relativePath, data) {
  const absolutePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

async function writeText(relativePath, data) {
  const absolutePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, data, "utf-8");
}

function normalizeToOutputPath(outputDir, configPath) {
  const normalized = configPath.replace(/^gitpagedocs\//, "");
  return `${outputDir}/${normalized}`;
}

function parseDocFileToKey(fileName) {
  if (fileName === "index.md") return "index";
  if (fileName === "getting-started.md") return "gettingStarted";
  if (fileName === "configuration.md") return "configuration";
  if (fileName === "deployment.md") return "deployment";
  if (fileName === "architecture.md") return "architecture";
  if (fileName === "themes.md") return "themes";
  if (fileName === "faq.md") return "faq";
  return undefined;
}

function extractLanguageFromPath(docPath) {
  const match = docPath.match(/\/(pt|en|es)\//);
  return match?.[1];
}

function buildConfigArtifacts() {
  const versionRoutes_1_0_0 = [
    {
      id: 0,
      path: {
        pt: "gitpagedocs/docs/versions/1.0.0/pt/index.md",
        en: "gitpagedocs/docs/versions/1.0.0/en/index.md",
        es: "gitpagedocs/docs/versions/1.0.0/es/index.md",
      },
    },
    {
      id: 1,
      path: {
        pt: "gitpagedocs/docs/versions/1.0.0/pt/getting-started.md",
        en: "gitpagedocs/docs/versions/1.0.0/en/getting-started.md",
        es: "gitpagedocs/docs/versions/1.0.0/es/getting-started.md",
      },
    },
    {
      id: 2,
      path: {
        pt: "gitpagedocs/docs/versions/1.0.0/pt/configuration.md",
        en: "gitpagedocs/docs/versions/1.0.0/en/configuration.md",
        es: "gitpagedocs/docs/versions/1.0.0/es/configuration.md",
      },
    },
    {
      id: 3,
      path: {
        pt: "gitpagedocs/docs/versions/1.0.0/pt/deployment.md",
        en: "gitpagedocs/docs/versions/1.0.0/en/deployment.md",
        es: "gitpagedocs/docs/versions/1.0.0/es/deployment.md",
      },
    },
    {
      id: 4,
      path: {
        pt: "gitpagedocs/docs/versions/1.0.0/pt/architecture.md",
        en: "gitpagedocs/docs/versions/1.0.0/en/architecture.md",
        es: "gitpagedocs/docs/versions/1.0.0/es/architecture.md",
      },
    },
    {
      id: 5,
      path: {
        pt: "gitpagedocs/docs/versions/1.0.0/pt/themes.md",
        en: "gitpagedocs/docs/versions/1.0.0/en/themes.md",
        es: "gitpagedocs/docs/versions/1.0.0/es/themes.md",
      },
    },
    {
      id: 6,
      path: {
        pt: "gitpagedocs/docs/versions/1.0.0/pt/faq.md",
        en: "gitpagedocs/docs/versions/1.0.0/en/faq.md",
        es: "gitpagedocs/docs/versions/1.0.0/es/faq.md",
      },
    },
  ];

  const versionRoutes_1_1_0 = [
    { id: 0, path: { pt: "gitpagedocs/docs/versions/1.1.0/pt/index.md", en: "gitpagedocs/docs/versions/1.1.0/en/index.md", es: "gitpagedocs/docs/versions/1.1.0/es/index.md" } },
    { id: 1, path: { pt: "gitpagedocs/docs/versions/1.1.0/pt/getting-started.md", en: "gitpagedocs/docs/versions/1.1.0/en/getting-started.md", es: "gitpagedocs/docs/versions/1.1.0/es/getting-started.md" } },
    { id: 2, path: { pt: "gitpagedocs/docs/versions/1.1.0/pt/configuration.md", en: "gitpagedocs/docs/versions/1.1.0/en/configuration.md", es: "gitpagedocs/docs/versions/1.1.0/es/configuration.md" } },
    { id: 3, path: { pt: "gitpagedocs/docs/versions/1.1.0/pt/deployment.md", en: "gitpagedocs/docs/versions/1.1.0/en/deployment.md", es: "gitpagedocs/docs/versions/1.1.0/es/deployment.md" } },
    { id: 4, path: { pt: "gitpagedocs/docs/versions/1.1.0/pt/architecture.md", en: "gitpagedocs/docs/versions/1.1.0/en/architecture.md", es: "gitpagedocs/docs/versions/1.1.0/es/architecture.md" } },
    { id: 5, path: { pt: "gitpagedocs/docs/versions/1.1.0/pt/themes.md", en: "gitpagedocs/docs/versions/1.1.0/en/themes.md", es: "gitpagedocs/docs/versions/1.1.0/es/themes.md" } },
    { id: 6, path: { pt: "gitpagedocs/docs/versions/1.1.0/pt/faq.md", en: "gitpagedocs/docs/versions/1.1.0/en/faq.md", es: "gitpagedocs/docs/versions/1.1.0/es/faq.md" } },
  ];

  const versionRoutes_1_1_1 = [
    { id: 0, path: { pt: "gitpagedocs/docs/versions/1.1.1/pt/index.md", en: "gitpagedocs/docs/versions/1.1.1/en/index.md", es: "gitpagedocs/docs/versions/1.1.1/es/index.md" } },
    { id: 1, path: { pt: "gitpagedocs/docs/versions/1.1.1/pt/getting-started.md", en: "gitpagedocs/docs/versions/1.1.1/en/getting-started.md", es: "gitpagedocs/docs/versions/1.1.1/es/getting-started.md" } },
    { id: 2, path: { pt: "gitpagedocs/docs/versions/1.1.1/pt/configuration.md", en: "gitpagedocs/docs/versions/1.1.1/en/configuration.md", es: "gitpagedocs/docs/versions/1.1.1/es/configuration.md" } },
    { id: 3, path: { pt: "gitpagedocs/docs/versions/1.1.1/pt/deployment.md", en: "gitpagedocs/docs/versions/1.1.1/en/deployment.md", es: "gitpagedocs/docs/versions/1.1.1/es/deployment.md" } },
    { id: 4, path: { pt: "gitpagedocs/docs/versions/1.1.1/pt/architecture.md", en: "gitpagedocs/docs/versions/1.1.1/en/architecture.md", es: "gitpagedocs/docs/versions/1.1.1/es/architecture.md" } },
    { id: 5, path: { pt: "gitpagedocs/docs/versions/1.1.1/pt/themes.md", en: "gitpagedocs/docs/versions/1.1.1/en/themes.md", es: "gitpagedocs/docs/versions/1.1.1/es/themes.md" } },
    { id: 6, path: { pt: "gitpagedocs/docs/versions/1.1.1/pt/faq.md", en: "gitpagedocs/docs/versions/1.1.1/en/faq.md", es: "gitpagedocs/docs/versions/1.1.1/es/faq.md" } },
  ];

  const versionMenus_1_0_0 = [
    {
      id: 0,
      pt: { title: "Inicio", "path-click": "gitpagedocs/docs/versions/1.0.0/pt/index.md" },
      en: { title: "Home", "path-click": "gitpagedocs/docs/versions/1.0.0/en/index.md" },
      es: { title: "Inicio", "path-click": "gitpagedocs/docs/versions/1.0.0/es/index.md" },
    },
    {
      id: 1,
      pt: { title: "Primeiros passos", "path-click": "gitpagedocs/docs/versions/1.0.0/pt/getting-started.md" },
      en: { title: "Getting Started", "path-click": "gitpagedocs/docs/versions/1.0.0/en/getting-started.md" },
      es: { title: "Primeros pasos", "path-click": "gitpagedocs/docs/versions/1.0.0/es/getting-started.md" },
    },
    {
      id: 2,
      pt: {
        title: "Configuracao",
        "path-click": "gitpagedocs/docs/versions/1.0.0/pt/configuration.md",
        submenus: [
          { title: "Arquitetura", "path-click": "gitpagedocs/docs/versions/1.0.0/pt/architecture.md" },
          { title: "Temas e layouts", "path-click": "gitpagedocs/docs/versions/1.0.0/pt/themes.md" },
          { title: "FAQ", "path-click": "gitpagedocs/docs/versions/1.0.0/pt/faq.md" },
        ],
      },
      en: {
        title: "Configuration",
        "path-click": "gitpagedocs/docs/versions/1.0.0/en/configuration.md",
        submenus: [
          { title: "Architecture", "path-click": "gitpagedocs/docs/versions/1.0.0/en/architecture.md" },
          { title: "Themes and layouts", "path-click": "gitpagedocs/docs/versions/1.0.0/en/themes.md" },
          { title: "FAQ", "path-click": "gitpagedocs/docs/versions/1.0.0/en/faq.md" },
        ],
      },
      es: {
        title: "Configuracion",
        "path-click": "gitpagedocs/docs/versions/1.0.0/es/configuration.md",
        submenus: [
          { title: "Arquitectura", "path-click": "gitpagedocs/docs/versions/1.0.0/es/architecture.md" },
          { title: "Temas y layouts", "path-click": "gitpagedocs/docs/versions/1.0.0/es/themes.md" },
          { title: "FAQ", "path-click": "gitpagedocs/docs/versions/1.0.0/es/faq.md" },
        ],
      },
    },
    {
      id: 3,
      pt: { title: "Publicacao", "path-click": "gitpagedocs/docs/versions/1.0.0/pt/deployment.md" },
      en: { title: "Deployment", "path-click": "gitpagedocs/docs/versions/1.0.0/en/deployment.md" },
      es: { title: "Publicacion", "path-click": "gitpagedocs/docs/versions/1.0.0/es/deployment.md" },
    },
  ];

  const versionMenus_1_1_0 = [
    { id: 0, pt: { title: "Inicio", "path-click": "gitpagedocs/docs/versions/1.1.0/pt/index.md" }, en: { title: "Home", "path-click": "gitpagedocs/docs/versions/1.1.0/en/index.md" }, es: { title: "Inicio", "path-click": "gitpagedocs/docs/versions/1.1.0/es/index.md" } },
    { id: 1, pt: { title: "Primeiros passos", "path-click": "gitpagedocs/docs/versions/1.1.0/pt/getting-started.md" }, en: { title: "Getting Started", "path-click": "gitpagedocs/docs/versions/1.1.0/en/getting-started.md" }, es: { title: "Primeros pasos", "path-click": "gitpagedocs/docs/versions/1.1.0/es/getting-started.md" } },
    {
      id: 2,
      pt: { title: "Configuracao", "path-click": "gitpagedocs/docs/versions/1.1.0/pt/configuration.md", submenus: [{ title: "Arquitetura", "path-click": "gitpagedocs/docs/versions/1.1.0/pt/architecture.md" }, { title: "Temas e layouts", "path-click": "gitpagedocs/docs/versions/1.1.0/pt/themes.md" }, { title: "FAQ", "path-click": "gitpagedocs/docs/versions/1.1.0/pt/faq.md" }] },
      en: { title: "Configuration", "path-click": "gitpagedocs/docs/versions/1.1.0/en/configuration.md", submenus: [{ title: "Architecture", "path-click": "gitpagedocs/docs/versions/1.1.0/en/architecture.md" }, { title: "Themes and layouts", "path-click": "gitpagedocs/docs/versions/1.1.0/en/themes.md" }, { title: "FAQ", "path-click": "gitpagedocs/docs/versions/1.1.0/en/faq.md" }] },
      es: { title: "Configuracion", "path-click": "gitpagedocs/docs/versions/1.1.0/es/configuration.md", submenus: [{ title: "Arquitectura", "path-click": "gitpagedocs/docs/versions/1.1.0/es/architecture.md" }, { title: "Temas y layouts", "path-click": "gitpagedocs/docs/versions/1.1.0/es/themes.md" }, { title: "FAQ", "path-click": "gitpagedocs/docs/versions/1.1.0/es/faq.md" }] },
    },
    { id: 3, pt: { title: "Publicacao", "path-click": "gitpagedocs/docs/versions/1.1.0/pt/deployment.md" }, en: { title: "Deployment", "path-click": "gitpagedocs/docs/versions/1.1.0/en/deployment.md" }, es: { title: "Publicacion", "path-click": "gitpagedocs/docs/versions/1.1.0/es/deployment.md" } },
  ];

  const versionMenus_1_1_1 = [
    { id: 0, pt: { title: "Inicio", "path-click": "gitpagedocs/docs/versions/1.1.1/pt/index.md" }, en: { title: "Home", "path-click": "gitpagedocs/docs/versions/1.1.1/en/index.md" }, es: { title: "Inicio", "path-click": "gitpagedocs/docs/versions/1.1.1/es/index.md" } },
    { id: 1, pt: { title: "Primeiros passos", "path-click": "gitpagedocs/docs/versions/1.1.1/pt/getting-started.md" }, en: { title: "Getting Started", "path-click": "gitpagedocs/docs/versions/1.1.1/en/getting-started.md" }, es: { title: "Primeros pasos", "path-click": "gitpagedocs/docs/versions/1.1.1/es/getting-started.md" } },
    {
      id: 2,
      pt: { title: "Configuracao", "path-click": "gitpagedocs/docs/versions/1.1.1/pt/configuration.md", submenus: [{ title: "Arquitetura", "path-click": "gitpagedocs/docs/versions/1.1.1/pt/architecture.md" }, { title: "Temas e layouts", "path-click": "gitpagedocs/docs/versions/1.1.1/pt/themes.md" }, { title: "FAQ", "path-click": "gitpagedocs/docs/versions/1.1.1/pt/faq.md" }] },
      en: { title: "Configuration", "path-click": "gitpagedocs/docs/versions/1.1.1/en/configuration.md", submenus: [{ title: "Architecture", "path-click": "gitpagedocs/docs/versions/1.1.1/en/architecture.md" }, { title: "Themes and layouts", "path-click": "gitpagedocs/docs/versions/1.1.1/en/themes.md" }, { title: "FAQ", "path-click": "gitpagedocs/docs/versions/1.1.1/en/faq.md" }] },
      es: { title: "Configuracion", "path-click": "gitpagedocs/docs/versions/1.1.1/es/configuration.md", submenus: [{ title: "Arquitectura", "path-click": "gitpagedocs/docs/versions/1.1.1/es/architecture.md" }, { title: "Temas y layouts", "path-click": "gitpagedocs/docs/versions/1.1.1/es/themes.md" }, { title: "FAQ", "path-click": "gitpagedocs/docs/versions/1.1.1/es/faq.md" }] },
    },
    { id: 3, pt: { title: "Publicacao", "path-click": "gitpagedocs/docs/versions/1.1.1/pt/deployment.md" }, en: { title: "Deployment", "path-click": "gitpagedocs/docs/versions/1.1.1/en/deployment.md" }, es: { title: "Publicacion", "path-click": "gitpagedocs/docs/versions/1.1.1/es/deployment.md" } },
  ];

  const rootConfig = {
    site: {
      name: "Git Pages Docs",
      defaultLanguage: "en",
      supportedLanguages: Object.keys(DOCS),
      HideThemeSelector: false,
      ThemeDefault: "aurora-dark",
      ThemeModeDefault: "dark",
      ProjectLink: "https://github.com/Vidigal-code/git-page-docs",
      docsVersion: "1.0.0",
      ActiveNavigation: true,
      FocusMode: true,
      IconImageMenuHeader: "/icon.svg",
      IconImageMenuHeaderLight: "https://cdn-icons-png.flaticon.com/256/25/25231.png",
      IconImageMenuHeaderDark: "https://i.pinimg.com/736x/ac/b3/51/acb3513e5a2664ba59bec11222863a40.jpg",
      IconImageMenuHeaderReactIcones: true,
      IconImageMenuHeaderReactIconesTag: "FaGithubAlt",
      IconImageMenuHeaderReactIconesTagColorDark: "White",
      IconImageMenuHeaderReactIconesTagColorLight: "black",
      IconImageMenuHeaderReactIconesTagSize: "25px",
      IconProjectLinkReactIcones: true,
      IconProjectLinkReactIconesTag: "FaGithubAlt",
      IconProjectLinkReactIconesTagColorDark: "White",
      IconProjectLinkReactIconesTagColorLight: "black",
      IconProjectLinkReactIconesTagSize: "25px",
      layoutsConfigPath: "https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagedocs/layouts/layoutsConfig.json",
      rendering: "https://vidigal-code.github.io/git-page-docs/",
      langmenu: {
        pt: {
          pt: "Portugues",
          en: "Ingles",
          es: "Espanhol",
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
          darkMode: "Modo escuro",
          lightMode: "Modo claro",
        },
        en: {
          pt: "Portuguese",
          en: "English",
          es: "Spanish",
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
          darkMode: "Dark mode",
          lightMode: "Light mode",
        },
        es: {
          pt: "Portugues",
          en: "Ingles",
          es: "Espanol",
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
          darkMode: "Modo oscuro",
          lightMode: "Modo claro",
        },
      },
    },
    VersionControl: {
      versions: [
        {
          id: "1.0.0",
          path: "gitpagedocs/docs/versions/1.0.0/config.json",
          ProjectLink: "https://github.com/Vidigal-code/git-page-docs",
          branch: "https://github.com/Vidigal-code/git-page-docs/tree/main",
          release: "https://github.com/Vidigal-code/git-page-docs/releases/tag/v1.0.0",
          commit: "https://github.com/Vidigal-code/git-page-docs/commits/main",
        },
        {
          id: "1.1.0",
          path: "gitpagedocs/docs/versions/1.1.0/config.json",
          ProjectLink: "https://github.com/Vidigal-code/git-page-docs",
          branch: "https://github.com/Vidigal-code/git-page-docs/tree/main",
          release: "https://github.com/Vidigal-code/git-page-docs/releases/tag/v1.1.0",
          commit: "",
        },
        {
          id: "1.1.1",
          path: "gitpagedocs/docs/versions/1.1.1/config.json",
          ProjectLink: "https://github.com/Vidigal-code/git-page-docs",
          branch: "",
          release: "",
          commit: "",
        },
      ],
    },
    routes: [
      {
        id: 0,
        path: {
          pt: "gitpagedocs/docs/pt/index.md",
          en: "gitpagedocs/docs/en/index.md",
          es: "gitpagedocs/docs/es/index.md",
        },
      },
      {
        id: 1,
        path: {
          pt: "gitpagedocs/docs/pt/getting-started.md",
          en: "gitpagedocs/docs/en/getting-started.md",
          es: "gitpagedocs/docs/es/getting-started.md",
        },
      },
      {
        id: 2,
        path: {
          pt: "gitpagedocs/docs/pt/configuration.md",
          en: "gitpagedocs/docs/en/configuration.md",
          es: "gitpagedocs/docs/es/configuration.md",
        },
      },
      {
        id: 3,
        path: {
          pt: "gitpagedocs/docs/pt/deployment.md",
          en: "gitpagedocs/docs/en/deployment.md",
          es: "gitpagedocs/docs/es/deployment.md",
        },
      },
      {
        id: 4,
        path: {
          pt: "gitpagedocs/docs/pt/architecture.md",
          en: "gitpagedocs/docs/en/architecture.md",
          es: "gitpagedocs/docs/es/architecture.md",
        },
      },
      {
        id: 5,
        path: {
          pt: "gitpagedocs/docs/pt/themes.md",
          en: "gitpagedocs/docs/en/themes.md",
          es: "gitpagedocs/docs/es/themes.md",
        },
      },
      {
        id: 6,
        path: {
          pt: "gitpagedocs/docs/pt/faq.md",
          en: "gitpagedocs/docs/en/faq.md",
          es: "gitpagedocs/docs/es/faq.md",
        },
      },
    ],
    "menus-header": [
      {
        id: 0,
        pt: {
          title: "Inicio",
          "path-click": "gitpagedocs/docs/pt/index.md",
        },
        en: {
          title: "Home",
          "path-click": "gitpagedocs/docs/en/index.md",
        },
        es: {
          title: "Inicio",
          "path-click": "gitpagedocs/docs/es/index.md",
        },
      },
      {
        id: 1,
        pt: {
          title: "Primeiros passos",
          "path-click": "gitpagedocs/docs/pt/getting-started.md",
        },
        en: {
          title: "Getting Started",
          "path-click": "gitpagedocs/docs/en/getting-started.md",
        },
        es: {
          title: "Primeros pasos",
          "path-click": "gitpagedocs/docs/es/getting-started.md",
        },
      },
      {
        id: 2,
        pt: {
          title: "Configuracao",
          "path-click": "gitpagedocs/docs/pt/configuration.md",
          submenus: [
            { title: "Arquitetura", "path-click": "gitpagedocs/docs/pt/architecture.md" },
            { title: "Temas e layouts", "path-click": "gitpagedocs/docs/pt/themes.md" },
            { title: "FAQ", "path-click": "gitpagedocs/docs/pt/faq.md" },
          ],
        },
        en: {
          title: "Configuration",
          "path-click": "gitpagedocs/docs/en/configuration.md",
          submenus: [
            { title: "Architecture", "path-click": "gitpagedocs/docs/en/architecture.md" },
            { title: "Themes and layouts", "path-click": "gitpagedocs/docs/en/themes.md" },
            { title: "FAQ", "path-click": "gitpagedocs/docs/en/faq.md" },
          ],
        },
        es: {
          title: "Configuracion",
          "path-click": "gitpagedocs/docs/es/configuration.md",
          submenus: [
            { title: "Arquitectura", "path-click": "gitpagedocs/docs/es/architecture.md" },
            { title: "Temas y layouts", "path-click": "gitpagedocs/docs/es/themes.md" },
            { title: "FAQ", "path-click": "gitpagedocs/docs/es/faq.md" },
          ],
        },
      },
      {
        id: 3,
        pt: {
          title: "Publicacao",
          "path-click": "gitpagedocs/docs/pt/deployment.md",
        },
        en: {
          title: "Deployment",
          "path-click": "gitpagedocs/docs/en/deployment.md",
        },
        es: {
          title: "Publicacion",
          "path-click": "gitpagedocs/docs/es/deployment.md",
        },
      },
    ],
    translations: {
      notFound: {
        title: {
          pt: "Pagina nao encontrada",
          en: "Page not found",
          es: "Pagina no encontrada",
        },
        description: {
          pt: "A pagina de documentacao solicitada nao existe neste contexto de repositorio.",
          en: "The requested documentation page does not exist in this repository context.",
          es: "La pagina de documentacion solicitada no existe en este contexto de repositorio.",
        },
        returnHome: {
          pt: "Voltar para inicio",
          en: "Return Home",
          es: "Volver al inicio",
        },
      },
      navigation: {
        previous: {
          pt: "Voltar",
          en: "Previous",
          es: "Volver",
        },
        next: {
          pt: "Avancar markdown",
          en: "Next Markdown",
          es: "Avanzar markdown",
        },
        menuOpen: {
          pt: "Menu",
          en: "Menu",
          es: "Menu",
        },
        menuClose: {
          pt: "Fechar",
          en: "Close",
          es: "Cerrar",
        },
      },
    },
  };

  const layoutsConfig = { layouts: LAYOUTS };
  const fallbackLayoutsConfig = { layouts: FALLBACK_LAYOUTS };

  return {
    rootConfig,
    layoutsConfig,
    fallbackLayoutsConfig,
    docs: DOCS,
    versionConfigs: {
      "1.0.0": {
        routes: versionRoutes_1_0_0,
        "menus-header": versionMenus_1_0_0,
      },
      "1.1.0": {
        routes: versionRoutes_1_1_0,
        "menus-header": versionMenus_1_1_0,
      },
      "1.1.1": {
        routes: versionRoutes_1_1_1,
        "menus-header": versionMenus_1_1_1,
      },
    },
  };
}

function parseCliOptions(argv, env) {
  const isBuild = argv.includes("--build") || env.GITPAGEDOCS_BUILD === "1";
  const isServe = argv.includes("--serve");
  const mode = argv.includes("--full") ? "full" : "config-only";
  const outputDir = "gitpagedocs";
  return { isBuild, isServe, mode, outputDir };
}

async function writeConfigOnlyOutput(outputDir, artifacts) {
  await writeJson(`${outputDir}/config.json`, artifacts.rootConfig);
  await writeJson(`${outputDir}/layouts/layoutsConfig.json`, artifacts.layoutsConfig);
  await writeJson(`${outputDir}/layouts/layoutsFallbackConfig.json`, artifacts.fallbackLayoutsConfig);

  for (const [versionId, versionConfig] of Object.entries(artifacts.versionConfigs)) {
    await writeJson(`${outputDir}/docs/versions/${versionId}/config.json`, versionConfig);
  }

  for (const layout of LAYOUTS) {
    const template = createThemeTemplate(layout);
    await writeJson(`${outputDir}/layouts/${layout.file}`, template);
  }

  for (const route of artifacts.rootConfig.routes ?? []) {
    for (const [language, docPath] of Object.entries(route.path ?? {})) {
      const fileName = path.basename(docPath);
      const key = parseDocFileToKey(fileName);
      const content = key ? artifacts.docs?.[language]?.[key] : undefined;
      if (!content) continue;
      await writeText(normalizeToOutputPath(outputDir, docPath), content);
    }
  }

  for (const [versionId, versionConfig] of Object.entries(artifacts.versionConfigs)) {
    const versionRoutes = versionConfig.routes ?? [];
    for (const route of versionRoutes) {
      for (const docPath of Object.values(route.path ?? {})) {
        const fileName = path.basename(docPath);
        const key = parseDocFileToKey(fileName);
        const language = extractLanguageFromPath(docPath);
        const content = key && language ? artifacts.docs?.[language]?.[key] : undefined;
        if (!content) continue;
        await writeText(normalizeToOutputPath(outputDir, docPath), content);
      }
    }

    // Ensure version folders always include an index file.
    for (const language of ["pt", "en", "es"]) {
      const fallbackIndex = artifacts.docs?.[language]?.index;
      if (!fallbackIndex) continue;
      const versionIndexPath = `${outputDir}/docs/versions/${versionId}/${language}/index.md`;
      if (!existsSync(path.join(ROOT, versionIndexPath))) {
        await writeText(versionIndexPath, fallbackIndex);
      }
    }
  }
}

async function run() {
  const options = parseCliOptions(process.argv, process.env);
  const artifacts = buildConfigArtifacts();
  await writeConfigOnlyOutput(options.outputDir, artifacts);

  console.log(`Generated: ${options.outputDir}/ (config-only)`);
  console.log("No index.html/index.js generated.");
  if (options.isBuild) {
    console.log("`--build` keeps compatibility flag but output remains gitpagedocs/.");
  }
  if (options.mode === "full" || options.isServe) {
    console.log("External commands were skipped (no prebuilt copy and no local serve spawn).");
  }
  if (existsSync(PREBUILT_DIR)) {
    console.log("`prebuilt/` detected, but ignored by config-only generator.");
  }
}

run().catch((error) => {
  console.error("Failed to create Git Page Docs scaffold.", error);
  process.exitCode = 1;
});
