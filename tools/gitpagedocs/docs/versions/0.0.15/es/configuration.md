# Configuración

La configuración de runtime está en `gitpagedocs/config.json`. Los textos de la UI viven al lado, un archivo por idioma.

## Idiomas (`site.languages` + `langs/`)

- `site.languages` en `gitpagedocs/config.json` activa (`true`) o desactiva (`false`) cada idioma, en el orden del menú: `{ "languages": { "en": true, "pt": true, "es": false } }`. Un idioma en `false` desaparece del selector de idiomas y sus textos no se cargan, aunque existan sus docs.
- `gitpagedocs/langs/<lang>.json` guarda los textos de ese idioma: `langmenu` (cabecera, búsqueda, visor de código, reproductor de audio, chat de IA y acceso a los docs) y `translations` (`notFound`, `navigation`, `footer`).
- Para agregar un idioma, crea `langs/<lang>.json` y agrega `"<lang>": true` en `site.languages`.
- Los `config.json` antiguos que aún traen `site.langmenu` / `translations` inline siguen funcionando; cuando existen ambos, los archivos de `langs/` prevalecen y cualquier clave ausente se completa desde la versión actual.

## Sección `site`

Claves principales:

- `name`: título del proyecto en UI
- `defaultLanguage`: idioma por defecto
- `HideThemeSelector`: ocultar/mostrar selector de tema
- `ThemeDefault`: id del tema inicial
- `ThemeModeDefault`: modo inicial (`light` o `dark`)
- `ProjectLink`: URL de repositorio para acciones de cabecera
- `docsVersion`: versión seleccionada por defecto
- `ActiveNavigation`: habilita la navegación rápida y el atajo Ctrl+K
- `FocusMode`: habilita modo foco/lectura
- `icons`: iconos de la cabecera. `icons.defaults` guarda lo que todos comparten (`reactIcon`, `colorDark`, `colorLight`, `size`, `imgDark`, `imgLight`, `imgWidth`, `imgHeight`) y cada icono define su `tag` y lo que cambia (`null` quita un campo). Las claves planas de abajo siguen valiendo y ganan cuando existen ambas formas.
- `IconImageMenuHeaderImgWidth`, `IconImageMenuHeaderImgHeight`: tamaño del icono principal
- `IconImageMenuHeaderLightImg`, `IconImageMenuHeaderDarkImg`: icono principal (light/dark)
- `IconProjectLinkImgWidth`, `IconProjectLinkImgHeight`: tamaño del icono enlace del proyecto
- `IconProjectLinkLightImg`, `IconProjectLinkDarkImg`: icono enlace del proyecto
- `IconVersionLinksImgWidth`, `IconVersionLinksImgHeight`: tamaño del icono enlaces de versión
- `IconVersionLinksLightImg`, `IconVersionLinksDarkImg`: icono enlaces de versión
- `IconInfoHeaderMenuImgWidth`, `IconInfoHeaderMenuImgHeight`: tamaño del icono info
- `IconInfoHeaderMenuLightImg`, `IconInfoHeaderMenuDarkImg`: icono info
- `IconPreviewProjectLinkImgWidth`, `IconPreviewProjectLinkImgHeight`: tamaño del icono preview
- `IconPreviewProjectLinkLightImg`, `IconPreviewProjectLinkDarkImg`: icono preview
- `layoutsConfigPath`: fallback remoto de layouts
- `rendering`: URL canónica publicada

## Posición de la navegación de documentos

Configura el grupo de botones al pie del documento en `gitpagedocs/config.json`:

```json
{ "site": { "documentNavigation": { "position": "center" } } }
```

`position` admite `left`, `center` o `right`; el valor por defecto es `center` (centro). Los valores ausentes o no válidos usan ese valor. Anterior, Siguiente y Volver arriba permanecen juntos en este orden, con la misma alineación en escritorio y móvil. Esta opción posiciona el grupo; `site.backToTop` sigue determinando cuándo aparece la flecha. No cambia la posición de la flecha de la guía de introducción.

## Volver arriba en páginas largas

La flecha para volver arriba en las páginas de documentación y en `/introduction-guide` se controla mediante `site.backToTop` en `gitpagedocs/config.json`:

```json
{ "site": { "backToTop": { "enabled": true, "minPageHeightViewports": 3 } } }
```

Por defecto, la flecha está activada solo en una página desplazable cuya altura total sea al menos tres veces la altura del área visible del navegador. Usa `enabled: false` para ocultarla. `minPageHeightViewports` acepta un número finito mayor que `1`; los valores ausentes o no válidos usan `3`. Por ejemplo, `4` exige una página de al menos cuatro alturas del área visible. El umbral mide la altura total de la página, no la distancia ya recorrida. La misma configuración controla las páginas de documentación y la guía de introducción.

## Controles de idioma, tema, foco, navegación rápida, PDF y documentos

En `gitpagedocs/config.json`, estas entradas de `site.icons` configuran idioma, tema, versión, foco, navegación Ctrl+K, acciones PDF y navegación al pie de los documentos. Los nueve controles utilizan React Icons por defecto:

```json
{
  "site": {
    "icons": {
      "LanguageSelector": {
        "reactIcon": true, "tag": "SiGoogletranslate", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "ThemeSelector": {
        "reactIcon": true, "tag": "LuPencil", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "FocusMode": {
        "reactIcon": true, "tag": "LuBookOpen", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "VersionSelector": {
        "reactIcon": true, "tag": "LuGitBranch", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "QuickNavigation": {
        "reactIcon": true, "tag": "LuSearch", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "PdfDownload": {
        "reactIcon": true, "tag": "LuDownload", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "PdfOpenInNewTab": {
        "reactIcon": true, "tag": "LuExternalLink", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "DocumentPrevious": {
        "reactIcon": true, "tag": "LuChevronLeft", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "DocumentNext": {
        "reactIcon": true, "tag": "LuChevronRight", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      }
    }
  }
}
```

Cada control es independiente: `reactIcon: true` muestra el icono (por defecto); `false` muestra texto. Personaliza `tag`, `size`, `colorDark` y `colorLight` por control; `currentColor` sigue el tema activo. Los controles con iconos conservan sus nombres accesibles, y los selectores conservan sus menús. El atajo Ctrl+K sigue disponible. `site.FocusMode` habilita el modo foco; `site.icons.FocusMode` solo cambia la apariencia del botón. `site.icons.PdfDownload` y `site.icons.PdfOpenInNewTab` seleccionan texto o iconos independientemente; las opciones correspondientes de `site.pdf` y del `pdf` de la ruta controlan la disponibilidad de cada acción.

Las configuraciones compactas pueden mover valores comunes a `site.icons.defaults`; los campos omitidos heredan esos valores. Define `reactIcon: false` en una entrada concreta para sustituir el icono predeterminado por texto.

## Sección `VersionControl`

`site.icons.VersionSelector` utiliza `LuGitBranch` por defecto. Define `reactIcon: false` para mostrar el texto de la versión seleccionada; `true` muestra el icono. Personaliza los mismos campos `tag`, `size`, `colorDark` y `colorLight`. El selector aparece solo cuando hay más de una versión de documentación; conserva el nombre accesible localizado del selector y muestra la versión seleccionada en el tooltip.

`VersionControl.versions` define:

- `id`: identificador de versión
- `path`: ruta de config de versión
- links opcionales (`ProjectLink`, `branch`, `release`, `commit`)
- metadatos opcionales del source viewer (`source-viewer`, `source-viewer-path`)

## Navegación y rutas

- `routes`: rutas markdown por idioma (legado)
- `menus-header`: menú jerarquico
- `translations`: etiquetas UI para not-found y navegación

## Autorización (config de versión)

- `auth`: configuraciones globales de autorización para esa versión
- `auth.accessKeys`: mapa de claves usado por `authorization.accessKeyId`
- `auth.rolesStorageKey`: clave de localStorage para bootstrap de roles
- `auth.providers`: adaptadores de proveedor (`authjs`, `clerk`, `firebase`, `jwt`)

## Tipos de contenido (config de versión)

Los configs de versión soportan múltiples tipos:

- `routes-md`: Rutas markdown con `title`, `description` (centrados vía `titlePosition`, `descriptionPosition`)
- `routes-source-viewer`: Contenedores de código fuente con `source-viewer: true` y `source-viewer-path`
- `routes-html`: Rutas de páginas HTML por idioma
- `routes-video`: Config de vídeo con `video.videoType` (youtube, vimeo, mp4, etc.) y `video.pathVideo`
- `routes-audio`: Config de audio con `audio.audioType` (youtube, mp3, etc.) y `audio.pathAudio`
- `routes-pdf`: PDF con `pdf.pathPdf` por idioma; consulta Documentos PDF.
- `authorization` (md/html/vídeo): guardia de acceso por clave, roles y autenticación externa
- `menus-header-md`, `menus-header-source-viewer`, `menus-header-html`, `menus-header-video`, `menus-header-audio`, `menus-header-pdf`: menús por tipo
- `hierarchyPage`: orden de contenedores en la página `{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }`
- `hierarchyMenu`: orden de secciones del menú `{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }`

Cada ruta puede incluir `title`, `description` (por idioma), `titleCss`, `titlePosition: "center"`, `descriptionPosition: "center"`, `titleIsVisible`, `descriptionIsVisible`.

Los ajustes que comparten todas las rutas se escriben una sola vez en `routeDefaults`, al inicio del config de la versión; cada ruta guarda solo sus propios valores, y un valor escrito en la ruta gana sobre `routeDefaults`.

## Variables por ruta (blockLink, container, url, browseAll)

Opciones por ruta en `routes-md`, `routes-html` y `routes-video`:

- **`blockLink`** (defecto: true) – Para HTML: si true, los enlaces abren en nueva pestaña (`target="_blank"`); si false, en el mismo contexto.
- **`container`** – `"full"` = altura automática; numero (ej: `500`) = altura fija en px con overflow auto. Se aplica a md, html y vídeo.
- **`url`** – Solo en `routes-html`: `Record<LanguageCode, string>` con URLs externas. Al definirse, el iframe usa `src={url}` en vez de HTML local vía `srcDoc`. Las rutas con `url` no generan archivos HTML locales.
- **`browseAll`** (defecto: false) – Si true, el contenedor muestra botones Anterior/Siguiente para navegar entre todos los items de ese tipo.

## Tipos de contenido: path vs url (HTML)

- **Markdown (`routes-md`)**: usa `path` apuntando a archivos `.md` locales.
- **HTML (`routes-html`)**: usa `path` para archivos HTML locales (sin extensión .html en config) o `url` para URLs externas. Con `url`, el iframe carga la página externa; no se genera archivo local.
- **Vídeo (`routes-video`)**: usa `video.pathVideo` y `video.videoType` (youtube, vimeo, mp4, etc.).

## Variables de entorno

- `GITPAGEDOCS_REPOSITORY_SEARCH`: activa/desactiva búsqueda remota en local
- `GITHUB_ACTIONS`: habilita comportamiento específico de GitHub Pages

## Comportamiento del sitio y valores predeterminados

| Clave | Valor / finalidad |
| --- | --- |
| `ActiveNavigation` | true; navegación rápida y atajo Ctrl+K |
| `FocusMode / focusMode` | Activación general (true) y controles independientes de copia, descarga, sección y documento; consulta Modo foco |
| `pdf` | Activación general, vista previa, descarga y nueva pestaña; todos true |
| `containerPagination` | Activo; abajo/a la derecha, cuatro iconos y contador; consulta Contenedores paginados |
| `markdownMarkers` | Activo; colores del tema para destinos resaltados y enlaces del índice; consulta Marcadores de Markdown |
| `nestedMenusEnabled` | true; árbol recursivo, o destinos planos con false |
| `RouteGuide` | true; breadcrumbs, con prioridad para valores de versión y ruta Markdown |
| `accessibility` | Activado por defecto; opciones de narración en Accesibilidad |
| `HideThemeSelector` | false; true oculta el selector de tema |
| `FooterEnabled` | true; muestra el pie de página |
| `FooterLinkName / FooterLinkUrl` | Texto y destino del enlace del pie |
| `FooterDateMode / FooterDateCustom` | browser, year o custom; custom utiliza el texto configurado |
| `SiteHeaderName / SiteIconPath` | Marca de cabecera y ruta del icono del sitio |
| `audioPlayerEnabled` | true; controles de audio de fondo |
| `audioAutoPlayOnLoad` | false; autoplay depende de la política del navegador |
| `audioLoopEnabled / audioSequentialPlayback` | false; repetir pista / avanzar pistas nativas |
| `audioAllowUserChoice` | Permite elegir pista cuando la lista tiene varias entradas |
| `audioTracks` | Objetos con url, type y title por idioma |
| `audioPopoverHideSource / audioPopoverShowMinutes` | false / true; origen y duración de pistas nativas |
| `audioPopoverSourceCustomLabel` | Texto opcional del origen por idioma |
| `mediaExclusivePlayback` | true; un audio entre narración, radio, pistas y vídeo |
| `AiChatEnabled / AiChatAutoLockSeconds` | true / 30; muestra chat y bloquea por inactividad (0 desactiva el temporizador) |
| `docsAccess` | enabled y publicKey configuran el acceso a documentación; los archivos públicos siguen siendo públicos |
| `RouteguideBrandPositionDefault / RouteguideBrandContainerTopDefault` | center / false; posición del índice de títulos, separado de breadcrumbs |
| `TocScrollMaxHeightDesktop / TocScrollMaxHeightMobile` | Límites de desplazamiento del índice; longitudes CSS como min(65vh, 400px) |

## Añadir una versión o documento

Crea la carpeta de versión con su config y regístrala en `VersionControl.versions` con `id` y `path`. Añade una entrada `routes-md` con ID único y rutas por idioma; añade destinos correspondientes en el menú. Usa `routeDefaults` para valores compartidos por las rutas; los campos explícitos de la ruta tienen prioridad. Consulta Navegación para submenús y valores de `RouteGuide`.

Las opciones visuales son configuración pública. Nunca guardes credenciales de proveedor o claves privadas en el JSON del sitio. Los ejemplos de Rutas autorizadas muestran controles del cliente, no protección del servidor para archivos descargables.

La entrada `QuickNavigation` controla la apariencia de icono/texto del botón Ctrl+K. El atajo de teclado y el panel de búsqueda siguen disponibles.

> Versión: 0.0.15
