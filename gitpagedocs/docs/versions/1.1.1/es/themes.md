# Temas y layouts

Los temas son templates JSON mapeados por `layoutsConfig.json`.

## Archivos

- `gitpagedocs/layouts/layoutsConfig.json`
- `gitpagedocs/layouts/layoutsFallbackConfig.json`
- `gitpagedocs/layouts/templates/*.json`

## Modelo de template

Cada template normalmente incluye:

- `id`, `name`, `author`, `version`
- `mode` y metadatos de par dark/light
- `colors`
- `typography`
- tokens de `components`
- `animations`

## Comportamiento en runtime

- tema activo viene de config/seleccion de usuario
- toggle light/dark resuelve tema pareado por referencia
- variables CSS se generan desde tokens del template

## Buenas practicas

- mantener contraste accesible
- mantener escala consistente de espacios y bordes
- ofrecer variantes dark y light cuando sea posible

> Version (ES): 1.1.1
