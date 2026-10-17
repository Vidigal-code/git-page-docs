# Temas y layouts

Los temas son templates JSON mapeados por `layoutsConfig.json`.

## Archivos

- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/layoutsFallbackConfig.json`
- `gitpagelayouts/templates/*.json`

## Modelo de template

Cada template normalmente incluye:

- `id`, `name`, `author`, `version`
- `mode` y metadatos de par dark/light
- `colors`
- `typography`
- tokens de `components`
- `animations`

## Comportamiento en runtime

- tema activo viene de config/selección de usuario
- toggle light/dark resuelve tema pareado por referencia
- variables CSS se generan desde tokens del template

## Buenas practicas

- mantener contraste accesible
- mantener escala consistente de espacios y bordes
- ofrecer variantes dark y light cuando sea posible

## Elegir y personalizar

Elige un tema mediante el selector o configura `site.ThemeDefault` con su ID exacto. `ThemeModeDefault` define el modo inicial claro/oscuro. `HideThemeSelector` oculta el selector; el tema seleccionado sigue aplicado.

En tu repositorio, ejecuta la CLI con `--layoutconfig`, edita la plantilla generada y conserva el ID coherente con `layoutsConfig.json`. El contenido de ruta y `site.icons` son independientes del catálogo de temas. Usa `currentColor` para iconos que heredan el color de texto o configura colores claros/oscuros con contraste suficiente.

Al contribuir en Git Page Docs, la fuente es `gitpagelayouts/v2/base.json` junto con `gitpagelayouts/v2/layouts/<id>.json`. Ejecuta `pnpm layouts:sync` para generar plantillas y documentación. La sincronización puede sobrescribir las ediciones directas de plantillas generadas.

> Versión: 0.0.10
