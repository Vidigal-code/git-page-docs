# Getting Started

This guide configures the project from zero to running docs.

## Prerequisites

- Node.js 20+
- npm 10+ (or pnpm if preferred)

## Local setup

1. Install dependencies:
   - `npm install`
2. Generate/update docs assets:
   - `npm run gitpagedocs`
3. Start development:
   - `npm run dev`
4. Build + run production locally:
   - `npm run build`
   - `npm start`

## CLI behavior

`npx gitpagedocs` (or `npm run gitpagedocs`) generates docs assets in the official `gitpagedocs/` folder.

- Generates only markdown/json artifacts
- Does not generate `index.html`
- Does not generate `index.js`
- Does not run install commands

## Repository search mode

Local repository search is controlled by environment variable:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true`
- `GITPAGEDOCS_REPOSITORY_SEARCH=false`

On GitHub Pages builds (`GITHUB_ACTIONS=true`), repository search is always enabled.
