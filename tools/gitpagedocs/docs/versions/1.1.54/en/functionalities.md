# Functionalities

Complete reference of CLI options, configuration keys, and runtime features.

## CLI commands

| Command | Description |
|---------|--------------|
| `gitpagedocs` | Generate config and docs in `gitpagedocs/` |
| `gitpagedocs --layoutconfig` | Also generate local layouts/templates |
| `gitpagedocs --home` | Standalone distribution (`gitpagedocshome/`) |
| `gitpagedocs --push --owner X --repo Y` | Setup workflow, commit, push |
| `gitpagedocs --interactive` / `-i` | Interactive mode with prompts |
| `gitpagedocs ai` | Interactive AI documentation generator |
| `gitpagedocs provider [id]` / `models [provider]` | List AI providers / catalog models |
| `gitpagedocs document[:repo\|:file\|:folder]` | Generate documentation with AI |
| `gitpagedocs deploy` / `pages [actions\|deploy]` | Configure GitHub Pages via Actions + push |
| `gitpagedocs docs` | Refresh README/CONTRIBUTING/SECURITY managed regions |
| `gitpagedocs doctor` / `version` / `update` | Diagnostics / version / update hint |
| `gitpagedocs mcp start` | Start the MCP server over stdio |

Install globally with `npm install -g gitpagedocs`, or run one-off with `npx gitpagedocs`.

## CLI options

| Option | Description |
|--------|-------------|
| `--owner <user>` | GitHub owner |
| `--repo <repo>` | GitHub repository |
| `--path <subpath>` | Docs subpath (e.g. `docs`); without it, base path = repo name for correct CSS/JS on project sites |
| `--output <dir>` | Output directory (default: `gitpagedocs`) |
| `--search true|false` | Enable/disable repository search (`--home`) |
| `--layoutconfig` | Generate `gitpagedocs/layouts/` |
| `--push` | Create workflow, commit artifacts, push |
| `--home` | Generate `gitpagedocshome/` (static + .env + Dockerfile) |

## Generated output

- `gitpagedocs/config.json` – root config
- `gitpagedocs/icon.svg` – default icon
- `gitpagedocs/docs/versions/<ver>/config.json` – per-version routes
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md` – markdown docs
- `gitpagedocs/layouts/` – only with `--layoutconfig`

## Content types

| Type | Config key | Description |
|------|------------|-------------|
| Markdown | `routes-md` | .md files with `path` per language |
| HTML | `routes-html` | local `path` or external `url` |
| Video | `routes-video` | `video.pathVideo`, `video.videoType` |
| Audio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |

## Source code viewer

The version config can render a **Source code** container through `routes-source-viewer` and `menus-header-source-viewer`. The viewer reads GitHub repository trees at runtime and applies the current documentation theme.

- Repository tree from `source-viewer-path`; branch defaults to `main`
- Folder navigation and file filtering
- GitHub-style directory listing
- Code rendering with line numbers
- Markdown preview/code toggle, including `README.md`
- Collapsible folders in the sidebar

## Config keys (site)

- `name`, `defaultLanguage`, `supportedLanguages`
- `docsVersion`, `rendering`, `ThemeDefault`, `ThemeModeDefault`
- `ProjectLink`, `layoutsConfigPathOficial`, `layoutsConfigPath`

## Environment variables

- `GITPAGEDOCS_REPOSITORY_SEARCH` – repository search (local)
- `GITHUB_ACTIONS` – GitHub Pages build mode

## AI assistant

The docs ship an AI assistant in two surfaces: an in-docs **chat drawer** (the ✨ button in the sidebar, enabled via `site.AiChatEnabled`) and a dedicated **`/ai` console** page.

- **14 providers** via one shared core: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure OpenAI, Mistral, DeepSeek, Cohere, Groq, xAI, Together, Fireworks, Perplexity.
- **Model selection** — pick from each provider's catalog (`gitpagedocs models <provider>`) or type a custom id.
- **Encrypted at rest** — your API key is sealed with AES-256-GCM behind a **local password** (one unlock per session) and is never stored in plaintext or logged. A legacy plaintext key is migrated and wiped on first unlock.
- **AI documentation generation** — `gitpagedocs ai` scans chosen paths and writes multilingual markdown (pt/en/es); reusable via `.gitpagedocsconfig`.

## MCP server

`gitpagedocs mcp start` runs a Model Context Protocol server (stdio) exposing **20 tools** (filesystem, AI, doc generation/analysis) and **7 resources** (`project://structure|docs|config|repository|readme|ai/providers|ai/models`) for editors and AI agents.

> Version: 1.1.54
