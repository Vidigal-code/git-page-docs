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

> Version: 1.1.0
