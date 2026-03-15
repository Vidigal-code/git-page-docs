#!/usr/bin/env node

import { existsSync, rmSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

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

- \`routes\`: markdown paths per language
- \`menus-header\`: hierarchical menu model
- \`translations\`: UI labels

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
- \`IconImageMenuHeader\`: icone principal
- \`layoutsConfigPath\`: fallback remoto para layouts
- \`rendering\`: URL canonica publicada

## Secao \`VersionControl\`

\`VersionControl.versions\` define:

- \`id\`: identificador da versao
- \`path\`: caminho do config da versao
- links opcionais (\`ProjectLink\`, \`branch\`, \`release\`, \`commit\`)

## Navegacao e rotas

- \`routes\`: caminhos markdown por idioma
- \`menus-header\`: menu hierarquico
- \`translations\`: labels de UI para not-found e navegacao

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
- \`IconImageMenuHeader\`: icono principal
- \`layoutsConfigPath\`: fallback remoto de layouts
- \`rendering\`: URL canonica publicada

## Seccion \`VersionControl\`

\`VersionControl.versions\` define:

- \`id\`: identificador de version
- \`path\`: ruta de config de version
- links opcionales (\`ProjectLink\`, \`branch\`, \`release\`, \`commit\`)

## Navegacion y rutas

- \`routes\`: rutas markdown por idioma
- \`menus-header\`: menu jerarquico
- \`translations\`: etiquetas UI para not-found y navegacion

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

function withVersionBadge(content, versionId, language) {
  const normalized = typeof content === "string" ? content : "";
  if (!normalized.trim()) {
    return normalized;
  }

  const alreadyTagged =
    normalized.includes(`Version: ${versionId}`) ||
    normalized.includes(`Versao: ${versionId}`) ||
    normalized.includes(`Version (ES): ${versionId}`);
  if (alreadyTagged) {
    return normalized;
  }

  const label =
    language === "pt"
      ? `> Versao: ${versionId}`
      : language === "es"
        ? `> Version (ES): ${versionId}`
        : `> Version: ${versionId}`;

  return `${normalized.trimEnd()}\n\n${label}\n`;
}

function buildConfigArtifacts(options = {}) {
  const useLocalLayoutConfig = Boolean(options.useLocalLayoutConfig);
  const useOfficialLayouts = !useLocalLayoutConfig;
  const githubOwner = options.githubOwner;
  const githubRepo = options.githubRepo;
  const renderingUrl = githubOwner && githubRepo
    ? `https://${githubOwner}.github.io/${githubRepo}/`
    : "https://vidigal-code.github.io/git-page-docs/";
  const projectLink = githubOwner && githubRepo
    ? `https://github.com/${githubOwner}/${githubRepo}`
    : "https://github.com/Vidigal-code/git-page-docs";
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
      ActiveNavigation: true,
      FocusMode: true,
      FooterEnabled: true,
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
      layoutsConfigPathOficial: useOfficialLayouts,
      layoutsConfigPathTemplatesOficial: useOfficialLayouts ? OFFICIAL_LAYOUTS_TEMPLATES_URL : "",
      layoutsConfigPathOficialUrl: useOfficialLayouts ? OFFICIAL_LAYOUTS_CONFIG_URL : "",
      rendering: renderingUrl,
      ProjectLink: projectLink,
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
          focusMode: "Modo foco",
          versionLinksLabel: "Links do repositorio",
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
          focusMode: "Focus mode",
          versionLinksLabel: "Repository links",
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
          focusMode: "Modo foco",
          versionLinksLabel: "Enlaces del repositorio",
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
          branch: "",
          release: "",
          commit: "",
        },
        {
          id: "1.1.0",
          path: "gitpagedocs/docs/versions/1.1.0/config.json",
          ProjectLink: projectLink,
          PathConfig: "gitpagedocs/docs/versions/1.1.0/config.json",
          branch: "",
          release: "",
          commit: "",
        },
        {
          id: "1.1.1",
          path: "gitpagedocs/docs/versions/1.1.1/config.json",
          ProjectLink: projectLink,
          PathConfig: "gitpagedocs/docs/versions/1.1.1/config.json",
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
  const args = argv.slice(2);
  const knownFlags = new Set(["--build", "--serve", "--layoutconfig", "--full", "--push"]);
  const readOptionValue = (optionName) => {
    const equalsArg = args.find((arg) => arg.startsWith(`${optionName}=`));
    if (equalsArg) {
      return equalsArg.slice(optionName.length + 1).trim();
    }
    const index = args.indexOf(optionName);
    if (index >= 0) {
      const nextArg = args[index + 1];
      if (nextArg && !nextArg.startsWith("--")) {
        return nextArg.trim();
      }
    }
    return "";
  };

  let githubOwner = readOptionValue("--owner");
  let githubRepo = readOptionValue("--repo");
  const fallbackDashedArgs = args
    .filter((arg) => arg.startsWith("--"))
    .filter((arg) => !knownFlags.has(arg))
    .filter((arg) => !arg.startsWith("--owner"))
    .filter((arg) => !arg.startsWith("--repo"))
    .map((arg) => arg.replace(/^--/, "").trim())
    .filter(Boolean);
  if (!githubOwner && fallbackDashedArgs[0]) {
    githubOwner = fallbackDashedArgs[0];
  }
  if (!githubRepo && fallbackDashedArgs[1]) {
    githubRepo = fallbackDashedArgs[1];
  }

  const isBuild = argv.includes("--build") || env.GITPAGEDOCS_BUILD === "1";
  const isServe = argv.includes("--serve");
  const useLocalLayoutConfig = argv.includes("--layoutconfig");
  const shouldPush = argv.includes("--push");
  const mode = argv.includes("--full") ? "full" : "config-only";
  const outputDir = "gitpagedocs";
  return {
    isBuild,
    isServe,
    mode,
    outputDir,
    useLocalLayoutConfig,
    shouldPush,
    githubOwner,
    githubRepo,
  };
}

function sanitizeSegment(value) {
  if (!value) return "";
  const normalized = value.trim();
  return /^[A-Za-z0-9._-]+$/.test(normalized) ? normalized : "";
}

async function ensureGitHubPagesWorkflow() {
  const workflowPath = ".github/workflows/gitpagedocs-pages.yml";
  const workflowContent = `name: Deploy GitPageDocs

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout target repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Prepare runtime source
        run: |
          git clone --depth 1 https://github.com/Vidigal-code/git-page-docs.git .gitpagedocs-runtime
          if [ -d gitpagedocs ]; then
            rm -rf .gitpagedocs-runtime/gitpagedocs
            cp -R gitpagedocs .gitpagedocs-runtime/gitpagedocs
          fi

      - name: Install runtime dependencies
        run: npm ci
        working-directory: .gitpagedocs-runtime

      - name: Build static site with target repository path
        run: npm run build
        working-directory: .gitpagedocs-runtime
        env:
          GITHUB_ACTIONS: "true"
          GITHUB_REPOSITORY: \${{ github.repository }}

      - name: Add .nojekyll
        run: touch .gitpagedocs-runtime/out/.nojekyll 2>/dev/null || mkdir -p .gitpagedocs-runtime/out && touch .gitpagedocs-runtime/out/.nojekyll

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./.gitpagedocs-runtime/out

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
  await writeText(workflowPath, workflowContent);
}

function runGitPushForGeneratedArtifacts(options) {
  const owner = sanitizeSegment(options.githubOwner);
  const repo = sanitizeSegment(options.githubRepo);
  if (!owner || !repo) {
    throw new Error("`--push` requires owner and repo. Use `--owner <owner> --repo <repo>` or `--<owner> --<repo>`.");
  }
  if (!existsSync(path.join(ROOT, ".git"))) {
    throw new Error("Current directory is not a git repository. Initialize git before using --push.");
  }

  const repoUrl = `https://github.com/${owner}/${repo}.git`;
  try {
    execSync("git remote get-url origin", { cwd: ROOT, stdio: "ignore" });
  } catch {
    execSync(`git remote add origin "${repoUrl}"`, { cwd: ROOT, stdio: "inherit" });
  }

  execSync('git add "gitpagedocs" ".github/workflows/gitpagedocs-pages.yml"', { cwd: ROOT, stdio: "inherit" });

  let hasStagedChanges = false;
  try {
    execSync("git diff --cached --quiet", { cwd: ROOT, stdio: "ignore" });
    hasStagedChanges = false;
  } catch {
    hasStagedChanges = true;
  }

  if (!hasStagedChanges) {
    return;
  }

  execSync('git commit -m "chore: setup gitpagedocs pages workflow"', { cwd: ROOT, stdio: "inherit" });

  const currentBranch = execSync("git branch --show-current", { cwd: ROOT, stdio: "pipe" }).toString().trim() || "main";
  execSync(`git push -u origin ${currentBranch}`, { cwd: ROOT, stdio: "inherit" });
}

async function writeConfigOnlyOutput(outputDir, artifacts, options) {
  // Keep only versioned docs output in docs/, removing legacy root language folders.
  for (const legacyLanguageDir of ["en", "pt", "es"]) {
    const legacyPath = path.join(ROOT, outputDir, "docs", legacyLanguageDir);
    if (existsSync(legacyPath)) {
      rmSync(legacyPath, { recursive: true, force: true });
    }
  }

  await writeJson(`${outputDir}/config.json`, artifacts.rootConfig);
  const layoutsPath = path.join(ROOT, outputDir, "layouts");
  if (options.useLocalLayoutConfig) {
    await writeJson(`${outputDir}/layouts/layoutsConfig.json`, artifacts.layoutsConfig);
    await writeJson(`${outputDir}/layouts/layoutsFallbackConfig.json`, artifacts.fallbackLayoutsConfig);
    for (const layout of LAYOUTS) {
      const template = createThemeTemplate(layout);
      await writeJson(`${outputDir}/layouts/${layout.file}`, template);
    }
  } else if (existsSync(layoutsPath) && ROOT !== PKG_ROOT) {
    rmSync(layoutsPath, { recursive: true, force: true });
  }

  for (const [versionId, versionConfig] of Object.entries(artifacts.versionConfigs)) {
    await writeJson(`${outputDir}/docs/versions/${versionId}/config.json`, versionConfig);
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
        const versionedContent = withVersionBadge(content, versionId, language);
        await writeText(normalizeToOutputPath(outputDir, docPath), versionedContent);
      }
    }

    // Ensure version folders always include an index file.
    for (const language of ["pt", "en", "es"]) {
      const fallbackIndex = artifacts.docs?.[language]?.index;
      if (!fallbackIndex) continue;
      const versionIndexPath = `${outputDir}/docs/versions/${versionId}/${language}/index.md`;
      if (!existsSync(path.join(ROOT, versionIndexPath))) {
        const versionedFallbackIndex = withVersionBadge(fallbackIndex, versionId, language);
        await writeText(versionIndexPath, versionedFallbackIndex);
      }
    }
  }
}

async function run() {
  const options = parseCliOptions(process.argv, process.env);
  const artifacts = buildConfigArtifacts({
    useLocalLayoutConfig: options.useLocalLayoutConfig,
    githubOwner: sanitizeSegment(options.githubOwner),
    githubRepo: sanitizeSegment(options.githubRepo),
  });
  await writeConfigOnlyOutput(options.outputDir, artifacts, options);
  if (options.shouldPush) {
    await ensureGitHubPagesWorkflow();
    runGitPushForGeneratedArtifacts(options);
  }

  console.log(`Generated: ${options.outputDir}/ (config-only)`);
  console.log("No index.html/index.js generated.");
  if (options.useLocalLayoutConfig) {
    console.log("Local layouts generated in gitpagedocs/layouts/ (--layoutconfig).");
  } else {
    console.log("Using official remote layouts config by default (no local gitpagedocs/layouts generated).");
  }
  if (options.githubOwner && options.githubRepo) {
    console.log(`Configured rendering URL: https://${options.githubOwner}.github.io/${options.githubRepo}/`);
    console.log(
      `Official viewer remains available: https://vidigal-code.github.io/git-page-docs/${options.githubOwner}/${options.githubRepo}?modetheme=light&lang=pt`,
    );
  }
  if (options.shouldPush) {
    console.log("Generated: .github/workflows/gitpagedocs-pages.yml");
    console.log("Push mode enabled: committed and pushed gitpagedocs/ + workflow to origin.");
  }
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
