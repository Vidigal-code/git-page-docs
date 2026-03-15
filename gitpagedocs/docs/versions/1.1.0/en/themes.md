# Themes and Layouts

Themes are JSON templates mapped by `layoutsConfig.json`.

## Strategy options

- Default mode (`npx gitpagedocs`): use official layouts/templates from the upstream repository.
- Local mode (`npx gitpagedocs --layoutconfig`): generate and use local templates from your repository.

## Local layout files

- `gitpagedocs/layouts/layoutsConfig.json`
- `gitpagedocs/layouts/layoutsFallbackConfig.json`
- `gitpagedocs/layouts/templates/*.json`

## Template model

Each template usually includes:

- `id`, `name`, `author`, `version`
- `mode` + dark/light pairing metadata
- `colors`
- `typography`
- `components`
- `animations`

## Runtime behavior

- Active theme is resolved from config/user selection.
- Light/dark toggle resolves paired theme via reference.
- CSS variables are generated from template tokens.
- Runtime includes fallback behavior if a source is unavailable.

> Version: 1.1.0
