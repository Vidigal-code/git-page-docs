# Architecture

A pnpm + turborepo monorepo where all business logic lives in one shared core (`tools/`); the frontend, CLI, and MCP server are thin consumers of it.

## Packages

- **frontend/** — Next.js viewer (Feature-Sliced: `app / widgets / features / entities / shared`); static export.
- **cli/** — the published `gitpagedocs` bin (hexagonal: `presentation / application / domain / infrastructure`) + `cli/ai/` (the AI documentation CLI).
- **tools/** — `@gitpagedocs/tools`: `ai/ security/ crypto/ cache/ config/ logger/ errors/ filesystem/ documentation/ i18n/ ports/`.
- **mcp/** — `@gitpagedocs/mcp`: MCP tools + resources delegating to `tools/`.

## Main runtime modules (frontend)

- `frontend/src/app/[[...repo]]/page.tsx` — route parser, static params, shell selection (docs vs repository-search).
- `frontend/src/entities/docs/api/load-docs-data.ts` — local/remote config loading, version resolution, markdown parse, layouts + themes.
- `frontend/src/widgets/docs-shell/docs-shell.tsx` — UI rendering, language/version/theme state, URL sync, AI chat drawer mount.

## Security: encrypted AI credentials

The `/ai` console and the chat drawer gate access behind a local password that derives (PBKDF2) an AES-256-GCM key; keys live encrypted in `localStorage` and are decrypted only for the session (`@gitpagedocs/tools/security`).

## Data flow

1. Request route arrives (`/owner/repo/v/x.y.z` or local equivalent)
2. Config is resolved (local or remote repo)
3. Version config overrides base routes/menus
4. Markdown is loaded and converted to HTML
5. Layout template is resolved and CSS vars applied
6. Shell renders content + controls

## Reliability points

- fallback strategy for layout/template loading
- resilient markdown loading per language
- localStorage sync for user language/version/theme

> Version: 0.0.16
