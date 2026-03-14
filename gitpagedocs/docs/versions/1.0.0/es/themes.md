# Temas y layouts

Los temas se definen con plantillas JSON y se cargan dinamicamente.

## Donde viven los temas

- Catalogo principal: `public/layouts/layoutsConfig.json`
- Plantillas principales: `public/layouts/templates/*.json`
- Catalogo fallback: `gitpagedocs/layouts/layoutsConfig.json`
- Plantillas fallback: `gitpagedocs/layouts/templates/*.json`

## Estructura del tema

Cada tema controla:

- Colores (`background`, `primary`, `secondary`, `text`, etc.)
- Tipografia
- Estilo de componentes (`header`, `card`, `button`, `select`)
- Efectos opcionales (`animations`)

## Soporte claro/oscuro

- Cuando `supportsLightAndDarkModes: true`, aparece el toggle.
- El emparejamiento usa `supportsLightAndDarkModesReference`.
