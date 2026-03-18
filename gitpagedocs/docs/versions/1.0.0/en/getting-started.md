# Getting Started

This guide configures your repository from zero to running docs.

## Prerequisites

- Node.js 20+
- npm 10+

## Install and generate

1. Install package:
   - `npm install gitpagedocs`
2. Generate docs config and versions:
   - `npx gitpagedocs`
3. Optional: generate local layouts/templates:
   - `npx gitpagedocs --layoutconfig`

## Local run

1. Development:
   - `npm run dev`
2. Production locally:
   - `npm run build`
   - `npm start`

## CLI behavior

`npx gitpagedocs` generates only artifacts in `gitpagedocs/`:

- JSON + markdown docs assets
- No `index.html`
- No `index.js`
- No install command execution

## Repository search mode

Local repository search is controlled by:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true`
- `GITPAGEDOCS_REPOSITORY_SEARCH=false`

On GitHub Pages builds (`GITHUB_ACTIONS=true`), repository-search home is enabled.

## Troubleshooting

### Repository search does not work locally

- Set `GITPAGEDOCS_REPOSITORY_SEARCH=true` in `.env` (create it in project root if missing).
- Ensure the target repository contains `gitpagedocs/config.json`.
- Check that markdown paths in the target repo match its version config routes.

### Build fails or docs do not load

- Run `npm run lint` to catch config or path issues.
- Ensure `gitpagedocs/config.json` exists and has valid `VersionControl.versions`.
- Verify markdown files exist for each language (`en`, `pt`, `es`) in the version folders.

### Version path returns wrong or empty content

- Check `VersionControl.versions[*].path` in `gitpagedocs/config.json`.
- Ensure the version config has valid `routes` and `menus-header`.
- Regenerate with `npx gitpagedocs` to refresh artifacts.

## Next steps

- **Configuration and deployment**: See **Functionalities** for `config.json` keys, self-hosted GitHub Pages, and npm publish.
- **Deploy to GitHub Pages**: Run `npx gitpagedocs --push --owner <user> --repo <repo>` to create the workflow, commit artifacts, and push.

> Version: 1.0.0
