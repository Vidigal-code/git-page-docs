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

Shortcut syntax also supported:

```bash
npx gitpagedocs --push --your-user --your-repository
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
  - `npx gitpagedocs --push --owner your-user --repo your-repository`
  - This creates `.github/workflows/gitpagedocs-pages.yml`, sets `site.rendering`, commits generated artifacts, and pushes to `origin`.
  - The generated workflow is self-sufficient: it clones the official `git-page-docs` runtime in CI, injects your `gitpagedocs/` folder, builds with your repository path, and deploys to your own GitHub Pages URL.
  - In `--push` mode, root URL opens docs directly (search home is disabled via `site.repositorySearchHome=false`).
  - The workflow trigger is generated for your current git branch automatically, so it works in repositories that do not use `main`.
  - After push, CLI also attempts to switch repository Pages source to **GitHub Actions** automatically using `gh api` (if GitHub CLI is available and authenticated).

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
- `npm run build` -> generate `gitpagedocs/` + `next build`
- `npm run build:prebuilt` -> generate + build + copy `out/` to `prebuilt/`
- `npm run dev` -> `next dev`
- `npm run start` -> `next start` (after `prestart` build)
- `npm run lint` -> `eslint .`

## Compatibility Flags

Supported for compatibility:

- `--build`
- `--serve`
- `--full`
- `--push` (setup + workflow + git push automation)

These flags do not change the artifact type. Output remains `gitpagedocs/`.
