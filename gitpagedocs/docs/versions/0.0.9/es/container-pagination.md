# Contenedores paginados

Muestra varios archivos en un único contenedor Markdown, HTML, vídeo, audio o PDF. Registra los archivos en la colección de rutas correspondiente y añade sus IDs, en orden, a `pagination.items` en la ruta del contenedor. Cada contenedor conserva su propia selección. Usa bloques de contenido ordenados para combinar varios contenedores y tipos en una página.

## Valores del sitio

Configura `site.containerPagination` en `gitpagedocs/config.json`. Los cuatro controles están activos: primera página, anterior, siguiente y última. Aparecen debajo del contenido, a la derecha, con iconos y contador de página actual/total.

```json
{
  "site": {
    "containerPagination": {
      "enabled": true,
      "alignment": "right",
      "placement": "bottom",
      "display": "icon",
      "showCount": true,
      "controls": {
        "first": true,
        "previous": true,
        "next": true,
        "last": true
      },
      "icons": {
        "first": "FiSkipBack",
        "previous": "FiChevronLeft",
        "next": "FiChevronRight",
        "last": "FiSkipForward"
      },
      "iconSize": "20px",
      "labels": {
        "pages": {
          "en": "Pages",
          "pt": "Páginas",
          "es": "Páginas"
        },
        "first": {
          "en": "First page",
          "pt": "Primeira página",
          "es": "Primera página"
        },
        "previous": {
          "en": "Previous page",
          "pt": "Página anterior",
          "es": "Página anterior"
        },
        "next": {
          "en": "Next page",
          "pt": "Próxima página",
          "es": "Página siguiente"
        },
        "last": {
          "en": "Last page",
          "pt": "Última página",
          "es": "Última página"
        }
      }
    }
  }
}
```

## Archivos y metadatos por ruta

Añade este ejemplo a `routes-md` en la configuración de la versión. La ruta 1 debe existir. El primer elemento puede apuntar a la propia ruta. HTML, vídeo, audio y PDF usan la misma estructura en la colección `routes-*` correspondiente.

```json
{
  "id": 51,
  "path": {
    "en": "gitpagedocs/docs/versions/<version>/en/pagination-first.md",
    "pt": "gitpagedocs/docs/versions/<version>/pt/pagination-first.md",
    "es": "gitpagedocs/docs/versions/<version>/es/pagination-first.md"
  },
  "pagination": {
    "items": [
      {
        "routeId": 51,
        "title": {
          "en": "First lesson",
          "pt": "Primeira lição",
          "es": "Primera lección"
        }
      },
      {
        "routeId": 1,
        "title": {
          "en": "Getting started",
          "pt": "Primeiros passos",
          "es": "Primeros pasos"
        },
        "description": {
          "en": "Configure your project",
          "pt": "Configure seu projeto",
          "es": "Configura tu proyecto"
        }
      }
    ]
  }
}
```

| Opción | Valores y comportamiento |
| --- | --- |
| `enabled` | Activa o desactiva; la ruta tiene prioridad sobre el sitio. |
| `alignment` | `left`, `center` o `right`; predeterminado `right`. |
| `placement` | `top`, `bottom` o `both`; predeterminado `bottom`. |
| `display` | `icon` o `text`; predeterminado `icon`. |
| `showCount` | Muestra la página actual y el total; predeterminado `true`. |
| `controls` | Activa individualmente `first`, `previous`, `next` y `last`. |
| `icons` / `iconSize` | Tags de React Icons y tamaño CSS; colores del tema activo. |
| `labels` | Texto o mapas de idiomas para acciones y `pages`; conserva nombres accesibles con iconos. |
| `items` | Lista ordenada con `routeId` entero del mismo tipo de contenido. |
| `items[].title` / `description` | Mapas de idiomas que sustituyen los metadatos; los campos omitidos usan los de la ruta. |

Controles, iconos y etiquetas complementan los valores globales. Los botones sin destino disponible se deshabilitan. Desactivar la paginación muestra la ruta original. Las referencias inválidas se notifican en la consola; las fuentes sin autorización se excluyen. No se expande recursivamente la paginación de otra ruta.

## Enfoque, búsqueda y medios

La paginación Markdown aparece en el modo enfoque. Cambiar el archivo mantiene el enfoque abierto, actualiza título, descripción y acciones del archivo, y vuelve a la primera sección. Ctrl+K incluye los elementos disponibles de contenedores con un destino en el menú; abre el elemento dentro de su página. La selección se conserva durante la navegación y se reinicia al cambiar idioma, versión o recargar.

El archivo seleccionado utiliza la disposición de metadatos existente. Título y descripción de Markdown permanecen fuera del Markdown renderizado. Cambiar de medio sustituye el reproductor anterior y conserva la reproducción exclusiva. La navegación general es independiente: `site.documentNavigation.position` mantiene `center` como valor predeterminado.

## Ejemplo de validación

Abre Guías > Lee y explora > Ejemplo de contenedores paginados (página 50). Incluye tres archivos Markdown, dos HTML, MP4/WebM del vídeo público de flores de MDN, dos tonos WAV locales de dos segundos y dos PDF diferentes en inglés. El vídeo requiere internet; los demás archivos vienen con la documentación. Navega en cada contenedor, prueba Ctrl+K y abre la secuencia Markdown en modo enfoque.

> Versión: 0.0.9
