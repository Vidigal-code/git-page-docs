# Architecture

This project is organized by feature boundaries and UI runtime responsibilities.

## Main runtime modules

- `src/app/[[...repo]]/page.tsx`
  - route parser
  - static params generation
  - shell selection (docs shell vs repository search shell)
- `src/entities/docs/api/load-docs-data.ts`
  - local/remote config loading
  - version resolution
  - markdown fetch + parse pipeline
  - layouts + themes loading
- `src/widgets/docs-shell/docs-shell.tsx`
  - UI rendering
  - language/version/theme state
  - URL synchronization

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

> Version: 1.1.0
