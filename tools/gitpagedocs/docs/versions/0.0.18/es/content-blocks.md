# Bloques de contenido ordenados

Una página puede contener varios documentos Markdown, reproductores HTML, vídeos, pistas de audio y PDFs en cualquier orden. Añade un array `pages` en el nivel principal del config de la versión. Cada bloque referencia una ruta ya definida en `routes-md`, `routes-html`, `routes-video`, `routes-audio` o `routes-pdf`. La página tiene una sola URL; los bloques no crean destinos de navegación separados.

## Ejemplo completo con repeticiones

La página 39 del scaffold combina tres bloques Markdown, dos HTML, dos vídeos, dos audios y tres PDFs. Referencia las rutas incluidas 1, 2, 30, 29, 11, 12 y 23. Combina el siguiente objeto con `gitpagedocs/docs/versions/0.0.10/config.json` o con el config de la versión actual; conserva las definiciones de esas rutas y sus archivos. El mismo ejemplo se incluye en el nuevo scaffold.

```json
{
  "pages": [
    {
      "id": 39,
      "blocks": [
        {
          "id": "getting-started",
          "type": "md",
          "routeId": 1
        },
        {
          "id": "project-overview",
          "type": "md",
          "routeId": 2
        },
        {
          "id": "html-guide",
          "type": "md",
          "routeId": 30
        },
        {
          "id": "doom-first",
          "type": "html",
          "routeId": 29
        },
        {
          "id": "doom-second",
          "type": "html",
          "routeId": 29
        },
        {
          "id": "video-first",
          "type": "video",
          "routeId": 11
        },
        {
          "id": "video-second",
          "type": "video",
          "routeId": 11
        },
        {
          "id": "audio-first",
          "type": "audio",
          "routeId": 12
        },
        {
          "id": "audio-second",
          "type": "audio",
          "routeId": 12
        },
        {
          "id": "pdf-first",
          "type": "pdf",
          "routeId": 23
        },
        {
          "id": "pdf-second",
          "type": "pdf",
          "routeId": 23
        },
        {
          "id": "pdf-third",
          "type": "pdf",
          "routeId": 23
        }
      ]
    }
  ]
}
```

Añade un destino de menú con `"path-click": "page:39"` en cada idioma. La entrada incluida está en Guías → Lee y explora → Múltiples bloques de contenido. Su etiqueta es independiente de las etiquetas de cada bloque.

## Orden, repetición y opciones individuales

- `pages[].id` es un identificador entero de página. Usa un ID nuevo que no coincida con una ruta existente.
- `blocks[].id` es una cadena no vacía, única dentro de su página. Dos instancias pueden usar el mismo `routeId`, pero necesitan IDs de bloque distintos.
- `type` acepta exactamente `md`, `html`, `video`, `audio` o `pdf`; `routeId` selecciona una ruta de la lista correspondiente.
- El orden del array determina el orden de presentación. Mueve un objeto para reordenarlo, elimínalo para ocultar esa instancia o cópialo con un ID nuevo para repetirlo. `hierarchyPage` sigue aplicándose a las páginas anteriores y no reordena este array.

Cada referencia utiliza el origen, traducción, visibilidad, dimensiones, acciones PDF, controles multimedia y autorización de su ruta. Para asignar opciones diferentes a dos apariciones del mismo archivo, define dos rutas con IDs distintos y la misma ruta de origen; después referencia esos IDs. No dupliques parámetros de ruta dentro del bloque.

Un bloque Markdown renderiza solo su documento; el audio inline antiguo de su ruta no se convierte en un bloque adicional. Referencia explícitamente una ruta de audio cuando forme parte de la secuencia. Los bloques seleccionan rutas fijas y no comparten un índice de `browseAll`. La exclusividad multimedia y las restricciones del navegador siguen aplicándose; repetir un reproductor no inicia la reproducción automáticamente.

El modo foco y la narración leen los bloques Markdown autorizados y disponibles en el idioma seleccionado, en el orden del array, incluidas las repeticiones. Copiar/descargar desde foco une sus fuentes originales con dos saltos de línea y utiliza `page-39.md` en este ejemplo. Cada contenedor Markdown visible conserva sus acciones individuales de copia/descarga y el nombre original. Los IDs de encabezados renderizados reciben un prefijo por bloque para evitar anclas duplicadas; la fuente descargada no cambia. Las páginas o bloques denegados se excluyen de renderización, copia, foco y narración. Este control del cliente no protege archivos públicos ni impide que el cargador de documentos lea sus fuentes.

## Posicionar títulos y descripciones

Cada ruta de contenido acepta `layout.title` y `layout.description` independientemente. `placement` admite `outside` o `inside` del contenedor; `position` admite `before` o `after` del contenido. Combina este fragmento de presentación con una ruta existente, conservando sus campos de contenido:

```json
{
  "id": 23,
  "layout": {
    "title": {
      "placement": "outside",
      "position": "before"
    },
    "description": {
      "placement": "inside",
      "position": "after"
    }
  }
}
```

En Markdown, el título y la descripción configurados siempre permanecen fuera del documento renderizado; se respeta su posición anterior/posterior. Los encabezados escritos en Markdown siguen perteneciendo al documento. HTML, vídeo, audio y PDF admiten ambas ubicaciones. Estos campos cambian la presentación, no el archivo de origen ni el contenido multimedia. `titleIsVisible`, `descriptionIsVisible`, alineación y estilos existentes siguen aplicándose. Omite `layout` para conservar la presentación actual. Los valores compartidos pueden estar en `routeDefaults`; un `layout` explícito de la ruta sustituye ese objeto de defaults.

## Compatibilidad y acceso

Los configs sin `pages` mantienen su comportamiento de contenedor único o rutas mixtas. El array `pages` de la versión sustituye al array raíz; `[]` lo vacía. Las definiciones inválidas o referencias inexistentes se ignoran sin impedir que carguen las otras páginas. Las identidades duplicadas de página o bloque conservan la primera entrada válida; un ID de página que coincide con una ruta se ignora para conservar la ruta existente. Corrige esos errores en la configuración en lugar de depender de su omisión.

El campo `authorization` de la página protege el destino compuesto, y cada ruta referenciada mantiene sus propios requisitos de acceso. Ocultar un bloque no protege archivos públicos. Markdown y PDF no inventan traducciones cuando falta el archivo del idioma seleccionado; los demás tipos conservan el fallback de la ruta, incluido inglés para vídeo/audio y URLs HTML externas. Prueba todos los bloques e idiomas, navegación directa, rutas protegidas, medios repetidos, errores de descarga y límites del navegador antes de publicar. Muchos embeds o PDFs activos consumen memoria y red; incluye solo lo que necesita el lector.

> Versión: 0.0.18
