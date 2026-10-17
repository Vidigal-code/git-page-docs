import { PACKAGE_VERSION } from "../contracts/doc-versions.mjs";
import { practicalEn } from "./practical-en.mjs";
import { operationsEn } from "./operations-en.mjs";

export const docsEn = {
    ...practicalEn,
    ...operationsEn,
    pdf: `# PDF documents

PDF is a first-class content type alongside Markdown, HTML, source code, video and audio. The viewer uses the browser's native PDF preview. Download and open-in-new-tab actions remain independently configurable.

## Included English project guide

The scaffold includes [GitPageDocs project guide (PDF, English)](https://github.com/Vidigal-code/git-page-docs/blob/main/cli/content/assets/gitpagedocs-project-guide.pdf). It explains the project, packages, configuration, icons, focus mode, narration, CLI, MCP and deployment. The PDF is in English; the reference page is translated into English, Portuguese and Spanish.

The CLI copies the bundled PDF bytes into \`gitpagedocs/docs/versions/<version>/en/gitpagedocs-project-guide.pdf\`. All three language paths in the example point to this English file. To provide translations, add the translated PDFs and change each language path.

## Site defaults

Add this block inside \`site\` in \`gitpagedocs/config.json\`:

\`\`\`json
{
  "pdf": {
    "enabled": true,
    "previewEnabled": true,
    "downloadEnabled": true,
    "openInNewTabEnabled": true
  }
}
\`\`\`

\`enabled\` is the master switch for PDF content. The other fields control the preview, download button and new-tab button. Every field defaults to \`true\` when omitted, including older configurations.

Action precedence is \`route.pdf.<flag>\` > \`site.pdf.<flag>\` > \`true\`. An explicit route \`true\` enables that action even when its site default is \`false\`; \`site.pdf.enabled: false\` still disables PDF content everywhere. A missing path for the selected language makes the PDF unavailable; there is no automatic language fallback.

PDF actions use icons by default. Configure \`site.icons.PdfDownload\` (\`FiDownload\`) and \`site.icons.PdfOpenInNewTab\` (\`FiExternalLink\`) independently with \`reactIcon\`, \`tag\`, \`size\`, \`colorDark\` and \`colorLight\`. For example, \`"PdfDownload": { "reactIcon": false }\` shows download text while the new-tab action remains an icon. Changing appearance does not change the action flags above.

## Route and menu example

In \`gitpagedocs/docs/versions/0.0.10/config.json\`, keep route and menu arrays at the top level:

\`\`\`json
{
  "routes-pdf": [{
    "id": 23,
    "title": { "en": "Project guide (English)", "pt": "Guia do projeto (inglês)", "es": "Guía del proyecto (inglés)" },
    "pdf": {
      "pathPdf": {
        "en": "gitpagedocs/docs/versions/0.0.10/en/gitpagedocs-project-guide.pdf",
        "pt": "gitpagedocs/docs/versions/0.0.10/en/gitpagedocs-project-guide.pdf",
        "es": "gitpagedocs/docs/versions/0.0.10/en/gitpagedocs-project-guide.pdf"
      },
      "previewEnabled": true,
      "downloadEnabled": true,
      "openInNewTabEnabled": true
    }
  }],
  "menus-header-pdf": [{
    "id": 23,
    "en": { "title": "Project guide (English)", "path-click": "page:23" },
    "pt": { "title": "Guia do projeto (inglês)", "path-click": "page:23" },
    "es": { "title": "Guía del proyecto (inglés)", "path-click": "page:23" }
  }]
}
\`\`\`

The \`pdf.pathPdf\` map selects the file for the current language. Use \`page:<id>\` in PDF menu destinations. The same recursive \`submenus\` structure used by other menus is supported. The scaffold reserves ID 23 for the PDF example and ID 24 for this Markdown reference; use unique IDs for additional pages.

The optional route flags live inside \`pdf\`. Shared presentation, \`container\`, \`RouteGuide\` and authorization options remain route-level fields. \`routeDefaults\` also applies to PDF routes. Add \`"pdf": 5\` to \`hierarchyPage\` and \`hierarchyMenu\` to position PDFs after audio; change the order values to suit your site.

## Files and deployment

Repository-root paths beginning with \`gitpagedocs/\` are copied into the viewer's public assets when Next.js starts or builds. The URL respects the configured deployment subpath on GitHub Pages. Keep the PDF tracked in Git and publish it with the generated documentation. Assets outside \`gitpagedocs/\` must already be in the viewer's \`frontend/public/\` directory or be reachable through an HTTP(S) URL.

Use the binary PDF URL, not an HTML repository preview URL. For remote repositories, the configured path resolves against that repository. Preview, download and opening a new tab fetch the file bytes, so an external server must allow CORS for all three actions. The viewer validates the PDF signature and creates a temporary \`application/pdf\` Blob URL. Preview and new-tab viewing use the browser's native PDF viewer; the origin server's framing policy and MIME/disposition headers do not control the Blob view.

The new-tab button opens the validated PDF Blob instead of navigating to the raw repository URL. This also works when preview is disabled: loading starts when the reader downloads or opens the document. Previously loaded bytes are reused for the current PDF. Network/CORS failures, invalid PDFs and blocked new tabs produce a visible error; there is no automatic fallback to the raw URL. Native PDF support and the browser's own download preferences still determine how the new tab displays the file.

## Reading and troubleshooting

- Native PDF controls, keyboard support, zoom and page navigation depend on the browser's PDF viewer. Some mobile browsers open or download the file instead of embedding it.
- Preview does not convert the PDF to Markdown. Markdown focus mode, section navigation, copy-as-Markdown and narration operate on Markdown documents, not the embedded PDF.
- Disabling preview can keep the download and new-tab actions available. Turning off every PDF action leaves no interactive PDF control.
- A disabled button is not access control. Publicly hosted PDFs remain downloadable by URL. Use protected hosting for confidential documents.
- If a preview is blank, verify that the path returns a PDF and that CORS permits access, then try the new-tab action. Allow pop-ups for the site if the browser blocks that action. Download and new-tab failures are reported on the page.
`,
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
- \`gitpagelayouts/layoutsConfig.json\` (only with \`--layoutconfig\`)
- \`gitpagelayouts/templates/*.json\` (only with \`--layoutconfig\`)

## Quick navigation

- Open **Getting Started** for local setup.
- Open **Configuration** for full \`config.json\` explanation.
- Open **Deployment** for local, server, and GitHub Pages behavior.
- Open **Architecture** for code map and data flow.
- Open **Themes and layouts** for template authoring details.
- Open **Authorized routes** for key, roles, and external auth setup.
- Open **FAQ** for troubleshooting.

## Detailed references

- **CLI reference**: installation, every command and compatibility flags.
- **MCP server**: client setup, all 20 tools, 7 resources and provider configuration.
- **Navigation and nested menus**: recursive trees, URLs and breadcrumb overrides.
- **Focus mode**: copy/download Markdown and section/document navigation.
- **Accessibility and narration**: browser voices, controls and media interaction.
- **PDF documents**: native previews, download/new-tab controls and the included English guide.
- **Configuration recipes**: a complete multilingual site and a menu with sections inside sections.
- **Migration and compatibility**: upgrade configurations from 0.0.1 onward while preserving your content.
- **Troubleshooting**: UTF-8, local and Pages paths, PDF loading, browser voices and MCP startup.
- **Contributing and validation**: source files, generation, public contracts and release checks.
- **HTML containers**: local and external pages, route/menu configuration and the interactive DOOM example.

The generated menu keeps Getting Started and Project overview first. Guides contains Configure your site, Read and explore, and Automate and integrate; each category contains its related pages. Operations and development groups publishing, maintenance and contribution guides. Git and GitHub contains the repository examples. Categories can contain further categories without a fixed nesting limit.
`,
    gettingStarted: `# Getting Started

Git Page Docs separates the documentation files from the viewer. Install the CLI to create the files; use the official viewer, GitHub Pages or a checkout of the runtime to display them.

## Requirements and installation

Use Node.js 20 or newer. Git is needed for publishing; GitHub CLI is needed when asking the CLI to configure Pages automatically.

\`\`\`bash
npm install --save-dev @gitpagedocs/cli
npx gitpagedocs --no-interactive --owner YOUR_USER --repo YOUR_REPOSITORY
\`\`\`

For a one-off run, use \`npx --yes @gitpagedocs/cli --no-interactive --owner YOUR_USER --repo YOUR_REPOSITORY\`. For a global command, use \`npm install -g @gitpagedocs/cli\`, then \`gitpagedocs\`. Run from the repository root.

## Generated contract

- \`gitpagedocs/config.json\`: site options and version references.
- \`gitpagedocs/langs/{en,pt,es}.json\`: UI strings.
- \`gitpagedocs/docs/versions/<version>/config.json\`: routes and menus.
- \`gitpagedocs/docs/versions/<version>/{en,pt,es}/*.md\`: page content; filenames stay in English across languages.
- \`gitpagedocs/icon.svg\`: site icon.
- \`--layoutconfig\` additionally writes \`gitpagelayouts/\`; use \`--layouts-dir\` to change that directory.

The generator writes configuration and content; it does not install a Next.js application into your repository. Rerunning it writes the scaffold files again: review the Git diff before keeping changes to hand-edited documentation.

## Read and publish

Commit and push the generated folder, then open \`https://vidigal-code.github.io/git-page-docs/YOUR_USER/YOUR_REPOSITORY/\` for a public repository. To publish your own site, authenticate with \`gh auth login\`, then run \`npx gitpagedocs pages deploy --owner YOUR_USER --repo YOUR_REPOSITORY\`. This generates files, commits and pushes; inspect the resulting GitHub Actions run. See Deployment for the subpath and workflow contract.

## Develop the viewer locally

The following commands belong to a checkout of Git Page Docs, not to a repository containing only generated files:

\`\`\`bash
git clone https://github.com/Vidigal-code/git-page-docs.git
cd git-page-docs
corepack enable
pnpm install --frozen-lockfile
pnpm dev
\`\`\`

The repository pins pnpm in \`packageManager\`. \`pnpm dev\` enables repository search; \`pnpm dev:e2e\` uses the local documentation. For a production build, run \`pnpm build\` and \`pnpm start\`; the start script rebuilds before starting. Use \`PORT=3100\` in the process environment when port 3000 is occupied.

## Next steps

Use Configuration for languages, icons, navigation, focus and narration; Functionalities for CLI and MCP; Themes and layouts for visual tokens; FAQ for diagnostics.
`,
    projectOverview: `# Project Overview

Git Page Docs is a **pnpm + turborepo monorepo** that turns a repository's \`gitpagedocs/\` folder into a multilingual, versioned documentation site — with an integrated AI assistant and a Model Context Protocol (MCP) server.

## Monorepo packages

- **frontend/** — Next.js 15 (App Router, React 19) documentation viewer, static-exported for GitHub Pages.
- **cli/** — the published \`@gitpagedocs/cli\` npm package (\`npm install -g @gitpagedocs/cli\`): scaffolds the docs contract, generates docs with AI, configures Pages, and runs the MCP server.
- **tools/** — \`@gitpagedocs/tools\`, the shared business-logic core: the 14-provider AI system, the encrypted credential vault, the config loader, caches, and the logger.
- **mcp/** — \`@gitpagedocs/mcp\`, a Model Context Protocol server (20 tools + 7 resources).
- **gitpagedocs/** — the user contract: \`config.json\`, versioned docs, and layouts.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript; static export for GitHub Pages
- gray-matter + marked for Markdown; react-icons
- pnpm workspaces + turborepo; Vitest + Playwright; ESLint

## Highlights

- Multilingual (\`en\`, \`pt\`, \`es\`) and version-aware routing (\`/v/:version\`)
- 14-provider AI system (OpenAI, Anthropic, Gemini, Ollama, Mistral, DeepSeek, Cohere, Groq, xAI, and more) with streaming
- AI API keys stored **encrypted at rest** (AES-256-GCM) behind a local password gate — never plaintext
- In-docs **AI chat drawer** plus a dedicated **\`/ai\` console**
- 64-theme layout system (dark and light variants); local and GitHub Pages execution modes
`,
    functionalities: `# Functionalities

Complete reference of CLI options, configuration keys, and runtime features.

## Command line

See **CLI reference** for all commands, flags, examples and compatibility behavior. See **MCP server** for editor integration.

## Content types

| Type | Config key | Description |
|------|------------|-------------|
| Markdown | \`routes-md\` | .md files with \`path\` per language |
| HTML | \`routes-html\` | local \`path\` or external \`url\` |
| Video | \`routes-video\` | \`video.pathVideo\`, \`video.videoType\` |
| Audio | \`routes-audio\` | \`audio.pathAudio\`, \`audio.audioType\` |
| PDF | \`routes-pdf\` | \`pdf.pathPdf\` per language; native preview and download |

## Source code viewer

The version config can render a **Source code** container through \`routes-source-viewer\` and \`menus-header-source-viewer\`. The viewer reads GitHub repository trees at runtime and applies the current documentation theme.

- Repository tree from \`source-viewer-path\`; branch defaults to \`main\`
- Folder navigation and file filtering
- GitHub-style directory listing
- Code rendering with line numbers
- Markdown preview/code toggle, including \`README.md\`
- Collapsible folders in the sidebar

## Config keys (site)

- \`name\`, \`defaultLanguage\`
- \`docsVersion\`, \`rendering\`, \`ThemeDefault\`, \`ThemeModeDefault\`
- \`ProjectLink\`, \`layoutsConfigPathOficial\`, \`layoutsConfigPath\`
- Languages: \`site.languages\` (enable/disable each one); UI strings: \`gitpagedocs/langs/<lang>.json\`

## Media playback (one sound at a time)

\`site.mediaExclusivePlayback\` (default \`true\`): playing a route video pauses the radio and the audio tracks, and playing the radio or an audio track pauses the video. It works with YouTube and Vimeo (through their player APIs), native files (\`mp4\`, \`webm\`, …) and any other embed.

To show a video without sound while the radio or an audio track explains it, set \`"muted": true\` in that route's \`video\` object: the video plays only the picture and stays out of the rule. \`"mediaExclusivePlayback": false\` turns the rule off for the whole site.

## Environment variables

- \`GITPAGEDOCS_REPOSITORY_SEARCH\` – repository search (local)
- \`GITHUB_ACTIONS\` – GitHub Pages build mode

## AI assistant

The docs ship an AI assistant in two surfaces: an in-docs **chat drawer** (the AI chat button in the sidebar, enabled via \`site.AiChatEnabled\`) and a dedicated **\`/ai\` console** page.

- **14 providers** via one shared core: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure OpenAI, Mistral, DeepSeek, Cohere, Groq, xAI, Together, Fireworks, Perplexity.
- **Model selection** — pick from each provider's catalog (\`gitpagedocs models <provider>\`); a stored model id the provider has retired is replaced by the provider default automatically.
- **Encrypted at rest** — your API key is sealed with AES-256-GCM behind a **local password** and is never stored in plaintext or logged.
- **Inactivity auto-lock** — the chat drawer locks itself after \`site.AiChatAutoLockSeconds\` idle seconds (default 30, \`0\` disables): a centered countdown modal in your language lets you cancel or lock now, and unlocking asks for the password again.
- **Resilient providers** — transient provider errors are retried (3 attempts) and a final failure is a plain message ending with "Try again!".
- **AI documentation generation** — \`gitpagedocs ai\` scans chosen paths and writes multilingual markdown (pt/en/es); reusable via \`.gitpagedocsconfig\`, whose API key lives sealed in the encrypted \`.gitpagedocsvault\` (the vault password is asked on every run). \`gitpagedocs chat\` brings the same assistant to the terminal.

## MCP server

\`gitpagedocs mcp start\` runs a Model Context Protocol server (stdio) exposing **20 tools** (filesystem, AI, doc generation/analysis) and **7 resources** (\`project://structure|docs|config|repository|readme|ai/providers|ai/models\`) for editors and AI agents.
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
        "en": "gitpagedocs/docs/versions/${PACKAGE_VERSION}/en/authorized-routes.md",
        "pt": "gitpagedocs/docs/versions/${PACKAGE_VERSION}/pt/authorized-routes.md",
        "es": "gitpagedocs/docs/versions/${PACKAGE_VERSION}/es/authorized-routes.md"
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

Runtime configuration lives in \`gitpagedocs/config.json\`. UI text lives next to it, one file per language.

## Languages (\`site.languages\` + \`langs/\`)

- \`site.languages\` in \`gitpagedocs/config.json\` switches each language on (\`true\`) or off (\`false\`), in menu order: \`{ "languages": { "en": true, "pt": true, "es": false } }\`. A language set to \`false\` disappears from the language selector and its strings are not loaded, even when its docs exist.
- \`gitpagedocs/langs/<lang>.json\` holds that language's strings: \`langmenu\` (header, search, source viewer, audio player, AI chat and docs-access labels) and \`translations\` (\`notFound\`, \`navigation\`, \`footer\`).
- To add a language, create \`langs/<lang>.json\` and add \`"<lang>": true\` to \`site.languages\`.
- Older \`config.json\` files that still inline \`site.langmenu\` / \`translations\` keep working; when both exist, the \`langs/\` files win and any missing key is backfilled from the current release.

## \`site\` section

Important keys:

- \`name\`
- \`defaultLanguage\`
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

## Language, theme, focus, quick navigation, PDF and document controls

In \`gitpagedocs/config.json\`, these \`site.icons\` entries configure the language selector, theme selector, focus, Ctrl+K navigation, PDF actions and document-footer navigation. All eight controls use React Icons by default:

\`\`\`json
{
  "site": {
    "icons": {
      "LanguageSelector": {
        "reactIcon": true, "tag": "FiGlobe", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "ThemeSelector": {
        "reactIcon": true, "tag": "BsSunFill", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "FocusMode": {
        "reactIcon": true, "tag": "MdFullscreen", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "QuickNavigation": {
        "reactIcon": true, "tag": "FiSearch", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "PdfDownload": {
        "reactIcon": true, "tag": "FiDownload", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "PdfOpenInNewTab": {
        "reactIcon": true, "tag": "FiExternalLink", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "DocumentPrevious": {
        "reactIcon": true, "tag": "FiChevronLeft", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "DocumentNext": {
        "reactIcon": true, "tag": "FiChevronRight", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      }
    }
  }
}
\`\`\`

Each control is independent: \`reactIcon: true\` shows its icon (the default); \`false\` displays text. Customize \`tag\`, \`size\`, \`colorDark\` and \`colorLight\` per control; \`currentColor\` follows the active theme. Icon controls keep their accessible names, and selectors keep their menus. The Ctrl+K shortcut remains available. \`site.FocusMode\` still enables focus mode; \`site.icons.FocusMode\` only changes the button's appearance. \`site.icons.PdfDownload\` and \`site.icons.PdfOpenInNewTab\` independently select text or icons; the corresponding \`site.pdf\` and route \`pdf\` flags control whether each action is available.

Compact configs may move shared values into \`site.icons.defaults\`; omitted fields inherit those defaults. Set \`reactIcon: false\` on a specific entry to override the default icon presentation with text.

## \`VersionControl\` section

\`VersionControl.versions\` defines:

- \`id\`
- \`path\`
- optional metadata links (\`ProjectLink\`, \`branch\`, \`release\`, \`commit\`)
- optional source viewer metadata (\`source-viewer\`, \`source-viewer-path\`)

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
- \`routes-source-viewer\`: Source viewer containers with \`source-viewer: true\` and \`source-viewer-path\`
- \`routes-html\`: HTML page paths per language
- \`routes-video\`: Video config with \`video.videoType\` (youtube, vimeo, mp4, etc.) and \`video.pathVideo\`
- \`routes-audio\`: Audio config with \`audio.audioType\` (youtube, mp3, etc.) and \`audio.pathAudio\`
- \`routes-pdf\`: PDF config with \`pdf.pathPdf\` per language; see PDF documents.
- \`authorization\` (md/html/video): route guard by access key, roles, and external auth
- \`menus-header-md\`, \`menus-header-source-viewer\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\`, \`menus-header-pdf\`: menus per type
- \`hierarchyPage\`: container order on page \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }\`
- \`hierarchyMenu\`: menu section order \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }\`

Each route can include \`title\`, \`description\` (per language), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

Settings every route shares are written once in \`routeDefaults\` at the top of the version config; each route keeps only its own values, and a value written on a route wins over \`routeDefaults\`.

Header icons live in \`site.icons\`: \`defaults\` holds what all icons share (\`reactIcon\`, \`colorDark\`, \`colorLight\`, \`size\`, \`imgDark\`, \`imgLight\`, \`imgWidth\`, \`imgHeight\`) and each icon entry sets its \`tag\` plus any difference (\`null\` removes a field). The older flat keys (\`IconNavMenuOpenReactIconesTag\`, …) still work and win when both are present.

## Route-level variables (blockLink, container, url, browseAll)

Per-route options for \`routes-md\`, \`routes-html\`, \`routes-video\`, and \`routes-audio\`:

- **\`blockLink\`** (default: true) – For HTML: if true, links open in a new tab (\`target="_blank"\`); if false, links open in the same context.
- **\`container\`** – \`"full"\` = auto-extend height; number (e.g. \`500\`) = fixed height in px with overflow auto. Applies to md, html, video, and audio containers.
- **\`url\`** – For \`routes-html\` only: \`Record<LanguageCode, string>\` with external URLs. When set, the iframe uses \`src={url}\` instead of local HTML via \`srcDoc\`. Routes with \`url\` do not generate local HTML files.
- **\`browseAll\`** (default: false) – If true, the container shows Previous/Next buttons to browse all items of that type without changing the page.

## Content types: path vs url (HTML)

- **Markdown (\`routes-md\`)**: always uses \`path\` pointing to local \`.md\` files.
- **HTML (\`routes-html\`)**: uses \`path\` for local HTML files (no \`.html\` extension in config) or \`url\` for external URLs. When \`url\` is set, the iframe loads the external page; no local file is generated.
- **Video (\`routes-video\`)**: uses \`video.pathVideo\` and \`video.videoType\` (youtube, vimeo, mp4, etc.).
- **Audio (\`routes-audio\`)**: uses \`audio.pathAudio\` and \`audio.audioType\` (youtube, mp3, etc.). No autoplay by default.

## Environment variables

- \`GITPAGEDOCS_REPOSITORY_SEARCH\`: enable/disable remote repository search in local runtime
- \`GITHUB_ACTIONS\`: enables GitHub Pages specific runtime behavior

## Site behavior and defaults

| Key | Default / purpose |
| --- | --- |
| \`ActiveNavigation\` | true; quick-navigation control and Ctrl+K shortcut |
| \`FocusMode / focusMode\` | Master switch (true) and independent copy, download, section and document controls; see Focus mode |
| \`pdf\` | PDF master switch, preview, download and new-tab defaults; all true |
| \`nestedMenusEnabled\` | true; recursive menu tree, or flat destinations when false |
| \`RouteGuide\` | true; breadcrumbs, overridable by version defaults and individual Markdown routes |
| \`accessibility\` | Enabled by default; narration settings are explained in Accessibility |
| \`HideThemeSelector\` | false; true hides the theme selector |
| \`FooterEnabled\` | true; show the footer |
| \`FooterLinkName / FooterLinkUrl\` | Footer link label and destination |
| \`FooterDateMode / FooterDateCustom\` | browser, year or custom; custom uses the configured text |
| \`SiteHeaderName / SiteIconPath\` | Header brand and site icon path |
| \`audioPlayerEnabled\` | true; background audio controls |
| \`audioAutoPlayOnLoad\` | false; autoplay remains subject to browser policy |
| \`audioLoopEnabled / audioSequentialPlayback\` | false; loop current track / advance native tracks |
| \`audioAllowUserChoice\` | Allow track selection when a playlist has multiple entries |
| \`audioTracks\` | Track objects: url, type and localized title |
| \`audioPopoverHideSource / audioPopoverShowMinutes\` | false / true; source label and native-track duration |
| \`audioPopoverSourceCustomLabel\` | Optional localized source label |
| \`mediaExclusivePlayback\` | true; only one audible source among narration, radio, audio and video |
| \`AiChatEnabled / AiChatAutoLockSeconds\` | true / 30; show the chat and lock after inactivity (0 disables the timer) |
| \`docsAccess\` | enabled and publicKey configure the documentation gate; public files remain public |
| \`RouteguideBrandPositionDefault / RouteguideBrandContainerTopDefault\` | center / false; heading-outline layout, distinct from breadcrumbs |
| \`TocScrollMaxHeightDesktop / TocScrollMaxHeightMobile\` | Heading-outline scroll limits; CSS lengths such as min(65vh, 400px) |

## Adding a version or document

Create a version directory and its config, then register it in \`VersionControl.versions\` with \`id\` and \`path\`. Add a \`routes-md\` entry with a unique page ID and localized paths; add matching menu destinations. Keep \`routeDefaults\` for values shared by all routes; explicit route fields win. See Navigation for recursive menus and \`RouteGuide\` overrides.

Display settings are public configuration. Never store provider credentials or private keys in site JSON. The examples in Authorized routes demonstrate client-side controls, not server-side protection of downloadable files.

The \`QuickNavigation\` entry controls the Ctrl+K button's icon/text appearance. The keyboard shortcut and search panel remain available.
`,
    deployment: `# Deployment

Choose the official viewer for a public repository, deploy a dedicated GitHub Pages site, or host a static export built from the runtime.

## Official viewer

Commit the generated \`gitpagedocs/\` folder to your public repository. Open \`https://vidigal-code.github.io/git-page-docs/OWNER/REPOSITORY/\`; select a version and language. The viewer fetches the repository configuration and content. A private repository is not made public by using this URL.

## Your GitHub Pages site

Prerequisites: Git repository, a GitHub origin, permission to push, and authenticated GitHub CLI (\`gh auth login\`) when configuring Pages through the CLI.

\`\`\`bash
npx gitpagedocs pages deploy --owner OWNER --repo REPOSITORY
\`\`\`

This flow confirms the target, generates docs and \`.github/workflows/gitpagedocs-pages.yml\`, commits, pushes and requests GitHub Actions as the Pages source. To change only the source, use \`npx gitpagedocs pages actions\`. To publish under a subpath, pass \`--path docs\`.

Watch the GitHub Actions run until deployment succeeds; the CLI's printed URL can appear before the remote build finishes. Project sites normally use \`https://OWNER.github.io/REPOSITORY/\`; user/organization sites use the root of their \`OWNER.github.io\` repository.

## Build contract

The workflow installs the pinned pnpm workspace dependencies, builds the viewer and uploads the static artifact with the official Pages actions. Its deploy job needs \`pages: write\`, \`id-token: write\` and the \`github-pages\` environment.

- \`GITHUB_ACTIONS=true\` enables Next.js static export.
- \`GITHUB_REPOSITORY=OWNER/REPOSITORY\` supplies the repository base path.
- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` enables the search-home build.
- \`GITPAGEDOCS_BASE_PATH\` can explicitly override the base path; \`GITPAGEDOCS_PATH\` supplies the docs subpath.
- \`GITPAGEDOCS_DIST_DIR\` separates build/dev output when running two local servers.

A normal \`pnpm build\` without the Pages environment is a Next.js production build; it does not by itself prove the static export. Preserve \`.nojekyll\` when hosting the export on Pages.

## Standalone export

From a runtime checkout with installed dependencies, \`node cli/index.mjs --home --output gitpagedocshome --no-interactive\` builds \`frontend/\` and packages a static distribution. \`--search true\` enables its repository-search home. The output includes static files, a README, Dockerfile and environment example; its destination is recreated. A static web server serves the resulting files; changing a build-time environment option requires another build.

## npm releases for maintainers

The monorepo publishes \`@gitpagedocs/tools\`, \`@gitpagedocs/mcp\` and \`@gitpagedocs/cli\`; the workspace root and frontend are private. The current \`npm-publish.yml\` runs on pushes to \`main\` and skips a CLI version already on npm. It uses the repository's \`NPM_TOKEN\` secret and publishes workspaces in dependency order. Creating a GitHub release alone is not its trigger.

Synchronize package versions and internal dependencies, regenerate docs/baselines, run typecheck, lint, tests, smoke checks, build and Playwright, then review before pushing. Confirm all three package versions on npm and the Pages workflow result. The config-only CLI ignores \`prebuilt/\`; it is not required by this publishing workflow.
`,
    architecture: `# Architecture

A pnpm + turborepo monorepo where all business logic lives in one shared core (\`tools/\`); the frontend, CLI, and MCP server are thin consumers of it.

## Packages

- **frontend/** — Next.js viewer (Feature-Sliced: \`app / widgets / features / entities / shared\`); static export.
- **cli/** — the published \`gitpagedocs\` bin (hexagonal: \`presentation / application / domain / infrastructure\`) + \`cli/ai/\` (the AI documentation CLI).
- **tools/** — \`@gitpagedocs/tools\`: \`ai/ security/ crypto/ cache/ config/ logger/ errors/ filesystem/ documentation/ i18n/ ports/\`.
- **mcp/** — \`@gitpagedocs/mcp\`: MCP tools + resources delegating to \`tools/\`.

## Main runtime modules (frontend)

- \`frontend/src/app/[[...repo]]/page.tsx\` — route parser, static params, shell selection (docs vs repository-search).
- \`frontend/src/entities/docs/api/load-docs-data.ts\` — local/remote config loading, version resolution, markdown parse, layouts + themes.
- \`frontend/src/widgets/docs-shell/docs-shell.tsx\` — UI rendering, language/version/theme state, URL sync, AI chat drawer mount.

## Security: encrypted AI credentials

The \`/ai\` console and the chat drawer gate access behind a local password that derives (PBKDF2) an AES-256-GCM key; keys live encrypted in \`localStorage\` and are decrypted only for the session (\`@gitpagedocs/tools/security\`).

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

- Default mode (\`npx @gitpagedocs/cli\`): use official layouts/templates from the upstream repository.
- Local mode (\`npx @gitpagedocs/cli --layoutconfig\`): generate and use local templates from your repository.

## Local layout files

- \`gitpagelayouts/layoutsConfig.json\`
- \`gitpagelayouts/layoutsFallbackConfig.json\`
- \`gitpagelayouts/templates/*.json\`

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

## Choose and customize

Select an installed theme through the theme selector or configure \`site.ThemeDefault\` with its exact ID. \`ThemeModeDefault\` sets the initial light/dark mode. \`HideThemeSelector\` hides the selector; the selected theme still applies.

For your own repository, run the CLI with \`--layoutconfig\`, then edit the generated template and keep its ID consistent with \`layoutsConfig.json\`. A route's content and \`site.icons\` remain independent of the theme catalog. Use \`currentColor\` for icons that should inherit the active text color, or configure separate dark/light colors with sufficient contrast.

When contributing to Git Page Docs itself, the authoring source is \`gitpagelayouts/v2/base.json\` plus \`gitpagelayouts/v2/layouts/<id>.json\`. Run \`pnpm layouts:sync\` to regenerate templates and documentation. Direct edits to generated templates can be overwritten by that synchronization.
`,
    mcp: `# MCP server

The Model Context Protocol server exposes 20 tools and 7 resources over **stdio**. It starts as a child process of your MCP client. It does not open an HTTP port or run a background daemon.

## Install and connect

Use Node.js 20+. Install the CLI in the project with \`npm install --save-dev @gitpagedocs/cli\`; this includes the server and its TypeScript runtime. A global installation also supports \`gitpagedocs mcp start\`. For a one-off run, use \`npx --yes @gitpagedocs/cli mcp start\`.

In VS Code, create \`.vscode/mcp.json\` with the following configuration. The process working directory is the project root; the MCP command has no \`--root\` or \`--cwd\` flag.

\`\`\`json
{
  "servers": {
    "gitpagedocs": {
      "type": "stdio",
      "command": "node",
      "args": [
        "\${workspaceFolder}/node_modules/@gitpagedocs/cli/index.mjs",
        "mcp",
        "start"
      ],
      "cwd": "\${workspaceFolder}"
    }
  }
}
\`\`\`

Open the client's MCP server controls, start GitPageDocs and list its tools/resources. Test \`list_files\` with \`{"path":".","recursive":false}\` and read \`project://readme\`. These operations need no provider key. A terminal launched with \`mcp start\` waits for JSON-RPC; ordinary text typed into stdin is not a chat command. On a source checkout, the direct entry is \`node --import tsx mcp/src/bin.ts\`, not \`index.ts\`.

## Configure a provider

Provider calls read credentials from the server process environment. MCP does not automatically load \`.env\` or the CLI's encrypted vault. Use the client's protected input/secret facility to inject environment values; never place real keys in a committed configuration. Restart the MCP process after changing its environment.

Select a provider using \`configure_ai_provider\` or \`.gitpagedocs-mcp.json\` at the project root:

\`\`\`json
{
  "provider": "ollama",
  "model": "llama3"
}
\`\`\`

| Provider | Environment |
| --- | --- |
| \`openai\` | \`OPENAI_API_KEY\` |
| \`anthropic\` | \`ANTHROPIC_API_KEY / CLAUDE_API_KEY\` |
| \`gemini\` | \`GEMINI_API_KEY / GOOGLE_API_KEY\` |
| \`openrouter\` | \`OPENROUTER_API_KEY\` |
| \`ollama\` | \`OLLAMA_BASE_URL\` |
| \`azure-openai\` | \`AZURE_OPENAI_API_KEY + AZURE_OPENAI_BASE_URL\` |
| \`mistral\` | \`MISTRAL_API_KEY\` |
| \`deepseek\` | \`DEEPSEEK_API_KEY\` |
| \`cohere\` | \`COHERE_API_KEY\` |
| \`groq\` | \`GROQ_API_KEY\` |
| \`xai\` | \`XAI_API_KEY\` |
| \`together\` | \`TOGETHER_API_KEY\` |
| \`fireworks\` | \`FIREWORKS_API_KEY\` |
| \`perplexity\` | \`PERPLEXITY_API_KEY\` |

With no valid selection, the default provider is OpenAI. Ollama does not require an API key; its local service and chosen model must be available. \`OLLAMA_BASE_URL\` is optional. Azure's base URL is the complete chat-operation URL, including deployment and API-version query when required. Model listings are the bundled catalog, not a live availability check.

## Tool reference

\`?\` marks an optional argument. Paths and content are strings; \`recursive\` is boolean. Provider identifiers come from the provider catalog. Call tools through the MCP client's tool interface.

| Tool | Arguments | Behavior |
| --- | --- | --- |
| \`list_files\` | \`path?, recursive?\` | List files (defaults: current directory, non-recursive) |
| \`read_file\` | \`path\` | Read UTF-8 text |
| \`write_file\` | \`path, content\` | Write the entire file; create parent directories |
| \`search_project\` | \`query, extension?\` | Case-insensitive substring search |
| \`list_ai_providers\` | \`—\` | Read the provider catalog |
| \`list_ai_models\` | \`provider?\` | Read the local model catalog |
| \`configure_ai_provider\` | \`provider, model?\` | Save .gitpagedocs-mcp.json |
| \`ask_ai\` | \`prompt, provider?, model?, system?\` | Return one response, without conversation history |
| \`generate_documentation\` | \`path, provider?\` | Document one source file |
| \`generate_api_docs\` | \`path, provider?\` | Describe the API in one file |
| \`generate_database_docs\` | \`path, provider?\` | Describe data models in one file |
| \`analyze_source_code\` | \`path, provider?\` | Analyze one source file |
| \`generate_readme\` | \`provider?\` | Use the tree and package.json |
| \`generate_architecture_docs\` | \`provider?\` | Use the repository tree |
| \`analyze_repository\` | \`provider?\` | Analyze the repository tree |
| \`analyze_project\` | \`provider?\` | Analyze the tree and package.json |
| \`generate_changelog\` | \`provider?\` | Use up to 80 commits, falling back to the tree |
| \`generate_release_notes\` | \`provider?\` | Use the same context as the changelog |
| \`validate_docs\` | \`provider?\` | Ask the provider to review gathered Markdown |
| \`update_documentation\` | \`path, instructions?, provider?\` | Generate and write a managed region |

\`generate_*\`, \`analyze_*\`, \`ask_ai\` and \`validate_docs\` return text; they do not save it automatically. \`validate_docs\` is a provider review, not a deterministic link checker. Only \`write_file\`, \`configure_ai_provider\` and \`update_documentation\` write files. \`update_documentation\` preserves text outside \`<!-- gitpagedocs:start -->\` / \`<!-- gitpagedocs:end -->\`; it appends a region when a valid pair is absent. The server does not show its own confirmation prompt; configure permissions in the MCP client.

## Resource reference

| URI | Content |
| --- | --- |
| \`project://structure\` | Repository tree |
| \`project://docs\` | Collected Markdown documents |
| \`project://config\` | Resolved configuration and sourcePath |
| \`project://repository\` | package.json content |
| \`project://readme\` | README.md |
| \`project://ai/providers\` | Provider catalog |
| \`project://ai/models\` | Model catalog by provider |

## Example workflow

1. Read \`project://structure\` and \`project://readme\`.
2. Call \`list_ai_providers\` and \`list_ai_models\` to select a provider/model.
3. Call \`generate_api_docs\` with \`{"path":"src/index.ts"}\` to review the returned draft.
4. Save approved text with \`write_file\`, or use \`update_documentation\` with \`{"path":"docs/api.md","instructions":"Document the public API in English."}\` for a managed region.

The generation step sends selected project content to the configured provider.

## Limits and troubleshooting

- File reads: up to 512,000 bytes. Listing: up to 2,000 entries; gathered project trees: 400 entries.
- Search: up to 5,000 entries, 200 matches, 240 characters per matching line.
- Documentation gathering: first 40 Markdown files among up to 2,000 entries; files over 40,000 bytes are skipped. Provider context is capped at 24,000 characters.
- Listing skips build/dependency directories such as \`node_modules\`, \`.git\`, \`.next\`, \`out\`, \`dist\`, \`prebuilt\`, \`.turbo\` and \`coverage\`. It does not interpret \`.gitignore\`; files such as \`.env\` are not automatically excluded. Run only in a trusted project and select the content to expose.
- Path checks use lexical containment; do not treat the process as an operating-system sandbox or assume symlink/junction isolation. Loading \`project://config\` can import JavaScript/TypeScript configuration.
- Tool failures include \`isError: true\`. Missing resources return \`Unavailable: ...\`. Check the client's stderr log for startup errors; stdout is reserved for JSON-RPC.
- If tools work but generation fails, verify provider selection, environment credentials, model availability and service connectivity.
`,
    cli: `# CLI reference

## CLI commands

| Command | Description |
|---------|--------------|
| \`gitpagedocs\` | Generate config and docs in \`gitpagedocs/\` |
| \`gitpagedocs --layoutconfig\` | Also generate local layouts/templates in \`gitpagelayouts/\` |
| \`gitpagedocs --home\` | Standalone distribution (\`gitpagedocshome/\`) |
| \`gitpagedocs --push --owner X --repo Y\` | Setup workflow, commit, push |
| \`gitpagedocs --interactive\` / \`-i\` | Interactive mode with prompts (the default in a terminal) |
| \`gitpagedocs --no-interactive\` / \`--yes\` / \`-y\` | Never prompt; use flags and defaults |
| \`gitpagedocs ai\` | Interactive AI documentation generator |
| \`gitpagedocs chat [question]\` | Streaming AI chat in the terminal (REPL on a TTY; one-shot with a question or piped stdin) |
| \`gitpagedocs provider [id]\` / \`models [provider]\` | List AI providers / catalog models |
| \`gitpagedocs document[:repo\\|:file\\|:folder]\` | Generate documentation with AI |
| \`gitpagedocs deploy\` / \`pages [actions\\|deploy]\` | Configure GitHub Pages via Actions + push |
| \`gitpagedocs docs\` | Refresh README/CONTRIBUTING/SECURITY managed regions |
| \`gitpagedocs password\` | Set a documentation access password (public key in \`site.docsAccess\`) |
| \`gitpagedocs config\` / \`config clear\` | Show the resolved config / delete the stored config and key vault |
| \`gitpagedocs doctor\` / \`version\` / \`update\` | Diagnostics / version / registry update check |
| \`gitpagedocs mcp start\` | Start the MCP server over stdio |

Install globally with \`npm install -g @gitpagedocs/cli\`, or run one-off with \`npx @gitpagedocs/cli\`.

## CLI options

| Option | Description |
|--------|-------------|
| \`--owner <user>\` | GitHub owner |
| \`--repo <repo>\` | GitHub repository |
| \`--path <subpath>\` | Docs subpath (e.g. \`docs\`); without it, base path = repo name for correct CSS/JS on project sites |
| \`--output <dir>\` | Output directory (default: \`gitpagedocs\`) |
| \`--search <true-or-false>\` | Enable/disable repository search (\`--home\`) |
| \`--layoutconfig\` | Generate local layouts in \`gitpagelayouts/\` |
| \`--layouts-dir <dir>\` | Folder for local layouts (default: \`gitpagelayouts\`) |
| \`--push\` | Create workflow, commit artifacts, push |
| \`--pages-actions\` | Only switch GitHub Pages to GitHub Actions (same as \`pages actions\`) |
| \`--home\` | Generate \`gitpagedocshome/\` (static + .env + Dockerfile) |

## Generated output

- \`gitpagedocs/config.json\` – root config
- \`gitpagedocs/icon.svg\` – default icon
- \`gitpagedocs/docs/versions/<ver>/config.json\` – per-version routes
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` – markdown docs
- \`gitpagelayouts/\` – only with \`--layoutconfig\` (folder configurable with \`--layouts-dir\`)

## Examples and command boundaries

\`\`\`bash
npx gitpagedocs --no-interactive --owner octocat --repo handbook
npx gitpagedocs --layoutconfig --layouts-dir assets/layouts --no-interactive
npx gitpagedocs chat "Explain this project" --provider ollama --model llama3
npx gitpagedocs pages deploy --owner octocat --repo handbook --path docs
npx gitpagedocs mcp start
\`\`\`

- \`init\` is an alias of generation. \`providers\` aliases \`provider\`; \`--version\` and \`-v\` alias \`version\`.
- \`document\`, \`document:repo\`, \`document:file\`, \`document:folder\` and \`--ai\` select the interactive documentation workflow. Select directories in its prompts; these aliases do not implement a separate positional file/folder API.
- \`chat\` accepts \`--provider <id>\`, \`--model <id>\` and \`--system <prompt>\`. With a question or piped stdin it answers once; an interactive terminal without a question starts a conversation.
- \`--build\`, \`--serve\` and \`--full\` are compatibility flags: the ordinary scaffold remains config-only and they do not start a local server.
- \`--home\` builds \`frontend/\` from a runtime checkout and writes the static export plus supporting files. Its output directory is recreated when it is not \`.\`; keep your source documentation outside that destination. Installing the CLI alone does not supply \`frontend/\`.
- \`pages actions\` only configures the Pages source; \`pages deploy\` and \`--push\` generate, commit and push. A printed URL does not mean the remote build has finished: check GitHub Actions.
- \`update\` checks npm and prints an installation command; it does not silently upgrade the CLI.

## Configuration and credentials

Site display settings are in \`gitpagedocs/config.json\`. The interactive generator/chat stores \`.gitpagedocsconfig\` and its encrypted \`.gitpagedocsvault\` in the per-user OS configuration directory: \`%APPDATA%/gitpagedocs\` on Windows, \`~/Library/Application Support/gitpagedocs\` on macOS, and the XDG config location on Linux. \`config clear\` removes those saved settings and the vault. MCP uses its own project-local \`.gitpagedocs-mcp.json\` plus process environment; see the MCP page.

\`gitpagedocs docs\` updates only marker-bounded regions of README.md, CONTRIBUTING.md and SECURITY.md, preserving surrounding prose. \`password\` configures the documentation access key pair; client-side presentation controls do not make public repository files confidential.
`,
    navigation: `# Navigation and nested menus

Routes define page content; menus define how readers reach it. Configure them in \`gitpagedocs/docs/versions/<version>/config.json\`. Site-wide presentation options belong to \`gitpagedocs/config.json\`.

\`\`\`json
{
  "site": {
    "nestedMenusEnabled": true,
    "RouteGuide": true
  }
}
\`\`\`

## Build a menu tree

Each \`menus-header-md\` entry has an \`id\` and localized \`pt\`, \`en\`, \`es\` objects with \`title\` and optional \`path-click\`. Add \`submenus\` containing more entries to nest the tree. A language object may also contain localized \`submenus\` with the same title/path structure. Use one form consistently to avoid listing the same child twice.

Groups without \`path-click\` organize children. For a Markdown destination, use its actual localized path from \`routes-md[].path\`. The \`page:<id>\` alias is registered by source-viewer, video, audio and PDF routes; do not use it for a Markdown-only page. The example below uses version \`0.0.8\`: replace that segment with the version you are editing and create the three chapter files.

\`\`\`json
{
  "routeDefaults": {
    "RouteGuide": false
  },
  "routes-md": [
    {
      "id": 101,
      "RouteGuide": true,
      "path": {
        "pt": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md",
        "en": "gitpagedocs/docs/versions/0.0.8/en/chapter.md",
        "es": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
      }
    }
  ],
  "menus-header-md": [
    {
      "id": 900,
      "pt": {
        "title": "Guia"
      },
      "en": {
        "title": "Guide"
      },
      "es": {
        "title": "Guía"
      },
      "submenus": [
        {
          "id": 901,
          "pt": {
            "title": "Capítulos"
          },
          "en": {
            "title": "Chapters"
          },
          "es": {
            "title": "Capítulos"
          },
          "submenus": [
            {
              "id": 101,
              "pt": {
                "title": "Primeiro capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md"
              },
              "en": {
                "title": "First chapter",
                "path-click": "gitpagedocs/docs/versions/0.0.8/en/chapter.md"
              },
              "es": {
                "title": "Primer capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
              }
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

## Nesting behavior

\`site.nestedMenusEnabled: true\` renders expandable recursive menus. You may add another \`submenus\` array at any node: there is no fixed application depth limit. The configuration must remain finite and practical for browser memory and usability. Setting it to \`false\` displays destinations as a flat list; it does not remove nested pages.

The tree supplies sidebar navigation, search labels, parent expansion and breadcrumb trails. Keep IDs stable and unambiguous; nodes pointing at a protected page follow its authorization rules. Apply the same structure to \`menus-header-source-viewer\`, \`menus-header-html\`, \`menus-header-video\` , \`menus-header-audio\` and \`menus-header-pdf\`. \`hierarchyMenu\` orders the type sections; \`hierarchyPage\` orders content containers that share a page ID.

## Breadcrumbs: RouteGuide

\`RouteGuide\` controls the breadcrumb trail. Resolution order is the page's \`routes-md[].RouteGuide\`, then the version's \`routeDefaults.RouteGuide\`, then \`site.RouteGuide\`, with \`true\` as the fallback. The example disables breadcrumbs for the version and enables them for chapter 101. Existing version \`0.0.8\` files can use the same fields.

\`RouteguideBrand\` and \`RouteguideBrandPosition\` are separate settings for the document's heading outline/table of contents; they do not control breadcrumbs.

## URLs and previous/next

Versioned URLs use \`/v/<version>/\`; \`?lang=pt\` selects a language and \`?id=101\` selects a page ID. \`?name=chapter\` selects the document slug. Keep \`VersionControl.versions[].path\` pointing at the matching version config. \`site.ActiveNavigation\` enables quick navigation and its Ctrl+K shortcut. Footer previous/next controls follow available menu destinations; focus-mode document navigation has its own option. See Focus mode for its section and document controls.

Footer previous/next buttons use \`site.icons.DocumentPrevious\` (\`FiChevronLeft\`) and \`site.icons.DocumentNext\` (\`FiChevronRight\`) by default. Set \`reactIcon: false\` on either entry to show its translated text; each entry also accepts \`tag\`, \`size\`, \`colorDark\` and \`colorLight\`. Appearance does not change navigation: the footer appears when more than one menu destination is available, and the unavailable direction stays disabled at the ends.

Test a new menu from the sidebar, by direct URL and in each enabled language; verify the destination exists and is allowed for the current reader.
`,
    focusMode: `# Focus mode

Focus mode opens the current Markdown document in a reading dialog. Enable it with \`site.FocusMode\`; the control is available only for a real Markdown page. \`site.icons.FocusMode\` changes its icon/text appearance and does not enable or disable the feature.

## Configure the controls

Merge this fragment into \`gitpagedocs/config.json\`:

\`\`\`json
{
  "site": {
    "FocusMode": true,
    "focusMode": {
      "copyEnabled": true,
      "downloadEnabled": true,
      "sectionNavigationEnabled": true,
      "documentNavigationEnabled": true
    }
  }
}
\`\`\`

Each option defaults to \`true\`; setting one to \`false\` hides its corresponding action or navigation group. With \`sectionNavigationEnabled: false\`, focus mode displays the entire document without section pagination. Existing configurations without the new \`focusMode\` object keep the controls enabled.

## Sections and documents

- Section navigation has four buttons: first section, previous section, next section and last section of the current document.
- Document navigation has four buttons: first document, previous document, next document and last document in menu order, including nested menus.
- \`sectionNavigationEnabled\` controls the four section buttons; \`documentNavigationEnabled\` controls the four document buttons. Unavailable directions are disabled at the ends.
- Documents without a translation in the active language, non-Markdown destinations and inaccessible pages are skipped.
- Switching documents keeps the dialog open and starts at the first section. Section/document counters show the current position.
- \`site.ActiveNavigation\` controls the quick-navigation interface; it does not disable focus-mode document navigation.

## Copy and download

Copy and download use the **entire original Markdown document in the selected language**, including sections not currently visible. They do not export the rendered HTML or only the current reading section.

The download keeps the Markdown basename from the route's localized \`path\`; if unavailable, the filename is \`document.md\`. Clipboard access follows the browser's permission and secure-context rules. If copying fails, use download instead and check the displayed error.

## Keyboard and reading

The dialog has an accessible name, keyboard focus management and a close control. Use Tab to move through controls and Escape to close it. Keep icon-only controls accessible by retaining their translated names. Closing the dialog returns to the documentation view.

Narration is configured separately in Accessibility. Changing the active document or language cancels the previous narration so it cannot continue reading stale content.
`,
    accessibility: `# Accessibility and narration

The accessibility controls include native browser narration for the current Markdown document. Narration uses the Web Speech API (\`speechSynthesis\`); it does not require an API key or an external GitPageDocs speech service.

## Configuration

Merge the following settings into \`gitpagedocs/config.json\`:

\`\`\`json
{
  "site": {
    "accessibility": {
      "enabled": true,
      "narration": {
        "enabled": true,
        "defaultRate": 1,
        "defaultVolume": 1
      }
    },
    "mediaExclusivePlayback": true
  }
}
\`\`\`

- \`site.accessibility.enabled\`: enable the accessibility interface.
- \`site.accessibility.narration.enabled\`: enable document narration.
- \`defaultRate\`: initial speed from \`0.5\` to \`2\`, in steps of \`0.25\`; the default is \`1\`.
- \`defaultVolume\`: initial volume from \`0\` (silent) to \`1\` (full), in steps of \`0.1\`; the default is \`1\`.
- All enable switches default to \`true\`; omitted settings use the shipped defaults.

## Read a document aloud

1. Open a Markdown page and the accessibility/narration controls.
2. Choose a voice and language from those exposed by your browser; adjust speed and volume.
3. Start reading. Pause temporarily, resume from the paused speech or stop the session.
4. To change reading settings predictably, stop, change the controls and start again.

Narration starts only after your action; there is no autoplay. Automatic voice selection follows the document language, while an explicit voice choice uses that voice's language. Narration does not translate the document.

The speech content is readable text extracted from the rendered Markdown. Scripts, styles, SVG content and elements marked hidden for assistive technology are excluded. Long documents are read completely in successive blocks. Changing the document or language, disabling narration or leaving the page cancels the previous speech.

The normal view and focus mode share voice, speed and volume preferences while the page remains mounted. These preferences are not stored across reloads. Non-numeric speed or volume settings use \`1\`; numeric settings outside the supported ranges are clamped to their nearest limit.

## One audio source at a time

With \`site.mediaExclusivePlayback: true\` (default), starting or resuming narration pauses the radio, audio tracks and route videos. Starting those media stops narration. A muted video remains outside this sound rule. Use \`false\` only when simultaneous playback is intentional.

The setting is shared with existing media playback; there is no second narration-exclusivity flag. The page remains readable when narration is disabled.

## Browser and voice availability

Speech support and voices depend on the browser, operating system and installed or remotely supplied voices. Voice lists can arrive after the page loads. A browser may expose a different set of languages than another device.

Unavailable speech support and playback errors are reported in the interface. Confirm that a usable voice exists, system audio is enabled and the page has received a user interaction. An empty voice list is not evidence that the document failed to load.

Do not assume every voice works offline: browser voices can be local or remote. This feature speaks text; it does not record microphone input. Browser narration complements keyboard navigation and screen readers; it does not replace them.

See the [Web Speech API reference](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) for browser-level behavior.
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

## Why does an icon still show text?

Set \`site.icons.<Control>.reactIcon\` to the boolean \`true\`, with an exact React Icons export name in \`tag\`. LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious and DocumentNext use icons by default; set any entry to \`false\` for text. Flat \`Icon*ReactIcones\` fields take precedence if both formats are present. Check whether the feature itself is disabled, such as \`HideThemeSelector\`, \`FocusMode\` or the PDF action flags.

## Why do menu children or breadcrumbs differ?

\`nestedMenusEnabled: false\` intentionally flattens destinations. Check \`submenus\`, language objects and \`path-click\`, then confirm that referenced pages exist and are accessible. Breadcrumbs use \`RouteGuide\` with route > version > site priority. \`RouteguideBrand\` controls the heading outline instead.

## Why is narration silent or interrupted?

Check browser support, available voice, language, volume and system output. Voices can load asynchronously or require a remote service. With \`mediaExclusivePlayback: true\`, another audio/video source stops narration by design. Switching documents cancels the old speech. See Accessibility for setup.

## Why does the MCP command wait or a tool fail?

\`mcp start\` waits for an MCP client over stdio; it is not a terminal chat prompt. Confirm the process cwd and use the published CLI entry or \`mcp/src/bin.ts\`. Filesystem/catalog tools need no provider, but generation requires credentials in the MCP process environment. The CLI vault and \`.env\` are not loaded automatically; inspect \`isError\` and the client's stderr log.

## Why did regeneration change my pages?

Scaffolding writes generated routes, configs and documentation again. Review changes in Git and keep project-specific content in your chosen source files. In this repository, edit \`cli/content/docs-{en,pt,es}.mjs\` and route metadata before regeneration; do not edit generated copies as the only source.
`,
  };
