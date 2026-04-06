export const docsEn = {
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
  };
