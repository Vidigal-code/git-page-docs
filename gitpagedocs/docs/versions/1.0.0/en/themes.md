# Themes and layouts

Themes are defined by JSON templates and loaded dynamically.

## Where themes live

- Primary catalog: `public/layouts/layoutsConfig.json`
- Primary templates: `public/layouts/templates/*.json`
- Fallback catalog: `gitpagedocs/layouts/layoutsConfig.json`
- Fallback templates: `gitpagedocs/layouts/templates/*.json`

## Theme structure

Each theme controls:

- Colors (`background`, `primary`, `secondary`, `text`, etc.)
- Typography
- Component styling (`header`, `card`, `button`, `select`)
- Optional effects (`animations`)

## Light/Dark support

- When a theme has `supportsLightAndDarkModes: true`, mode toggle is available.
- Pairing is defined by `supportsLightAndDarkModesReference`.
