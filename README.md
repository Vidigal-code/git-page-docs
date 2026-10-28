# Git Page Docs

`gitpagedocs` is a CLI and runtime contract for repository documentation.

It generates and maintains a `gitpagedocs/` folder with config and versioned markdown files.
It does **not** generate `index.html` or `index.js`.

## Table of Contents

- [Project Architecture (Monorepo)](#project-architecture-monorepo)
- [UI Icon Policy](#ui-icon-policy)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Layout Strategy](#layout-strategy)
- [Use Official Site or Your Own GitHub Pages](#use-official-site-or-your-own-github-pages)
- [Self-Hosted GitHub Pages Setup](#self-hosted-github-pages-setup)
- [Generated Structure](#generated-structure)
- [Configuration Keys](#configuration-keys-layout-source)
- [Version selector visibility](#version-selector-visibility)
- [Repository Search Behavior](#repository-search-behavior)
- [Compact config format](#compact-config-format)
- [Scripts](#scripts)
- [URL Routes and Query Parameters](#url-routes-and-query-parameters)
- [Video routes](#video-routes)
- [Media playback](#media-playback)
- [Authorized Routes](#authorized-routes)
- [CLI Options](#cli-options)
- [AI CLI (interactive docs generator)](#ai-cli-interactive-docs-generator)
- [Documentation password gate](#documentation-password-gate)
- [AI chat drawer (auto-lock)](#ai-chat-drawer-auto-lock)
- [Markdown page actions](#markdown-page-actions)
- [Configuration File Format](#configuration-file-format)
- [Languages and UI Strings](#languages-and-ui-strings)
- [Versioning and changelog](#versioning-and-changelog)
- [License](#license)

## Project Architecture (Monorepo)

`git-page-docs` is a **pnpm + turborepo monorepo**. Cross-surface services live in the shared `tools/` core. The frontend owns documentation loading and presentation; the CLI owns scaffolding and command workflows; the MCP server exposes shared services through its protocol.

```text
git-page-docs/
|-- frontend/     # Next.js 15 docs viewer (static export) — see frontend/README.md
|-- cli/          # Hexagonal CLI, published as the `gitpagedocs` npm bin
|-- mcp/          # Model Context Protocol server (@gitpagedocs/mcp)
|-- tools/        # @gitpagedocs/tools — the ONLY home for shared business logic
|-- gitpagedocs/  # User contract: config + versioned docs (kept stable)
|-- gitpagelayouts/ # Canonical layouts home: JSON + generated per-layout docs (layouts:sync)
|-- e2e/          # Playwright end-to-end specs
`-- tsconfig.base.json · turbo.json · pnpm-workspace.yaml · vitest.config.ts
```

| Area | Package | Responsibility |
| --- | --- | --- |
| **frontend/** | `@gitpagedocs/frontend` (private) | Next.js App Router viewer: versioned, multilingual documentation, 124 themes including 60 animated presets, the in-docs AI chat drawer and `/ai` console. Built from the repository root; the Pages environment exports `frontend/out/`. |
| **cli/** | `gitpagedocs` (`bin`) | Hexagonal CLI (`@clack/prompts`) that scaffolds `gitpagedocs/`, generates docs with AI, configures GitHub Pages, and launches the MCP server. |
| **mcp/** | `@gitpagedocs/mcp` | MCP server (SDK 1.29): 20 tools + 7 resources for repository analysis and AI doc generation, all delegating to `tools/`. |
| **tools/** | `@gitpagedocs/tools` | Shared core: 14-provider AI system (registry/factory, no switch chains), encrypted credential vault (AES-256-GCM) + password gate, logger with secret redaction, caches, config loader, filesystem + documentation services. Browser-safe subpath exports (`./ai`, `./crypto/web`, `./security/web`, …). |
| **gitpagedocs/** | — | The user-facing contract: `config.{json,js,ts}` and `docs/versions/**`. Never broken by refactors. |

### Security: encrypted AI credentials

API keys are never stored in plaintext, neither on the site nor by the CLI:

- **Site (`/ai` console and chat drawer)** — a **local password** derives (PBKDF2-HMAC-SHA-256) an AES-256-GCM key; keys are encrypted at rest in `localStorage` and decrypted only for the session. The chat drawer also **locks itself after `site.AiChatAutoLockSeconds`** idle seconds (default 30) and asks for the password again — see [AI chat drawer (auto-lock)](#ai-chat-drawer-auto-lock).
- **CLI (`gitpagedocs ai` / `gitpagedocs chat`)** — the key never sits in `.gitpagedocsconfig`: it is sealed in the encrypted vault file `.gitpagedocsvault` next to it, with a **vault password created on first use and asked on every run** (`GITPAGEDOCS_VAULT_PASSWORD` for non-interactive runs). The config only records `"apiKeyEncrypted": true` — see [Manual config](#manual-config-gitpagedocsconfig).

### Tooling

- **pnpm workspaces** + **turborepo** for builds/tests across packages
- Shared **`tsconfig.base.json`**; `pnpm run typecheck` covers cli / frontend / tools / mcp
- **Vitest** unit + integration (coverage on `tools/src`) and **Playwright** E2E (`e2e/`)
- A **smoke + byte-baseline** harness (`pnpm run smoke:all`) guards every legacy CLI contract
- **GitHub Actions**: CI (`ci.yml`), GitHub Pages deploy (`gitpagedocs-pages.yml`), npm publish on version bump (`npm-publish.yml`) and deprecation of the retired 1.1.x line (`npm-deprecate.yml`)

> The sections below document the published `gitpagedocs` CLI and its runtime contract. For frontend-specific development (the Next.js viewer), see [`frontend/README.md`](frontend/README.md).

## UI Icon Policy

Frontend controls, navigation actions, status buttons, and visual affordances use `react-icons`.
Do not hardcode emojis or decorative Unicode symbols in React components, CLI output, or generated docs references.

Use the existing icon resolver flow where configuration is supported:

- `ReactIconByTag` for configurable frontend icon tags.
- `ResolvedNavMenuIconConfig` and related resolvers for menu, sidebar, lock, audio, and chat controls.
- Direct `react-icons` imports only for local, typed fallback icons.

When an icon-only button already exposes its accessible name through `aria-label` or `title`, mark the rendered icon with `aria-hidden`.

## Prerequisites

- **Node.js** 20+ (`engines.node` is `>=20` in every package)
- **npm** / **npx** to install or run the published CLI
- **pnpm** 10 (`packageManager: pnpm@10.33.2`) to develop this monorepo

## Quick Start

Install the CLI globally, or run it one-off:

```bash
npm install -g @gitpagedocs/cli   # global install
gitpagedocs                       # then run anywhere (the bin is `gitpagedocs`)

# or, no install:
npx @gitpagedocs/cli
```

> `gitpagedocs` is published from the [`cli/`](cli/README.md) package of this monorepo. Generating docs is config-only — it never writes `index.html`/`index.js`.

Generate docs config and versioned files (recommended default):

```bash
npx @gitpagedocs/cli
```

Generate docs plus local layout templates:

```bash
npx @gitpagedocs/cli --layoutconfig
```

Generate docs, configure GitHub Pages URL, create workflow, and push:

```bash
npx @gitpagedocs/cli --push --owner your-user --repo your-repository
```

Docs deploy at the repository root, e.g. `https://your-user.github.io/your-repository/v/0.0.16/?lang=en`.

Optional `--path` to serve docs in a subpath (e.g. `docs` or `git-page-docs`):

```bash
npx @gitpagedocs/cli --push --owner your-user --repo your-repository --path docs
```

Then docs are at `https://your-user.github.io/your-repository/docs/v/0.0.16/?lang=en`.

Shortcut syntax also supported:

```bash
npx @gitpagedocs/cli --push --your-user --your-repository
```

### Standalone home distribution (`npx @gitpagedocs/cli --home`)

From a buildable viewer checkout, generates a self-contained `gitpagedocshome/` folder with:

- Static export of the docs (ready for `npx serve .`)
- Pre-configured `.env`
- `Dockerfile` for container deployment
- `README.md` with usage instructions

The published config-only CLI does not bundle the Next.js frontend. Use this mode from a source checkout with its dependencies installed; the command builds the viewer before copying its static export.

```bash
npx @gitpagedocs/cli --home
cd gitpagedocshome
npx serve .
```

Or with Docker:

```bash
cd gitpagedocshome
docker build -t gitpagedocshome .
docker run -p 3000:80 gitpagedocshome
```

## Layout Strategy

`gitpagedocs` supports two layout strategies:

### 1) Default mode (`npx @gitpagedocs/cli`)

- `gitpagedocs/config.json` (or `config.js` / `config.ts`) is generated with official layout source enabled.
- Layouts/templates are loaded from the official repository URLs (the documented `gitpagelayouts/` home):
  - `https://github.com/Vidigal-code/git-page-docs/tree/main/gitpagelayouts`
  - Repositories generated with `--layoutconfig` keep their own local layouts folder and it is still resolved first.
- Every official layout is documented (palette, typography, usage) in [`gitpagelayouts/README.md`](gitpagelayouts/README.md).
- Best option if you want to focus only on writing docs.

### 2) Local layout mode (`npx @gitpagedocs/cli --layoutconfig`)

- Generates local files in `gitpagelayouts/**` (change the folder with `--layouts-dir <dir>`):
  - `layoutsConfig.json`
  - `layoutsFallbackConfig.json`
  - `templates/*.json`
- The generated `gitpagedocs/config.json` references that folder through `layoutsConfigPath` and `layoutsConfigPathTemplates`, so the viewer resolves it directly instead of probing.
- Official layout URLs are disabled in generated config.
- Best option if you want to create and maintain your own templates in your own repository.

### Fallback behavior

- Runtime keeps resilient fallback behavior if a layout/template source is unavailable.
- In local layout mode, the runtime prioritizes local repository layout sources and does not force official template URLs by default.

## Use Official Site or Your Own GitHub Pages

You can choose either:

1. **Official viewer site**
   `https://vidigal-code.github.io/git-page-docs/`
2. **Self-hosted viewer** in your own GitHub repository using GitHub Pages.

This means your docs can run independently from the official domain when you publish your own site.

## Self-Hosted GitHub Pages Setup

### 1) Prepare your repository

```bash
npm install
npx @gitpagedocs/cli
```

Or, if you want local templates:

```bash
npx @gitpagedocs/cli --layoutconfig
```

### 2) Configure runtime URL (`site.rendering`)

Set `gitpagedocs/config.json` (or `config.js` / `config.ts`) `site.rendering` to your GitHub Pages URL:

```text
https://<your-user>.github.io/<your-repository>/
```

Example:

```text
https://octocat.github.io/my-docs/
```

### 3) Build and validate locally

These scripts belong to the GitPageDocs runtime checkout. Copy your documentation into its `gitpagedocs/` folder before running them. A documentation-only repository can use the generated Pages workflow, which obtains and builds the runtime in CI.

```bash
pnpm run lint
pnpm run build
pnpm start
```

### 4) Publish with GitHub Pages

- Push your repository to GitHub.
- Enable Pages for your repository (Settings -> Pages).
- Use the repository workflow to build/deploy static output.
- Optional one-command bootstrap:
  - `npx @gitpagedocs/cli --push --owner your-user --repo your-repository` — docs served at `https://<owner>.github.io/<repo>/` (base path uses the repo name so CSS/JS load correctly)
  - `npx @gitpagedocs/cli --push --owner your-user --repo your-repository --path docs` — docs at `https://<owner>.github.io/<repo>/docs/`; the site root redirects there
  - This creates `.github/workflows/gitpagedocs-pages.yml`, sets `site.rendering`, commits generated artifacts, and pushes to `origin`.
  - The generated workflow clones the official `git-page-docs` runtime in CI, injects your `gitpagedocs/` folder, builds, and deploys to your GitHub Pages URL.
  - The workflow trigger uses your current git branch automatically.
  - After push, CLI also attempts to switch repository Pages source to **GitHub Actions** using `gh api` (if GitHub CLI is available and authenticated).

When built with `GITHUB_ACTIONS=true`, the runtime enables GitHub Pages behavior.

## Generated Structure

Default mode:

```text
gitpagedocs/
  config.json           # site.languages: { "en": true, "pt": true, "es": true } (enable/disable each language)
  langs/{en,pt,es}.json # UI strings per language (langmenu + translations)
  icon.svg
  docs/
    versions/
      0.0.16/config.json
      0.0.16/{en,pt,es}/*.md
      0.0.16/{en,pt,es}/doom.html
      0.0.16/en/gitpagedocs-project-guide.pdf
      0.0.15/             # also scaffolded
      0.0.14/             # also scaffolded
      0.0.13/             # also scaffolded
      0.0.12/{en,pt,es}/*.md
      0.0.11/             # also scaffolded
      0.0.10/             # also scaffolded
      0.0.9/              # also scaffolded; older folders are preserved
```

Local layout mode adds (at the repository root, next to `gitpagedocs/`):

```text
gitpagelayouts/
  layoutsConfig.json
  layoutsFallbackConfig.json
  templates/*.json
```

## Configuration Keys (Layout Source)

Main layout source keys in `gitpagedocs/config.json` (or `config.js` / `config.ts`):

- `layoutsConfigPathOficial`
- `layoutsConfigPathOficialUrl`
- `layoutsConfigPathTemplatesOficial`
- `layoutsConfigPath`
- `layoutsConfigPathTemplates`

Behavior:

- If `layoutsConfigPathOficial=true`, runtime prefers official layout/template sources.
- If `layoutsConfigPathOficial=false`, runtime prefers your repository layout/template sources (`gitpagelayouts/**` or your custom paths).

## Compact config format

`gitpagedocs/config.json` and each version config store every shared value once:

- `site.icons` replaces legacy flat `Icon*` keys: `defaults` holds shared icon settings
  (`reactIcon`, `colorDark`, `colorLight`, `size`, `imgDark`, `imgLight`, `imgWidth`, `imgHeight`),
  and each icon entry sets its `tag` plus any difference (`null` removes a field):

  ```json
  "icons": {
    "defaults": { "reactIcon": true, "colorDark": "currentColor", "colorLight": "currentColor", "size": "22px" },
    "NavMenuOpen": { "tag": "LuMenu" }
  }
  ```

- `routeDefaults` (version config) holds the route settings every route shares (title/description
  CSS, positions, visibility, margins, `blockLink`, `browseAll`); routes keep only their own values.

The viewer expands both forms when it loads a config (`@gitpagedocs/tools/config-format`), so the
flat keys still work: 0.0.x configs load unchanged, and a flat key or a value written on a route wins
over the compact form.

## Version selector visibility

In the docs shell, the **version** dropdown is hidden when `VersionControl.versions` resolves to **at most one unique** `id`:

- One entry, or multiple entries with the same `id`, shows **no** version selector (duplicate `id` rows are deduplicated; the first wins).
- Two or more **distinct** `id` values show the version selector.
- **Language** and **theme** selectors are separate and are not affected by version count.

## Repository Search Behavior

Repository search is controlled by environment/runtime context:

- GitHub Pages builds (`GITHUB_ACTIONS=true`): repository-search home enabled.
- Local runtime: controlled by `GITPAGEDOCS_REPOSITORY_SEARCH=true|false`.

Recommended for local testing:

```env
GITPAGEDOCS_REPOSITORY_SEARCH=true
```

Version configs can render a GitHub-style source browser inside the docs through `routes-source-viewer` and `menus-header-source-viewer`. Each source viewer route uses `source-viewer: true` and `source-viewer-path`, for example `https://github.com/Vidigal-code/git-page-docs/tree/main`.

## Scripts

Run from the repository root with `pnpm run <script>` (`npm run` works too). They mirror the root `package.json`:

| Script | What it does |
| --- | --- |
| `gitpagedocs` | `node cli/index.mjs` — generate `gitpagedocs/` (`config.json`, `langs/<lang>.json`, versioned docs, `icon.svg`) |
| `gitpagedocs:home` | `node cli/index.mjs --home` — standalone `gitpagedocshome/` distribution (static site + .env + Dockerfile) |
| `dev` | `next dev frontend` with the repository-search home (`GITPAGEDOCS_REPOSITORY_SEARCH=true`; `predev` copies `icon.svg`) |
| `dev:e2e` | `next dev frontend` opening the local docs directly — what Playwright runs against |
| `dev:e2e:guide` | `next dev frontend` in repository-search mode (build folder `frontend/.next-guide`) — the second Playwright server, for the introduction guide |
| `build` | generate `gitpagedocs/`, copy `icon.svg` to `frontend/public/` and run `next build frontend`; the Pages environment (`GITHUB_ACTIONS=true`) enables static export to `frontend/out/` |
| `build:prebuilt` | build in the Pages export environment, then copy `frontend/out/` to `cli/prebuilt/`; not part of normal npm publication |
| `start` | `node cli/start.mjs` serves the build (`prestart` runs `build` first) |
| `lint` / `lint:src` | `eslint .` / frontend sources only |
| `typecheck` / `typecheck:strict-unused` | `tsc --noEmit` for root, frontend, tools and mcp / plus unused-symbol checks |
| `test:unit` / `test:cov` | Vitest suite / with coverage |
| `test:e2e` | Playwright E2E on two dev servers, `PORT` and `PORT + 1` (`PORT=3100 pnpm run test:e2e` when 3000 is busy) |
| `smoke:cli` · `smoke:commands` · `smoke:flags` · `smoke:core` · `smoke:ai` · `smoke:secweb` · `smoke:mcp` · `smoke:docs` | self-tests of the CLI artifacts, command verbs, flag contract, tools core, AI providers, web security, MCP server and docs automation |
| `smoke:all` / `test` / `test:ci` | every smoke suite (`smoke:all` and `test` also run `baseline:check`) |
| `baseline:create` / `baseline:check` | recreate / verify the byte-stable snapshot of the generated `config.json` + `langs/*.json` (and `site-baseline.json`) |
| `layouts:sync` | regenerate `gitpagelayouts/` (layout JSON + per-layout docs) |
| `turbo:build` · `turbo:lint` · `turbo:typecheck` · `turbo:test` | the same tasks through turborepo |
| `publish:all` | `pnpm -r publish --access public --no-git-checks` |
| `clean` | remove `frontend/.next/` |

## URL Routes and Query Parameters

All routes for accessing documentation files on the official site or self-hosted GitHub Pages.

### Path structure

| Pattern | Description |
|--------|-------------|
| `/` | Repository search home (when `repositorySearchHome=true`) |
| `/{owner}/{repo}/` | Docs for `owner/repo`, default version |
| `/{owner}/{repo}/v/{version}/` | Docs for `owner/repo`, specific version |
| `/v/{version}/` | Docs for the project’s own repo, specific version |

**Base URL (official site):** `https://vidigal-code.github.io/git-page-docs/`

### Query parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `lang` | `en`, `pt`, `es` | UI and content language |
| `theme` | layout id (e.g. `aurora-dark`, `aurora-light`) | Active theme; always reflected in URL |
| `modetheme` | `dark`, `light` | Theme mode (legacy; `theme` takes precedence) |
| `version` | e.g. `0.0.16` | Version (alternative to path) |
| `menu` | `en`, `pt`, `es` | Language for path resolution (use with `id` or `name`) |
| `id` | route id (e.g. `1`, `2`) | Navigate to page by route id |
| `name` | slug (e.g. `getting-started`) | Navigate to page by filename slug |
| `mdfull` | `en`, `pt`, `es` | Markdown fullscreen mode |
| `htmlfull` | `en`, `pt`, `es` | HTML fullscreen mode for a `routes-html` entry; the scaffold includes the localized DOOM example (route 29) |
| `file` | path (with `mdfull` or `htmlfull`) | File to show in fullscreen |
| `videofull` | `en`, `pt`, `es` | Video fullscreen mode |
| `audiofull` | `en`, `pt`, `es` | Audio fullscreen mode |
| `slug` | video/audio slug (with `videofull` or `audiofull`) | Video/audio identifier |
| `#heading-id` | anchor | Scroll to heading in markdown |

### Example URLs (git-page-docs, English)

Base URL used below:

```text
https://vidigal-code.github.io/git-page-docs
```

**Base docs paths**

- Repository search home:
  https://vidigal-code.github.io/git-page-docs/
- Repository default version:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/?lang=en
- Repository pinned version:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en
- Project version path without owner/repo:
  https://vidigal-code.github.io/git-page-docs/v/0.0.16/?lang=en
- Version through query parameter:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/?lang=en&version=0.0.16

**Markdown pages by route id**

- Getting Started (`id=1`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=1
- Project overview (`id=2`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=2
- Functionalities (`id=3`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=3
- GitHub issues and projects (`id=4`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=4
- Introduction to Git (`id=5`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=5
- Authorized routes (`id=6`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=6

**Markdown pages by slug (`name`)**

- Getting Started:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&name=getting-started
- Project overview:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&name=project-overview
- Functionalities:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&name=functionalities
- GitHub issues and projects:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&name=github-issues-projects
- Introduction to Git:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&name=git-introduction
- Authorized routes:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&name=authorized-routes

**Source viewer**

- Source viewer page inside the docs shell (`id=7`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=7
- Standalone source viewer root:
  https://vidigal-code.github.io/git-page-docs/source-viewer
- Standalone source viewer for this repository:
  https://vidigal-code.github.io/git-page-docs/source-viewer/Vidigal-code/git-page-docs/tree/main
- Standalone source viewer for a nested path:
  https://vidigal-code.github.io/git-page-docs/source-viewer/Vidigal-code/git-page-docs/tree/main/frontend/src
- The standalone viewer shows a back button beside the GitHub link (langmenu key `sourceViewerBackLabel`) that returns to the site root keeping the current look, e.g. `/?theme=skyline-dark&modetheme=dark`.

**Video pages** (`id=8` to `id=10` require sign-in; `id=11` is open to every visitor, see [Video routes](#video-routes))

- Interactive vs non-interactive modes (`id=8`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=8
- GitHub issues and projects video (`id=9`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=9
- Python tutor video (`id=10`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=10
- Git introduction video (`id=11`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=11

**Audio pages**

- Audio track (`id=12`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=12

**Fullscreen modes**

- Markdown fullscreen:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?mdfull=en&file=gitpagedocs/docs/versions/0.0.16/en/getting-started.md
- Video fullscreen by route id:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?videofull=en&id=8
- Video fullscreen by slug:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?videofull=en&slug=bdIJkGr2NV0
- Audio fullscreen by route id:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?audiofull=en&id=12
- Audio fullscreen by slug:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?audiofull=en&slug=0w80F8FffQ4

**Theme and heading selection**

- aurora-dark theme:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&theme=aurora-dark
- aurora-light theme:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&theme=aurora-light
- Legacy mode parameter:
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&modetheme=dark
- Scroll to a Markdown heading (`## Prerequisites` of Getting Started; the anchor is the lower-cased heading with spaces as `-`):
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=1#prerequisites

**Standalone app routes**

- AI console:
  https://vidigal-code.github.io/git-page-docs/ai
- Introduction guide:
  https://vidigal-code.github.io/git-page-docs/introduction-guide

The introduction guide is available in repository-search builds. Its chapter tour follows native page scrolling and keeps text readable when scrolling stops at a transition, without adjacent chapters overlapping. Parallax effects, reduced-motion preferences and the stacked layout for short landscape viewports remain supported.

## Video routes

Video pages come from `routes-video` in the version config. Each route sets `video.videoType`
(`youtube`, `vimeo`, `mp4`, …) and `video.pathVideo` per language; for YouTube, `pathVideo` is the
video id. The viewer renders the route inside the docs shell, and `?videofull=<lang>&id=<route id>`
(or `&slug=<video id>`) opens it fullscreen.

The video routes of this repository are GitHub channel videos. Routes `id=8` to `id=10` carry the
demo `authorization` (`requireExternalAuth`) and stay hidden from the sidebar until the visitor signs
in with a configured provider. Route `id=11` has no `authorization`, so the **Video** menu section and
its video container are always visible. Videos are played only by the video container; markdown pages
do not embed them.

A video route that shares its `id` with a markdown route is shown on the same page. The *Introduction
to Git* page (`id=5`) uses this to show the test video in a video container **above** its markdown:
the version config has a `routes-video` entry with `"id": 5` (no menu entry of its own) and the
markdown route sets a page order that puts the video first:

```json
{ "id": 5, "hierarchyPage": { "video": 0, "md": 1, "source-viewer": 2, "html": 3, "audio": 4 } }
```

Test video (GitHub channel, *A brief introduction to Git for beginners*):

[![A brief introduction to Git for beginners | GitHub](https://img.youtube.com/vi/r8jQ9hVA2qs/hqdefault.jpg)](https://www.youtube.com/watch?v=r8jQ9hVA2qs)

- Watch on YouTube: https://www.youtube.com/watch?v=r8jQ9hVA2qs
- Video route: https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=11
- Introduction to Git page (video above the markdown): https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?lang=en&menu=en&id=5
- Fullscreen: https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/0.0.16/?videofull=en&slug=r8jQ9hVA2qs

Route definition in `gitpagedocs/docs/versions/0.0.16/config.json`:

```json
{
  "routes-video": [
    {
      "id": 11,
      "title": { "en": "A brief introduction to Git for beginners | GitHub" },
      "fullscreenEnabled": true,
      "video": {
        "videoType": { "en": "youtube", "pt": "youtube", "es": "youtube" },
        "pathVideo": { "en": "r8jQ9hVA2qs", "pt": "r8jQ9hVA2qs", "es": "r8jQ9hVA2qs" }
      }
    }
  ],
  "menus-header-video": [
    { "id": 11, "en": { "title": "A brief introduction to Git for beginner...", "path-click": "page:11" } }
  ]
}
```

## Media playback

Only one sound plays at a time. With `site.mediaExclusivePlayback` (default `true` in
`gitpagedocs/config.json`):

| Starts playing | Is paused |
| --- | --- |
| a route video | the header radio and audio tracks; narration stops |
| the header radio | route videos and audio tracks; narration stops |
| an audio track | route videos and the header radio; narration stops |
| native narration | route videos, the header radio and audio tracks |

How each video source is followed and paused:

| Source (`video.videoType`) | Detects play | Pauses |
| --- | --- | --- |
| `youtube` | official YouTube IFrame Player API (`enablejsapi=1`, state `PLAYING`) | `pauseVideo()` |
| `vimeo` | Vimeo player `postMessage` protocol (`play` event) | `pause` method |
| `mp4`, `webm`, `ogg`, … (native) | the element's `play` event | `pause()` |
| any other embed (`tiktok`, `instagram`, …) | focus moving into the player | reloads the embed |

Customizing:

- **Video with the picture only** — set `"muted": true` in a route's `video` object. The video starts
  without sound (YouTube `mute=1`, Vimeo `muted=1`, native `muted`) and stays out of the rule, so it
  can run while the radio or an audio track explains it:

  ```json
  {
    "id": 5,
    "video": {
      "videoType": { "en": "youtube" },
      "pathVideo": { "en": "r8jQ9hVA2qs" },
      "muted": true
    }
  }
  ```

- **No rule at all** — `"mediaExclusivePlayback": false` in `site` lets every player run freely (the
  radio and the audio tracks still pause each other, as before).

## Authorized Routes

Route authorization is configured per version in:

- `gitpagedocs/docs/versions/<version>/config.json`

Use the top-level `auth` section plus route-level `authorization`:

- `auth.accessKeys`: key ids and expected secrets
- `auth.rolesStorageKey`: localStorage key used to bootstrap roles
- `auth.providers`: external providers (`authjs`, `clerk`, `firebase`, `jwt`)
- `authorization.accessKeyId`: requires a configured key
- `authorization.requiredRoles`: requires matching roles
- `authorization.requireExternalAuth`: requires authenticated external provider
- `authorization.allowedProviders`: optional provider allow-list per route

Example:

```json
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
        "en": "gitpagedocs/docs/versions/0.0.16/en/authorized-routes.md",
        "pt": "gitpagedocs/docs/versions/0.0.16/pt/authorized-routes.md",
        "es": "gitpagedocs/docs/versions/0.0.16/es/authorized-routes.md"
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
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--owner <user>` | GitHub owner (e.g. `Vidigal-code`) |
| `--repo <repo>` | GitHub repository (e.g. `git-page-docs`) |
| `--path <subpath>` | Subpath for docs (e.g. `docs`); without it, base path = repo name for correct asset loading on project sites |
| `--output <dir>` | Output directory (default: `gitpagedocs` or `gitpagedocshome` with `--home`) |
| `--search true\|false` | Enable/disable repository search (mainly for `--home`) |
| `--layoutconfig` | Generate local layout templates in `gitpagelayouts/` |
| `--layouts-dir <dir>` | Folder that holds local layouts (default: `gitpagelayouts`) |
| `--push` | Create workflow, commit artifacts, push to origin |
| `--pages-actions` | Only switch the repository's GitHub Pages source to GitHub Actions (same as `pages actions`; no docs generation or push) |
| `--home` | Standalone distribution in `gitpagedocshome/` (static site + .env + Dockerfile + README) |
| `--interactive` / `-i` | Run in interactive mode (already the default in a terminal) |
| `--no-interactive` / `--yes` / `-y` | Never prompt; use flags and defaults (implied in CI and when stdin is piped) |
| `ai` or `--ai` | Interactive AI documentation mode (paths, provider, API key/base URL, multilingual output) |
| `pages actions` | Detect owner/repo/branch from the git remote and, after confirmation, switch Pages to GitHub Actions |
| `pages deploy` | Resolve owner/repo (flags or git remote), confirm, then run the full `--push` flow and print the site URL |
| `--build` | Compatibility flag (no change to output) |
| `--serve` | Compatibility flag |
| `--full` | Compatibility flag |

Shortcut syntax: `npx @gitpagedocs/cli --push --<owner> --<repo>` (e.g. `--Vidigal-code --git-page-docs`) is equivalent to `--owner <owner> --repo <repo>`.

With `--home`, output is `gitpagedocshome/` (or `--output` value). Otherwise, output remains `gitpagedocs/` (or `--output` value).

## AI CLI (interactive docs generator)

Run:

```bash
npx @gitpagedocs/cli ai
```

This mode provides:

- provider selection from the shared catalog (`gitpagedocs provider` lists the supported IDs)
- API key / base URL input
- path input (supports multiple paths and cross-repo paths)
- multilingual markdown generation (`pt`, `en`, `es`)
- optional `.gitpagedocsconfig` persistence for manual reuse — the API key is sealed in the
  encrypted vault `.gitpagedocsvault` (vault password created on first use, asked on every run)
- interactive fallback when directories are missing (fix/skip/abort)

The same credentials power `gitpagedocs chat [question]`, a streaming AI chat in the terminal
(REPL on a TTY; one-shot with a question or piped stdin; `--provider`, `--model`, `--system`).
See [`cli/README.md`](cli/README.md#gitpagedocs-chat).

**Generates in the gitpagedocs pattern.** The model is told what gitpagedocs is and
returns documentation split into multiple pages. `gitpagedocs ai` first scaffolds the base
`gitpagedocs/` structure, then writes each page to
`gitpagedocs/docs/versions/<latest>/<lang>/<slug>.md` (in every language) **and wires them
into that version's `config.json`** (`routes-md` + `menus-header-md`), so the AI pages show up
directly in the docs viewer menu. The added entries are tagged `aiGenerated` and are
idempotent — re-running `gitpagedocs ai` replaces them instead of duplicating.

> Note: a later plain `gitpagedocs` run rebuilds the base config from the deterministic
> templates and drops the AI wiring — re-run `gitpagedocs ai` to restore it.

### Manual config (`.gitpagedocsconfig`)

The config is stored in the per-user OS config directory (never inside the
repository, so nothing secret can be committed by accident), with owner-only file
permissions on POSIX systems:

- Windows: `%APPDATA%\gitpagedocs\.gitpagedocsconfig`
- macOS: `~/Library/Application Support/gitpagedocs/.gitpagedocsconfig`
- Linux: `$XDG_CONFIG_HOME/gitpagedocs/.gitpagedocsconfig` (or `~/.config/gitpagedocs/.gitpagedocsconfig`)

Set `GITPAGEDOCS_CONFIG_DIR` to override the directory. Delete the stored file, the
vault and their credentials at any time with `npx @gitpagedocs/cli config clear`. File contents:

The example below assumes the interactive setup has already saved a key in the encrypted vault. Creating `apiKeyEncrypted: true` manually does not create a key; run setup and decline reuse of an incomplete configuration to enter credentials.

```json
{
  "version": 1,
  "ai": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apiKeyEncrypted": true,
    "paths": ["src", "cli", "../another-repo/src"],
    "languages": ["pt", "en", "es"],
    "outputDir": "gitpagedocs/docs",
    "filePrefix": "ai-generated",
    "contextPrompt": "Write clear technical documentation for this repository."
  }
}
```

**The API key is not in this file.** When a configuration is saved, the key is sealed into the
encrypted vault `.gitpagedocsvault` in the same directory (AES-256-GCM; key derived from your
password with PBKDF2-HMAC-SHA-256, 210k iterations) and the config only keeps
`"apiKeyEncrypted": true`:

- the **vault password is created on first use** (typed twice) and **asked on every run** of
  `gitpagedocs ai` / `gitpagedocs chat` that uses the stored key (3 attempts, then the run aborts);
- `GITPAGEDOCS_VAULT_PASSWORD` supplies it without a prompt (CI, pipes, no TTY);
- a plaintext `"apiKey"` written by 0.0.1 is sealed into the vault and removed from the file
  when `ai` or `chat` reuses that configuration and unlocks it with the vault password;
- `gitpagedocs config clear` deletes the config **and** the vault.

For Ollama, use `baseUrl` instead of an API key (no vault involved).

## Documentation password gate

Add a viewer password gate to the documentation:

```bash
gitpagedocs password
```

It prompts for a password (type + confirm), writes a non-reversible **public key** to
`site.docsAccess` in `gitpagedocs/config.json`, and prints a **private key** to copy. The
scheme is double-hash: `privateKey = SHA256(password)`, `publicKey = SHA256(privateKey)` — the
password itself is never stored. When `docsAccess.enabled` is set, the viewer blocks the entire
documentation behind a full-page gate; visitors unlock with the **password OR the private key**
(verified against the public key). The unlock is cached in `localStorage`, and a lock icon in
the menu clears the cache to re-block. Leave `docsAccess.enabled` false (the default) to keep
the docs open.

This is a client-side viewing gate. Public repository files and static assets remain publicly accessible; use private hosting with server-side access control for confidential content.

## AI chat drawer (auto-lock)

The in-docs chat drawer keeps the provider key in the encrypted `localStorage` vault and unlocks
it with the local password. Two `site` keys in `gitpagedocs/config.json` control it:

| Key | Default | Description |
| --- | --- | --- |
| `AiChatEnabled` | `true` (anything but `false`) | Shows the AI chat button in the sidebar and mounts the drawer |
| `AiChatAutoLockSeconds` | `30` | Idle seconds before the drawer locks itself (`60`, `100`, …; `0` disables; a non-numeric or negative value falls back to `30`) |

Behavior:

- Any pointer, key, wheel or touch event inside the drawer counts as activity. Ten seconds before
  the limit (at 20 s idle with the default) a **centered modal** shows a countdown in the selected
  language — pt *Salvar* / *Cancelar*, en *OK* / *Cancel*, es *Guardar* / *Cancelar*. *Cancel*
  keeps the session; the confirm button or the countdown reaching zero **locks the drawer**.
- Locking drops the in-memory password: the keys stay encrypted in the vault and the password
  gate is shown again. The timer pauses while a reply is streaming.
- The modal traps focus (Tab / Shift+Tab / Escape = cancel), hides everything behind it, follows
  the active theme (light or dark) and is responsive down to phone widths. Its strings come from
  `langmenu`: `aiChatAutoLockTitle`, `aiChatAutoLockDesc` (with `{seconds}`),
  `aiChatAutoLockConfirmBtn`, `aiChatAutoLockCancelBtn`.
- The provider/model picker is generated from the shared catalog (`gitpagedocs models <id>`). A
  stored model missing from that catalog is replaced by the provider default; the catalog does not verify live provider availability. Every
  option reads `Provider · Model` (`OpenAI · GPT-4o mini`, `Anthropic Claude · Sonnet 4.6`,
  `Google Gemini · 2.5 Flash`, `Ollama · Llama 3`); the provider name comes from `langmenu`
  (`aiChatProviderOpenAI`, `aiChatProviderClaude`, `aiChatProviderGemini`, `aiChatProviderOllama`) and
  the model name from the catalog. The picker is the same theme-aware dropdown as the language and
  theme selectors, so the open list is painted by the theme instead of the browser's native popup.
- Buttons on the primary colour use the derived `--primary-foreground` token (near-black text on a
  light primary such as `carbon-dark`'s white, white text on deep tones), and native controls follow
  the theme's derived `--color-scheme`; both are computed from the layout palette, so themes declare
  nothing new.
- The exclamation-mark button in the drawer header opens a **"How to use and risks"** tab, readable
  before any password exists: how the vault and the per-request decryption work, a step-by-step guide,
  every event of the flow and the risks that remain. Its text comes from the `langmenu` keys
  `aiChatInfo*` (one list item per line; `{seconds}` shows `AiChatAutoLockSeconds`).
- Transient provider errors (HTTP 408/425/429/500/502/503/504) are retried up to 3 times with
  backoff; a final failure is shown as a plain sentence ending with *Try again!*
  (`langmenu.aiChatRetryHint`), never as a bracketed status code.

## Markdown page actions

Every markdown page shows, beside the fullscreen button, a **copy** button (puts the page's original
`.md` text on the clipboard) and a **download** button (saves it as `<file>.md`), for the language
being read. Labels come from `gitpagedocs/langs/<lang>.json`: `mdCopyLabel`, `mdCopiedLabel`,
`mdCopyErrorLabel`, `mdDownloadLabel`.

## Configuration File Format

Runtime supports three config file formats (in order of precedence):

- `gitpagedocs/config.json`
- `gitpagedocs/config.js` (CommonJS `module.exports` or ESM `export default`)
- `gitpagedocs/config.ts` (TypeScript; exports default object)

## Languages and UI Strings

The UI text is not part of `config.json`; it lives in one JSON file per language:

- `site.languages` in `gitpagedocs/config.json` — switches each language on (`true`) or off (`false`), in menu order: `{ "languages": { "en": true, "pt": true, "es": false } }`. A language set to `false` disappears from the language selector and its strings are not loaded, even when its docs exist.
- `gitpagedocs/langs/<lang>.json` — that language's `langmenu` (header, search, source viewer, audio player, AI chat, docs-access labels) and `translations` (`notFound`, `navigation`, `footer`).

To add a language, create `gitpagedocs/langs/<lang>.json` and add `"<lang>": true` to `site.languages`. Strings inlined in `site.langmenu` / `translations` still work: the `langs/` files win when both exist, and any missing key is backfilled from the current release baseline.

## Versioning and changelog

`0.0.1` is the first official stable release and the baseline every later version counts from. The
1.1.x line published before it (npm `1.1.44`–`1.1.71`) is deprecated on the registry and its GitHub
releases were removed. See [CHANGELOG.md](CHANGELOG.md) for what each release contains.

## License

ISC. See [repository](https://github.com/Vidigal-code/git-page-docs) for details.

<!-- gitpagedocs:start -->
### Supported AI providers (14)

| Provider | ID | Default model | Capabilities |
| --- | --- | --- | --- |
| OpenAI | `openai` | `gpt-4o-mini` | stream, vision |
| Anthropic | `anthropic` | `claude-sonnet-4-6` | stream, vision |
| Google Gemini | `gemini` | `gemini-2.5-flash` | stream, vision, audio |
| OpenRouter | `openrouter` | `openai/gpt-4o-mini` | stream, vision |
| Ollama (local) | `ollama` | `llama3` | stream, vision |
| Azure OpenAI | `azure-openai` | `gpt-4o-mini` | stream, vision |
| Mistral | `mistral` | `mistral-large-latest` | stream |
| DeepSeek | `deepseek` | `deepseek-chat` | stream |
| Cohere | `cohere` | `command-r-plus` | stream |
| Groq | `groq` | `llama-3.3-70b-versatile` | stream |
| xAI Grok | `xai` | `grok-2-latest` | stream, vision |
| Together AI | `together` | `meta-llama/Llama-3.3-70B-Instruct-Turbo` | stream |
| Fireworks AI | `fireworks` | `accounts/fireworks/models/llama-v3p3-70b-instruct` | stream |
| Perplexity | `perplexity` | `sonar` | stream |

### CLI commands

- `gitpagedocs init` — scaffold gitpagedocs config files
- `gitpagedocs config` — show the resolved gitpagedocs config
- `gitpagedocs provider [id]` — list AI providers or show one
- `gitpagedocs models [provider]` — list catalog models
- `gitpagedocs ai` — interactive AI docs generator (writes pages in the gitpagedocs pattern)
- `gitpagedocs chat [question]` — streaming AI chat in the terminal (REPL on a TTY; one-shot with a question or piped stdin)
- `gitpagedocs document[:repo|:file|:folder]` — aliases of the interactive documentation generator; select input directories in its prompts
- `gitpagedocs password` — set a documentation access password (writes the public key to config.json)
- `gitpagedocs config clear` — delete the stored .gitpagedocsconfig and the encrypted key vault
- `gitpagedocs docs` — refresh the managed regions of README, CONTRIBUTING and SECURITY
- `gitpagedocs deploy | pages` — configure GitHub Pages via Actions and push
- `gitpagedocs pages actions` — switch the repository's GitHub Pages source to GitHub Actions (no docs generation or push)
- `gitpagedocs pages deploy` — detect owner/repo, confirm, then generate, commit, push and print the site URL
- `gitpagedocs doctor` — diagnose the environment
- `gitpagedocs mcp start` — start the MCP server over stdio
- `gitpagedocs version` — print the CLI version
- `gitpagedocs update` — check the registry for a newer CLI and print the install command

### User references

The generated documentation includes 35 Markdown pages per language: focused references plus complete configuration recipes, migration/compatibility, troubleshooting, contributing/testing and HTML-container guides. All pages are available in English, Portuguese and Spanish; Markdown filenames stay in English while titles and content preserve UTF-8 accents and special characters.
The scaffold registers documentation versions 0.0.16, 0.0.15, 0.0.14, 0.0.13, 0.0.12, 0.0.11, 0.0.10 and 0.0.9 in descending order with the current examples; the npm package version is 0.0.16. Paths and version badges match each generated documentation version. Existing older version folders are preserved.

The scaffold has real nested sections: Guides → Configure your site / Read and explore / Automate and integrate → documents, plus Operations and development and Git/GitHub groups. Getting Started and Project overview remain the first destinations. Every parent section has its own localized Markdown overview: click its title to read it, or use the separate arrow to expand children. Breadcrumb ancestors such as Guides → Configure your site remain navigable. Recursive `submenus` can extend the hierarchy without a fixed depth limit; `site.nestedMenusEnabled: false` keeps every destination in a flat presentation.

Configure controls through `gitpagedocs/config.json` → `site.icons`. `LanguageSelector`, `ThemeSelector`, `VersionSelector`, `FocusMode`, `QuickNavigation`, `PdfDownload`, `PdfOpenInNewTab`, `DocumentPrevious` and `DocumentNext` use icons by default. Set `reactIcon: false` independently to display text; `true` displays the icon. Customize `tag`, `size`, `colorDark` and `colorLight` per entry. Compact configs inherit omitted values from `icons.defaults`, so an omitted per-control `reactIcon` does not mean text mode. The Ctrl+K shortcut and accessible control names remain available.
`VersionSelector` uses `LuGitBranch` by default; `reactIcon: false` displays the selected version as text. It appears only when more than one documentation version is available, retains the selector's localized accessible name and shows the selected version in its tooltip.

`site.nestedMenusEnabled` selects recursive or flat navigation. Breadcrumbs use `RouteGuide` with route > version defaults > site precedence and have 12 px of spacing above and below. `site.FocusMode` enables reading mode; `site.focusMode` controls copy, download, section navigation and document navigation independently.

Focus mode provides eight navigation buttons: first, previous, next and last document, plus first, previous, next and last section. Each navigation flag controls its group of four; document changes keep the reader open and restart at the first section.
Focus narration reads only the displayed section. Section/document changes and entering/leaving focus stop the previous speech; a new reading uses the visible content while retaining voice, speed and volume preferences. With `sectionNavigationEnabled: false`, the whole document is visible and narratable. Source copy/download still covers the complete document.

Documentation pages and the introduction guide use `site.backToTop: { enabled: true, minPageHeightViewports: 3 }` for their back-to-top arrow. It is available only on a scrollable page at least three viewport heights tall. Set `enabled: false` to hide it; the threshold accepts a finite number greater than 1 and otherwise defaults to 3.

Document-footer controls use `DocumentPrevious` (`LuChevronLeft`) and `DocumentNext` (`LuChevronRight`); either can use its translated text with `reactIcon: false`. The footer appears for multiple available menu destinations and disables unavailable directions. `site.ActiveNavigation` controls quick navigation and Ctrl+K separately.
`site.documentNavigation.position` in `gitpagedocs/config.json` accepts `left`, `center` or `right`; it defaults to `center` when omitted or invalid. Previous, Next and Back to top remain grouped in that order on desktop and mobile. The position setting does not change the arrow's `site.backToTop` visibility rules or the introduction-guide arrow.

`site.accessibility.narration` configures native browser reading. Voices and offline availability depend on the browser and operating system. `site.mediaExclusivePlayback` coordinates narration, radio, audio and video so only one audible source plays by default.

See [the MCP reference](mcp/README.md) for installation, client configuration, all 20 tools, all 7 resources, provider variables and limits. Start with `gitpagedocs mcp start` from the target project; on a source checkout the direct entry is `node --import tsx mcp/src/bin.ts`.

### Animated themes

The catalog contains 124 themes: 64 original themes, 20 standalone Motion backgrounds and 20 additional parallax families with dark and light variants (40 entries). All 84 earlier themes remain unchanged. Try `aurora-borealis-dark`/`aurora-borealis-light`, `firefly-grove-dark`/`firefly-grove-light`, or `ocean-depths-dark`/`ocean-depths-light`; the existing light/dark control switches within each pair. Each pair shares `supportsLightAndDarkModesReference` in the catalog. All themes are available through the official catalog and local `--layoutconfig` generation. See [the complete catalog](gitpagelayouts/README.md) and the generated Themes and layouts guide in English, Portuguese and Spanish.

Customize `site.backgroundEffects` in `gitpagedocs/config.json`: `enabled: false` disables every background; `overrides` applies common settings; `themes[themeId]` applies theme-specific settings. Templates provide optional top-level `backgroundEffects`. Precedence is template → global overrides → per-theme overrides, while `layers` replaces the complete array. Adjust layer counts/colors, animation speed and pointer/scroll parallax without editing JavaScript. Reduced-motion preferences and a visitor pause control are supported; every new preset retains both protections.
Pause/resume sits beside the navigation lock in the documentation menu (expanded, collapsed and mobile), or in the search-page header. A manual pause survives menu and theme changes until Resume is selected. `site.backgroundEffects.overrides.accessibility.showPauseButton` defaults to `true`; `false` hides only the control. Configure `site.icons.BackgroundAnimationPause` (`FiPause`) and `BackgroundAnimationResume` (`FiPlay`) with `reactIcon`, `tag`, `size`, `colorDark` and `colorLight`. Defaults are icons, 22px and `currentColor`; `reactIcon: false` shows localized text. Use the background master switch to disable the effect itself.

Preset sources live in `gitpagelayouts/v2/layouts/` as `overrides.backgroundEffects`. `pnpm run layouts:sync` expands templates and compiles the same presets into the CLI package; existing themes do not acquire an animation implicitly.

### PDF documents

Read or download the [GitPageDocs project guide (PDF, English)](cli/content/assets/gitpagedocs-project-guide.pdf). The CLI includes this real PDF in each generated version under `en/gitpagedocs-project-guide.pdf`; the example route points all three languages to the English document.

Configure `site.pdf` with `enabled`, `previewEnabled`, `downloadEnabled` and `openInNewTabEnabled` (all default to `true`). The version config uses `routes-pdf`, `pdf.pathPdf` per language and `menus-header-pdf` with `page:23` for the bundled example. Route-level preview/download/new-tab options go inside `pdf`; `hierarchyPage.pdf` and `hierarchyMenu.pdf` order the content and menu sections.

```json
{ "id": 23, "pdf": { "pathPdf": { "en": "gitpagedocs/docs/versions/0.0.16/en/gitpagedocs-project-guide.pdf", "pt": "gitpagedocs/docs/versions/0.0.16/en/gitpagedocs-project-guide.pdf", "es": "gitpagedocs/docs/versions/0.0.16/en/gitpagedocs-project-guide.pdf" }, "previewEnabled": true, "downloadEnabled": true, "openInNewTabEnabled": true } }
```

The native browser viewer handles PDF previews and new tabs through validated `application/pdf` Blob URLs. Preview, download and new-tab actions all require CORS permission for external files. Opening a new tab does not navigate to the raw repository URL, so that server's Content-Type/Content-Disposition does not force a download. Browser PDF support and user preferences still apply. With preview disabled, the first download or new-tab action loads the PDF; cached bytes are reused. File/network errors and blocked pop-ups are reported without silently falling back to the raw URL.

PDF action icons are independent: `site.icons.PdfDownload` defaults to `LuDownload`, and `site.icons.PdfOpenInNewTab` defaults to `LuExternalLink`. For example, `"PdfDownload": { "reactIcon": false }` shows download text while the new-tab control remains an icon. The `site.pdf` and route `pdf` action flags control availability separately from appearance.

Next.js dev/build stages repository PDFs and supported native audio/video files from `gitpagedocs/` into public assets and respects the Pages subpath. Files outside that tree must already be in `frontend/public/` or available by HTTP(S). Remote repository routes resolve native media against the repository's raw-file URL. See the generated PDF documents and Paginated containers pages for complete examples.

### Multiple ordered content blocks

A version config can define `pages: [{ id: 39, blocks: [{ id: 'intro', type: 'md', routeId: 1 }, { id: 'repeat', type: 'md', routeId: 1 }] }]`. Use valid JSON with double quotes in the configuration. Block IDs are unique within a page; route references can repeat. The list order determines display order, independently of `hierarchyPage`. Supported types are `md`, `html`, `video`, `audio` and `pdf`; their sources and individual options remain in the corresponding `routes-*` arrays. Reference two route IDs pointing to the same file when two instances need different options.

The example at `gitpagedocs/docs/versions/0.0.10/config.json` and the current scaffold use one destination, `page:39`, containing three Markdown blocks, two HTML blocks, two videos, two audio tracks and three PDFs. See the generated Ordered content blocks guide for the complete JSON, access behavior and compatibility rules. Existing pages without this array retain their behavior.

Routes independently position their configured title and description through `layout.title` and `layout.description`: each accepts `placement: 'inside' | 'outside'` and `position: 'before' | 'after'`. Markdown always keeps configured labels outside its document while honoring before/after. Omitted layout preserves existing presentation. Existing visibility, alignment and CSS settings remain applicable.

### Paginated containers and Markdown markers

A Markdown, HTML, video, audio or PDF route can define `pagination.items: [{ routeId: 51 }, { routeId: 1 }]`, referencing routes of the same type in display order. Each container keeps an independent selection; item title/description language maps override the referenced route's metadata. Existing routes and ordered content blocks remain compatible. The bundled `page:50` demonstrates three Markdown files, two HTML pages, MP4/WebM video, two local WAV files and two PDFs.

`site.containerPagination` supplies shared defaults; route `pagination` overrides them. Defaults are enabled, bottom/right aligned, icon controls for first/previous/next/last, plus current/total count. Configure `alignment`, `placement`, `display`, `showCount`, individual `controls`, React Icons `icons`/`iconSize` and localized `labels`. Pagination also works in Markdown focus mode without closing it; Ctrl+K can open a container's available files. See `container-pagination.md` for complete options, access rules and examples.

`routes-md[].markdownMarkers.items` marks arbitrary visible Markdown text or elements using exactly one of `text` or `selector`, with a unique `id`, optional one-based `occurrence`, localized `label` and theme colors. Every valid marker highlights its target and adds an index link that scrolls there. `site.markdownMarkers` supplies shared enablement/styles; route and item options refine them. This does not replace `RouteGuideSpeciFicbrand`: an empty heading filter still includes all headings. Targets remain unique across repeated Markdown blocks, and source copy/download stays unchanged. See `markdown-markers.md` for translated examples and validation behavior.

### HTML containers and the DOOM example

The scaffold includes a local HTML demonstration whose outer documentation container supplies its title and description. The HTML itself contains only the externally hosted DOOM player, without duplicated prose or a custom load button. Game assets are not bundled. The wrapper is generated as `docs/versions/<version>/{en,pt,es}/doom.html`; the HTML containers guide explains sizing, external URLs and browser restrictions.

Keep both `routes-html` and `menus-header-html` in the version configuration. Menu paths must match the localized HTML paths; local HTML does not use a `page:29` alias. Merge this example with existing arrays:

```json
{
  "routes-html": [{
    "id": 29,
    "title": { "en": "DOOM: HTML example", "pt": "DOOM: exemplo HTML", "es": "DOOM: ejemplo HTML" },
    "description": { "en": "Load an interactive HTML demo", "pt": "Carregue uma demonstração HTML interativa", "es": "Carga una demostración HTML interactiva" },
    "titleIsVisible": true, "descriptionIsVisible": true, "container": "full",
    "path": { "en": "gitpagedocs/docs/versions/0.0.16/en/doom.html", "pt": "gitpagedocs/docs/versions/0.0.16/pt/doom.html", "es": "gitpagedocs/docs/versions/0.0.16/es/doom.html" }
  }],
  "menus-header-html": [{
    "id": 29,
    "en": { "title": "DOOM: HTML example", "path-click": "gitpagedocs/docs/versions/0.0.16/en/doom.html" },
    "pt": { "title": "DOOM: exemplo HTML", "path-click": "gitpagedocs/docs/versions/0.0.16/pt/doom.html" },
    "es": { "title": "DOOM: ejemplo HTML", "path-click": "gitpagedocs/docs/versions/0.0.16/es/doom.html" }
  }]
}
```

Select the HTML menu entry: the SDK loads when the page opens, and the native Play control starts the game. Internet access and a compatible browser are required. Bootstrap failures display an error asking you to reload the page. Only publish trusted HTML: the existing iframe permits scripts and same-origin content. Test keyboard access, mobile layout and the actual deployed Pages URL; external availability and framing policies remain controlled by the provider.
<!-- gitpagedocs:end -->
