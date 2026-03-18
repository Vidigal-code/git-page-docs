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

## Configuration

Runtime configuration lives in `gitpagedocs/config.json`.

### `site` section

| Key | Description |
|-----|-------------|
| `name` | Site name |
| `defaultLanguage` | Default UI language (`en`, `pt`, `es`) |
| `supportedLanguages` | Array of supported languages |
| `docsVersion` | Default docs version |
| `rendering` | GitHub Pages URL for self-hosted |
| `ThemeDefault` | Default theme id |
| `ThemeModeDefault` | Default mode (`dark`/`light`) |
| `ProjectLink` | Project/repo link |

### Layout source keys

| Key | Description |
|-----|-------------|
| `layoutsConfigPathOficial` | `true` = use official layouts; `false` = use local |
| `layoutsConfigPath` | Local layouts config path |

### `VersionControl` section

`VersionControl.versions` defines per-version: `id`, `path`, optional metadata.

## Deployment

1. **Official viewer site**: `https://vidigal-code.github.io/git-page-docs/` – provide owner + repository to load docs.
2. **Self-hosted GitHub Pages**: Generate with `npx gitpagedocs`, set `site.rendering` to your Pages URL, build and deploy via workflow.

## Architecture

Main runtime modules: Route parser (`src/app/[[...repo]]/page.tsx`), Load docs (`src/entities/docs/api/load-docs-data.ts`), Docs shell (`src/widgets/docs-shell/docs-shell.tsx`). Data flow: request → config → version → markdown → layout → shell.

## Themes and layouts

Themes are JSON templates in `layoutsConfig.json`. Default mode uses official layouts; Local mode (`--layoutconfig`) uses `gitpagedocs/layouts/`.

## FAQ

### Why are remote repositories not opening locally?

Check: `GITPAGEDOCS_REPOSITORY_SEARCH=true` in `.env`; target repo has `gitpagedocs/config.json`; markdown paths match routes config.

### Why does a version path return wrong content?

Check: `VersionControl.versions[*].path` in config; version config has valid `routes` and `menus-header`; markdown files exist per language.

### Why does theme selection not apply correctly?

Check: `layoutsConfig.json` references valid templates; template ids are unique; selected theme exists in loaded themes map.

### Why can GitHub Pages behave differently from local?

GitHub Pages build mode enables repository-search home and static-export specific behavior.

## Environment variables

| Variable | Description |
|----------|-------------|
| `GITPAGEDOCS_REPOSITORY_SEARCH` | Enable/disable remote repository search (local) |
| `GITHUB_ACTIONS` | GitHub Pages build mode |

> Version: 1.1.0
