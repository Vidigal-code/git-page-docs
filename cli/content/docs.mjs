export const DOCS = {
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

Use the menu to open:

- **Getting Started** – Setup from zero
- **Project overview** – Stack, goals and structure
- **Functionalities** – CLI, options, configuration, deployment, themes, FAQ
- **GitHub issues and projects** – How to use Issues and Projects
- **Introduction to Git** – Basic Git concepts
- **Source code** – GitHub-style code viewer
- **Configuration** – Full \`config.json\` explanation
- **Deployment** – Local, server, and GitHub Pages behavior
- **Architecture** – Code map and data flow
- **Themes** – Template authoring details
- **FAQ** – Troubleshooting

## What each page covers

| Page | Description |
|------|-------------|
| Getting Started | Prerequisites, install, generate, local run, CLI behavior, repository search, troubleshooting |
| Project overview | Stack, objectives, folder structure, architecture summary |
| Functionalities | CLI commands and options, generated output, content types, source viewer, configuration keys, deployment, architecture, themes, FAQ |
| GitHub issues and projects | Issues (bugs, features, assignees), Projects (Kanban, tables), workflows |
| Introduction to Git | Basic Git concepts for beginners |
| Source code | File tree, search, syntax highlighting, copy, README preview for all \`.md\` files |
| Configuration | Site, layout, VersionControl sections; content types; env vars |
| Deployment | Official site, self-hosted GitHub Pages, npm publish |
| Architecture | Route parser, load-docs, docs-shell; data flow; reliability |
| Themes | Layout strategies, template model, runtime behavior |
| FAQ | Remote repos, version path, theme selection, GitHub Pages behavior |
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

## Troubleshooting

### Repository search does not work locally

- Set \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` in \`.env\` (create it in project root if missing).
- Ensure the target repository contains \`gitpagedocs/config.json\`.
- Check that markdown paths in the target repo match its version config routes.

### Build fails or docs do not load

- Run \`npm run lint\` to catch config or path issues.
- Ensure \`gitpagedocs/config.json\` exists and has valid \`VersionControl.versions\`.
- Verify markdown files exist for each language (\`en\`, \`pt\`, \`es\`) in the version folders.

### Version path returns wrong or empty content

- Check \`VersionControl.versions[*].path\` in \`gitpagedocs/config.json\`.
- Ensure the version config has valid \`routes\` and \`menus-header\`.
- Regenerate with \`npx gitpagedocs\` to refresh artifacts.

## Next steps

- **Configuration and deployment**: See **Functionalities** for \`config.json\` keys, self-hosted GitHub Pages, and npm publish.
- **Deploy to GitHub Pages**: Run \`npx gitpagedocs --push --owner <user> --repo <repo>\` to create the workflow, commit artifacts, and push.
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

## Architecture (summary)

\`\`\`mermaid
flowchart LR
    CLI[npx gitpagedocs] --> gitpagedocs[gitpagedocs/]
    gitpagedocs --> config[config.json]
    gitpagedocs --> docs[docs/versions]
    config --> runtime[Next.js runtime]
    docs --> runtime
    runtime --> shell[Docs shell UI]
\`\`\`

### Data flow

1. **CLI** (\`npx gitpagedocs\`) scans the project and writes \`gitpagedocs/config.json\`, \`gitpagedocs/docs/versions/<ver>/*\`, and optionally \`gitpagedocs/layouts/\`.
2. **Request** arrives at \`/owner/repo/v/x.y.z\` (or local equivalent).
3. **Runtime** loads config (local or from remote repo), resolves version, fetches markdown and layouts.
4. **Docs shell** renders content with language/version/theme state and URL sync.

### Main folders

| Path | Role |
|------|------|
| \`gitpagedocs/config.json\` | Root config (site, VersionControl, layout source) |
| \`gitpagedocs/docs/versions/<ver>/config.json\` | Per-version routes, menus |
| \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` | Markdown content |
| \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer\` | Source code viewer HTML |
| \`gitpagedocs/layouts/\` | Local layouts (with \`--layoutconfig\`) |
| \`src/app/\`, \`src/entities/\`, \`src/widgets/\` | Next.js app, load-docs, docs-shell |
`,
    functionalities: `# Functionalities

Complete reference of CLI options, configuration keys, and runtime features.

## CLI commands

| Command | Description |
|---------|--------------|
| \`npx gitpagedocs\` | Generate config and docs in \`gitpagedocs/\` |
| \`npx gitpagedocs --layoutconfig\` | Also generate local layouts/templates |
| \`npx gitpagedocs --home\` | Standalone distribution (\`gitpagedocshome/\`) |
| \`npx gitpagedocs --push --owner X --repo Y\` | Setup workflow, commit, push |
| \`npx gitpagedocs --interactive\` / \`-i\` | Interactive mode with prompts |

## CLI options

| Option | Description |
|--------|-------------|
| \`--owner <user>\` | GitHub owner |
| \`--repo <repo>\` | GitHub repository |
| \`--path <subpath>\` | Docs subpath (e.g. \`docs\`); without it, base path = repo name for correct CSS/JS on project sites |
| \`--output <dir>\` | Output directory (default: \`gitpagedocs\`) |
| \`--search true|false\` | Enable/disable repository search (\`--home\`) |
| \`--layoutconfig\` | Generate \`gitpagedocs/layouts/\` |
| \`--push\` | Create workflow, commit artifacts, push |
| \`--home\` | Generate \`gitpagedocshome/\` (static + .env + Dockerfile) |

## Generated output

- \`gitpagedocs/config.json\` – root config
- \`gitpagedocs/icon.svg\` – default icon
- \`gitpagedocs/docs/versions/<ver>/config.json\` – per-version routes
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` – markdown docs
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer\` – GitHub-style source code viewer
- \`gitpagedocs/layouts/\` – only with \`--layoutconfig\`

## Content types

| Type | Config key | Description |
|------|------------|-------------|
| Markdown | \`routes-md\` | .md files with \`path\` per language |
| HTML | \`routes-html\` | \`path\` (e.g. source-viewer) or \`url\` for external |
| Video | \`routes-video\` | \`video.pathVideo\`, \`video.videoType\` |
| Audio | \`routes-audio\` | \`audio.pathAudio\`, \`audio.audioType\` |

## Source code viewer

The CLI generates a **Source code** page per version. It scans \`src/\`, \`cli/\`, and root files (README.md, package.json, next.config.ts, etc.) and builds a GitHub-style dark viewer with:

- File tree sidebar with folder collapse/expand
- Search filter for files
- Syntax highlighting (TypeScript, JavaScript, JSON, CSS, Markdown)
- Copy button, line numbers
- README.md preview/code toggle
- Expand all / Collapse all controls

## Configuration

Runtime configuration lives in \`gitpagedocs/config.json\`.

### \`site\` section

| Key | Description |
|-----|-------------|
| \`name\` | Site name |
| \`defaultLanguage\` | Default UI language (\`en\`, \`pt\`, \`es\`) |
| \`supportedLanguages\` | Array of supported languages |
| \`docsVersion\` | Default docs version |
| \`rendering\` | GitHub Pages URL for self-hosted |
| \`ThemeDefault\` | Default theme id |
| \`ThemeModeDefault\` | Default mode (\`dark\`/\`light\`) |
| \`ProjectLink\` | Project/repo link |

### Layout source keys

| Key | Description |
|-----|-------------|
| \`layoutsConfigPathOficial\` | \`true\` = use official layouts; \`false\` = use local |
| \`layoutsConfigPath\` | Local layouts config path |

### \`VersionControl\` section

\`VersionControl.versions\` defines per-version: \`id\`, \`path\`, optional metadata.

## Deployment

1. **Official viewer site**: \`https://vidigal-code.github.io/git-page-docs/\` – provide owner + repository to load docs.
2. **Self-hosted GitHub Pages**: Generate with \`npx gitpagedocs\`, set \`site.rendering\` to your Pages URL, build and deploy via workflow.

## Architecture

Main runtime modules: Route parser (\`src/app/[[...repo]]/page.tsx\`), Load docs (\`src/entities/docs/api/load-docs-data.ts\`), Docs shell (\`src/widgets/docs-shell/docs-shell.tsx\`). Data flow: request → config → version → markdown → layout → shell.

## Themes and layouts

Themes are JSON templates in \`layoutsConfig.json\`. Default mode uses official layouts; Local mode (\`--layoutconfig\`) uses \`gitpagedocs/layouts/\`.

## FAQ

### Why are remote repositories not opening locally?

Check: \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` in \`.env\`; target repo has \`gitpagedocs/config.json\`; markdown paths match routes config.

### Why does a version path return wrong content?

Check: \`VersionControl.versions[*].path\` in config; version config has valid \`routes\` and \`menus-header\`; markdown files exist per language.

### Why does theme selection not apply correctly?

Check: \`layoutsConfig.json\` references valid templates; template ids are unique; selected theme exists in loaded themes map.

### Why can GitHub Pages behave differently from local?

GitHub Pages build mode enables repository-search home and static-export specific behavior.

## Environment variables

| Variable | Description |
|----------|-------------|
| \`GITPAGEDOCS_REPOSITORY_SEARCH\` | Enable/disable remote repository search (local) |
| \`GITHUB_ACTIONS\` | GitHub Pages build mode |
`,
    githubIssuesProjects: `# GitHub Issues and Projects

Learn how to use GitHub Issues and Projects to manage your work.

## Issues

Issues let you track bugs, features, and tasks.

- **Assignees**: assign work to team members
- **Labels**: categorize by type (bug, enhancement, documentation)
- **Milestones**: group issues for releases or sprints
- **Discussions**: comments and linked PRs stay attached to the issue

### Creating an issue

1. Open the **Issues** tab in your repo
2. Click **New issue**
3. Add title, description, labels, and assignees
4. Submit and optionally link to a PR when ready

## Projects

Projects visualize and organize work beyond simple lists.

- **Kanban boards**: columns like To do, In progress, Done
- **Tables**: rows and columns for structured data
- **Roadmaps**: timeline views with milestones
- **Custom fields**: priorities, status, effort
- **Automation**: move items when PRs merge, auto-archive

### Creating a project

1. Open **Projects** in your repo or org
2. Click **New project**, choose **Board** (Kanban) or **Table**
3. Add columns/fields (Status, Priority, etc.)
4. Link issues or add work items manually

### Workflow example

1. Create issues for bugs and features
2. Add them to a Kanban project
3. Move cards as work progresses
4. Link PRs to close issues automatically

## Related resources

- GitHub docs: "Managing your work with GitHub Issues and Projects"
- Video: "How to use GitHub Issues and Projects"
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
- \`routes-audio\`: Audio config with \`audio.audioType\` (youtube, mp3, etc.) and \`audio.pathAudio\`
- \`menus-header-md\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\`: menus per type
- \`hierarchyPage\`: container order on page \`{ md: 0, html: 1, video: 2, audio: 3 }\`
- \`hierarchyMenu\`: menu section order \`{ md: 0, html: 1, video: 2, audio: 3 }\`

Each route can include \`title\`, \`description\` (per language), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

## Route-level variables (blockLink, container, url, browseAll)

Per-route options for \`routes-md\`, \`routes-html\`, \`routes-video\`, and \`routes-audio\`:

- **\`blockLink\`** (default: true) – For HTML: if true, links open in a new tab (\`target="_blank"\`); if false, links open in the same context.
- **\`container\`** – \`"full"\` = auto-extend height; number (e.g. \`500\`) = fixed height in px with overflow auto. Applies to md, html, video, and audio containers.
- **\`url\`** – For \`routes-html\` only: \`Record<LanguageCode, string>\` with external URLs. When set, the iframe uses \`src={url}\` instead of local HTML via \`srcDoc\`. Routes with \`url\` do not generate local HTML files.
- **\`browseAll\`** (default: false) – If true, the container shows Previous/Next buttons to browse all items of that type without changing the page.

## Content types: path vs url (HTML)

- **Markdown (\`routes-md\`)**: always uses \`path\` pointing to local \`.md\` files.
- **HTML (\`routes-html\`)**: uses \`path\` for local HTML files (no \`.html\` extension in config, e.g. \`source-viewer\`) or \`url\` for external URLs. When \`url\` is set, the iframe loads the external page; no local file is generated. The CLI generates a **Source code** viewer (GitHub-style) per version.
- **Video (\`routes-video\`)**: uses \`video.pathVideo\` and \`video.videoType\` (youtube, vimeo, mp4, etc.).
- **Audio (\`routes-audio\`)**: uses \`audio.pathAudio\` and \`audio.audioType\` (youtube, mp3, etc.). No autoplay by default.

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

Use o menu para abrir:

- **Primeiros passos** – Setup do zero
- **Visao geral do projeto** – Stack, objetivos e estrutura
- **Funcionalidades** – CLI, opcoes, configuracao, publicacao, temas, FAQ
- **GitHub Issues e Projects** – Como usar Issues e Projects
- **Introducao ao Git** – Conceitos basicos de Git
- **Codigo fonte** – Visualizador de codigo estilo GitHub
- **Configuracao** – Detalhes completos do \`config.json\`
- **Publicacao** – Comportamento local, servidor e GitHub Pages
- **Arquitetura** – Mapa de codigo e fluxo de dados
- **Temas** – Detalhes de autoria de templates
- **FAQ** – Troubleshooting

## O que cada pagina cobre

| Pagina | Descricao |
|--------|-----------|
| Primeiros passos | Pre-requisitos, instalar, gerar, execucao local, comportamento da CLI, troubleshooting |
| Visao geral do projeto | Stack, objetivos, estrutura de pastas, resumo de arquitetura |
| Funcionalidades | Comandos e opcoes da CLI, saida gerada, tipos de conteudo, visualizador de codigo, chaves de config, publicacao, arquitetura, temas, FAQ |
| GitHub Issues e Projects | Issues (bugs, features, responsaveis), Projects (Kanban, tabelas), fluxos |
| Introducao ao Git | Conceitos basicos de Git para iniciantes |
| Codigo fonte | Arvore de arquivos, busca, destaque de sintaxe, copiar, preview do README |
| Configuracao | Seccoes site, layout, VersionControl; tipos de conteudo; variaveis de ambiente |
| Publicacao | Site oficial, GitHub Pages self-hosted, npm publish |
| Arquitetura | Parser de rotas, load-docs, docs-shell; fluxo de dados; resiliencia |
| Temas | Estrategias de layout, modelo de template, comportamento em runtime |
| FAQ | Repos remotos, rota de versao, tema, GitHub Pages |
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

## Troubleshooting

### Busca por repositorio nao funciona localmente

- Defina \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` no \`.env\` (crie na raiz do projeto se nao existir).
- Garanta que o repo alvo contem \`gitpagedocs/config.json\`.
- Verifique se os paths markdown no repo alvo batem com o config de rotas.

### Build falha ou docs nao carregam

- Execute \`npm run lint\` para detectar erros de config ou paths.
- Garanta que \`gitpagedocs/config.json\` existe e tem \`VersionControl.versions\` validos.
- Verifique se existem arquivos markdown para cada idioma (\`en\`, \`pt\`, \`es\`) nas pastas de versao.

### Rota de versao retorna conteudo errado ou vazio

- Verifique \`VersionControl.versions[*].path\` em \`gitpagedocs/config.json\`.
- Garanta que o config da versao tem \`routes\` e \`menus-header\` validos.
- Regenere com \`npx gitpagedocs\` para atualizar os artefatos.

## Proximos passos

- **Configuracao e publicacao**: Veja **Funcionalidades** para chaves do \`config.json\`, GitHub Pages self-hosted e publish no npm.
- **Publicar no GitHub Pages**: Execute \`npx gitpagedocs --push --owner <user> --repo <repo>\` para criar o workflow, commitar artefatos e enviar.
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

## Arquitetura (resumo)

\`\`\`mermaid
flowchart LR
    CLI[npx gitpagedocs] --> gitpagedocs[gitpagedocs/]
    gitpagedocs --> config[config.json]
    gitpagedocs --> docs[docs/versions]
    config --> runtime[Next.js runtime]
    docs --> runtime
    runtime --> shell[Docs shell UI]
\`\`\`

### Fluxo de dados

1. **CLI** (\`npx gitpagedocs\`) escaneia o projeto e escreve \`gitpagedocs/config.json\`, \`gitpagedocs/docs/versions/<ver>/*\` e opcionalmente \`gitpagedocs/layouts/\`.
2. **Request** chega em \`/owner/repo/v/x.y.z\` (ou equivalente local).
3. **Runtime** carrega config (local ou remoto), resolve versao, busca markdown e layouts.
4. **Docs shell** renderiza conteudo com estado de idioma/versao/tema e sincronizacao de URL.

### Pastas principais

| Path | Papel |
|------|-------|
| \`gitpagedocs/config.json\` | Config raiz (site, VersionControl, layout) |
| \`gitpagedocs/docs/versions/<ver>/config.json\` | Rotas e menus por versao |
| \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` | Conteudo markdown |
| \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer\` | Visualizador de codigo HTML |
| \`gitpagedocs/layouts/\` | Layouts locais (com \`--layoutconfig\`) |
| \`src/app/\`, \`src/entities/\`, \`src/widgets/\` | App Next.js, load-docs, docs-shell |
`,
    functionalities: `# Funcionalidades

Referencia completa de opcoes da CLI, chaves de configuracao e recursos do runtime.

## Comandos da CLI

| Comando | Descricao |
|---------|------------|
| \`npx gitpagedocs\` | Gera config e docs em \`gitpagedocs/\` |
| \`npx gitpagedocs --layoutconfig\` | Tambem gera layouts/templates locais |
| \`npx gitpagedocs --home\` | Distribuicao standalone (\`gitpagedocshome/\`) |
| \`npx gitpagedocs --push --owner X --repo Y\` | Configura workflow, commit, push |
| \`npx gitpagedocs --interactive\` / \`-i\` | Modo interativo com prompts |

## Opcoes da CLI

| Opcao | Descricao |
|-------|-----------|
| \`--owner <user>\` | Owner do GitHub |
| \`--repo <repo>\` | Repositorio GitHub |
| \`--path <subpath>\` | Subcaminho dos docs (ex: \`docs\`); sem ele, base path = nome do repo para CSS/JS em project sites |
| \`--output <dir>\` | Diretorio de saida (padrao: \`gitpagedocs\`) |
| \`--search true|false\` | Habilita/desabilita busca de repositorio (\`--home\`) |
| \`--layoutconfig\` | Gera \`gitpagedocs/layouts/\` |
| \`--push\` | Cria workflow, commit de artefatos, push |
| \`--home\` | Gera \`gitpagedocshome/\` (estatico + .env + Dockerfile) |

## Saida gerada

- \`gitpagedocs/config.json\` – config raiz
- \`gitpagedocs/icon.svg\` – icone padrao
- \`gitpagedocs/docs/versions/<ver>/config.json\` – rotas por versao
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` – docs em markdown
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer\` – visualizador de codigo (estilo GitHub)
- \`gitpagedocs/layouts/\` – apenas com \`--layoutconfig\`

## Tipos de conteudo

| Tipo | Chave config | Descricao |
|------|--------------|-----------|
| Markdown | \`routes-md\` | Arquivos .md com \`path\` por idioma |
| HTML | \`routes-html\` | \`path\` (ex: source-viewer) ou \`url\` externa |
| Video | \`routes-video\` | \`video.pathVideo\`, \`video.videoType\` |
| Audio | \`routes-audio\` | \`audio.pathAudio\`, \`audio.audioType\` |

## Visualizador de codigo fonte

A CLI gera uma pagina **Codigo fonte** por versao. Escaneia \`src/\`, \`cli/\` e arquivos raiz (README.md, package.json, next.config.ts, etc.) e constroi um visualizador estilo GitHub em modo escuro com:

- Arvore de arquivos na lateral com expandir/recolher pastas
- Filtro de busca
- Destaque de sintaxe (TypeScript, JavaScript, JSON, CSS, Markdown)
- Botao copiar, numeros de linha
- Alternar preview/codigo do README.md
- Controles Expandir tudo / Recolher tudo

## Configuracao

A configuracao de runtime fica em \`gitpagedocs/config.json\`.

### Secao \`site\`

| Chave | Descricao |
|-------|-----------|
| \`name\` | Nome do site |
| \`defaultLanguage\` | Idioma padrao (\`en\`, \`pt\`, \`es\`) |
| \`supportedLanguages\` | Lista de idiomas suportados |
| \`docsVersion\` | Versao padrao dos docs |
| \`rendering\` | URL do GitHub Pages para self-hosted |
| \`ThemeDefault\` | Id do tema padrao |
| \`ThemeModeDefault\` | Modo padrao (\`dark\`/\`light\`) |
| \`ProjectLink\` | Link do projeto/repo |

### Chaves de layout

| Chave | Descricao |
|-------|-----------|
| \`layoutsConfigPathOficial\` | \`true\` = layouts oficiais; \`false\` = locais |
| \`layoutsConfigPath\` | Caminho dos layouts locais |

### Secao \`VersionControl\`

\`VersionControl.versions\` define por versao: \`id\`, \`path\` e metadados opcionais.

## Publicacao

1. **Site oficial**: \`https://vidigal-code.github.io/git-page-docs/\` – informe owner + repositorio para carregar docs.
2. **GitHub Pages self-hosted**: Gere com \`npx gitpagedocs\`, defina \`site.rendering\` para sua URL Pages, faca build e publique via workflow.

## Arquitetura

Modulos principais: Parser de rota (\`src/app/[[...repo]]/page.tsx\`), Carregar docs (\`src/entities/docs/api/load-docs-data.ts\`), Docs shell (\`src/widgets/docs-shell/docs-shell.tsx\`). Fluxo: request → config → versao → markdown → layout → shell.

## Temas e layouts

Temas sao templates JSON em \`layoutsConfig.json\`. Modo padrao usa layouts oficiais; Modo local (\`--layoutconfig\`) usa \`gitpagedocs/layouts/\`.

## FAQ

### Por que repositorios remotos nao abrem localmente?

Verifique: \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` no \`.env\`; repo alvo tem \`gitpagedocs/config.json\`; paths markdown batem com config de rotas.

### Por que rota de versao mostra conteudo errado?

Verifique: \`VersionControl.versions[*].path\` no config; config da versao tem \`routes\` e \`menus-header\` validos; arquivos markdown existem por idioma.

### Por que tema nao aplica corretamente?

Verifique: \`layoutsConfig.json\` referencia templates validos; ids sao unicos; tema selecionado existe no mapa de temas.

### Por que GitHub Pages pode se comportar diferente do local?

O modo build GitHub Pages habilita pagina de busca e comportamento especifico de export estatico.

## Variaveis de ambiente

| Variavel | Descricao |
|----------|-----------|
| \`GITPAGEDOCS_REPOSITORY_SEARCH\` | Ativa/desativa busca remota (local) |
| \`GITHUB_ACTIONS\` | Modo build GitHub Pages |
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
- \`routes-audio\`: Config de audio com \`audio.audioType\` (youtube, mp3, etc.) e \`audio.pathAudio\`
- \`menus-header-md\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\`: menus por tipo
- \`hierarchyPage\`: ordem dos containers na pagina \`{ md: 0, html: 1, video: 2, audio: 3 }\`
- \`hierarchyMenu\`: ordem das secoes do menu \`{ md: 0, html: 1, video: 2, audio: 3 }\`

Cada rota pode incluir \`title\`, \`description\` (por idioma), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

## Variaveis por rota (blockLink, container, url, browseAll)

Opcoes por rota em \`routes-md\`, \`routes-html\` e \`routes-video\`:

- **\`blockLink\`** (padrao: true) – Para HTML: se true, links abrem em nova aba (\`target="_blank"\`); se false, no proprio contexto.
- **\`container\`** – \`"full"\` = altura automatica; numero (ex: \`500\`) = altura fixa em px com overflow auto. Aplica-se a md, html e video.
- **\`url\`** – Apenas em \`routes-html\`: \`Record<LanguageCode, string>\` com URLs externas. Quando definido, o iframe usa \`src={url}\` em vez de HTML local via \`srcDoc\`. Rotas com \`url\` nao geram arquivos HTML locais.
- **\`browseAll\`** (padrao: false) – Se true, o container mostra botoes Anterior/Proximo para navegar entre todos os itens daquele tipo.

## Tipos de conteudo: path vs url (HTML)

- **Markdown (\`routes-md\`)**: usa \`path\` apontando para arquivos \`.md\` locais.
- **HTML (\`routes-html\`)**: usa \`path\` para arquivos HTML locais (sem extensao .html no config, ex: \`source-viewer\`) ou \`url\` para URLs externas. Com \`url\`, o iframe carrega a pagina externa; nenhum arquivo local e gerado. A CLI gera um visualizador **Codigo fonte** (estilo GitHub) por versao.
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

## Issues

Issues permitem rastrear bugs, funcionalidades e tarefas.

- **Responsaveis**: atribuir trabalho a membros da equipe
- **Etiquetas**: categorizar por tipo (bug, melhoria, documentacao)
- **Marcos**: agrupar issues para releases ou sprints
- **Discussoes**: comentarios e PRs vinculados ficam ligados a issue

### Criar uma issue

1. Abra a aba **Issues** no seu repo
2. Clique em **New issue**
3. Adicione titulo, descricao, etiquetas e responsaveis
4. Envie e opcionalmente vincule a um PR quando pronto

## Projects

Projects visualizam e organizam o trabalho alem de listas simples.

- **Quadros Kanban**: colunas como A fazer, Em progresso, Concluido
- **Tabelas**: linhas e colunas para dados estruturados
- **Roadmaps**: visoes de timeline com marcos
- **Campos customizados**: prioridade, status, esforco
- **Automacao**: mover itens quando PRs fazem merge, arquivar automaticamente

### Criar um project

1. Abra **Projects** no repo ou na organizacao
2. Clique em **New project**, escolha **Board** (Kanban) ou **Table**
3. Adicione colunas/campos (Status, Prioridade, etc.)
4. Vincule issues ou adicione itens manualmente

### Exemplo de fluxo

1. Crie issues para bugs e funcionalidades
2. Adicione-as a um projeto Kanban
3. Mova os cards conforme o progresso
4. Vincule PRs para fechar issues automaticamente

## Recursos relacionados

- Docs GitHub: "Managing your work with GitHub Issues and Projects"
- Video: "How to use GitHub Issues and Projects"
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

Usa el menu para abrir:

- **Primeros pasos** – Setup desde cero
- **Vision general del proyecto** – Stack, objetivos y estructura
- **Funcionalidades** – CLI, opciones, configuracion, publicacion, temas, FAQ
- **GitHub Issues y Projects** – Como usar Issues y Projects
- **Introduccion a Git** – Conceptos basicos de Git
- **Codigo fuente** – Visor de codigo estilo GitHub
- **Configuracion** – Detalle completo de \`config.json\`
- **Publicacion** – Comportamiento local, servidor y GitHub Pages
- **Arquitectura** – Mapa de codigo y flujo de datos
- **Temas** – Detalles de creacion de templates
- **FAQ** – Troubleshooting

## Que cubre cada pagina

| Pagina | Descripcion |
|--------|-------------|
| Primeros pasos | Requisitos, instalar, generar, ejecucion local, comportamiento de la CLI, troubleshooting |
| Vision general del proyecto | Stack, objetivos, estructura de carpetas, resumen de arquitectura |
| Funcionalidades | Comandos y opciones CLI, salida generada, tipos de contenido, visor de codigo, claves de config, publicacion, arquitectura, temas, FAQ |
| GitHub Issues y Projects | Issues (bugs, features, asignados), Projects (Kanban, tablas), flujos |
| Introduccion a Git | Conceptos basicos de Git para principiantes |
| Codigo fuente | Arbol de archivos, busqueda, resaltado de sintaxis, copiar, vista previa del README |
| Configuracion | Secciones site, layout, VersionControl; tipos de contenido; variables de entorno |
| Publicacion | Sitio oficial, GitHub Pages self-hosted, npm publish |
| Arquitectura | Parser de rutas, load-docs, docs-shell; flujo de datos; resiliencia |
| Temas | Estrategias de layout, modelo de template, comportamiento en runtime |
| FAQ | Repos remotos, ruta de version, tema, GitHub Pages |
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

## Troubleshooting

### La busqueda por repositorio no funciona en local

- Define \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` en \`.env\` (crealo en la raiz del proyecto si no existe).
- Asegurate de que el repo objetivo contiene \`gitpagedocs/config.json\`.
- Verifica que los paths markdown del repo objetivo coincidan con el config de rutas.

### El build falla o los docs no cargan

- Ejecuta \`npm run lint\` para detectar errores de config o paths.
- Asegurate de que \`gitpagedocs/config.json\` existe y tiene \`VersionControl.versions\` validos.
- Verifica que existan archivos markdown para cada idioma (\`en\`, \`pt\`, \`es\`) en las carpetas de version.

### La ruta de version retorna contenido incorrecto o vacio

- Verifica \`VersionControl.versions[*].path\` en \`gitpagedocs/config.json\`.
- Asegurate de que el config de version tiene \`routes\` y \`menus-header\` validos.
- Regenera con \`npx gitpagedocs\` para actualizar los artefactos.

## Proximos pasos

- **Configuracion y publicacion**: Ve **Funcionalidades** para claves de \`config.json\`, GitHub Pages self-hosted y publicacion en npm.
- **Publicar en GitHub Pages**: Ejecuta \`npx gitpagedocs --push --owner <user> --repo <repo>\` para crear el workflow, hacer commit de artefactos y enviar.
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

## Arquitectura (resumen)

\`\`\`mermaid
flowchart LR
    CLI[npx gitpagedocs] --> gitpagedocs[gitpagedocs/]
    gitpagedocs --> config[config.json]
    gitpagedocs --> docs[docs/versions]
    config --> runtime[Next.js runtime]
    docs --> runtime
    runtime --> shell[Docs shell UI]
\`\`\`

### Flujo de datos

1. **CLI** (\`npx gitpagedocs\`) escanea el proyecto y escribe \`gitpagedocs/config.json\`, \`gitpagedocs/docs/versions/<ver>/*\` y opcionalmente \`gitpagedocs/layouts/\`.
2. **Request** llega a \`/owner/repo/v/x.y.z\` (o equivalente local).
3. **Runtime** carga config (local o remoto), resuelve version, obtiene markdown y layouts.
4. **Docs shell** renderiza contenido con estado de idioma/version/tema y sincronizacion de URL.

### Carpetas principales

| Path | Rol |
|------|-----|
| \`gitpagedocs/config.json\` | Config raiz (site, VersionControl, layout) |
| \`gitpagedocs/docs/versions/<ver>/config.json\` | Rutas y menus por version |
| \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` | Contenido markdown |
| \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer\` | Visor de codigo HTML |
| \`gitpagedocs/layouts/\` | Layouts locales (con \`--layoutconfig\`) |
| \`src/app/\`, \`src/entities/\`, \`src/widgets/\` | App Next.js, load-docs, docs-shell |
`,
    functionalities: `# Funcionalidades

Referencia completa de opciones CLI, claves de configuracion y funciones del runtime.

## Comandos CLI

| Comando | Descripcion |
|---------|-------------|
| \`npx gitpagedocs\` | Genera config y docs en \`gitpagedocs/\` |
| \`npx gitpagedocs --layoutconfig\` | Tambien genera layouts/templates locales |
| \`npx gitpagedocs --home\` | Distribucion standalone (\`gitpagedocshome/\`) |
| \`npx gitpagedocs --push --owner X --repo Y\` | Configura workflow, commit, push |
| \`npx gitpagedocs --interactive\` / \`-i\` | Modo interactivo con prompts |

## Opciones CLI

| Opcion | Descripcion |
|--------|-------------|
| \`--owner <user>\` | Owner de GitHub |
| \`--repo <repo>\` | Repositorio GitHub |
| \`--path <subpath>\` | Subruta de docs (ej: \`docs\`); sin ella, base path = nombre del repo para CSS/JS en project sites |
| \`--output <dir>\` | Directorio de salida (default: \`gitpagedocs\`) |
| \`--search true|false\` | Habilita/deshabilita busqueda de repositorio (\`--home\`) |
| \`--layoutconfig\` | Genera \`gitpagedocs/layouts/\` |
| \`--push\` | Crea workflow, commit de artefactos, push |
| \`--home\` | Genera \`gitpagedocshome/\` (estatico + .env + Dockerfile) |

## Salida generada

- \`gitpagedocs/config.json\` – config raiz
- \`gitpagedocs/icon.svg\` – icono por defecto
- \`gitpagedocs/docs/versions/<ver>/config.json\` – rutas por version
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` – docs en markdown
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer\` – visor de codigo (estilo GitHub)
- \`gitpagedocs/layouts/\` – solo con \`--layoutconfig\`

## Tipos de contenido

| Tipo | Clave config | Descripcion |
|------|--------------|-------------|
| Markdown | \`routes-md\` | Archivos .md con \`path\` por idioma |
| HTML | \`routes-html\` | \`path\` (ej: source-viewer) o \`url\` externa |
| Video | \`routes-video\` | \`video.pathVideo\`, \`video.videoType\` |
| Audio | \`routes-audio\` | \`audio.pathAudio\`, \`audio.audioType\` |

## Visor de codigo fuente

La CLI genera una pagina **Codigo fuente** por version. Escanea \`src/\`, \`cli/\` y archivos raiz (README.md, package.json, next.config.ts, etc.) y construye un visor estilo GitHub en modo oscuro con:

- Arbol de archivos en barra lateral con expandir/colapsar carpetas
- Filtro de busqueda
- Resaltado de sintaxis (TypeScript, JavaScript, JSON, CSS, Markdown)
- Boton copiar, numeros de linea
- Alternar vista previa/codigo del README.md
- Controles Expandir todo / Colapsar todo

## Configuracion

La configuracion de runtime esta en \`gitpagedocs/config.json\`.

### Seccion \`site\`

| Clave | Descripcion |
|-------|-------------|
| \`name\` | Nombre del sitio |
| \`defaultLanguage\` | Idioma por defecto (\`en\`, \`pt\`, \`es\`) |
| \`supportedLanguages\` | Lista de idiomas soportados |
| \`docsVersion\` | Version por defecto de docs |
| \`rendering\` | URL de GitHub Pages para self-hosted |
| \`ThemeDefault\` | Id del tema por defecto |
| \`ThemeModeDefault\` | Modo por defecto (\`dark\`/\`light\`) |
| \`ProjectLink\` | Enlace del proyecto/repo |

### Claves de layout

| Clave | Descripcion |
|-------|-------------|
| \`layoutsConfigPathOficial\` | \`true\` = layouts oficiales; \`false\` = locales |
| \`layoutsConfigPath\` | Ruta de layouts locales |

### Seccion \`VersionControl\`

\`VersionControl.versions\` define por version: \`id\`, \`path\` y metadatos opcionales.

## Publicacion

1. **Sitio oficial**: \`https://vidigal-code.github.io/git-page-docs/\` – proporcione owner + repositorio para cargar docs.
2. **GitHub Pages self-hosted**: Genere con \`npx gitpagedocs\`, configure \`site.rendering\` a su URL Pages, haga build y publique via workflow.

## Arquitectura

Modulos principales: Parser de rutas (\`src/app/[[...repo]]/page.tsx\`), Cargar docs (\`src/entities/docs/api/load-docs-data.ts\`), Docs shell (\`src/widgets/docs-shell/docs-shell.tsx\`). Flujo: request → config → version → markdown → layout → shell.

## Temas y layouts

Los temas son templates JSON en \`layoutsConfig.json\`. Modo por defecto usa layouts oficiales; Modo local (\`--layoutconfig\`) usa \`gitpagedocs/layouts/\`.

## FAQ

### Por que repositorios remotos no abren en local?

Verifica: \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` en \`.env\`; repo objetivo tiene \`gitpagedocs/config.json\`; paths markdown coinciden con config de rutas.

### Por que ruta de version muestra contenido incorrecto?

Verifica: \`VersionControl.versions[*].path\` en config; config de version tiene \`routes\` y \`menus-header\` validos; archivos markdown existen por idioma.

### Por que tema no aplica correctamente?

Verifica: \`layoutsConfig.json\` referencia templates validos; ids son unicos; tema seleccionado existe en el mapa de temas.

### Por que GitHub Pages puede comportarse distinto del local?

El modo build GitHub Pages habilita pagina de busqueda y comportamiento especifico de export estatico.

## Variables de entorno

| Variable | Descripcion |
|----------|-------------|
| \`GITPAGEDOCS_REPOSITORY_SEARCH\` | Activa/desactiva busqueda remota (local) |
| \`GITHUB_ACTIONS\` | Modo build GitHub Pages |
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
- \`routes-audio\`: Config de audio con \`audio.audioType\` (youtube, mp3, etc.) y \`audio.pathAudio\`
- \`menus-header-md\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\`: menus por tipo
- \`hierarchyPage\`: orden de contenedores en la pagina \`{ md: 0, html: 1, video: 2, audio: 3 }\`
- \`hierarchyMenu\`: orden de secciones del menu \`{ md: 0, html: 1, video: 2, audio: 3 }\`

Cada ruta puede incluir \`title\`, \`description\` (por idioma), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

## Variables por ruta (blockLink, container, url, browseAll)

Opciones por ruta en \`routes-md\`, \`routes-html\` y \`routes-video\`:

- **\`blockLink\`** (defecto: true) – Para HTML: si true, los enlaces abren en nueva pestaña (\`target="_blank"\`); si false, en el mismo contexto.
- **\`container\`** – \`"full"\` = altura automatica; numero (ej: \`500\`) = altura fija en px con overflow auto. Se aplica a md, html y video.
- **\`url\`** – Solo en \`routes-html\`: \`Record<LanguageCode, string>\` con URLs externas. Al definirse, el iframe usa \`src={url}\` en vez de HTML local via \`srcDoc\`. Las rutas con \`url\` no generan archivos HTML locales.
- **\`browseAll\`** (defecto: false) – Si true, el contenedor muestra botones Anterior/Siguiente para navegar entre todos los items de ese tipo.

## Tipos de contenido: path vs url (HTML)

- **Markdown (\`routes-md\`)**: usa \`path\` apuntando a archivos \`.md\` locales.
- **HTML (\`routes-html\`)**: usa \`path\` para archivos HTML locales (sin extension .html en config, ej: \`source-viewer\`) o \`url\` para URLs externas. Con \`url\`, el iframe carga la pagina externa; no se genera archivo local. La CLI genera un visor **Codigo fuente** (estilo GitHub) por version.
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

## Issues

Las Issues permiten rastrear bugs, funcionalidades y tareas.

- **Asignados**: asignar trabajo a miembros del equipo
- **Etiquetas**: categorizar por tipo (bug, mejora, documentacion)
- **Hitos**: agrupar issues para releases o sprints
- **Discusiones**: comentarios y PRs vinculados permanecen ligados a la issue

### Crear una issue

1. Abre la pestana **Issues** en tu repo
2. Haz clic en **New issue**
3. Anade titulo, descripcion, etiquetas y asignados
4. Envia y opcionalmente vincula a un PR cuando este listo

## Projects

Los Projects visualizan y organizan el trabajo mas alla de listas simples.

- **Tableros Kanban**: columnas como Por hacer, En progreso, Hecho
- **Tablas**: filas y columnas para datos estructurados
- **Roadmaps**: vistas de timeline con hitos
- **Campos personalizados**: prioridad, estado, esfuerzo
- **Automatizacion**: mover items cuando los PRs hacen merge, archivar automaticamente

### Crear un project

1. Abre **Projects** en tu repo o en la organizacion
2. Haz clic en **New project**, elige **Board** (Kanban) o **Table**
3. Anade columnas/campos (Status, Prioridad, etc.)
4. Vincula issues o anade items manualmente

### Ejemplo de flujo

1. Crea issues para bugs y funcionalidades
2. Anadelas a un proyecto Kanban
3. Mueve las tarjetas segun avance el trabajo
4. Vincula PRs para cerrar issues automaticamente

## Recursos relacionados

- Docs GitHub: "Managing your work with GitHub Issues and Projects"
- Video: "How to use GitHub Issues and Projects"
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