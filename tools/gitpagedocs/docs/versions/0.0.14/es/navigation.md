# Navegación y submenús

Las rutas definen el contenido; los menús definen cómo encontrarlo. Configúralos en `gitpagedocs/docs/versions/<version>/config.json`. Las opciones visuales globales están en `gitpagedocs/config.json`.

```json
{
  "site": {
    "nestedMenusEnabled": true,
    "RouteGuide": true
  }
}
```

## Guía de introducción

La ruta `/introduction-guide` está disponible en los builds con búsqueda de repositorios. Su recorrido por capítulos sigue el desplazamiento nativo de la página. A partir de la versión 0.0.16 del visor, detenerse en una transición mantiene el texto legible, sin superposición entre capítulos adyacentes. Se conservan los efectos de parallax, la preferencia de movimiento reducido y el diseño en lista para ventanas de poca altura en orientación horizontal.

En la versión 0.0.18 del visor, cada gesto de rueda/trackpad, paso con el teclado o deslizamiento vertical avanza o retrocede un capítulo. Los cambios de capítulo y las selecciones en la lista lateral son inmediatos, sin dejar el texto detenido entre escenas. Volver arriba también salta inmediatamente y enfoca la presentación inicial. Las ventanas de poca altura en orientación horizontal conservan el diseño de lectura en lista.

Un único botón de reproducir/pausar en la cabecera controla los efectos de la guía y el fondo animado del tema seleccionado, incluido el fondo alternativo de los temas antiguos. Los efectos empiezan activos; pausarlos conserva el capítulo y el contenido actuales. La preferencia de movimiento reducido del sistema operativo siempre prevalece; el control deshabilitado explica cuándo el sistema ha reducido las animaciones. El título es visible desde el primer renderizado, sin desenfoque animado ni entrada escalonada por carácter; el parallax opcional utiliza desplazamientos pequeños y las apariciones de las secciones son breves. Los controles no modifican las paletas de los temas existentes.

Expandir vídeo, audio o HTML conserva el archivo seleccionado y la misma instancia del reproductor o iframe al abrir y cerrar. El visor solicita pantalla completa nativa cuando está disponible; Escape o los controles del navegador cierran la expansión y sincronizan la URL. Si la pantalla completa no está disponible o se rechaza, el mismo contenido se expande dentro de la página, sin un modal, con un botón de cierre y Escape dentro de la región expandida. Markdown y PDF mantienen su comportamiento de visualización existente.

## Crear el árbol de menús

Cada entrada de `menus-header-md` tiene `id` y objetos `pt`, `en`, `es` con `title` y `path-click` opcional. Añade `submenus` con nuevas entradas para anidar el árbol. El objeto de un idioma también acepta `submenus` localizados con título/ruta. Utiliza una forma de manera consistente para no listar el mismo hijo dos veces.

Los grupos sin `path-click` organizan sus hijos. Para el destino de una ruta Markdown, utiliza su ruta localizada real de `routes-md[].path`. Las rutas source-viewer, vídeo, audio, PDF y las composiciones explícitas de `pages` registran `page:<id>`; una ruta Markdown simple utiliza la ruta del archivo. El ejemplo utiliza la versión `0.0.8`: sustituye ese segmento por la versión editada y crea los tres archivos chapter.

```json
{
  "routeDefaults": {
    "RouteGuide": false
  },
  "routes-md": [
    {
      "id": 101,
      "RouteGuide": true,
      "path": {
        "pt": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md",
        "en": "gitpagedocs/docs/versions/0.0.8/en/chapter.md",
        "es": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
      }
    }
  ],
  "menus-header-md": [
    {
      "id": 900,
      "pt": {
        "title": "Guia"
      },
      "en": {
        "title": "Guide"
      },
      "es": {
        "title": "Guía"
      },
      "submenus": [
        {
          "id": 901,
          "pt": {
            "title": "Capítulos"
          },
          "en": {
            "title": "Chapters"
          },
          "es": {
            "title": "Capítulos"
          },
          "submenus": [
            {
              "id": 101,
              "pt": {
                "title": "Primeiro capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md"
              },
              "en": {
                "title": "First chapter",
                "path-click": "gitpagedocs/docs/versions/0.0.8/en/chapter.md"
              },
              "es": {
                "title": "Primer capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## Comportamiento del anidamiento

Un padre puede ser documento y grupo a la vez. Conserva su `path-click` localizado junto con `submenus`: el título abre su página Markdown y la flecha separada expande o contrae los hijos. El scaffold incluye resúmenes útiles para los ocho grupos padres. Los antecesores de los breadcrumbs enlazan a esos documentos; el destino actual sigue marcado como actual. Un grupo sin ruta puede organizar hijos, pero no tiene un destino para abrir.

El siguiente fragmento utiliza las rutas Markdown 31, 32 y 13 incluidas en el scaffold. Combínalo con `menus-header-md` y conserva las definiciones correspondientes en `routes-md` y sus archivos:

```json
{
  "id": 1000,
  "en": {
    "title": "Guides",
    "path-click": "gitpagedocs/docs/versions/0.0.14/en/guides.md"
  },
  "pt": {
    "title": "Guias",
    "path-click": "gitpagedocs/docs/versions/0.0.14/pt/guides.md"
  },
  "es": {
    "title": "Guías",
    "path-click": "gitpagedocs/docs/versions/0.0.14/es/guides.md"
  },
  "submenus": [
    {
      "id": 1001,
      "en": {
        "title": "Configure your site",
        "path-click": "gitpagedocs/docs/versions/0.0.14/en/configure-your-site.md"
      },
      "pt": {
        "title": "Configure seu site",
        "path-click": "gitpagedocs/docs/versions/0.0.14/pt/configure-your-site.md"
      },
      "es": {
        "title": "Configura tu sitio",
        "path-click": "gitpagedocs/docs/versions/0.0.14/es/configure-your-site.md"
      },
      "submenus": [
        {
          "id": 13,
          "en": {
            "title": "Configuration",
            "path-click": "gitpagedocs/docs/versions/0.0.14/en/configuration.md"
          },
          "pt": {
            "title": "Configuração",
            "path-click": "gitpagedocs/docs/versions/0.0.14/pt/configuration.md"
          },
          "es": {
            "title": "Configuración",
            "path-click": "gitpagedocs/docs/versions/0.0.14/es/configuration.md"
          }
        }
      ]
    }
  ]
}
```

`site.nestedMenusEnabled: true` muestra menús recursivos expandibles. Puedes añadir `submenus` en cualquier nodo: no existe un límite fijo de profundidad en la aplicación. La configuración debe ser finita y adecuada para la memoria del navegador y la usabilidad. Con `false`, los destinos aparecen en una lista plana; las páginas anidadas no se eliminan.

El árbol sirve para navegación lateral, etiquetas de búsqueda, expansión de padres y rutas de navegación. Mantén IDs estables y sin ambigüedad; los destinos protegidos siguen las reglas de autorización de su página. La misma estructura se aplica a `menus-header-source-viewer`, `menus-header-html`, `menus-header-video`, `menus-header-audio` y `menus-header-pdf`. `hierarchyMenu` ordena las secciones por tipo; `hierarchyPage` ordena los contenedores que comparten el ID de página.

## Ruta de navegación: RouteGuide

La ruta de navegación tiene 12 px de espacio arriba y abajo, separando el camino del contenido que la rodea.

`RouteGuide` controla los breadcrumbs. La prioridad es `routes-md[].RouteGuide` de la página, después `routeDefaults.RouteGuide` de la versión, después `site.RouteGuide`, con `true` como valor final por defecto. El ejemplo desactiva la ruta de navegación para la versión y la activa en el capítulo 101. Los archivos existentes de la versión `0.0.8` aceptan los mismos campos.

`RouteguideBrand` y `RouteguideBrandPosition` son opciones separadas del índice de títulos del documento; no controlan los breadcrumbs.

## URLs y anterior/siguiente

Las URLs versionadas utilizan `/v/<version>/`; `?lang=pt` elige el idioma y `?id=101` elige la página. `?name=chapter` selecciona el slug del documento. Mantén `VersionControl.versions[].path` apuntando al config de la versión correspondiente. `site.ActiveNavigation` activa la navegación rápida y su atajo Ctrl+K. Los controles anterior/siguiente del pie siguen los destinos disponibles en el menú; la navegación entre documentos en modo foco tiene su propia opción. Consulta Modo foco para controles de sección y documento.

Los botones anterior/siguiente del pie usan `site.icons.DocumentPrevious` (`LuChevronLeft`) y `site.icons.DocumentNext` (`LuChevronRight`) por defecto. Define `reactIcon: false` en cualquier entrada para mostrar su texto traducido; cada entrada también acepta `tag`, `size`, `colorDark` y `colorLight`. La apariencia no cambia la navegación: el pie aparece cuando hay más de un destino disponible en el menú, y la dirección no disponible permanece desactivada en los extremos.

Prueba un menú nuevo desde la barra lateral, por URL directa y en cada idioma habilitado; confirma que el destino existe y está permitido para el lector actual.

> Versión: 0.0.14
