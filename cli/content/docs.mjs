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

- Open **Getting Started** for local setup.
- Open **Configuration** for full \`config.json\` explanation.
- Open **Deployment** for local, server, and GitHub Pages behavior.
- Open **Architecture** for code map and data flow.
- Open **Themes and layouts** for template authoring details.
- Open **Authorized routes** for key, roles, and external auth setup.
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

## Config keys (site)

- \`name\`, \`defaultLanguage\`, \`supportedLanguages\`
- \`docsVersion\`, \`rendering\`, \`ThemeDefault\`, \`ThemeModeDefault\`
- \`ProjectLink\`, \`layoutsConfigPathOficial\`, \`layoutsConfigPath\`

## Environment variables

- \`GITPAGEDOCS_REPOSITORY_SEARCH\` – repository search (local)
- \`GITHUB_ACTIONS\` – GitHub Pages build mode
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
    authorizedRoutes: `# Authorized Routes

Protect routes by access key, required roles, and external authentication providers.

## Version config location

Configure this at:

- \`gitpagedocs/docs/versions/<version>/config.json\`

## Global auth section

Use top-level \`auth\` in version config:

- \`accessKeys\`: map of key ids to expected secrets
- \`rolesStorageKey\`: localStorage key for role bootstrap
- \`providers\`: external providers list (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Route-level authorization

Inside each route (\`routes-md\`, \`routes-html\`, \`routes-video\`):

- \`authorization.accessKeyId\`
- \`authorization.requiredRoles\`
- \`authorization.requireExternalAuth\`
- \`authorization.allowedProviders\`

## Phases

### Phase A - Access key

Set \`authorization.accessKeyId\` and define that key in \`auth.accessKeys\`.

### Phase B - Roles

Set \`authorization.requiredRoles\` with one or more roles.

Roles can come from:

- query param \`?authRoles=admin,maintainer\`
- localStorage (\`rolesStorageKey\`)
- external provider claims

### Phase C - External providers

Set \`authorization.requireExternalAuth=true\` and optionally \`allowedProviders\`.

Supported adapters:

- Auth.js (\`type: "authjs"\`)
- Clerk (\`type: "clerk"\`)
- Firebase Auth (\`type: "firebase"\`)
- Custom JWT (\`type: "jwt"\`)

## Example

\`\`\`json
{
  "auth": {
    "accessKeys": {
      "docs-key": "open-gitpagedocs-docs"
    },
    "providers": [
      { "type": "authjs", "enabled": true, "sessionEndpoint": "/api/auth/session" },
      { "type": "jwt", "enabled": true, "tokenStorageKey": "git-page-docs:jwt-token" }
    ]
  },
  "routes-md": [
    {
      "id": 6,
      "path": {
        "en": "gitpagedocs/docs/versions/1.1.1/en/authorized-routes.md",
        "pt": "gitpagedocs/docs/versions/1.1.1/pt/authorized-routes.md",
        "es": "gitpagedocs/docs/versions/1.1.1/es/authorized-routes.md"
      },
      "authorization": {
        "accessKeyId": "docs-key",
        "requiredRoles": ["maintainer"],
        "requireExternalAuth": true,
        "allowedProviders": ["authjs", "jwt"]
      }
    }
  ]
}
\`\`\`
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

## Authorization (version config)

- \`auth\`: global authorization runtime settings for that version
- \`auth.accessKeys\`: key map used by \`authorization.accessKeyId\`
- \`auth.rolesStorageKey\`: localStorage key for role bootstrap
- \`auth.providers\`: provider adapters (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Content types (version config)

Version configs support multiple content types:

- \`routes-md\`: Markdown routes with optional \`title\`, \`description\` (centered via \`titlePosition\`, \`descriptionPosition\`)
- \`routes-html\`: HTML page paths per language
- \`routes-video\`: Video config with \`video.videoType\` (youtube, vimeo, mp4, etc.) and \`video.pathVideo\`
- \`routes-audio\`: Audio config with \`audio.audioType\` (youtube, mp3, etc.) and \`audio.pathAudio\`
- \`authorization\` (md/html/video): route guard by access key, roles, and external auth
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

- Abra **Primeiros passos** para setup local.
- Abra **Configuracao** para detalhes completos do \`config.json\`.
- Abra **Publicacao** para comportamento local/producao/GitHub Pages.
- Abra **Arquitetura** para mapa de codigo e fluxo de dados.
- Abra **Temas e layouts** para autoria de templates.
- Abra **Rotas autorizadas** para configurar chave, papeis e autenticacao externa.
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

## Chaves de config (site)

- \`name\`, \`defaultLanguage\`, \`supportedLanguages\`
- \`docsVersion\`, \`rendering\`, \`ThemeDefault\`, \`ThemeModeDefault\`
- \`ProjectLink\`, \`layoutsConfigPathOficial\`, \`layoutsConfigPath\`

## Variaveis de ambiente

- \`GITPAGEDOCS_REPOSITORY_SEARCH\` – busca de repositorio (local)
- \`GITHUB_ACTIONS\` – modo build GitHub Pages
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

## Autorizacao (config de versao)

- \`auth\`: configuracoes globais de autorizacao para a versao
- \`auth.accessKeys\`: mapa de chaves usado por \`authorization.accessKeyId\`
- \`auth.rolesStorageKey\`: chave de localStorage para bootstrap de papeis
- \`auth.providers\`: adaptadores de provedor (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Tipos de conteudo (config de versao)

Configs de versao suportam multiplos tipos:

- \`routes-md\`: Rotas markdown com \`title\`, \`description\` (centralizados via \`titlePosition\`, \`descriptionPosition\`)
- \`routes-html\`: Caminhos de paginas HTML por idioma
- \`routes-video\`: Config de video com \`video.videoType\` (youtube, vimeo, mp4, etc.) e \`video.pathVideo\`
- \`routes-audio\`: Config de audio com \`audio.audioType\` (youtube, mp3, etc.) e \`audio.pathAudio\`
- \`authorization\` (md/html/video): guarda de acesso por chave, papeis e autenticacao externa
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
    authorizedRoutes: `# Rotas autorizadas

Proteja rotas por chave de acesso, papeis obrigatorios e provedores externos.

## Local do config de versao

Configure em:

- \`gitpagedocs/docs/versions/<versao>/config.json\`

## Secao global auth

Use \`auth\` no topo do config de versao:

- \`accessKeys\`: mapa de ids de chave para segredo esperado
- \`rolesStorageKey\`: chave de localStorage para bootstrap de papeis
- \`providers\`: lista de provedores externos (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Autorizacao por rota

Dentro de cada rota (\`routes-md\`, \`routes-html\`, \`routes-video\`):

- \`authorization.accessKeyId\`
- \`authorization.requiredRoles\`
- \`authorization.requireExternalAuth\`
- \`authorization.allowedProviders\`

## Fases

### Fase A - Chave de acesso

Defina \`authorization.accessKeyId\` e a chave correspondente em \`auth.accessKeys\`.

### Fase B - Papeis

Defina \`authorization.requiredRoles\` com um ou mais papeis.

Os papeis podem vir de:

- query param \`?authRoles=admin,maintainer\`
- localStorage (\`rolesStorageKey\`)
- claims de provedores externos

### Fase C - Provedores externos

Defina \`authorization.requireExternalAuth=true\` e opcionalmente \`allowedProviders\`.

Adaptadores suportados:

- Auth.js (\`type: "authjs"\`)
- Clerk (\`type: "clerk"\`)
- Firebase Auth (\`type: "firebase"\`)
- JWT custom (\`type: "jwt"\`)
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
- Abre **Rutas autorizadas** para configurar clave, roles y autenticacion externa.
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

## Claves de config (site)

- \`name\`, \`defaultLanguage\`, \`supportedLanguages\`
- \`docsVersion\`, \`rendering\`, \`ThemeDefault\`, \`ThemeModeDefault\`
- \`ProjectLink\`, \`layoutsConfigPathOficial\`, \`layoutsConfigPath\`

## Variables de entorno

- \`GITPAGEDOCS_REPOSITORY_SEARCH\` – busqueda de repositorio (local)
- \`GITHUB_ACTIONS\` – modo build GitHub Pages
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

## Autorizacion (config de version)

- \`auth\`: configuraciones globales de autorizacion para esa version
- \`auth.accessKeys\`: mapa de claves usado por \`authorization.accessKeyId\`
- \`auth.rolesStorageKey\`: clave de localStorage para bootstrap de roles
- \`auth.providers\`: adaptadores de proveedor (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Tipos de contenido (config de version)

Los configs de version soportan multiples tipos:

- \`routes-md\`: Rutas markdown con \`title\`, \`description\` (centrados via \`titlePosition\`, \`descriptionPosition\`)
- \`routes-html\`: Rutas de paginas HTML por idioma
- \`routes-video\`: Config de video con \`video.videoType\` (youtube, vimeo, mp4, etc.) y \`video.pathVideo\`
- \`routes-audio\`: Config de audio con \`audio.audioType\` (youtube, mp3, etc.) y \`audio.pathAudio\`
- \`authorization\` (md/html/video): guardia de acceso por clave, roles y autenticacion externa
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
    authorizedRoutes: `# Rutas autorizadas

Protege rutas por clave de acceso, roles requeridos y proveedores externos.

## Ubicacion del config de version

Configura en:

- \`gitpagedocs/docs/versions/<version>/config.json\`

## Seccion global auth

Usa \`auth\` en la raiz del config de version:

- \`accessKeys\`: mapa de ids de clave al secreto esperado
- \`rolesStorageKey\`: clave de localStorage para bootstrap de roles
- \`providers\`: lista de proveedores externos (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Autorizacion por ruta

Dentro de cada ruta (\`routes-md\`, \`routes-html\`, \`routes-video\`):

- \`authorization.accessKeyId\`
- \`authorization.requiredRoles\`
- \`authorization.requireExternalAuth\`
- \`authorization.allowedProviders\`

## Fases

### Fase A - Clave de acceso

Define \`authorization.accessKeyId\` y la clave correspondiente en \`auth.accessKeys\`.

### Fase B - Roles

Define \`authorization.requiredRoles\` con uno o mas roles.

Los roles pueden venir de:

- query param \`?authRoles=admin,maintainer\`
- localStorage (\`rolesStorageKey\`)
- claims de proveedores externos

### Fase C - Proveedores externos

Define \`authorization.requireExternalAuth=true\` y opcionalmente \`allowedProviders\`.

Adaptadores soportados:

- Auth.js (\`type: "authjs"\`)
- Clerk (\`type: "clerk"\`)
- Firebase Auth (\`type: "firebase"\`)
- JWT custom (\`type: "jwt"\`)
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