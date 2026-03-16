#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "./runtime/run.mjs";

const ROOT = process.cwd();
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.join(SCRIPT_DIR, "..");
const PREBUILT_DIR = path.join(PKG_ROOT, "prebuilt");
const OFFICIAL_LAYOUTS_CONFIG_URL =
  "https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagedocs/layouts/layoutsConfig.json";
const OFFICIAL_LAYOUTS_TEMPLATES_URL =
  "https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagedocs/layouts/templates";

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
  {
    id: "oceanic-dark",
    name: "Oceanic Dark",
    author: "Kauan Vidigal",
    file: "templates/oceanic-dark.json",
    preview: "Deep ocean dark UI with cyan and blue accents",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "oceanic-1",
    mode: "dark",
  },
  {
    id: "oceanic-light",
    name: "Oceanic Light",
    author: "Kauan Vidigal",
    file: "templates/oceanic-light.json",
    preview: "Clean ocean light UI with soft aqua accents",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "oceanic-1",
    mode: "light",
  },
  {
    id: "rose-dark",
    name: "Rose Dark",
    author: "Kauan Vidigal",
    file: "templates/rose-dark.json",
    preview: "Elegant dark rose palette with pink highlights",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "rose-1",
    mode: "dark",
  },
  {
    id: "rose-light",
    name: "Rose Light",
    author: "Kauan Vidigal",
    file: "templates/rose-light.json",
    preview: "Soft rose light theme for modern documentation",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "rose-1",
    mode: "light",
  },
  {
    id: "forest-dark",
    name: "Forest Dark",
    author: "Kauan Vidigal",
    file: "templates/forest-dark.json",
    preview: "Moody forest dark theme with green accents",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "forest-1",
    mode: "dark",
  },
  {
    id: "forest-light",
    name: "Forest Light",
    author: "Kauan Vidigal",
    file: "templates/forest-light.json",
    preview: "Fresh forest light theme with natural greens",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "forest-1",
    mode: "light",
  },
  {
    id: "graphite-dark",
    name: "Graphite Dark",
    author: "Kauan Vidigal",
    file: "templates/graphite-dark.json",
    preview: "Premium graphite dark interface with blue glow",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "graphite-1",
    mode: "dark",
  },
  {
    id: "graphite-light",
    name: "Graphite Light",
    author: "Kauan Vidigal",
    file: "templates/graphite-light.json",
    preview: "Minimal graphite light interface with calm contrast",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "graphite-1",
    mode: "light",
  },
  {
    id: "lava-dark",
    name: "Lava Dark",
    author: "Kauan Vidigal",
    file: "templates/lava-dark.json",
    preview: "Bold dark magma palette with hot orange accents",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "lava-1",
    mode: "dark",
  },
  {
    id: "lava-light",
    name: "Lava Light",
    author: "Kauan Vidigal",
    file: "templates/lava-light.json",
    preview: "Warm light lava palette with energetic contrast",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "lava-1",
    mode: "light",
  },
  {
    id: "skyline-dark",
    name: "Skyline Dark",
    author: "Kauan Vidigal",
    file: "templates/skyline-dark.json",
    preview: "Night skyline dark blue palette with neon cyan",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "skyline-1",
    mode: "dark",
  },
  {
    id: "skyline-light",
    name: "Skyline Light",
    author: "Kauan Vidigal",
    file: "templates/skyline-light.json",
    preview: "Airy skyline light palette with cool blue accents",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "skyline-1",
    mode: "light",
  },
  {
    id: "emerald-dark",
    name: "Emerald Dark",
    author: "Kauan Vidigal",
    file: "templates/emerald-dark.json",
    preview: "Dark emerald style with refined green contrast",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "emerald-1",
    mode: "dark",
  },
  {
    id: "emerald-light",
    name: "Emerald Light",
    author: "Kauan Vidigal",
    file: "templates/emerald-light.json",
    preview: "Elegant emerald light style for readable docs",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "emerald-1",
    mode: "light",
  },
  {
    id: "violet-dark",
    name: "Violet Dark",
    author: "Kauan Vidigal",
    file: "templates/violet-dark.json",
    preview: "Modern violet dark gradient with vivid contrast",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "violet-1",
    mode: "dark",
  },
  {
    id: "violet-light",
    name: "Violet Light",
    author: "Kauan Vidigal",
    file: "templates/violet-light.json",
    preview: "Violet light palette with smooth, modern highlights",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "violet-1",
    mode: "light",
  },
  {
    id: "amber-dark",
    name: "Amber Dark",
    author: "Kauan Vidigal",
    file: "templates/amber-dark.json",
    preview: "Dark amber interface with rich golden accents",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "amber-1",
    mode: "dark",
  },
  {
    id: "amber-light",
    name: "Amber Light",
    author: "Kauan Vidigal",
    file: "templates/amber-light.json",
    preview: "Warm amber light interface with soft gold tones",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "amber-1",
    mode: "light",
  },
  {
    id: "slate-dark",
    name: "Slate Dark",
    author: "Kauan Vidigal",
    file: "templates/slate-dark.json",
    preview: "Professional slate dark theme for technical docs",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "slate-1",
    mode: "dark",
  },
  {
    id: "slate-light",
    name: "Slate Light",
    author: "Kauan Vidigal",
    file: "templates/slate-light.json",
    preview: "Professional slate light theme with neutral tones",
    supportsLightAndDarkModes: true,
    supportsLightAndDarkModesReference: "slate-1",
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
  "oceanic-dark": {
    background: "#06121A",
    primary: "#0EA5E9",
    secondary: "#22D3EE",
    text: "#DDF6FF",
    textSecondary: "#9CC5D8",
    cardBackground: "#0C1C27",
    cardBorder: "#1E3A4B",
    error: "#F87171",
    success: "#34D399",
  },
  "oceanic-light": {
    background: "#F0F9FF",
    primary: "#0284C7",
    secondary: "#0891B2",
    text: "#0C4A6E",
    textSecondary: "#1D4E89",
    cardBackground: "#FFFFFF",
    cardBorder: "#BAE6FD",
    error: "#DC2626",
    success: "#0F766E",
  },
  "rose-dark": {
    background: "#1B0B13",
    primary: "#F43F5E",
    secondary: "#FB7185",
    text: "#FFE4EA",
    textSecondary: "#F9A8D4",
    cardBackground: "#28111C",
    cardBorder: "#7A1F3D",
    error: "#FB7185",
    success: "#34D399",
  },
  "rose-light": {
    background: "#FFF1F5",
    primary: "#E11D48",
    secondary: "#DB2777",
    text: "#7A1733",
    textSecondary: "#9D174D",
    cardBackground: "#FFFFFF",
    cardBorder: "#FBCFE8",
    error: "#DC2626",
    success: "#059669",
  },
  "forest-dark": {
    background: "#0A140F",
    primary: "#22C55E",
    secondary: "#4ADE80",
    text: "#DCFCE7",
    textSecondary: "#86EFAC",
    cardBackground: "#122017",
    cardBorder: "#275A3F",
    error: "#F87171",
    success: "#22C55E",
  },
  "forest-light": {
    background: "#F3FFF5",
    primary: "#15803D",
    secondary: "#16A34A",
    text: "#14532D",
    textSecondary: "#166534",
    cardBackground: "#FFFFFF",
    cardBorder: "#BBF7D0",
    error: "#DC2626",
    success: "#15803D",
  },
  "graphite-dark": {
    background: "#0B0F14",
    primary: "#60A5FA",
    secondary: "#93C5FD",
    text: "#E5E7EB",
    textSecondary: "#9CA3AF",
    cardBackground: "#141A22",
    cardBorder: "#2A3442",
    error: "#F87171",
    success: "#34D399",
  },
  "graphite-light": {
    background: "#F8FAFC",
    primary: "#2563EB",
    secondary: "#3B82F6",
    text: "#0F172A",
    textSecondary: "#475569",
    cardBackground: "#FFFFFF",
    cardBorder: "#CBD5E1",
    error: "#DC2626",
    success: "#059669",
  },
  "lava-dark": {
    background: "#1A0D08",
    primary: "#F97316",
    secondary: "#FB923C",
    text: "#FFE7D5",
    textSecondary: "#FDBA74",
    cardBackground: "#2B1610",
    cardBorder: "#7C2D12",
    error: "#FB7185",
    success: "#4ADE80",
  },
  "lava-light": {
    background: "#FFF7ED",
    primary: "#EA580C",
    secondary: "#F97316",
    text: "#7C2D12",
    textSecondary: "#9A3412",
    cardBackground: "#FFFFFF",
    cardBorder: "#FED7AA",
    error: "#DC2626",
    success: "#16A34A",
  },
  "skyline-dark": {
    background: "#080E1E",
    primary: "#3B82F6",
    secondary: "#22D3EE",
    text: "#E0E7FF",
    textSecondary: "#93C5FD",
    cardBackground: "#101A2F",
    cardBorder: "#2B3A67",
    error: "#F87171",
    success: "#34D399",
  },
  "skyline-light": {
    background: "#EFF6FF",
    primary: "#2563EB",
    secondary: "#0EA5E9",
    text: "#1E3A8A",
    textSecondary: "#1D4ED8",
    cardBackground: "#FFFFFF",
    cardBorder: "#BFDBFE",
    error: "#DC2626",
    success: "#059669",
  },
  "emerald-dark": {
    background: "#07150F",
    primary: "#10B981",
    secondary: "#34D399",
    text: "#D1FAE5",
    textSecondary: "#6EE7B7",
    cardBackground: "#10231A",
    cardBorder: "#1F6A4C",
    error: "#F87171",
    success: "#10B981",
  },
  "emerald-light": {
    background: "#ECFDF5",
    primary: "#059669",
    secondary: "#10B981",
    text: "#064E3B",
    textSecondary: "#065F46",
    cardBackground: "#FFFFFF",
    cardBorder: "#A7F3D0",
    error: "#DC2626",
    success: "#059669",
  },
  "violet-dark": {
    background: "#12081F",
    primary: "#8B5CF6",
    secondary: "#A78BFA",
    text: "#EDE9FE",
    textSecondary: "#C4B5FD",
    cardBackground: "#1E1033",
    cardBorder: "#4C1D95",
    error: "#FB7185",
    success: "#34D399",
  },
  "violet-light": {
    background: "#F5F3FF",
    primary: "#7C3AED",
    secondary: "#8B5CF6",
    text: "#4C1D95",
    textSecondary: "#5B21B6",
    cardBackground: "#FFFFFF",
    cardBorder: "#DDD6FE",
    error: "#DC2626",
    success: "#059669",
  },
  "amber-dark": {
    background: "#1A1306",
    primary: "#F59E0B",
    secondary: "#FBBF24",
    text: "#FEF3C7",
    textSecondary: "#FCD34D",
    cardBackground: "#2A1E0D",
    cardBorder: "#7C5B13",
    error: "#FB7185",
    success: "#4ADE80",
  },
  "amber-light": {
    background: "#FFFBEB",
    primary: "#D97706",
    secondary: "#F59E0B",
    text: "#78350F",
    textSecondary: "#92400E",
    cardBackground: "#FFFFFF",
    cardBorder: "#FDE68A",
    error: "#DC2626",
    success: "#16A34A",
  },
  "slate-dark": {
    background: "#0B1120",
    primary: "#64748B",
    secondary: "#94A3B8",
    text: "#E2E8F0",
    textSecondary: "#CBD5E1",
    cardBackground: "#111827",
    cardBorder: "#334155",
    error: "#F87171",
    success: "#34D399",
  },
  "slate-light": {
    background: "#F8FAFC",
    primary: "#475569",
    secondary: "#64748B",
    text: "#1E293B",
    textSecondary: "#334155",
    cardBackground: "#FFFFFF",
    cardBorder: "#CBD5E1",
    error: "#DC2626",
    success: "#16A34A",
  },
};

const DOCS = {
  en: {
    index: `# Git Page Docs

Git Page Docs is a multilingual documentation runtime for repositories that ship a \`gitpagedocs/\` folder.

## What this project delivers

- Multilingual markdown rendering (\`en\`, \`pt\`, \`es\`)
- Version-aware docs routing (\`/v/:version\`)
- Theme system with JSON templates
- Local and GitHub Pages execution modes
- Optional repository search + remote rendering

## Folder contract

The runtime expects this structure:

- \`gitpagedocs/config.json\`
- \`gitpagedocs/docs/<lang>/*.md\`
- \`gitpagedocs/docs/versions/<version>/config.json\`
- \`gitpagedocs/docs/versions/<version>/<lang>/*.md\`
- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

## Quick navigation

- Open **Getting Started** for local setup.
- Open **Configuration** for full \`config.json\` explanation.
- Open **Deployment** for local, server, and GitHub Pages behavior.
- Open **Architecture** for code map and data flow.
- Open **Themes and layouts** for template authoring details.
- Open **FAQ** for troubleshooting.
`,
    gettingStarted: `# Getting Started

This guide configures your repository from zero to running docs.

## Prerequisites

- Node.js 20+
- npm 10+

## Install and generate

1. Install package:
   - \`npm install gitpagedocs\`
2. Generate docs config and versions:
   - \`npx gitpagedocs\`
3. Optional: generate local layouts/templates:
   - \`npx gitpagedocs --layoutconfig\`

## Local run

1. Development:
   - \`npm run dev\`
2. Production locally:
   - \`npm run build\`
   - \`npm start\`

## CLI behavior

\`npx gitpagedocs\` generates only artifacts in \`gitpagedocs/\`:

- JSON + markdown docs assets
- No \`index.html\`
- No \`index.js\`
- No install command execution

## Repository search mode

Local repository search is controlled by:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\`
- \`GITPAGEDOCS_REPOSITORY_SEARCH=false\`

On GitHub Pages builds (\`GITHUB_ACTIONS=true\`), repository-search home is enabled.
`,
    projectOverview: `# Project Overview

Git Page Docs is powered by Next.js 15, React 19, TypeScript, and Node.js. It builds multilingual documentation for GitHub Pages.

## Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Static export for GitHub Pages
- gray-matter, marked for Markdown
- react-icons
- ESLint

## Goals

- Generate and maintain a \`gitpagedocs/\` folder with config and versioned content
- Support Markdown, HTML (local or URL), and video embeds
- Multilingual: en, pt, es
- Theme system with JSON templates
- Local and GitHub Pages execution
`,
    githubIssuesProjects: `# GitHub Issues and Projects

Learn how to use GitHub Issues and Projects to manage your work.

## Issues

- Track bugs, features, and tasks
- Assignees, labels, milestones
- Discussions and linked PRs

## Projects

- Kanban boards
- Tables and roadmaps
- Custom fields and automation
`,
    gitIntroduction: `# Introduction to Git

Basic Git concepts for beginners.

## Key concepts

- **Repository**: A project folder tracked by Git
- **Commit**: A snapshot of changes
- **Branch**: Alternative line of development
- **Remote**: Shared repository (e.g. on GitHub)

## Common commands

- \`git init\` - Initialize a repo
- \`git add\` - Stage changes
- \`git commit\` - Create a snapshot
- \`git push\` - Send to remote
`,
    configuration: `# Configuration

Runtime configuration lives in \`gitpagedocs/config.json\`.

## \`site\` section

Important keys:

- \`name\`
- \`defaultLanguage\`
- \`supportedLanguages\`
- \`docsVersion\`
- \`rendering\`
- \`ThemeDefault\`
- \`ThemeModeDefault\`
- \`ProjectLink\`

## Layout source keys

- \`layoutsConfigPathOficial\`
- \`layoutsConfigPathOficialUrl\`
- \`layoutsConfigPathTemplatesOficial\`
- \`layoutsConfigPath\`
- \`layoutsConfigPathTemplates\`

Behavior:

- If \`layoutsConfigPathOficial=true\`, runtime prefers official layout/template sources.
- If \`layoutsConfigPathOficial=false\`, runtime prefers repository-local/custom layout sources.

## \`VersionControl\` section

\`VersionControl.versions\` defines:

- \`id\`
- \`path\`
- optional metadata links (\`ProjectLink\`, \`branch\`, \`release\`, \`commit\`)

## Navigation

- \`routes\`: markdown paths per language (legacy)
- \`menus-header\`: hierarchical menu model
- \`translations\`: UI labels

## Content types (version config)

Version configs support multiple content types:

- \`routes-md\`: Markdown routes with optional \`title\`, \`description\` (centered via \`titlePosition\`, \`descriptionPosition\`)
- \`routes-html\`: HTML page paths per language
- \`routes-video\`: Video config with \`video.videoType\` (youtube, vimeo, mp4, etc.) and \`video.pathVideo\`
- \`menus-header-md\`, \`menus-header-html\`, \`menus-header-video\`: menus per type
- \`hierarchyPage\`: container order on page \`{ md: 0, html: 1, video: 2 }\`
- \`hierarchyMenu\`: menu section order \`{ md: 0, html: 1, video: 2 }\`

Each route can include \`title\`, \`description\` (per language), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

## Route-level variables (blockLink, container, url, browseAll)

Per-route options for \`routes-md\`, \`routes-html\`, and \`routes-video\`:

- **\`blockLink\`** (default: true) – For HTML: if true, links open in a new tab (\`target="_blank"\`); if false, links open in the same context.
- **\`container\`** – \`"full"\` = auto-extend height; number (e.g. \`500\`) = fixed height in px with overflow auto. Applies to md, html, and video containers.
- **\`url\`** – For \`routes-html\` only: \`Record<LanguageCode, string>\` with external URLs. When set, the iframe uses \`src={url}\` instead of local HTML via \`srcDoc\`. Routes with \`url\` do not generate local HTML files.
- **\`browseAll\`** (default: false) – If true, the container shows Previous/Next buttons to browse all items of that type without changing the page.

## Content types: path vs url (HTML)

- **Markdown (\`routes-md\`)**: always uses \`path\` pointing to local \`.md\` files.
- **HTML (\`routes-html\`)**: uses \`path\` for local \`.html\` files or \`url\` for external URLs. When \`url\` is set, the iframe loads the external page; no local file is generated.
- **Video (\`routes-video\`)**: uses \`video.pathVideo\` and \`video.videoType\` (youtube, vimeo, mp4, etc.).

## Environment variables

- \`GITPAGEDOCS_REPOSITORY_SEARCH\`: enable/disable remote repository search in local runtime
- \`GITHUB_ACTIONS\`: enables GitHub Pages specific runtime behavior
`,
    deployment: `# Deployment

Git Page Docs supports two usage models:

1. Use the official viewer site
2. Self-host your own GitHub Pages runtime

## Official viewer site

Use:

- \`https://vidigal-code.github.io/git-page-docs/\`

Provide owner + repository to load docs from repositories that contain \`gitpagedocs/\`.

## Self-hosted GitHub Pages

1. Generate docs:
   - \`npx gitpagedocs\`
   - or \`npx gitpagedocs --layoutconfig\` for local templates
2. Set \`site.rendering\` in \`gitpagedocs/config.json\`:
   - \`https://<your-user>.github.io/<your-repo>/\`
3. Build and validate:
   - \`npm run lint\`
   - \`npm run build\`
4. Deploy with GitHub Pages workflow.

When \`GITHUB_ACTIONS=true\`, runtime applies GitHub Pages behavior.

## npm publish flows

Recommended: GitHub Release + CI publish.

Manual fallback:

1. \`npm whoami\`
2. \`npm run lint\`
3. \`npm run build\`
4. \`npm pack --ignore-scripts\`
5. \`npm version patch\`
6. \`npm publish --access public\`
`,
    architecture: `# Architecture

This project is organized by feature boundaries and UI runtime responsibilities.

## Main runtime modules

- \`src/app/[[...repo]]/page.tsx\`
  - route parser
  - static params generation
  - shell selection (docs shell vs repository search shell)
- \`src/entities/docs/api/load-docs-data.ts\`
  - local/remote config loading
  - version resolution
  - markdown fetch + parse pipeline
  - layouts + themes loading
- \`src/widgets/docs-shell/docs-shell.tsx\`
  - UI rendering
  - language/version/theme state
  - URL synchronization

## Data flow

1. Request route arrives (\`/owner/repo/v/x.y.z\` or local equivalent)
2. Config is resolved (local or remote repo)
3. Version config overrides base routes/menus
4. Markdown is loaded and converted to HTML
5. Layout template is resolved and CSS vars applied
6. Shell renders content + controls

## Reliability points

- fallback strategy for layout/template loading
- resilient markdown loading per language
- localStorage sync for user language/version/theme
`,
    themes: `# Themes and Layouts

Themes are JSON templates mapped by \`layoutsConfig.json\`.

## Strategy options

- Default mode (\`npx gitpagedocs\`): use official layouts/templates from the upstream repository.
- Local mode (\`npx gitpagedocs --layoutconfig\`): generate and use local templates from your repository.

## Local layout files

- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/layoutsFallbackConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

## Template model

Each template usually includes:

- \`id\`, \`name\`, \`author\`, \`version\`
- \`mode\` + dark/light pairing metadata
- \`colors\`
- \`typography\`
- \`components\`
- \`animations\`

## Runtime behavior

- Active theme is resolved from config/user selection.
- Light/dark toggle resolves paired theme via reference.
- CSS variables are generated from template tokens.
- Runtime includes fallback behavior if a source is unavailable.
`,
    faq: `# FAQ

## Why are remote repositories not opening locally?

Check:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` in \`.env\`
- target repo contains \`gitpagedocs/config.json\`
- target repo markdown paths match its routes config

## Why does a version path return wrong content?

Check:

- \`VersionControl.versions[*].path\` in \`gitpagedocs/config.json\`
- that version config has valid \`routes\` and \`menus-header\`
- markdown files exist for each language

## Why does theme selection not apply correctly?

Check:

- \`layoutsConfig.json\` references valid template files
- template ids are unique
- selected theme exists in loaded themes map

## Why can GitHub Pages behave differently from local?

Because GitHub Pages build mode enables repository-search home and static-export specific behavior.
`,
  },
  pt: {
    index: `# Git Page Docs

Git Page Docs e um runtime de documentacao multi-idioma para repositorios que possuem a pasta \`gitpagedocs/\`.

## O que este projeto entrega

- Renderizacao markdown em varios idiomas (\`en\`, \`pt\`, \`es\`)
- Roteamento por versao (\`/v/:versao\`)
- Sistema de temas por templates JSON
- Execucao local e em GitHub Pages
- Busca de repositorio + renderizacao remota opcional

## Contrato de pastas

O runtime espera esta estrutura:

- \`gitpagedocs/config.json\`
- \`gitpagedocs/docs/<lang>/*.md\`
- \`gitpagedocs/docs/versions/<versao>/config.json\`
- \`gitpagedocs/docs/versions/<versao>/<lang>/*.md\`
- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

## Navegacao rapida

- Abra **Primeiros passos** para setup local.
- Abra **Configuracao** para detalhes completos do \`config.json\`.
- Abra **Publicacao** para comportamento local/producao/GitHub Pages.
- Abra **Arquitetura** para mapa de codigo e fluxo de dados.
- Abra **Temas e layouts** para autoria de templates.
- Abra **FAQ** para troubleshooting.
`,
    gettingStarted: `# Primeiros passos

Este guia leva o projeto do zero ate docs rodando.

## Pre-requisitos

- Node.js 20+
- npm 10+ (ou pnpm)

## Setup local

1. Instale dependencias:
   - \`npm install\`
2. Gere/atualize os artefatos de docs:
   - \`npm run gitpagedocs\`
3. Inicie o desenvolvimento:
   - \`npm run dev\`
4. Build e execucao local de producao:
   - \`npm run build\`
   - \`npm start\`

## Comportamento da CLI

\`npx gitpagedocs\` (ou \`npm run gitpagedocs\`) gera os artefatos na pasta oficial \`gitpagedocs/\`.

- Gera somente markdown/json
- Nao gera \`index.html\`
- Nao gera \`index.js\`
- Nao executa comandos de instalacao

## Modo de busca por repositorio

No ambiente local, o controle e por variavel:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\`
- \`GITPAGEDOCS_REPOSITORY_SEARCH=false\`

Em build de GitHub Pages (\`GITHUB_ACTIONS=true\`), a busca de repositorio fica sempre ativa.
`,
    projectOverview: `# Visao geral do projeto

Git Page Docs e alimentado por Next.js 15, React 19, TypeScript e Node.js. Gera documentacao multilinguagem para GitHub Pages.

## Stack

- Next.js 15
- React 19
- TypeScript
- Node.js 20+

## Objetivo

Construir documentacao multilinguagem para repositorios GitHub com suporte a versoes, temas e conteudo md/html/video.
`,
    configuration: `# Configuracao

A configuracao de runtime fica em \`gitpagedocs/config.json\`.

## Secao \`site\`

Principais chaves:

- \`name\`: titulo do projeto no UI
- \`defaultLanguage\`: idioma padrao
- \`supportedLanguages\`: lista de idiomas disponiveis
- \`HideThemeSelector\`: esconde/mostra seletor de tema
- \`ThemeDefault\`: id do tema inicial
- \`ThemeModeDefault\`: modo inicial (\`light\` ou \`dark\`)
- \`ProjectLink\`: URL de repositorio para acoes no cabecalho
- \`docsVersion\`: versao inicial selecionada
- \`ActiveNavigation\`: habilita comportamento de anterior/proximo
- \`FocusMode\`: habilita modo foco/leitura
- \`IconImageMenuHeaderImgWidth\`, \`IconImageMenuHeaderImgHeight\`: tamanho do icone principal
- \`IconImageMenuHeaderLightImg\`, \`IconImageMenuHeaderDarkImg\`: icone principal (light/dark)
- \`IconProjectLinkImgWidth\`, \`IconProjectLinkImgHeight\`: tamanho do icone link do projeto
- \`IconProjectLinkLightImg\`, \`IconProjectLinkDarkImg\`: icone link do projeto
- \`IconVersionLinksImgWidth\`, \`IconVersionLinksImgHeight\`: tamanho do icone links de versao
- \`IconVersionLinksLightImg\`, \`IconVersionLinksDarkImg\`: icone links de versao
- \`IconInfoHeaderMenuImgWidth\`, \`IconInfoHeaderMenuImgHeight\`: tamanho do icone info
- \`IconInfoHeaderMenuLightImg\`, \`IconInfoHeaderMenuDarkImg\`: icone info
- \`IconPreviewProjectLinkImgWidth\`, \`IconPreviewProjectLinkImgHeight\`: tamanho do icone preview
- \`IconPreviewProjectLinkLightImg\`, \`IconPreviewProjectLinkDarkImg\`: icone preview
- \`layoutsConfigPath\`: fallback remoto para layouts
- \`rendering\`: URL canonica publicada

## Secao \`VersionControl\`

\`VersionControl.versions\` define:

- \`id\`: identificador da versao
- \`path\`: caminho do config da versao
- links opcionais (\`ProjectLink\`, \`branch\`, \`release\`, \`commit\`)

## Navegacao e rotas

- \`routes\`: caminhos markdown por idioma (legado)
- \`menus-header\`: menu hierarquico
- \`translations\`: labels de UI para not-found e navegacao

## Tipos de conteudo (config de versao)

Configs de versao suportam multiplos tipos:

- \`routes-md\`: Rotas markdown com \`title\`, \`description\` (centralizados via \`titlePosition\`, \`descriptionPosition\`)
- \`routes-html\`: Caminhos de paginas HTML por idioma
- \`routes-video\`: Config de video com \`video.videoType\` (youtube, vimeo, mp4, etc.) e \`video.pathVideo\`
- \`menus-header-md\`, \`menus-header-html\`, \`menus-header-video\`: menus por tipo
- \`hierarchyPage\`: ordem dos containers na pagina \`{ md: 0, html: 1, video: 2 }\`
- \`hierarchyMenu\`: ordem das secoes do menu \`{ md: 0, html: 1, video: 2 }\`

Cada rota pode incluir \`title\`, \`description\` (por idioma), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

## Variaveis por rota (blockLink, container, url, browseAll)

Opcoes por rota em \`routes-md\`, \`routes-html\` e \`routes-video\`:

- **\`blockLink\`** (padrao: true) – Para HTML: se true, links abrem em nova aba (\`target="_blank"\`); se false, no proprio contexto.
- **\`container\`** – \`"full"\` = altura automatica; numero (ex: \`500\`) = altura fixa em px com overflow auto. Aplica-se a md, html e video.
- **\`url\`** – Apenas em \`routes-html\`: \`Record<LanguageCode, string>\` com URLs externas. Quando definido, o iframe usa \`src={url}\` em vez de HTML local via \`srcDoc\`. Rotas com \`url\` nao geram arquivos HTML locais.
- **\`browseAll\`** (padrao: false) – Se true, o container mostra botoes Anterior/Proximo para navegar entre todos os itens daquele tipo.

## Tipos de conteudo: path vs url (HTML)

- **Markdown (\`routes-md\`)**: usa \`path\` apontando para arquivos \`.md\` locais.
- **HTML (\`routes-html\`)**: usa \`path\` para arquivos \`.html\` locais ou \`url\` para URLs externas. Com \`url\`, o iframe carrega a pagina externa; nenhum arquivo local e gerado.
- **Video (\`routes-video\`)**: usa \`video.pathVideo\` e \`video.videoType\` (youtube, vimeo, mp4, etc.).

## Variaveis de ambiente

- \`GITPAGEDOCS_REPOSITORY_SEARCH\`: ativa/desativa busca remota localmente
- \`GITHUB_ACTIONS\`: ativa comportamento especifico de GitHub Pages
`,
    deployment: `# Publicacao

Git Page Docs roda como app Next.js com dois alvos: servidor local e GitHub Pages.

## Publicacao local

Use:

1. \`npm run build\`
2. \`npm start\`

Isso sobe runtime Node + Next.js usando a pasta local \`gitpagedocs/\`.

## Publicacao em GitHub Pages

Em build de GitHub Actions:

- \`GITHUB_ACTIONS=true\`
- comportamento de export estatico e habilitado pela configuracao
- pagina inicial de busca de repositorio fica ativa

## Fluxo de publish do pacote

Para publicar no npm:

- atualize versao no \`package.json\`
- execute \`npm publish --access public\`
- valide autenticacao com \`npm whoami\`

Se \`build:prebuilt\` for pulado no Windows, use CI para gerar artefatos prebuilt.
`,
    architecture: `# Arquitetura

O projeto e organizado por fronteiras de feature e responsabilidades do runtime.

## Modulos principais

- \`src/app/[[...repo]]/page.tsx\`
  - parser de rota
  - generateStaticParams
  - selecao de shell (docs vs repository search)
- \`src/entities/docs/api/load-docs-data.ts\`
  - carga de config local/remota
  - resolucao de versao
  - pipeline de fetch + parse markdown
  - carga de layouts + temas
- \`src/widgets/docs-shell/docs-shell.tsx\`
  - renderizacao da UI
  - estado de idioma/versao/tema
  - sincronizacao de URL

## Fluxo de dados

1. A rota chega (\`/owner/repo/v/x.y.z\` ou equivalente local)
2. O config e resolvido (local ou remoto)
3. Config de versao sobrescreve rotas/menus base
4. Markdown e carregado e convertido para HTML
5. Template de layout e resolvido e aplicado em CSS vars
6. Shell renderiza conteudo e controles

## Pontos de resiliencia

- fallback de carga para layouts/templates
- carregamento de markdown por idioma com fallback de erro
- sincronizacao de linguagem/versao/tema via localStorage
`,
    githubIssuesProjects: `# GitHub Issues e Projects

Aprenda a usar GitHub Issues e Projects para gerenciar seu trabalho.

## Conceitos

- Issues para rastrear tarefas e bugs
- Projects para visualizar e organizar o trabalho
- Workflows recomendados para equipes
`,
    gitIntroduction: `# Introducao ao Git

Conceitos basicos de Git para iniciantes.

## Comandos essenciais

- \`git init\` - iniciar repositorio
- \`git add\` - preparar alteracoes
- \`git commit\` - registrar commit
- \`git push\` - enviar para remoto
`,
    themes: `# Temas e layouts

Temas sao templates JSON mapeados por \`layoutsConfig.json\`.

## Arquivos

- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/layoutsFallbackConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

## Modelo de template

Cada template normalmente contem:

- \`id\`, \`name\`, \`author\`, \`version\`
- \`mode\` e metadados de par dark/light
- \`colors\`
- \`typography\`
- tokens de \`components\`
- \`animations\`

## Comportamento em runtime

- tema ativo vem de config/usuario
- toggle light/dark resolve o tema pareado por referencia
- variaveis CSS sao geradas dos tokens do template

## Boas praticas

- mantenha contraste acessivel
- padronize escala de espaco e borda
- ofereca variantes dark e light quando possivel
`,
    faq: `# FAQ

## Por que repositorios remotos nao abrem localmente?

Verifique:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` no \`.env\`
- repositorio alvo contem \`gitpagedocs/config.json\`
- paths markdown do repositorio batem com seu config de rotas

## Por que rota de versao mostra conteudo errado?

Verifique:

- \`VersionControl.versions[*].path\` em \`gitpagedocs/config.json\`
- config da versao possui \`routes\` e \`menus-header\` validos
- markdown existe para cada idioma

## Por que tema nao aplica corretamente?

Verifique:

- \`layoutsConfig.json\` referencia templates validos
- ids de template sao unicos
- tema selecionado existe no mapa de temas carregados

## Por que GitHub Pages pode se comportar diferente do local?

Porque o build de GitHub Pages habilita pagina inicial de busca e comportamento especifico de exportacao.
`,
  },
  es: {
    index: `# Git Page Docs

Git Page Docs es un runtime de documentacion multilenguaje para repositorios que incluyen la carpeta \`gitpagedocs/\`.

## Que entrega este proyecto

- Renderizado markdown multilenguaje (\`en\`, \`pt\`, \`es\`)
- Ruteo por version (\`/v/:version\`)
- Sistema de temas con templates JSON
- Ejecucion local y en GitHub Pages
- Busqueda de repositorio + render remoto opcional

## Contrato de carpetas

El runtime espera esta estructura:

- \`gitpagedocs/config.json\`
- \`gitpagedocs/docs/<lang>/*.md\`
- \`gitpagedocs/docs/versions/<version>/config.json\`
- \`gitpagedocs/docs/versions/<version>/<lang>/*.md\`
- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

## Navegacion rapida

- Abre **Primeros pasos** para setup local.
- Abre **Configuracion** para detalle completo de \`config.json\`.
- Abre **Publicacion** para comportamiento local/produccion/GitHub Pages.
- Abre **Arquitectura** para mapa de codigo y flujo de datos.
- Abre **Temas y layouts** para creacion de templates.
- Abre **FAQ** para troubleshooting.
`,
    gettingStarted: `# Primeros pasos

Esta guia lleva el proyecto desde cero hasta docs corriendo.

## Requisitos

- Node.js 20+
- npm 10+ (o pnpm)

## Setup local

1. Instala dependencias:
   - \`npm install\`
2. Genera/actualiza artefactos de docs:
   - \`npm run gitpagedocs\`
3. Inicia desarrollo:
   - \`npm run dev\`
4. Build + ejecucion local de produccion:
   - \`npm run build\`
   - \`npm start\`

## Comportamiento de la CLI

\`npx gitpagedocs\` (o \`npm run gitpagedocs\`) genera artefactos en la carpeta oficial \`gitpagedocs/\`.

- Genera solo markdown/json
- No genera \`index.html\`
- No genera \`index.js\`
- No ejecuta comandos de instalacion

## Modo de busqueda por repositorio

En local, se controla por variable:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\`
- \`GITPAGEDOCS_REPOSITORY_SEARCH=false\`

En build de GitHub Pages (\`GITHUB_ACTIONS=true\`), la busqueda de repositorio siempre esta activa.
`,
    projectOverview: `# Vision general del proyecto

Git Page Docs esta impulsado por Next.js 15, React 19, TypeScript y Node.js. Genera documentacion multilingue para GitHub Pages.

## Stack

- Next.js 15
- React 19
- TypeScript
- Node.js 20+

## Objetivo

Construir documentacion multilingue para repositorios GitHub con soporte para versiones, temas y contenido md/html/video.
`,
    configuration: `# Configuracion

La configuracion de runtime esta en \`gitpagedocs/config.json\`.

## Seccion \`site\`

Claves principales:

- \`name\`: titulo del proyecto en UI
- \`defaultLanguage\`: idioma por defecto
- \`supportedLanguages\`: lista de idiomas disponibles
- \`HideThemeSelector\`: ocultar/mostrar selector de tema
- \`ThemeDefault\`: id del tema inicial
- \`ThemeModeDefault\`: modo inicial (\`light\` o \`dark\`)
- \`ProjectLink\`: URL de repositorio para acciones de cabecera
- \`docsVersion\`: version seleccionada por defecto
- \`ActiveNavigation\`: habilita anterior/siguiente
- \`FocusMode\`: habilita modo foco/lectura
- \`IconImageMenuHeaderImgWidth\`, \`IconImageMenuHeaderImgHeight\`: tamano del icono principal
- \`IconImageMenuHeaderLightImg\`, \`IconImageMenuHeaderDarkImg\`: icono principal (light/dark)
- \`IconProjectLinkImgWidth\`, \`IconProjectLinkImgHeight\`: tamano del icono enlace del proyecto
- \`IconProjectLinkLightImg\`, \`IconProjectLinkDarkImg\`: icono enlace del proyecto
- \`IconVersionLinksImgWidth\`, \`IconVersionLinksImgHeight\`: tamano del icono enlaces de version
- \`IconVersionLinksLightImg\`, \`IconVersionLinksDarkImg\`: icono enlaces de version
- \`IconInfoHeaderMenuImgWidth\`, \`IconInfoHeaderMenuImgHeight\`: tamano del icono info
- \`IconInfoHeaderMenuLightImg\`, \`IconInfoHeaderMenuDarkImg\`: icono info
- \`IconPreviewProjectLinkImgWidth\`, \`IconPreviewProjectLinkImgHeight\`: tamano del icono preview
- \`IconPreviewProjectLinkLightImg\`, \`IconPreviewProjectLinkDarkImg\`: icono preview
- \`layoutsConfigPath\`: fallback remoto de layouts
- \`rendering\`: URL canonica publicada

## Seccion \`VersionControl\`

\`VersionControl.versions\` define:

- \`id\`: identificador de version
- \`path\`: ruta de config de version
- links opcionales (\`ProjectLink\`, \`branch\`, \`release\`, \`commit\`)

## Navegacion y rutas

- \`routes\`: rutas markdown por idioma (legado)
- \`menus-header\`: menu jerarquico
- \`translations\`: etiquetas UI para not-found y navegacion

## Tipos de contenido (config de version)

Los configs de version soportan multiples tipos:

- \`routes-md\`: Rutas markdown con \`title\`, \`description\` (centrados via \`titlePosition\`, \`descriptionPosition\`)
- \`routes-html\`: Rutas de paginas HTML por idioma
- \`routes-video\`: Config de video con \`video.videoType\` (youtube, vimeo, mp4, etc.) y \`video.pathVideo\`
- \`menus-header-md\`, \`menus-header-html\`, \`menus-header-video\`: menus por tipo
- \`hierarchyPage\`: orden de contenedores en la pagina \`{ md: 0, html: 1, video: 2 }\`
- \`hierarchyMenu\`: orden de secciones del menu \`{ md: 0, html: 1, video: 2 }\`

Cada ruta puede incluir \`title\`, \`description\` (por idioma), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

## Variables por ruta (blockLink, container, url, browseAll)

Opciones por ruta en \`routes-md\`, \`routes-html\` y \`routes-video\`:

- **\`blockLink\`** (defecto: true) – Para HTML: si true, los enlaces abren en nueva pestaña (\`target="_blank"\`); si false, en el mismo contexto.
- **\`container\`** – \`"full"\` = altura automatica; numero (ej: \`500\`) = altura fija en px con overflow auto. Se aplica a md, html y video.
- **\`url\`** – Solo en \`routes-html\`: \`Record<LanguageCode, string>\` con URLs externas. Al definirse, el iframe usa \`src={url}\` en vez de HTML local via \`srcDoc\`. Las rutas con \`url\` no generan archivos HTML locales.
- **\`browseAll\`** (defecto: false) – Si true, el contenedor muestra botones Anterior/Siguiente para navegar entre todos los items de ese tipo.

## Tipos de contenido: path vs url (HTML)

- **Markdown (\`routes-md\`)**: usa \`path\` apuntando a archivos \`.md\` locales.
- **HTML (\`routes-html\`)**: usa \`path\` para archivos \`.html\` locales o \`url\` para URLs externas. Con \`url\`, el iframe carga la pagina externa; no se genera archivo local.
- **Video (\`routes-video\`)**: usa \`video.pathVideo\` y \`video.videoType\` (youtube, vimeo, mp4, etc.).

## Variables de entorno

- \`GITPAGEDOCS_REPOSITORY_SEARCH\`: activa/desactiva busqueda remota en local
- \`GITHUB_ACTIONS\`: habilita comportamiento especifico de GitHub Pages
`,
    deployment: `# Publicacion

Git Page Docs corre como app Next.js con dos objetivos: servidor local y GitHub Pages.

## Publicacion local

Usa:

1. \`npm run build\`
2. \`npm start\`

Esto inicia runtime Node + Next.js usando \`gitpagedocs/\` local.

## Publicacion en GitHub Pages

En build de GitHub Actions:

- \`GITHUB_ACTIONS=true\`
- el comportamiento de export estatico se habilita por configuracion
- la pagina inicial de busqueda de repositorios queda activa

## Flujo de publish del paquete

Para publicar en npm:

- actualiza version en \`package.json\`
- ejecuta \`npm publish --access public\`
- valida autenticacion con \`npm whoami\`

Si \`build:prebuilt\` se omite en Windows, usa CI para generar artefactos prebuilt.
`,
    architecture: `# Arquitectura

El proyecto esta organizado por fronteras de feature y responsabilidades de runtime.

## Modulos principales

- \`src/app/[[...repo]]/page.tsx\`
  - parser de rutas
  - generateStaticParams
  - seleccion de shell (docs vs repository search)
- \`src/entities/docs/api/load-docs-data.ts\`
  - carga de config local/remota
  - resolucion de version
  - pipeline fetch + parse markdown
  - carga de layouts + temas
- \`src/widgets/docs-shell/docs-shell.tsx\`
  - render de UI
  - estado de idioma/version/tema
  - sincronizacion de URL

## Flujo de datos

1. Llega la ruta (\`/owner/repo/v/x.y.z\` o equivalente local)
2. Se resuelve config (local o remoto)
3. Config de version sobreescribe rutas/menus base
4. Markdown se carga y convierte a HTML
5. Template de layout se resuelve y aplica en CSS vars
6. Shell renderiza contenido y controles

## Puntos de resiliencia

- fallback de carga para layouts/templates
- carga de markdown por idioma con fallback de error
- sincronizacion de idioma/version/tema via localStorage
`,
    githubIssuesProjects: `# GitHub Issues y Projects

Aprende a usar GitHub Issues y Projects para gestionar tu trabajo.

## Conceptos

- Issues para rastrear tareas y bugs
- Projects para visualizar y organizar el trabajo
- Flujos recomendados para equipos
`,
    gitIntroduction: `# Introduccion a Git

Conceptos basicos de Git para principiantes.

## Comandos esenciales

- \`git init\` - iniciar repositorio
- \`git add\` - preparar cambios
- \`git commit\` - registrar commit
- \`git push\` - enviar a remoto
`,
    themes: `# Temas y layouts

Los temas son templates JSON mapeados por \`layoutsConfig.json\`.

## Archivos

- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/layoutsFallbackConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

## Modelo de template

Cada template normalmente incluye:

- \`id\`, \`name\`, \`author\`, \`version\`
- \`mode\` y metadatos de par dark/light
- \`colors\`
- \`typography\`
- tokens de \`components\`
- \`animations\`

## Comportamiento en runtime

- tema activo viene de config/seleccion de usuario
- toggle light/dark resuelve tema pareado por referencia
- variables CSS se generan desde tokens del template

## Buenas practicas

- mantener contraste accesible
- mantener escala consistente de espacios y bordes
- ofrecer variantes dark y light cuando sea posible
`,
    faq: `# FAQ

## Por que repositorios remotos no abren en local?

Verifica:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` en \`.env\`
- repositorio objetivo contiene \`gitpagedocs/config.json\`
- paths markdown del repositorio coinciden con su config de rutas

## Por que una ruta de version muestra contenido incorrecto?

Verifica:

- \`VersionControl.versions[*].path\` en \`gitpagedocs/config.json\`
- config de version tiene \`routes\` y \`menus-header\` validos
- markdown existe para cada idioma

## Por que tema no se aplica correctamente?

Verifica:

- \`layoutsConfig.json\` referencia templates validos
- ids de template son unicos
- tema seleccionado existe en el mapa de temas cargados

## Por que GitHub Pages puede comportarse distinto a local?

Porque el build de GitHub Pages habilita la pagina inicial de busqueda y comportamiento especifico de exportacion.
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

const DEFAULT_HIERARCHY = { md: 0, html: 1, video: 2 };

const ROUTE_META_ID1 = {
  titles: { pt: "Primeiros passos", en: "Getting Started", es: "Primeros pasos" },
  descriptions: { pt: "Configure o repositório do zero", en: "Configure repository from zero", es: "Configura el repositorio desde cero" },
};

const ROUTE_META_ID2 = {
  titles: { pt: "Visão geral do projeto", en: "Project overview", es: "Visión general del proyecto" },
  descriptions: { pt: "Stack, objetivo e estrutura do Git Page Docs", en: "Stack, goals and structure of Git Page Docs", es: "Stack, objetivos y estructura de Git Page Docs" },
};

const ROUTE_META_ID3 = {
  titles: { pt: "GitHub Issues e Projects", en: "GitHub issues and projects", es: "GitHub issues y projects" },
  descriptions: { pt: "Como usar Issues e Projects no GitHub", en: "How to use GitHub Issues and Projects", es: "Cómo usar GitHub Issues y Projects" },
};

const ROUTE_META_ID4 = {
  titles: { pt: "Introdução ao Git", en: "Introduction to Git", es: "Introducción a Git" },
  descriptions: { pt: "Conceitos básicos de Git para iniciantes", en: "Basic Git concepts for beginners", es: "Conceptos básicos de Git para principiantes" },
};

const VIDEO_META_ID1 = {
  title: { pt: "Interactive vs non-interactive modes | Copilot CLI for beginners", en: "Interactive vs non-interactive modes | Copilot CLI for beginners", es: "Interactive vs non-interactive modes | Copilot CLI for beginners" },
  description: {
    pt: "Quer saber a forma mais rápida de usar o GitHub Copilot no terminal? Neste tutorial, exploramos os dois modos principais do Copilot CLI.",
    en: "Want to know the fastest way to prompt GitHub Copilot from your terminal? In this beginner tutorial, we explore the two main modes of the Copilot CLI. Discover how to use the interactive mode to have GitHub Copilot run your project locally or use the non-interactive mode with the -p flag for quick summaries without leaving your shell context.",
    es: "¿Quieres conocer la forma más rápida de usar GitHub Copilot desde tu terminal? En este tutorial exploramos los dos modos principales del Copilot CLI.",
  },
};

const VIDEO_META_ID2 = {
  title: { pt: "How to use GitHub issues and projects | GitHub for Beginners", en: "How to use GitHub issues and projects | GitHub for Beginners", es: "How to use GitHub issues and projects | GitHub for Beginners" },
  description: {
    pt: "Aprenda a usar GitHub Issues e Projects para gerenciar seu trabalho.",
    en: "Learn how to use GitHub Issues and Projects to manage your work effectively.",
    es: "Aprende a usar GitHub Issues y Projects para gestionar tu trabajo.",
  },
};

const VIDEO_META_ID3 = {
  title: { pt: "How I built an AI Python tutor with the GitHub Copilot SDK", en: "How I built an AI Python tutor with the GitHub Copilot SDK", es: "How I built an AI Python tutor with the GitHub Copilot SDK" },
  description: {
    pt: "Construindo um tutor de Python com IA usando o GitHub Copilot SDK.",
    en: "Building an AI Python tutor using the GitHub Copilot SDK.",
    es: "Construyendo un tutor de Python con IA usando el GitHub Copilot SDK.",
  },
};

const VIDEO_META_ID4 = {
  title: { pt: "A brief introduction to Git for beginners | GitHub", en: "A brief introduction to Git for beginners | GitHub", es: "A brief introduction to Git for beginners | GitHub" },
  description: {
    pt: "Introdução ao Git para iniciantes.",
    en: "A brief introduction to Git for beginners.",
    es: "Una breve introducción a Git para principiantes.",
  },
};

const HTML_PAGES = {
  gettingStarted: {
    pt: `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"/><title>Primeiros passos</title><style>body{font-family:system-ui;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6}h1{color:#0ea5e9}p{color:#334155}</style></head>
<body><h1>Primeiros passos</h1><p>Esta é uma página HTML de teste. Configure o repositório do zero usando os passos na documentação Markdown.</p></body>
</html>`,
    en: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Getting Started</title><style>body{font-family:system-ui;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6}h1{color:#0ea5e9}p{color:#334155}</style></head>
<body><h1>Getting Started</h1><p>This is a test HTML page. Configure your repository from zero using the steps in the Markdown documentation.</p></body>
</html>`,
    es: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><title>Primeros pasos</title><style>body{font-family:system-ui;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6}h1{color:#0ea5e9}p{color:#334155}</style></head>
<body><h1>Primeros pasos</h1><p>Esta es una página HTML de prueba. Configura el repositorio desde cero usando los pasos en la documentación Markdown.</p></body>
</html>`,
  },
};

function buildHtmlRoute(versionId, routeId, pathByLang, titles, descriptions, options = {}) {
  const base = buildMdRoute(versionId, routeId, pathByLang, titles, descriptions, options);
  return { ...base };
}

function buildVideoRoute(versionId, routeId, videoType, pathVideo, titles, descriptions, options = {}) {
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

function buildMdRoute(versionId, routeId, pathByLang, titles, descriptions, options = {}) {
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
  };
  if (container !== undefined) out.container = container;
  return out;
}

function buildHtmlRouteWithUrl(versionId, routeId, urlByLang, titles, descriptions, options = {}) {
  const base = buildMdRoute(versionId, routeId, {}, titles, descriptions, { ...options, path: undefined });
  delete base.path;
  return {
    ...base,
    url: urlByLang,
    blockLink: options.blockLink !== false,
    container: options.container ?? "full",
  };
}

function buildConfigArtifacts(options = {}) {
  const useLocalLayoutConfig = Boolean(options.useLocalLayoutConfig);
  const useOfficialLayouts = !useLocalLayoutConfig;
  const githubOwner = options.githubOwner;
  const githubRepo = options.githubRepo;
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
      return buildMdRoute(versionId, id, pathByLang, meta.titles, meta.descriptions);
    });
  }

  function buildVersionHtmlRoutesSimple(versionId) {
    const base = `gitpagedocs/docs/versions/${versionId}`;
    const pathByLang1 = {
      pt: `${base}/pt/${HTML_PATHS[1].pt}`,
      en: `${base}/en/${HTML_PATHS[1].en}`,
      es: `${base}/es/${HTML_PATHS[1].es}`,
    };
    const urlByLang = {
      pt: "https://github.com/Vidigal-code/git-page-docs",
      en: "https://github.com/Vidigal-code/git-page-docs",
      es: "https://github.com/Vidigal-code/git-page-docs",
    };
    return [
      buildHtmlRoute(versionId, 1, pathByLang1, ROUTE_META_ID1.titles, ROUTE_META_ID1.descriptions),
      buildHtmlRouteWithUrl(versionId, 2, urlByLang, ROUTE_META_ID2.titles, ROUTE_META_ID2.descriptions, { container: "full", blockLink: true }),
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
      { id: 2, pt: { title: "GitHub (URL)", "path-click": "url:https://github.com/Vidigal-code/git-page-docs" }, en: { title: "GitHub (URL)", "path-click": "url:https://github.com/Vidigal-code/git-page-docs" }, es: { title: "GitHub (URL)", "path-click": "url:https://github.com/Vidigal-code/git-page-docs" } },
    ];
    const menuVideo = [1, 2, 3, 4].map((id) => ({
      id: id,
      pt: { title: VIDEO_METAS[id].title.pt.slice(0, 40) + "...", "path-click": `page:${id}` },
      en: { title: VIDEO_METAS[id].title.en.slice(0, 40) + "...", "path-click": `page:${id}` },
      es: { title: VIDEO_METAS[id].title.es.slice(0, 40) + "...", "path-click": `page:${id}` },
    }));
    return { md: menuMd, html: menuHtml, video: menuVideo };
  }

  const versionRoutes_1_0_0_md = buildVersionMdRoutesSimple("1.0.0");
  const versionRoutes_1_0_0_html = buildVersionHtmlRoutesSimple("1.0.0");
  const versionRoutes_1_0_0_video = buildVersionVideoRoutesSimple("1.0.0");
  const versionMenus_1_0_0 = buildVersionMenusSimple("1.0.0");

  const versionRoutes_1_1_0_md = buildVersionMdRoutesSimple("1.1.0");
  const versionRoutes_1_1_0_html = buildVersionHtmlRoutesSimple("1.1.0");
  const versionRoutes_1_1_0_video = buildVersionVideoRoutesSimple("1.1.0");
  const versionMenus_1_1_0 = buildVersionMenusSimple("1.1.0");

  const versionRoutes_1_1_1_md = buildVersionMdRoutesSimple("1.1.1");
  const versionRoutes_1_1_1_html = buildVersionHtmlRoutesSimple("1.1.1");
  const versionRoutes_1_1_1_video = buildVersionVideoRoutesSimple("1.1.1");
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
          titleHeaderMenuHtml: "Páginas",
          lastUpdateVersionLabel: "Ultima versao de atualizacao",
          darkMode: "Modo escuro",
          lightMode: "Modo claro",
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
          titleHeaderMenuHtml: "Pages",
          lastUpdateVersionLabel: "Last update version",
          darkMode: "Dark mode",
          lightMode: "Light mode",
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
          titleHeaderMenuHtml: "Páginas",
          lastUpdateVersionLabel: "Ultima version de actualizacion",
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
          ProjectLink: projectLink,
          PathConfig: "gitpagedocs/docs/versions/1.0.0/config.json",
          PreviewProject: "",
          UpdateDate: "",
          branch: "",
          release: "",
          commit: "",
        },
        {
          id: "1.1.0",
          path: "gitpagedocs/docs/versions/1.1.0/config.json",
          ProjectLink: projectLink,
          PathConfig: "gitpagedocs/docs/versions/1.1.0/config.json",
          PreviewProject: "",
          UpdateDate: "",
          branch: "",
          release: "",
          commit: "",
        },
        {
          id: "1.1.1",
          path: "gitpagedocs/docs/versions/1.1.1/config.json",
          ProjectLink: projectLink,
          PathConfig: "gitpagedocs/docs/versions/1.1.1/config.json",
          PreviewProject: "",
          UpdateDate: "",
          branch: "",
          release: "",
          commit: "",
        },
      ],
    },
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
          pt: "Proximo",
          en: "Next",
          es: "Siguiente",
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
        browsePrev: {
          pt: "Anterior",
          en: "Previous",
          es: "Anterior",
        },
        browseNext: {
          pt: "Proximo",
          en: "Next",
          es: "Siguiente",
        },
      },
      footer: {
        footerLabel: {
          pt: "Projeto",
          en: "Project",
          es: "Proyecto",
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
    docsHtml: HTML_PAGES,
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
runCli({
  argv: process.argv,
  env: process.env,
  root: ROOT,
  pkgRoot: PKG_ROOT,
  prebuiltDir: PREBUILT_DIR,
  buildConfigArtifacts,
  createThemeTemplate,
  layouts: LAYOUTS,
}).catch((error) => {
  console.error("Failed to create Git Page Docs scaffold.", error);
  process.exitCode = 1;
});
