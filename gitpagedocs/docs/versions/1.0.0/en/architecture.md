# Architecture

This project uses a modular architecture to keep rendering, theme loading and UI concerns isolated.

## Core layers

- `src/app`: Next.js routes and application shell.
- `src/entities/docs`: data models and loading logic.
- `src/widgets/docs-shell`: UI composition, menu behavior and interactions.

## Rendering flow

1. `gitpagedocs/config.json` is loaded.
2. Language routes are resolved.
3. Markdown content is fetched (local or remote) and transformed to HTML.
4. Layout/theme tokens are loaded.
5. UI renders with responsive desktop/mobile behavior.

## Runtime behavior

- Local mode prefers files in `public/layouts`.
- Production can load remote repo config/layouts/templates.
- If none are found, fallback themes in `gitpagedocs/layouts` are used.
