# Git Page Docs

`gitpagedocs` is a CLI and runtime contract for repository documentation.

It generates and maintains a `gitpagedocs/` folder with config and versioned markdown files.  
It does **not** generate `index.html` or `index.js`.

## Table of Contents

- [Project Architecture (Monorepo)](#project-architecture-monorepo)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Layout Strategy](#layout-strategy)
- [Use Official Site or Your Own GitHub Pages](#use-official-site-or-your-own-github-pages)
- [Self-Hosted GitHub Pages Setup](#self-hosted-github-pages-setup)
- [Generated Structure](#generated-structure)
- [Configuration Keys](#configuration-keys-layout-source)
- [Version selector visibility](#version-selector-visibility)
- [Repository Search Behavior](#repository-search-behavior)
- [Scripts](#scripts)
- [URL Routes and Query Parameters](#url-routes-and-query-parameters)
- [Authorized Routes](#authorized-routes)
- [CLI Options](#cli-options)
- [AI CLI (interactive docs generator)](#ai-cli-interactive-docs-generator)
- [Configuration File Format](#configuration-file-format)
- [License](#license)

## Project Architecture (Monorepo)

`git-page-docs` is a **pnpm + turborepo monorepo**. All business logic lives in one shared core (`tools/`); the frontend, CLI, and MCP server are thin consumers of it.

```text
git-page-docs/
├── frontend/     # Next.js 15 docs viewer (static export) — see frontend/README.md
├── cli/          # Hexagonal CLI, published as the `gitpagedocs` npm bin
├── mcp/          # Model Context Protocol server (@gitpagedocs/mcp)
├── tools/        # @gitpagedocs/tools — the ONLY home for shared business logic
├── gitpagedocs/  # User contract: config + versioned docs + layouts (kept stable)
├── e2e/          # Playwright end-to-end specs
└── tsconfig.base.json · turbo.json · pnpm-workspace.yaml · vitest.config.ts
```

| Area | Package | Responsibility |
| --- | --- | --- |
| **frontend/** | root pkg | Next.js App Router docs viewer: multi-version / multi-language docs, 36-theme layouts, the in-docs AI chat drawer, and the `/ai` console. Built via `next build frontend` and static-exported to `out/` for GitHub Pages. |
| **cli/** | `gitpagedocs` (`bin`) | Hexagonal CLI (`@clack/prompts`) that scaffolds `gitpagedocs/`, generates docs with AI, configures GitHub Pages, and launches the MCP server. |
| **mcp/** | `@gitpagedocs/mcp` | MCP server (SDK 1.29): 20 tools + 7 resources for repository analysis and AI doc generation, all delegating to `tools/`. |
| **tools/** | `@gitpagedocs/tools` | Shared core: 14-provider AI system (registry/factory, no switch chains), encrypted credential vault (AES-256-GCM) + password gate, logger with secret redaction, caches, config loader, filesystem + documentation services. Browser-safe subpath exports (`./ai`, `./crypto/web`, `./security/web`, …). |
| **gitpagedocs/** | — | The user-facing contract: `config.{json,js,ts}`, `docs/versions/**`, `layouts/**`. Never broken by refactors. |

### Security: encrypted AI credentials

API keys are never stored in plaintext. Both the `/ai` console and the in-docs chat drawer gate access behind a **local password** that derives (PBKDF2) an AES-256-GCM key; keys are encrypted at rest in `localStorage` and decrypted only for the session. Any legacy plaintext key is migrated into the vault and wiped on first unlock.

### Tooling

- **pnpm workspaces** + **turborepo** for builds/tests across packages
- Shared **`tsconfig.base.json`**; `npm run typecheck` covers cli / frontend / tools / mcp
- **Vitest** unit + integration (coverage on `tools/src`) and **Playwright** E2E (`e2e/`)
- A **smoke + byte-baseline** harness (`npm run smoke:all`) guards every legacy CLI contract
- **GitHub Actions**: CI (`ci.yml`) + GitHub Pages deploy (`gitpagedocs-pages.yml`)

> The sections below document the published `gitpagedocs` CLI and its runtime contract. For frontend-specific development (the Next.js viewer), see [`frontend/README.md`](frontend/README.md).

## Prerequisites

- **Node.js** 18+ (recommended 20+)
- **npm** 9+

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
npx gitpagedocs
```

Generate docs plus local layout templates:

```bash
npx gitpagedocs --layoutconfig
```

Generate docs, configure GitHub Pages URL, create workflow, and push:

```bash
npx gitpagedocs --push --owner your-user --repo your-repository
```

Docs deploy at the repository root, e.g. `https://your-user.github.io/your-repository/v/1.0.0/?lang=en`.

Optional `--path` to serve docs in a subpath (e.g. `docs` or `git-page-docs`):

```bash
npx gitpagedocs --push --owner your-user --repo your-repository --path docs
```

Then docs are at `https://your-user.github.io/your-repository/docs/v/1.0.0/?lang=en`.

Shortcut syntax also supported:

```bash
npx gitpagedocs --push --your-user --your-repository
```

### Standalone home distribution (`npx gitpagedocs --home`)

Generates a self-contained `gitpagedocshome/` folder with:

- Static export of the docs (ready for `npx serve .`)
- Pre-configured `.env`
- `Dockerfile` for container deployment
- `README.md` with usage instructions

```bash
npx gitpagedocs --home
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

### 1) Default mode (`npx gitpagedocs`)

- `gitpagedocs/config.json` (or `config.js` / `config.ts`) is generated with official layout source enabled.
- Layouts/templates are loaded from the official repository URLs:
  - `https://github.com/Vidigal-code/git-page-docs/tree/main/gitpagedocs/layouts`
- Best option if you want to focus only on writing docs.

### 2) Local layout mode (`npx gitpagedocs --layoutconfig`)

- Generates local files in `gitpagedocs/layouts/**`:
  - `layoutsConfig.json`
  - `layoutsFallbackConfig.json`
  - `templates/*.json`
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
npx gitpagedocs
```

Or, if you want local templates:

```bash
npx gitpagedocs --layoutconfig
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

```bash
npm run lint
npm run build
npm start
```

### 4) Publish with GitHub Pages

- Push your repository to GitHub.
- Enable Pages for your repository (Settings -> Pages).
- Use the repository workflow to build/deploy static output.
- Optional one-command bootstrap:
  - `npx gitpagedocs --push --owner your-user --repo your-repository` — docs at `https://<owner>.github.io/<repo>/<repo>/v/<version>/?lang=en` (e.g. `https://vidigal-code.github.io/energy-bill-ai-parser/energy-bill-ai-parser/v/1.0.0/?lang=en`); root redirects there; base path uses repo name so CSS/JS load correctly
  - `npx gitpagedocs --push --owner your-user --repo your-repository --path docs` — docs at `https://<owner>.github.io/<repo>/docs/v/<version>/`
  - This creates `.github/workflows/gitpagedocs-pages.yml`, sets `site.rendering`, commits generated artifacts, and pushes to `origin`.
  - The generated workflow clones the official `git-page-docs` runtime in CI, injects your `gitpagedocs/` folder, builds, and deploys to your GitHub Pages URL.
  - The workflow trigger uses your current git branch automatically.
  - After push, CLI also attempts to switch repository Pages source to **GitHub Actions** using `gh api` (if GitHub CLI is available and authenticated).

When built with `GITHUB_ACTIONS=true`, the runtime enables GitHub Pages behavior.

## Generated Structure

Default mode:

```text
gitpagedocs/
  config.json
  icon.svg
  docs/
    versions/
      1.0.0/config.json
      1.0.0/{en,pt,es}/*.md
      1.0.0/{en,pt,es}/source-viewer      # Source code viewer (GitHub-style)
      1.1.0/...
      1.1.1/...
```

Local layout mode adds:

```text
gitpagedocs/layouts/
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
- If `layoutsConfigPathOficial=false`, runtime prefers your repository layout/template sources (`gitpagedocs/layouts/**` or your custom paths).

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

## Scripts

- `npm run gitpagedocs` — runs `node cli/index.mjs` (generate config and docs)
- `npm run gitpagedocs:full` — compatibility alias for the same CLI
- `npm run gitpagedocs:home` — generates `gitpagedocshome/` (static site + .env + Dockerfile + README)
- `npm run build` — generate `gitpagedocs/` + copy icon to `public/` + `next build`
- `npm run build:prebuilt` — generate + build + copy `out/` to `prebuilt/`
- `npm run dev` — `next dev`
- `npm run start` — `node cli/start.mjs` (spawns `next start`; runs after `prestart` build)
- `npm run lint` — `eslint .`
- `npm run clean` — remove `.next/`

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
| `version` | e.g. `1.0.0` | Version (alternative to path) |
| `menu` | `en`, `pt`, `es` | Language for path resolution (use with `id` or `name`) |
| `id` | route id (e.g. `1`, `2`) | Navigate to page by route id |
| `name` | slug (e.g. `getting-started`) | Navigate to page by filename slug |
| `mdfull` | `en`, `pt`, `es` | Markdown fullscreen mode |
| `htmlfull` | `en`, `pt`, `es` | HTML fullscreen mode |
| `file` | path (with `mdfull` or `htmlfull`) | File to show in fullscreen |
| `videofull` | `en`, `pt`, `es` | Video fullscreen mode |
| `audiofull` | `en`, `pt`, `es` | Audio fullscreen mode |
| `slug` | video/audio slug (with `videofull` or `audiofull`) | Video/audio identifier |
| `#heading-id` | anchor | Scroll to heading in markdown |

### Example URLs (git-page-docs, English)

**Markdown pages**

- Getting Started (v1.0.0, aurora-dark theme):  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&theme=aurora-dark&menu=en&id=1  
- Project overview:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&id=2  
- GitHub issues and projects:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&id=3  
- Introduction to Git:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&id=4  

**By slug (`name`)**

- Getting Started:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&name=getting-started  
- Project overview:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&name=project-overview  

**HTML pages** (by slug)

- Source code viewer:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&name=source-viewer  

**Video pages** (route id 1–4; pages combine MD + HTML + Video by id)

- Video 1:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&id=1  

**Fullscreen modes**

- Markdown fullscreen:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?mdfull=en&file=gitpagedocs/docs/versions/1.0.0/en/getting-started.md  
- HTML fullscreen:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?htmlfull=en&file=gitpagedocs/docs/versions/1.0.0/en/source-viewer  
- Video fullscreen:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?videofull=en&id=1  

**Theme selection**

- aurora-dark (default dark):  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?theme=aurora-dark  
- aurora-light:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?theme=aurora-light  

**Other versions**

- v1.1.0:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.1.0/?lang=en&theme=aurora-dark  
- v1.1.1:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.1.1/?lang=en&theme=aurora-dark  

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
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--owner <user>` | GitHub owner (e.g. `Vidigal-code`) |
| `--repo <repo>` | GitHub repository (e.g. `git-page-docs`) |
| `--path <subpath>` | Subpath for docs (e.g. `docs`); without it, base path = repo name for correct asset loading on project sites |
| `--output <dir>` | Output directory (default: `gitpagedocs` or `gitpagedocshome` with `--home`) |
| `--search true\|false` | Enable/disable repository search (mainly for `--home`) |
| `--layoutconfig` | Generate local layout templates in `gitpagedocs/layouts/` |
| `--push` | Create workflow, commit artifacts, push to origin |
| `--home` | Standalone distribution in `gitpagedocshome/` (static site + .env + Dockerfile + README) |
| `--interactive` / `-i` | Run in interactive mode (prompts for options) |
| `ai` or `--ai` | Interactive AI documentation mode (paths, provider, API key/base URL, multilingual output) |
| `--build` | Compatibility flag (no change to output) |
| `--serve` | Compatibility flag |
| `--full` | Compatibility flag |

Shortcut syntax: `npx gitpagedocs --push --<owner> --<repo>` (e.g. `--Vidigal-code --git-page-docs`) is equivalent to `--owner <owner> --repo <repo>`.

With `--home`, output is `gitpagedocshome/` (or `--output` value). Otherwise, output remains `gitpagedocs/` (or `--output` value).

## AI CLI (interactive docs generator)

Run:

```bash
npx gitpagedocs ai
```

This mode provides:

- provider selection (`openai`, `claude`, `gemini`, `ollama`)
- API key / base URL input
- path input (supports multiple paths and cross-repo paths)
- multilingual markdown generation (`pt`, `en`, `es`)
- optional `.gitpagedocsconfig` persistence for manual reuse
- interactive fallback when directories are missing (fix/skip/abort)

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

You can run manually with a persisted config in repository root:

```json
{
  "version": 1,
  "ai": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apiKey": "<YOUR_API_KEY>",
    "paths": ["src", "cli", "../another-repo/src"],
    "languages": ["pt", "en", "es"],
    "outputDir": "gitpagedocs/docs",
    "filePrefix": "ai-generated",
    "contextPrompt": "Você é um redator técnico sênior..."
  }
}
```

For Ollama, use `baseUrl` instead of `apiKey`.

## Documentation password gate

Protect the whole documentation site behind a password:

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

## Configuration File Format

Runtime supports three config file formats (in order of precedence):

- `gitpagedocs/config.json`
- `gitpagedocs/config.js` (CommonJS `module.exports` or ESM `export default`)
- `gitpagedocs/config.ts` (TypeScript; exports default object)

## License

ISC. See [repository](https://github.com/Vidigal-code/git-page-docs) for details.

<!-- gitpagedocs:start -->
### Supported AI providers (14)

| Provider | ID | Default model | Capabilities |
| --- | --- | --- | --- |
| OpenAI | `openai` | `gpt-4o-mini` | stream, vision |
| Anthropic | `anthropic` | `claude-sonnet-4-6` | stream, vision |
| Google Gemini | `gemini` | `gemini-2.0-flash` | stream, vision, audio |
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
- `gitpagedocs document[:repo|:file|:folder]` — generate documentation with AI in the gitpagedocs pattern
- `gitpagedocs password` — set a documentation access password (writes the public key to config.json)
- `gitpagedocs deploy | pages` — configure GitHub Pages via Actions and push
- `gitpagedocs doctor` — diagnose the environment
- `gitpagedocs mcp start` — start the MCP server over stdio
- `gitpagedocs version` — print the CLI version
- `gitpagedocs update` — show how to update the CLI
<!-- gitpagedocs:end -->
