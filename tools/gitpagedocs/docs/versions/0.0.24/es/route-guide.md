# Configura la guía del documento

La guía del documento es el índice del Markdown actual. Es independiente del menú del sitio, de las rutas de navegación y de la guía introductoria de GitPageDocs. Configúrala en el elemento correspondiente de `routes-md`, dentro de la configuración de la versión.

En pantallas de escritorio con más de 1024 píxeles CSS, la guía lateral termina después de su última entrada, sin extenderse hasta el final del artículo. Desde 0.0.25, puede crecer hasta la altura disponible de la ventana debajo de la cabecera antes de necesitar desplazamiento interno. Este diseño lateral tiene prioridad sobre `TocScrollMaxHeightDesktop`; la guía centrada encima del contenido y los diseños de hasta 1024 píxeles mantienen sus reglas de tamaño anteriores. Una pequeña barra con el color de la entrada activa sigue la sección marcada al desplazarse. El indicador utiliza el seguimiento de secciones existente, sin animación continua.

## Selecciona los elementos indexados

Desde 0.0.21, `RouteGuideTags` selecciona qué tipos de elementos HTML se convierten en entradas automáticas después de renderizar Markdown. Este sitio usa explícitamente `h1`, `h2` y `h3` para facilitar la navegación de referencias extensas. Respeta la escritura y las mayúsculas de cada campo JSON.

```json
{
  "id": 43,
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteGuideSpeciFicbrand": [],
  "RouteguideBrandPosition": "left",
  "RouteguideBrandContainerTop": false
}
```

Combina estas opciones con una ruta Markdown existente y conserva su `path`, título y descripciones traducidas. El fragmento por sí solo no define los archivos del documento.

| Configuración | Efecto |
| --- | --- |
| `RouteguideBrand: true` | Habilita las entradas automáticas de la guía. |
| `RouteguideBrand: false` | Desactiva las entradas automáticas sin borrar contenido ni marcadores explícitos. |
| `RouteGuideTags: ["h1", "h2", "h3"]` | Indexa automáticamente esos niveles de título. |
| `RouteGuideTags` omitida | Conserva el comportamiento anterior de `h1` a `h6`. |
| `RouteGuideTags: []` | Desactiva la indexación automática; los marcadores Markdown explícitos siguen disponibles. |
| `RouteGuideSpeciFicbrand` | Filtra las entradas automáticas elegibles por ID del elemento. Una lista vacía no las restringe. |
| `RouteguideBrandPosition` | Alinea el contenido de la guía: `left`, `center` o `right`. |
| `RouteguideBrandContainerTop` | Con true coloca la guía encima del documento; false permite situarla junto al contenido en pantallas más anchas. |

## Usa títulos semánticos

Escribe un título `#` y usa `##` y `###` para las secciones y subsecciones principales. Los niveles expresan la jerarquía del documento; no deben elegirse solo para cambiar el tamaño de letra. Con el valor anterior, los títulos de cuarto nivel y posteriores siguen en el contenido, pero no añaden entradas automáticas.

La opción acepta etiquetas HTML seguras compatibles con el sanitizador de Markdown. Seleccionar `p`, por ejemplo, puede indexar párrafos; añadirla a una referencia larga puede generar un índice excesivo. La selección no permite conservar scripts, incrustaciones u otro HTML eliminado por la sanitización. Usa nombres explícitos de etiquetas; no existe una configuración con comodín.

## Filtra por ID del elemento

`RouteGuideTags` selecciona tipos de elementos. `RouteGuideSpeciFicbrand` selecciona IDs entre las entradas elegibles; no habilita una etiqueta excluida por `RouteGuideTags`. Comprueba el ID renderizado o copia el enlace del elemento antes de configurarlo. El texto, los acentos y los títulos repetidos pueden afectar los IDs generados. Las traducciones pueden tener IDs diferentes; comprueba cada idioma habilitado.

```json
{
  "RouteGuideTags": ["h2"],
  "RouteGuideSpeciFicbrand": ["selecciona-los-elementos-indexados", "usa-títulos-semánticos"]
}
```

El ejemplo corresponde a dos títulos de esta página en español. No reutilices esos IDs en otro documento esperando que existan sus entradas.

## Conserva los marcadores deliberados

Usa `markdownMarkers` explícitos cuando una frase o un elemento importante necesite un destino con nombre sin cambiar la jerarquía de títulos. Consulta [Marcadores Markdown](markdown-markers.md) para las reglas de coincidencia y estilo. Seleccionar `[]` para las etiquetas automáticas no borra esos marcadores; `RouteguideBrand` activa o desactiva la indexación automática; los marcadores explícitos siguen disponibles cuando es false.

## Distingue tres capas de navegación

- El menú selecciona documentos y categorías mediante `path-click` traducido y `submenus`.
- `RouteGuide` controla las rutas de navegación y hereda opciones del sitio, los valores de la versión y la ruta.
- `RouteguideBrand` y `RouteGuideTags` controlan las entradas automáticas del índice de este documento.

En ventanas estrechas, comienza con tres niveles de títulos, nombres concisos y el índice alineado a la izquierda. Consulta [Pantallas estrechas y plegables](responsive-layout.md) para una configuración práctica y una secuencia de comprobación.

## Etiquetas, elementos vacíos y destinos distintos

Para un elemento indexado, la guía elige su etiqueta a partir de `title`, después `alt` y finalmente el texto visible normalizado. Los textos largos se limitan a 96 caracteres seguidos de puntos suspensivos, evitando copiar un párrafo completo al índice. Un marcador Markdown explícito conserva su etiqueta configurada cuando apunta al mismo elemento.

Los elementos `br`, `hr`, `img` e `input` sin texto usan el nombre de la etiqueta cuando no existe una opción mejor. Los contenedores vacíos se ignoran. Solo pueden participar las etiquetas seguras aceptadas por el sanitizador Markdown; añadir una etiqueta a la lista no permite HTML inseguro.

El renderizador resuelve IDs duplicados para distinguir los destinos de la guía. Estos IDs identifican elementos del documento, no páginas del menú. Comprueba de nuevo el filtro después de cambiar títulos repetidos, HTML personalizado o la estructura. Al activar un destino dentro de `details` contraído, sus elementos de expansión antecesores se abren para mostrarlo.

## Comprueba el resultado

Abre la página en cada idioma; compara las entradas con los títulos, activa la primera y la última y revisa el foco del teclado. Prueba una lista explícita, una lista omitida y una lista vacía con un marcador. Después cambia el tamaño de la ventana sin cerrar el documento. Si falta una entrada, revisa su etiqueta, ID, regla de marcador e interruptor de la ruta antes de modificar el renderizador Markdown.


## Indexa otros elementos Markdown

Usa la etiqueta HTML producida por Markdown: `p` para párrafos, `li` para elementos de lista, `blockquote` para citas, `pre` para bloques de código, `table` para tablas e `img` para imágenes. Por ejemplo:

```json
{ "RouteGuideTags": ["h1", "h2", "h3", "p", "li", "blockquote", "pre", "table", "img"] }
```

Seleccionar un contenedor y sus hijos puede crear varias entradas para el mismo pasaje. Prefiere los tipos de elemento que ayuden a navegar. Las etiquetas se recortan, se comparan sin distinguir mayúsculas y se deduplican. Las etiquetas no compatibles se omiten y se notifican en la consola. Un valor que no sea un array se notifica y usa los niveles de títulos heredados; corrige la configuración en lugar de depender de esa alternativa.

> Versión: 0.0.24
