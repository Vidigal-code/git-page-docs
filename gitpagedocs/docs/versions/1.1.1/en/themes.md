# Themes and Layouts

Themes are JSON templates mapped by `layoutsConfig.json`.

## Files

- `gitpagedocs/layouts/layoutsConfig.json`
- `gitpagedocs/layouts/layoutsFallbackConfig.json`
- `gitpagedocs/layouts/templates/*.json`

## Template model

Each template usually contains:

- `id`, `name`, `author`, `version`
- `mode` and dark/light pair metadata
- `colors`
- `typography`
- `components` tokens
- `animations`

## Runtime behavior

- Active theme id comes from config/user selection
- Light/dark toggle resolves paired theme by reference id
- CSS custom properties are generated from template tokens

## Good practices

- keep color contrast accessible
- keep spacing and radius scales consistent
- define both dark and light variants when possible

> Version: 1.1.1
