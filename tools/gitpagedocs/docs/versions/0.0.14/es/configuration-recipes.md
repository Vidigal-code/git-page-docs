# Recetas de configuración

Esta guía crea un sitio pequeño en tres idiomas, con dos páginas Markdown y un menú de tres niveles. Parte de la configuración generada, revisa los cambios y conserva los archivos originales en el control de versiones. Los ejemplos utilizan los IDs 101 y 102 para distinguirlos de las páginas incluidas.

## 1. Genera y revisa la estructura

El scaffold incluye las versiones 0.0.14, 0.0.13, 0.0.12, 0.0.11, 0.0.10 y 0.0.9 en el selector, de la más reciente a la más antigua. Las seis contienen los ejemplos actuales; la versión del paquete es 0.0.14. Las rutas y etiquetas se generan para la versión correspondiente de la documentación. No se eliminan las carpetas existentes de versiones anteriores.

Ejecuta `npx --yes @gitpagedocs/cli@0.0.14 --no-interactive --owner TU_USUARIO --repo TU_REPOSITORIO` en un directorio de proyecto nuevo. En este repositorio de código fuente, `node cli/index.mjs` ejecuta la versión del checkout. La generación escribe configuración y documentación; no inicia el visor Next.js.

El siguiente JSON completo es un ejemplo mínimo de `gitpagedocs/config.json`. Para un sitio existente, combina los campos relevantes y conserva la identidad del repositorio, la publicación, los temas y las demás versiones.

```json
{
  "site": {
    "name": "Documentação • Guía • Documentation",
    "docsVersion": "0.0.14",
    "languages": {
      "en": true,
      "pt": true,
      "es": true
    },
    "nestedMenusEnabled": true,
    "ActiveNavigation": true,
    "RouteGuide": true,
    "FocusMode": true,
    "focusMode": {
      "copyEnabled": true,
      "downloadEnabled": true,
      "sectionNavigationEnabled": true,
      "documentNavigationEnabled": true
    },
    "icons": {
      "defaults": {
        "reactIcon": true,
        "size": "22px",
        "colorDark": "currentColor",
        "colorLight": "currentColor"
      },
      "LanguageSelector": {
        "tag": "SiGoogletranslate"
      },
      "ThemeSelector": {
        "tag": "LuPencil"
      },
      "VersionSelector": {
        "tag": "LuGitBranch"
      },
      "FocusMode": {
        "tag": "LuBookOpen"
      },
      "QuickNavigation": {
        "tag": "LuSearch"
      },
      "PdfDownload": {
        "tag": "LuDownload"
      },
      "PdfOpenInNewTab": {
        "tag": "LuExternalLink"
      },
      "DocumentPrevious": {
        "tag": "LuChevronLeft"
      },
      "DocumentNext": {
        "tag": "LuChevronRight"
      }
    },
    "pdf": {
      "enabled": true,
      "previewEnabled": true,
      "downloadEnabled": true,
      "openInNewTabEnabled": true
    }
  },
  "VersionControl": {
    "versions": [
      {
        "id": "0.0.14",
        "path": "gitpagedocs/docs/versions/0.0.14/config.json"
      }
    ]
  }
}
```

Las nueve entradas heredan la presentación común de `icons.defaults`. Para mostrar texto en una acción, añade `"reactIcon": false` a esa entrada. No cambies un valor compartido solo para modificar un botón. Los campos planos antiguos tienen prioridad sobre los compactos; elimina o actualiza un campo conflictivo tras confirmar su intención.

## 2. Crea la configuración de versión

Guarda el siguiente JSON completo en la ruta del config de versión indicada arriba. Una categoría tiene título y `submenus`; una hoja tiene `path-click` localizado. Las categorías no necesitan ruta. Los destinos Markdown usan las rutas reales de los archivos, no el alias `page:<id>`.

```json
{
  "routeDefaults": {
    "RouteGuide": true
  },
  "routes-md": [
    {
      "id": 101,
      "title": {
        "en": "Start",
        "pt": "Início",
        "es": "Inicio"
      },
      "path": {
        "en": "gitpagedocs/docs/versions/0.0.14/en/start.md",
        "pt": "gitpagedocs/docs/versions/0.0.14/pt/start.md",
        "es": "gitpagedocs/docs/versions/0.0.14/es/start.md"
      }
    },
    {
      "id": 102,
      "title": {
        "en": "Next steps",
        "pt": "Próximos passos",
        "es": "Próximos pasos"
      },
      "path": {
        "en": "gitpagedocs/docs/versions/0.0.14/en/next-steps.md",
        "pt": "gitpagedocs/docs/versions/0.0.14/pt/next-steps.md",
        "es": "gitpagedocs/docs/versions/0.0.14/es/next-steps.md"
      }
    }
  ],
  "menus-header-md": [
    {
      "id": 3100,
      "en": {
        "title": "Guides"
      },
      "pt": {
        "title": "Guias"
      },
      "es": {
        "title": "Guías"
      },
      "submenus": [
        {
          "id": 3101,
          "en": {
            "title": "Getting started"
          },
          "pt": {
            "title": "Primeiros passos"
          },
          "es": {
            "title": "Primeros pasos"
          },
          "submenus": [
            {
              "id": 101,
              "en": {
                "title": "Start",
                "path-click": "gitpagedocs/docs/versions/0.0.14/en/start.md"
              },
              "pt": {
                "title": "Início",
                "path-click": "gitpagedocs/docs/versions/0.0.14/pt/start.md"
              },
              "es": {
                "title": "Inicio",
                "path-click": "gitpagedocs/docs/versions/0.0.14/es/start.md"
              }
            },
            {
              "id": 102,
              "en": {
                "title": "Next steps",
                "path-click": "gitpagedocs/docs/versions/0.0.14/en/next-steps.md"
              },
              "pt": {
                "title": "Próximos passos",
                "path-click": "gitpagedocs/docs/versions/0.0.14/pt/next-steps.md"
              },
              "es": {
                "title": "Próximos pasos",
                "path-click": "gitpagedocs/docs/versions/0.0.14/es/next-steps.md"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

Crea `start.md` y `next-steps.md` en las carpetas `en`, `pt` y `es` de esa versión: seis archivos en total. Escribe cada idioma y guarda como UTF-8. Inicia cada página con un título y añade secciones `##` para probar el modo foco. Los bundles de `langs/` contienen el texto de interfaz, separado del contenido de los documentos.

## 3. Cambia la presentación conservando destinos

Con `nestedMenusEnabled: true`, el lector expande Guías → Primeros pasos → página. Con `false`, los mismos destinos aparecen como una lista plana. Añade `submenus` recursivamente cuando el contenido lo justifique; no existe un límite fijo de profundidad configurado. Usa identidades distintas entre hermanos y evita repetir destinos solo para hacer más profundo el árbol.

Los breadcrumbs usan `site.RouteGuide`, después `routeDefaults.RouteGuide` de la versión y finalmente la ruta individual. Gana el valor explícito más específico. `RouteguideBrand` controla el índice separado de encabezados. Las flechas anterior/siguiente del pie siguen los destinos disponibles; `ActiveNavigation` controla la navegación rápida y Ctrl+K.

## 4. Añade medios y verifica

Consulta Documentos PDF para añadir `routes-pdf` y `menus-header-pdf`; el ejemplo `page:23` apunta a la guía en inglés incluida. Vista previa, descarga y nueva pestaña son independientes de la apariencia de sus iconos. Los PDFs externos necesitan CORS para las tres acciones; los PDFs locales dentro de `gitpagedocs/` se preparan al ejecutar o compilar Next.js.

Comprueba todos los idiomas, expande cada categoría y sigue cada hoja. Prueba URLs directas, cambios de texto/icono, primero/anterior/siguiente/último en foco y direcciones desactivadas en los extremos. Inspecciona el config de versión cuando aparece una etiqueta pero falla su destino. Haz commit de la configuración revisada junto con los documentos y anexos referenciados.

> Versión: 0.0.14
