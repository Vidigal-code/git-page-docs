# Functionalities

Complete reference of CLI options, configuration keys, and runtime features.

## CLI commands

| Command | Description |
|---------|--------------|
| `npx gitpagedocs` | Generate config and docs in `gitpagedocs/` |
| `npx gitpagedocs --layoutconfig` | Also generate local layouts/templates |
| `npx gitpagedocs --home` | Standalone distribution (`gitpagedocshome/`) |
| `npx gitpagedocs --push --owner X --repo Y` | Setup workflow, commit, push |
| `npx gitpagedocs --interactive` / `-i` | Interactive mode with prompts |

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
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer` – GitHub-style source code viewer
- `gitpagedocs/layouts/` – only with `--layoutconfig`

## Content types

| Type | Config key | Description |
|------|------------|-------------|
| Markdown | `routes-md` | .md files with `path` per language |
| HTML | `routes-html` | `path` (e.g. source-viewer) or `url` for external |
| Video | `routes-video` | `video.pathVideo`, `video.videoType` |
| Audio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |

## Source code viewer

The CLI generates a **Source code** page per version. It scans `src/`, `cli/`, and root files (README.md, package.json, next.config.ts, etc.) and builds a GitHub-style dark viewer with:

- File tree sidebar with folder collapse/expand
- Search filter for files
- Syntax highlighting (TypeScript, JavaScript, JSON, CSS, Markdown)
- Copy button, line numbers
- README.md preview/code toggle
- Expand all / Collapse all controls

## Config keys (site)

- `name`, `defaultLanguage`, `supportedLanguages`
- `docsVersion`, `rendering`, `ThemeDefault`, `ThemeModeDefault`
- `ProjectLink`, `layoutsConfigPathOficial`, `layoutsConfigPath`

## Environment variables

- `GITPAGEDOCS_REPOSITORY_SEARCH` – repository search (local)
- `GITHUB_ACTIONS` – GitHub Pages build mode

> Version: 1.1.0
