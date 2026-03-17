# Git Page Docs

`gitpagedocs` is a CLI and runtime contract for repository documentation.

It generates and maintains a `gitpagedocs/` folder with config and versioned markdown files.  
It does **not** generate `index.html` or `index.js`.

## Quick Start

Install in your project:

```bash
npm install gitpagedocs
```

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

- `gitpagedocs/config.json` is generated with official layout source enabled.
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

Set `gitpagedocs/config.json` `site.rendering` to your GitHub Pages URL:

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
  - `npx gitpagedocs --push --owner your-user --repo your-repository` — docs at `https://<owner>.github.io/<repo>/v/<version>/`
  - `npx gitpagedocs --push --owner your-user --repo your-repository --path docs` — docs at `https://<owner>.github.io/<repo>/docs/v/<version>/`
  - This creates `.github/workflows/gitpagedocs-pages.yml`, sets `site.rendering`, commits generated artifacts, and pushes to `origin`.
  - The generated workflow clones the official `git-page-docs` runtime in CI, injects your `gitpagedocs/` folder, builds, and deploys to your GitHub Pages URL.
  - Root URL redirects to docs entrypoint (`/v/<version>`), so `https://<owner>.github.io/<repo>/` opens docs directly.
  - The workflow trigger uses your current git branch automatically.
  - After push, CLI also attempts to switch repository Pages source to **GitHub Actions** using `gh api` (if GitHub CLI is available and authenticated).

When built with `GITHUB_ACTIONS=true`, the runtime enables GitHub Pages behavior.

## Generated Structure

Default mode:

```text
gitpagedocs/
  config.json
  docs/
    versions/
      1.0.0/config.json
      1.0.0/{en,pt,es}/*.md
      1.1.0/config.json
      1.1.0/{en,pt,es}/*.md
      1.1.1/config.json
      1.1.1/{en,pt,es}/*.md
```

Local layout mode adds:

```text
gitpagedocs/layouts/
  layoutsConfig.json
  layoutsFallbackConfig.json
  templates/*.json
```

## Configuration Keys (Layout Source)

Main layout source keys in `gitpagedocs/config.json`:

- `layoutsConfigPathOficial`
- `layoutsConfigPathOficialUrl`
- `layoutsConfigPathTemplatesOficial`
- `layoutsConfigPath`
- `layoutsConfigPathTemplates`

Behavior:

- If `layoutsConfigPathOficial=true`, runtime prefers official layout/template sources.
- If `layoutsConfigPathOficial=false`, runtime prefers your repository layout/template sources (`gitpagedocs/layouts/**` or your custom paths).

## Repository Search Behavior

Repository search is controlled by environment/runtime context:

- GitHub Pages builds (`GITHUB_ACTIONS=true`): repository-search home enabled.
- Local runtime: controlled by `GITPAGEDOCS_REPOSITORY_SEARCH=true|false`.

Recommended for local testing:

```env
GITPAGEDOCS_REPOSITORY_SEARCH=true
```

## Scripts

- `npm run gitpagedocs` -> runs `node scripts/gitpagedocs-init.mjs`
- `npm run gitpagedocs:full` -> compatibility alias for the same generator
- `npm run gitpagedocs:home` -> generates `gitpagedocshome/` (static site + .env + Dockerfile + README)
- `npm run build` -> generate `gitpagedocs/` + `next build`
- `npm run build:prebuilt` -> generate + build + copy `out/` to `prebuilt/`
- `npm run dev` -> `next dev`
- `npm run start` -> `next start` (after `prestart` build)
- `npm run lint` -> `eslint .`

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
| `file` | path (with `mdfull` or `htmlfull`) | File to show in fullscreen |
| `videofull` | `en`, `pt`, `es` | Video fullscreen mode |
| `slug` | video slug (with `videofull`) | Video identifier |
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

**HTML pages** (by slug; pages combine MD + HTML when they share the same route id)

- Getting Started (HTML):  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&name=getting-started  
- Source code viewer:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&name=source-viewer  

**Video pages** (route id 1–4; pages combine MD + HTML + Video by id)

- Video 1:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?lang=en&menu=en&id=1  

**Fullscreen modes**

- Markdown fullscreen:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?mdfull=en&file=gitpagedocs/docs/versions/1.0.0/en/getting-started.md  
- HTML fullscreen:  
  https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-docs/v/1.0.0/?htmlfull=en&file=gitpagedocs/docs/versions/1.0.0/en/source-viewer.html  
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

## Compatibility Flags

Supported for compatibility:

- `--build`
- `--serve`
- `--full`
- `--push` (setup + workflow + git push automation)
- `--path <subpath>` (optional; put docs under a subpath, e.g. `docs` or `git-page-docs`)
- `--home` (standalone distribution in `gitpagedocshome/` with static site, `.env`, `Dockerfile`, and `README`)

With `--home`, output is `gitpagedocshome/` instead of `gitpagedocs/`. Otherwise, output remains `gitpagedocs/`.
