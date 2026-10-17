# Themes and Layouts

Themes are JSON templates mapped by `layoutsConfig.json`.

## Strategy options

- Default mode (`npx @gitpagedocs/cli`): use official layouts/templates from the upstream repository.
- Local mode (`npx @gitpagedocs/cli --layoutconfig`): generate and use local templates from your repository.

## Local layout files

- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/layoutsFallbackConfig.json`
- `gitpagelayouts/templates/*.json`

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

## Choose and customize

Select an installed theme through the theme selector or configure `site.ThemeDefault` with its exact ID. `ThemeModeDefault` sets the initial light/dark mode. `HideThemeSelector` hides the selector; the selected theme still applies.

For your own repository, run the CLI with `--layoutconfig`, then edit the generated template and keep its ID consistent with `layoutsConfig.json`. A route's content and `site.icons` remain independent of the theme catalog. Use `currentColor` for icons that should inherit the active text color, or configure separate dark/light colors with sufficient contrast.

When contributing to Git Page Docs itself, the authoring source is `gitpagelayouts/v2/base.json` plus `gitpagelayouts/v2/layouts/<id>.json`. Run `pnpm layouts:sync` to regenerate templates and documentation. Direct edits to generated templates can be overwritten by that synchronization.

> Version: 0.0.9
