# Git Page Docs

Git Page Docs is a `Next.js` documentation app and scaffolding CLI for multi-language markdown documentation (`en`, `pt`, `es`) with themeable layouts.

## Features

- Multi-language docs from `gitpagedocs/config.json`
- Theme system with layout templates (`light`/`dark` support)
- Repository search mode with URL format `/{owner}/{repo}`
- Version selector and version-aware routes
- Responsive UI for desktop/mobile
- Keyboard navigation (`Ctrl+K`) and focus reading mode

## Getting Started

```bash
npm install
npm run gitpagedocs
npm run dev
```

Open: `http://localhost:3000`

## CLI

Run:

```bash
npm run gitpagedocs
```

This command creates or updates:

- `gitpagedocs/config.json`
- `gitpagedocs/docs/**` (base docs and versioned docs)
- `gitpagedocs/layouts/**` (fallback themes)
- `public/layouts/layoutsConfig.json`
- `public/layouts/templates/*.json`

## Repository Search Mode

In `gitpagedocs/config.json`:

- Set `RendertoanyRepositoryviaSearch: true` to enable remote repository lookup.
- The home route shows a centered search page with:
  - owner input
  - repository input
  - language selector
  - theme controls (when available)

Example URL:

`https://vidigal-code.github.io/git-page-docs/Vidigal-code/git-page-link-create`

If the target repository does not contain `gitpagedocs/config.json`, the app renders a themed fallback page with a localized message and language selector (`en`, `pt`, `es`).

## Theme Behavior

- `HideThemeSelector: false` shows the theme selector.
- `HideThemeSelector: true` keeps `ThemeDefault`.
- If the active theme supports mode pairs, the dark/light toggle appears.
- If not, the mode toggle is hidden.

## Deploy to GitHub Pages

This repository includes `/.github/workflows/deploy.yml` for GitHub Pages deployment.

### One-time setup

1. Go to repository **Settings** -> **Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main`

The workflow builds and deploys to:

- [https://vidigal-code.github.io/git-page-docs/](https://vidigal-code.github.io/git-page-docs/)

## Local Validation

```bash
npm run lint
npm run build
```
