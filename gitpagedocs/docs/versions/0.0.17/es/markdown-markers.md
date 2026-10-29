# Marcadores de Markdown

Un marcador resalta una frase o un elemento HTML dentro del Markdown renderizado y añade una entrada enlazada al índice. Al pulsarla, la página se desplaza hasta el destino resaltado. Resaltado y navegación siempre funcionan juntos; no hay modos independientes de solo resaltado o solo índice.

## Conserva el índice de títulos

`RouteguideBrand` activa el índice existente. `RouteGuideSpeciFicbrand` sigue siendo una lista de IDs de títulos: un array vacío incluye todos. Los marcadores se configuran por separado en `routes-md[].markdownMarkers` y no cambian ese filtro. Sus entradas pueden aparecer incluso con `RouteguideBrand: false`. El índice sigue el orden del documento y reutiliza el ID del destino cuando existe.

## Valores del sitio

Configura la activación y los colores comunes en `gitpagedocs/config.json`:

```json
{
  "site": {
    "markdownMarkers": {
      "enabled": true,
      "style": {
        "background": "color-mix(in srgb, var(--primary) 24%, transparent)",
        "color": "var(--text)",
        "outlineColor": "var(--primary)"
      }
    }
  }
}
```

El `enabled` de la ruta tiene prioridad sobre el sitio. Usa `markdownMarkers.enabled: false` en una ruta para desactivar sus marcadores, o `enabled: false` en un elemento para omitir solo ese marcador. Esto no desactiva el índice de títulos existente.

## Ejemplo por ruta

Añade estos campos a una ruta Markdown existente en la configuración de la versión. El primer destino existe en el ejemplo de paginación incluido; añade una tabla al Markdown antes de activar el segundo.

```json
{
  "id": 51,
  "RouteguideBrand": true,
  "RouteGuideSpeciFicbrand": [],
  "markdownMarkers": {
    "enabled": true,
    "items": [
      {
        "id": "reading-target",
        "text": {
          "en": "This highlighted sentence is a navigation target.",
          "pt": "Esta frase realçada é um destino de navegação.",
          "es": "Esta frase resaltada es un destino de navegación."
        },
        "label": {
          "en": "Important detail",
          "pt": "Detalhe importante",
          "es": "Detalle importante"
        }
      },
      {
        "id": "second-cell",
        "selector": "td",
        "occurrence": 2,
        "label": {
          "en": "Second table cell",
          "pt": "Segunda célula da tabela",
          "es": "Segunda celda de la tabla"
        },
        "style": {
          "outlineColor": "var(--secondary)"
        }
      }
    ]
  }
}
```

| Campo | Comportamiento |
| --- | --- |
| `id` | Texto obligatorio, no vacío y único en la lista de marcadores de la ruta. |
| `text` | Frase exacta, sensible a mayúsculas, del texto visible. Puede atravesar formato inline; se normalizan espacios y Unicode sin cambiar el texto mostrado. |
| `selector` | Selector CSS de un elemento del Markdown, como `blockquote`, `td` o `#ejemplo`. |
| `occurrence` | Coincidencia elegida, contando desde `1`; por defecto la primera. Útil para texto o elementos repetidos. |
| `label` | Texto del índice; si falta o no está disponible, se usa el ID del marcador. |
| `style` | Colores CSS opcionales `background`, `color` y `outlineColor`. |

Indica exactamente un destino: `text` o `selector`. Textos, selectores y etiquetas admiten una cadena o un mapa de idiomas; primero se usa el idioma actual y después el inglés. Los selectores solo buscan en el fragmento Markdown actual, no en la aplicación. Se excluye el contenido oculto o ejecutable.

## Colores, repeticiones y diagnóstico

Los estilos se combinan en este orden: sitio, ruta y marcador. Variables como `var(--primary)`, `var(--secondary)` y `var(--text)` siguen el tema claro u oscuro. Los campos admiten colores, no hojas de estilo arbitrarias ni URLs de imágenes. Todo marcador válido recibe un resaltado visible del tema, incluso sin un estilo personalizado.

Cada instancia Markdown de una página compuesta conserva destinos únicos para títulos y marcadores. Copiar/descargar mantiene el Markdown original. Los selectores no válidos, IDs duplicados, ocurrencias incorrectas y destinos ausentes se notifican en la consola sin crear enlaces sin destino. Los colores no válidos se notifican y el estilo normal sigue disponible.

Abre Guías > Lee y explora > Ejemplo de contenedores paginados y elige la entrada resaltada del índice en su primer Markdown. El mismo mecanismo sirve para párrafos, listas, citas, tablas y elementos de código.

> Versión: 0.0.17
