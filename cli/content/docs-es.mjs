import { practicalEs } from "./practical-es.mjs";
import { operationsEs } from "./operations-es.mjs";
import { overviewsEs } from "./overviews-es.mjs";
import { CONTENT_BLOCKS_DOCS } from "./content-blocks.mjs";
import { PARENT_MENU_JSON } from "./configuration-examples.mjs";

export const docsEs = {
    ...practicalEs,
    ...operationsEs,
    ...overviewsEs,
    contentBlocks: CONTENT_BLOCKS_DOCS.es,
    pdf: `# Documentos PDF

PDF es un tipo de contenido propio junto con Markdown, HTML, código fuente, vídeo y audio. La vista previa utiliza el visor nativo de PDF del navegador. Las acciones de descarga y apertura en una pestaña nueva se configuran de forma independiente.

## Guía del proyecto en inglés

El scaffold incluye la [Guía del proyecto GitPageDocs (PDF, inglés)](https://github.com/Vidigal-code/git-page-docs/blob/main/cli/content/assets/gitpagedocs-project-guide.pdf). Explica el proyecto, paquetes, configuración, iconos, modo foco, narración, CLI, MCP y publicación. El PDF está en inglés; esta referencia está disponible en español, inglés y portugués.

La CLI copia los bytes del anexo a \`gitpagedocs/docs/versions/<versión>/en/gitpagedocs-project-guide.pdf\`. Los tres idiomas del ejemplo apuntan a ese archivo en inglés. Para ofrecer traducciones, añade los PDFs traducidos y cambia la ruta de cada idioma.

## Valores predeterminados del sitio

Añade este bloque dentro de \`site\` en \`gitpagedocs/config.json\`:

\`\`\`json
{
  "pdf": {
    "enabled": true,
    "previewEnabled": true,
    "downloadEnabled": true,
    "openInNewTabEnabled": true
  }
}
\`\`\`

\`enabled\` es el interruptor general del contenido PDF. Los demás campos controlan la vista previa, el botón de descarga y el botón de nueva pestaña. Cada campo omitido toma el valor \`true\`, también en configuraciones antiguas.

La precedencia de las acciones es \`ruta.pdf.<flag>\` > \`site.pdf.<flag>\` > \`true\`. Un \`true\` explícito en la ruta activa esa acción aunque el valor del sitio sea \`false\`; \`site.pdf.enabled: false\` sigue desactivando todos los PDFs. Si falta la ruta del idioma seleccionado, el PDF no está disponible; no hay cambio automático de idioma.

Las acciones PDF usan iconos por defecto. Configura \`site.icons.PdfDownload\` (\`LuDownload\`) y \`site.icons.PdfOpenInNewTab\` (\`LuExternalLink\`) por separado con \`reactIcon\`, \`tag\`, \`size\`, \`colorDark\` y \`colorLight\`. Por ejemplo, \`"PdfDownload": { "reactIcon": false }\` muestra texto en descarga mientras la nueva pestaña conserva su icono. La apariencia no cambia las opciones de activación anteriores.

## Ejemplo de ruta y menú

En \`gitpagedocs/docs/versions/0.0.11/config.json\`, conserva las listas de rutas y menús en el nivel principal:

\`\`\`json
{
  "routes-pdf": [{
    "id": 23,
    "title": { "en": "Project guide (English)", "pt": "Guia do projeto (inglês)", "es": "Guía del proyecto (inglés)" },
    "pdf": {
      "pathPdf": {
        "en": "gitpagedocs/docs/versions/0.0.11/en/gitpagedocs-project-guide.pdf",
        "pt": "gitpagedocs/docs/versions/0.0.11/en/gitpagedocs-project-guide.pdf",
        "es": "gitpagedocs/docs/versions/0.0.11/en/gitpagedocs-project-guide.pdf"
      },
      "previewEnabled": true,
      "downloadEnabled": true,
      "openInNewTabEnabled": true
    }
  }],
  "menus-header-pdf": [{
    "id": 23,
    "en": { "title": "Project guide (English)", "path-click": "page:23" },
    "pt": { "title": "Guia do projeto (inglês)", "path-click": "page:23" },
    "es": { "title": "Guía del proyecto (inglés)", "path-click": "page:23" }
  }]
}
\`\`\`

El mapa \`pdf.pathPdf\` selecciona el archivo del idioma actual. Usa \`page:<id>\` en los destinos del menú PDF. Se admite la misma estructura recursiva de \`submenus\` que en otros menús. El scaffold reserva el ID 23 para el ejemplo PDF y el ID 24 para esta referencia Markdown; utiliza IDs únicos para las páginas adicionales.

Las opciones de la ruta se colocan dentro de \`pdf\`. La presentación compartida, \`container\`, \`RouteGuide\` y la autorización permanecen en el nivel de la ruta. \`routeDefaults\` también se aplica a las rutas PDF. Añade \`"pdf": 5\` en \`hierarchyPage\` y \`hierarchyMenu\` para colocar los PDFs después del audio; ajusta los valores según el orden deseado.

## Archivos y publicación

Las rutas relativas a la raíz del repositorio que empiezan por \`gitpagedocs/\` se copian a los assets públicos del visor al iniciar o compilar Next.js. La URL respeta el subdirectorio de publicación de GitHub Pages. Incluye el PDF en Git y publícalo junto con la documentación generada. Los archivos fuera de \`gitpagedocs/\` deben estar en \`frontend/public/\` del visor o ser accesibles mediante una URL HTTP(S).

Usa la URL del PDF binario, no una página HTML de vista previa del repositorio. Para repositorios remotos, la ruta se resuelve dentro de ese repositorio. La vista previa, la descarga y la apertura en una nueva pestaña obtienen los bytes del archivo, por lo que un servidor externo debe permitir CORS para las tres acciones. El visor valida la firma PDF y crea una URL Blob temporal de tipo \`application/pdf\`. La vista previa y la nueva pestaña utilizan el visor PDF nativo del navegador; la política de incorporación y las cabeceras de tipo/disposición del servidor de origen no controlan esta vista Blob.

El botón de nueva pestaña abre el Blob PDF validado en lugar de navegar a la URL raw del repositorio. También funciona con la vista previa desactivada: la carga comienza cuando el lector descarga o abre el documento. Los bytes cargados se reutilizan para el PDF actual. Los fallos de red/CORS, los PDFs inválidos y el bloqueo de nuevas pestañas muestran un error; no hay fallback automático a la URL raw. El soporte PDF nativo y las preferencias de descarga del navegador siguen determinando cómo se muestra el archivo en la nueva pestaña.

## Lectura y diagnóstico

- Los controles nativos de PDF, teclado, zoom y navegación dependen del visor del navegador. Algunos navegadores móviles abren o descargan el archivo en vez de incorporarlo.
- La vista previa no convierte PDF en Markdown. El modo foco, la navegación por secciones, la copia de Markdown y la narración actúan sobre documentos Markdown, no sobre el PDF incorporado.
- Desactivar la vista previa puede conservar la descarga y la nueva pestaña. Desactivar todas las acciones deja el PDF sin controles interactivos.
- Ocultar un botón no controla el acceso. Los PDFs alojados públicamente siguen disponibles mediante su URL. Los documentos confidenciales necesitan alojamiento protegido.
- Si la vista previa está vacía, confirma que la ruta devuelve un PDF y permite acceso mediante CORS; después prueba la nueva pestaña. Permite ventanas emergentes para el sitio si el navegador bloquea esa acción. Los fallos de descarga y apertura se muestran en la página.
`,
    index: `# Git Page Docs

Git Page Docs es un runtime de documentación multilenguaje para repositorios que incluyen la carpeta \`gitpagedocs/\`.

## Qué ofrece este proyecto

- Renderizado markdown multilenguaje (\`en\`, \`pt\`, \`es\`)
- Ruteo por versión (\`/v/:version\`)
- Sistema de temas con templates JSON
- Ejecución local y en GitHub Pages
- Búsqueda de repositorio + render remoto opcional

## Contrato de carpetas

El runtime espera esta estructura:

- \`gitpagedocs/config.json\`
- \`gitpagedocs/docs/<lang>/*.md\`
- \`gitpagedocs/docs/versions/<version>/config.json\`
- \`gitpagedocs/docs/versions/<version>/<lang>/*.md\`
- \`gitpagelayouts/layoutsConfig.json\`
- \`gitpagelayouts/templates/*.json\`

## Navegación rápida

- Abre **Primeros pasos** para setup local.
- Abre **Configuración** para detalle completo de \`config.json\`.
- Abre **Publicación** para comportamiento local/producción/GitHub Pages.
- Abre **Arquitectura** para mapa de código y flujo de datos.
- Abre **Temas y layouts** para creación de templates.
- Abre **Rutas autorizadas** para configurar clave, roles y autenticación externa.
- Abre **FAQ** para troubleshooting.

## Referencias detalladas

- **Referencia de la CLI**: instalación, todos los comandos y flags de compatibilidad.
- **Servidor MCP**: cliente, 20 tools, 7 resources y configuración de proveedores.
- **Navegación y submenús**: árboles recursivos, URLs y prioridad de breadcrumbs.
- **Bloques de contenido ordenados**: repite y ordena Markdown, HTML, vídeo, audio y PDF en una página; posiciona títulos y descripciones configurados de forma independiente.
- **Modo foco**: copiar/descargar Markdown y navegar por sección/documento.
- **Accesibilidad y narración**: voces del navegador, controles e interacción con medios.
- **Documentos PDF**: vista previa nativa, descarga/nueva pestaña y la guía incluida en inglés.
- **Recetas de configuración**: un sitio multilingüe completo y un menú con secciones dentro de secciones.
- **Migración y compatibilidad**: actualizar configuraciones desde la versión 0.0.1 conservando tu contenido.
- **Solución de problemas**: UTF-8, rutas locales y de Pages, carga de PDF, voces e inicio de MCP.
- **Contribución y validación**: archivos fuente, generación, contratos públicos y comprobaciónes de publicación.
- **Contenedores HTML**: páginas locales y externas, configuración de rutas/menús y el ejemplo interactivo DOOM.

El menú generado mantiene Primeros pasos y la descripción general del proyecto al principio. Guías contiene Configura tu sitio, Lee y explora y Automatiza e integra; cada categoría contiene sus páginas relacionadas. Operación y desarrollo agrupa publicación, mantenimiento y contribución. Git y GitHub contiene los ejemplos del repositorio. Las categorías pueden contener otras categorías sin un límite fijo de niveles.
`,
    gettingStarted: `# Primeros pasos

Git Page Docs separa los archivos de documentación del visor. Instala la CLI para crear los archivos; utiliza el visor oficial, GitHub Pages o un checkout del runtime para mostrarlos.

## Requisitos e instalación

Utiliza Node.js 20 o posterior. Git es necesario para publicar; GitHub CLI es necesario cuando la CLI configura Pages automáticamente.

\`\`\`bash
npm install --save-dev @gitpagedocs/cli
npx gitpagedocs --no-interactive --owner TU_USUARIO --repo TU_REPOSITORIO
\`\`\`

Para una ejecución sin instalación local, utiliza \`npx --yes @gitpagedocs/cli --no-interactive --owner TU_USUARIO --repo TU_REPOSITORIO\`. Para instalar globalmente, utiliza \`npm install -g @gitpagedocs/cli\` y después \`gitpagedocs\`. Ejecuta desde la raíz del repositorio.

## Contrato generado

- \`gitpagedocs/config.json\`: opciones del sitio y referencias de versiones.
- \`gitpagedocs/langs/{en,pt,es}.json\`: textos de la interfaz.
- \`gitpagedocs/docs/versions/<version>/config.json\`: rutas y menús.
- \`gitpagedocs/docs/versions/<version>/{en,pt,es}/*.md\`: contenido; los nombres de archivo permanecen en inglés en los tres idiomas.
- \`gitpagedocs/icon.svg\`: icono del sitio.
- \`--layoutconfig\` también escribe \`gitpagelayouts/\`; \`--layouts-dir\` cambia esa carpeta.

El generador escribe configuración y contenido; no instala una aplicación Next.js en tu repositorio. Ejecutarlo de nuevo vuelve a escribir los archivos del scaffold: revisa el diff de Git antes de conservar cambios en documentación editada manualmente.

## Leer y publicar

Haz commit y push de la carpeta generada y abre \`https://vidigal-code.github.io/git-page-docs/TU_USUARIO/TU_REPOSITORIO/\` para un repositorio público. Para publicar tu propio sitio, autentícate con \`gh auth login\` y ejecuta \`npx gitpagedocs pages deploy --owner TU_USUARIO --repo TU_REPOSITORIO\`. Esto genera archivos, hace commit y push; revisa la ejecución de GitHub Actions. Consulta Publicación para subrutas y el contrato del workflow.

## Desarrollar el visor localmente

Los siguientes comandos pertenecen a un checkout de Git Page Docs, no a un repositorio que solo contiene archivos generados:

\`\`\`bash
git clone https://github.com/Vidigal-code/git-page-docs.git
cd git-page-docs
corepack enable
pnpm install --frozen-lockfile
pnpm dev
\`\`\`

El repositorio fija pnpm en \`packageManager\`. \`pnpm dev\` activa la búsqueda de repositorios; \`pnpm dev:e2e\` utiliza la documentación local. Para producción local, ejecuta \`pnpm build\` y \`pnpm start\`; el script start recompila antes de iniciar. Configura \`PORT=3100\` en el entorno del proceso cuando el puerto 3000 esté ocupado.

## Siguientes pasos

Usa Configuración para idiomas, iconos, navegación, foco y narración; Funcionalidades para CLI y MCP; Temas y diseños para tokens visuales; Preguntas frecuentes para diagnóstico.
`,
    projectOverview: `# Visión general del proyecto

Git Page Docs es un monorepo pnpm + turborepo que convierte la carpeta \`gitpagedocs/\` de un repositorio en un sitio de documentación multilingüe y versionado — con un asistente de IA integrado y un servidor MCP (Model Context Protocol).

## Paquetes del monorepo

- **frontend/** — visor Next.js 15 (App Router, React 19), exportado estáticamente para GitHub Pages.
- **cli/** — el paquete npm publicado \`@gitpagedocs/cli\` (\`npm install -g @gitpagedocs/cli\`): genera la estructura de docs, documenta con IA, configura Pages y ejecuta el servidor MCP.
- **tools/** — \`@gitpagedocs/tools\`, el núcleo de lógica compartido: sistema de IA con 14 proveedores, bóveda de credenciales cifrada, cargador de config, caches y logger.
- **mcp/** — \`@gitpagedocs/mcp\`, servidor Model Context Protocol (20 herramientas + 7 recursos).
- **gitpagedocs/** — el contrato del usuario: \`config.json\`, docs versionados y layouts.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript; exportación estática para GitHub Pages
- gray-matter + marked para Markdown; react-icons
- pnpm workspaces + turborepo; Vitest + Playwright; ESLint

## Destacados

- Multilingüe (\`en\`, \`pt\`, \`es\`) y rutas por versión (\`/v/:version\`)
- Sistema de IA con 14 proveedores (OpenAI, Anthropic, Gemini, Ollama, Mistral, DeepSeek, Cohere, Groq, xAI y más) con streaming
- Claves de IA **cifradas en reposo** (AES-256-GCM) detrás de una contraseña local — nunca en texto plano
- **Panel de chat de IA** en los docs + una **consola \`/ai\`** dedicada
- Sistema de 64 temas (variantes oscuras y claras); ejecución local y en GitHub Pages
`,
    functionalities: `# Funcionalidades

Referencia completa de opciones CLI, claves de configuración y funciones del runtime.

## Línea de comandos

Consulta **Referencia de la CLI** para comandos, flags, ejemplos y compatibilidad. Consulta **Servidor MCP** para integración con editores.

## Tipos de contenido

| Tipo | Clave config | Descripción |
|------|--------------|-------------|
| Markdown | \`routes-md\` | Archivos .md con \`path\` por idioma |
| HTML | \`routes-html\` | \`path\` local o \`url\` externa |
| Vídeo | \`routes-video\` | \`video.pathVideo\`, \`video.videoType\` |
| Audio | \`routes-audio\` | \`audio.pathAudio\`, \`audio.audioType\` |
| PDF | \`routes-pdf\` | \`pdf.pathPdf\` por idioma; vista previa nativa y descarga |

## Visor de código fuente

El config de versión puede renderizar un contenedor **Código fuente** vía \`routes-source-viewer\` y \`menus-header-source-viewer\`. El viewer lee el árbol del repositorio en GitHub en tiempo de ejecución y aplica el tema actual de la documentación.

- Árbol del repositorio desde \`source-viewer-path\`; la branch por defecto es \`main\`
- Navegación por carpetas y filtro de archivos
- Listado de directorios estilo GitHub
- Renderizado de código con números de línea
- Alternancia vista previa/código para Markdown, incluido \`README.md\`
- Carpetas colapsables en la barra lateral

## Claves de config (site)

- \`name\`, \`defaultLanguage\`
- \`docsVersion\`, \`rendering\`, \`ThemeDefault\`, \`ThemeModeDefault\`
- \`ProjectLink\`, \`layoutsConfigPathOficial\`, \`layoutsConfigPath\`
- Idiomas: \`site.languages\` (activa/desactiva cada uno); textos de la UI: \`gitpagedocs/langs/<lang>.json\`

## Reproducción de medios (un sonido a la vez)

\`site.mediaExclusivePlayback\` (por defecto \`true\`): reproducir un vídeo de ruta pausa la radio y las pistas de audio, y reproducir la radio o una pista de audio pausa el vídeo. Funciona con YouTube y Vimeo (mediante las APIs de sus reproductores), archivos nativos (\`mp4\`, \`webm\`, …) y cualquier otro embed.

Para mostrar un vídeo sin sonido mientras la radio o una pista de audio lo explica, usa \`"muted": true\` en el objeto \`video\` de la ruta: el vídeo reproduce solo la imagen y queda fuera de la regla. \`"mediaExclusivePlayback": false\` desactiva la regla en todo el sitio.

## Variables de entorno

- \`GITPAGEDOCS_REPOSITORY_SEARCH\` – búsqueda de repositorio (local)
- \`GITHUB_ACTIONS\` – modo build GitHub Pages

## Asistente de IA

Los docs traen un asistente de IA en dos superficies: un **panel de chat** dentro de los docs (botón de chat de IA en la barra lateral, activado por \`site.AiChatEnabled\`) y una página **consola \`/ai\`** dedicada.

- **14 proveedores** en un único core compartido: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure OpenAI, Mistral, DeepSeek, Cohere, Groq, xAI, Together, Fireworks, Perplexity.
- **Elección de modelo** — desde el catálogo de cada proveedor (\`gitpagedocs models <proveedor>\`); un id de modelo guardado que el proveedor retiró se reemplaza por el predeterminado del proveedor automáticamente.
- **Cifrado en reposo** — tu clave de API se sella con AES-256-GCM detrás de una **contraseña local** y nunca queda en texto plano ni en logs.
- **Bloqueo por inactividad** — el panel de chat se bloquea solo tras \`site.AiChatAutoLockSeconds\` segundos sin uso (por defecto 30, \`0\` lo desactiva): un modal centrado con cuenta regresiva, en tu idioma, permite cancelar o bloquear ahora, y desbloquear pide la contraseña de nuevo.
- **Proveedores resilientes** — los errores transitorios del proveedor se reintentan (3 intentos) y un fallo final es un mensaje simple que termina en "¡Inténtalo de nuevo!".
- **Generación de documentación con IA** — \`gitpagedocs ai\` recorre las rutas elegidas y escribe markdown multilingüe (pt/en/es); reutilizable vía \`.gitpagedocsconfig\`, cuya clave de API queda sellada en la bóveda cifrada \`.gitpagedocsvault\` (la contraseña de la bóveda se pide en cada ejecución). \`gitpagedocs chat\` lleva el mismo asistente a la terminal.

## Servidor MCP

\`gitpagedocs mcp start\` levanta un servidor Model Context Protocol (stdio) que expone **20 tools** (sistema de archivos, IA, generación/análisis de docs) y **7 resources** (\`project://structure|docs|config|repository|readme|ai/providers|ai/models\`) para editores y agentes de IA.
`,
    configuration: `# Configuración

La configuración de runtime está en \`gitpagedocs/config.json\`. Los textos de la UI viven al lado, un archivo por idioma.

## Idiomas (\`site.languages\` + \`langs/\`)

- \`site.languages\` en \`gitpagedocs/config.json\` activa (\`true\`) o desactiva (\`false\`) cada idioma, en el orden del menú: \`{ "languages": { "en": true, "pt": true, "es": false } }\`. Un idioma en \`false\` desaparece del selector de idiomas y sus textos no se cargan, aunque existan sus docs.
- \`gitpagedocs/langs/<lang>.json\` guarda los textos de ese idioma: \`langmenu\` (cabecera, búsqueda, visor de código, reproductor de audio, chat de IA y acceso a los docs) y \`translations\` (\`notFound\`, \`navigation\`, \`footer\`).
- Para agregar un idioma, crea \`langs/<lang>.json\` y agrega \`"<lang>": true\` en \`site.languages\`.
- Los \`config.json\` antiguos que aún traen \`site.langmenu\` / \`translations\` inline siguen funcionando; cuando existen ambos, los archivos de \`langs/\` prevalecen y cualquier clave ausente se completa desde la versión actual.

## Sección \`site\`

Claves principales:

- \`name\`: título del proyecto en UI
- \`defaultLanguage\`: idioma por defecto
- \`HideThemeSelector\`: ocultar/mostrar selector de tema
- \`ThemeDefault\`: id del tema inicial
- \`ThemeModeDefault\`: modo inicial (\`light\` o \`dark\`)
- \`ProjectLink\`: URL de repositorio para acciones de cabecera
- \`docsVersion\`: versión seleccionada por defecto
- \`ActiveNavigation\`: habilita la navegación rápida y el atajo Ctrl+K
- \`FocusMode\`: habilita modo foco/lectura
- \`icons\`: iconos de la cabecera. \`icons.defaults\` guarda lo que todos comparten (\`reactIcon\`, \`colorDark\`, \`colorLight\`, \`size\`, \`imgDark\`, \`imgLight\`, \`imgWidth\`, \`imgHeight\`) y cada icono define su \`tag\` y lo que cambia (\`null\` quita un campo). Las claves planas de abajo siguen valiendo y ganan cuando existen ambas formas.
- \`IconImageMenuHeaderImgWidth\`, \`IconImageMenuHeaderImgHeight\`: tamaño del icono principal
- \`IconImageMenuHeaderLightImg\`, \`IconImageMenuHeaderDarkImg\`: icono principal (light/dark)
- \`IconProjectLinkImgWidth\`, \`IconProjectLinkImgHeight\`: tamaño del icono enlace del proyecto
- \`IconProjectLinkLightImg\`, \`IconProjectLinkDarkImg\`: icono enlace del proyecto
- \`IconVersionLinksImgWidth\`, \`IconVersionLinksImgHeight\`: tamaño del icono enlaces de versión
- \`IconVersionLinksLightImg\`, \`IconVersionLinksDarkImg\`: icono enlaces de versión
- \`IconInfoHeaderMenuImgWidth\`, \`IconInfoHeaderMenuImgHeight\`: tamaño del icono info
- \`IconInfoHeaderMenuLightImg\`, \`IconInfoHeaderMenuDarkImg\`: icono info
- \`IconPreviewProjectLinkImgWidth\`, \`IconPreviewProjectLinkImgHeight\`: tamaño del icono preview
- \`IconPreviewProjectLinkLightImg\`, \`IconPreviewProjectLinkDarkImg\`: icono preview
- \`layoutsConfigPath\`: fallback remoto de layouts
- \`rendering\`: URL canónica publicada

## Controles de idioma, tema, foco, navegación rápida, PDF y documentos

En \`gitpagedocs/config.json\`, estas entradas de \`site.icons\` configuran idioma, tema, foco, navegación Ctrl+K, acciones PDF y navegación al pie de los documentos. Los ocho controles utilizan React Icons por defecto:

\`\`\`json
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
\`\`\`

Cada control es independiente: \`reactIcon: true\` muestra el icono (por defecto); \`false\` muestra texto. Personaliza \`tag\`, \`size\`, \`colorDark\` y \`colorLight\` por control; \`currentColor\` sigue el tema activo. Los controles con iconos conservan sus nombres accesibles, y los selectores conservan sus menús. El atajo Ctrl+K sigue disponible. \`site.FocusMode\` habilita el modo foco; \`site.icons.FocusMode\` solo cambia la apariencia del botón. \`site.icons.PdfDownload\` y \`site.icons.PdfOpenInNewTab\` seleccionan texto o iconos independientemente; las opciones correspondientes de \`site.pdf\` y del \`pdf\` de la ruta controlan la disponibilidad de cada acción.

Las configuraciones compactas pueden mover valores comunes a \`site.icons.defaults\`; los campos omitidos heredan esos valores. Define \`reactIcon: false\` en una entrada concreta para sustituir el icono predeterminado por texto.

## Sección \`VersionControl\`

\`VersionControl.versions\` define:

- \`id\`: identificador de versión
- \`path\`: ruta de config de versión
- links opcionales (\`ProjectLink\`, \`branch\`, \`release\`, \`commit\`)
- metadatos opcionales del source viewer (\`source-viewer\`, \`source-viewer-path\`)

## Navegación y rutas

- \`routes\`: rutas markdown por idioma (legado)
- \`menus-header\`: menú jerarquico
- \`translations\`: etiquetas UI para not-found y navegación

## Autorización (config de versión)

- \`auth\`: configuraciones globales de autorización para esa versión
- \`auth.accessKeys\`: mapa de claves usado por \`authorization.accessKeyId\`
- \`auth.rolesStorageKey\`: clave de localStorage para bootstrap de roles
- \`auth.providers\`: adaptadores de proveedor (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Tipos de contenido (config de versión)

Los configs de versión soportan múltiples tipos:

- \`routes-md\`: Rutas markdown con \`title\`, \`description\` (centrados vía \`titlePosition\`, \`descriptionPosition\`)
- \`routes-source-viewer\`: Contenedores de código fuente con \`source-viewer: true\` y \`source-viewer-path\`
- \`routes-html\`: Rutas de páginas HTML por idioma
- \`routes-video\`: Config de vídeo con \`video.videoType\` (youtube, vimeo, mp4, etc.) y \`video.pathVideo\`
- \`routes-audio\`: Config de audio con \`audio.audioType\` (youtube, mp3, etc.) y \`audio.pathAudio\`
- \`routes-pdf\`: PDF con \`pdf.pathPdf\` por idioma; consulta Documentos PDF.
- \`authorization\` (md/html/vídeo): guardia de acceso por clave, roles y autenticación externa
- \`menus-header-md\`, \`menus-header-source-viewer\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\`, \`menus-header-pdf\`: menús por tipo
- \`hierarchyPage\`: orden de contenedores en la página \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }\`
- \`hierarchyMenu\`: orden de secciones del menú \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }\`

Cada ruta puede incluir \`title\`, \`description\` (por idioma), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

Los ajustes que comparten todas las rutas se escriben una sola vez en \`routeDefaults\`, al inicio del config de la versión; cada ruta guarda solo sus propios valores, y un valor escrito en la ruta gana sobre \`routeDefaults\`.

## Variables por ruta (blockLink, container, url, browseAll)

Opciones por ruta en \`routes-md\`, \`routes-html\` y \`routes-video\`:

- **\`blockLink\`** (defecto: true) – Para HTML: si true, los enlaces abren en nueva pestaña (\`target="_blank"\`); si false, en el mismo contexto.
- **\`container\`** – \`"full"\` = altura automática; numero (ej: \`500\`) = altura fija en px con overflow auto. Se aplica a md, html y vídeo.
- **\`url\`** – Solo en \`routes-html\`: \`Record<LanguageCode, string>\` con URLs externas. Al definirse, el iframe usa \`src={url}\` en vez de HTML local vía \`srcDoc\`. Las rutas con \`url\` no generan archivos HTML locales.
- **\`browseAll\`** (defecto: false) – Si true, el contenedor muestra botones Anterior/Siguiente para navegar entre todos los items de ese tipo.

## Tipos de contenido: path vs url (HTML)

- **Markdown (\`routes-md\`)**: usa \`path\` apuntando a archivos \`.md\` locales.
- **HTML (\`routes-html\`)**: usa \`path\` para archivos HTML locales (sin extensión .html en config) o \`url\` para URLs externas. Con \`url\`, el iframe carga la página externa; no se genera archivo local.
- **Vídeo (\`routes-video\`)**: usa \`video.pathVideo\` y \`video.videoType\` (youtube, vimeo, mp4, etc.).

## Variables de entorno

- \`GITPAGEDOCS_REPOSITORY_SEARCH\`: activa/desactiva búsqueda remota en local
- \`GITHUB_ACTIONS\`: habilita comportamiento específico de GitHub Pages

## Comportamiento del sitio y valores predeterminados

| Clave | Valor / finalidad |
| --- | --- |
| \`ActiveNavigation\` | true; navegación rápida y atajo Ctrl+K |
| \`FocusMode / focusMode\` | Activación general (true) y controles independientes de copia, descarga, sección y documento; consulta Modo foco |
| \`pdf\` | Activación general, vista previa, descarga y nueva pestaña; todos true |
| \`nestedMenusEnabled\` | true; árbol recursivo, o destinos planos con false |
| \`RouteGuide\` | true; breadcrumbs, con prioridad para valores de versión y ruta Markdown |
| \`accessibility\` | Activado por defecto; opciones de narración en Accesibilidad |
| \`HideThemeSelector\` | false; true oculta el selector de tema |
| \`FooterEnabled\` | true; muestra el pie de página |
| \`FooterLinkName / FooterLinkUrl\` | Texto y destino del enlace del pie |
| \`FooterDateMode / FooterDateCustom\` | browser, year o custom; custom utiliza el texto configurado |
| \`SiteHeaderName / SiteIconPath\` | Marca de cabecera y ruta del icono del sitio |
| \`audioPlayerEnabled\` | true; controles de audio de fondo |
| \`audioAutoPlayOnLoad\` | false; autoplay depende de la política del navegador |
| \`audioLoopEnabled / audioSequentialPlayback\` | false; repetir pista / avanzar pistas nativas |
| \`audioAllowUserChoice\` | Permite elegir pista cuando la lista tiene varias entradas |
| \`audioTracks\` | Objetos con url, type y title por idioma |
| \`audioPopoverHideSource / audioPopoverShowMinutes\` | false / true; origen y duración de pistas nativas |
| \`audioPopoverSourceCustomLabel\` | Texto opcional del origen por idioma |
| \`mediaExclusivePlayback\` | true; un audio entre narración, radio, pistas y vídeo |
| \`AiChatEnabled / AiChatAutoLockSeconds\` | true / 30; muestra chat y bloquea por inactividad (0 desactiva el temporizador) |
| \`docsAccess\` | enabled y publicKey configuran el acceso a documentación; los archivos públicos siguen siendo públicos |
| \`RouteguideBrandPositionDefault / RouteguideBrandContainerTopDefault\` | center / false; posición del índice de títulos, separado de breadcrumbs |
| \`TocScrollMaxHeightDesktop / TocScrollMaxHeightMobile\` | Límites de desplazamiento del índice; longitudes CSS como min(65vh, 400px) |

## Añadir una versión o documento

Crea la carpeta de versión con su config y regístrala en \`VersionControl.versions\` con \`id\` y \`path\`. Añade una entrada \`routes-md\` con ID único y rutas por idioma; añade destinos correspondientes en el menú. Usa \`routeDefaults\` para valores compartidos por las rutas; los campos explícitos de la ruta tienen prioridad. Consulta Navegación para submenús y valores de \`RouteGuide\`.

Las opciones visuales son configuración pública. Nunca guardes credenciales de proveedor o claves privadas en el JSON del sitio. Los ejemplos de Rutas autorizadas muestran controles del cliente, no protección del servidor para archivos descargables.

La entrada \`QuickNavigation\` controla la apariencia de icono/texto del botón Ctrl+K. El atajo de teclado y el panel de búsqueda siguen disponibles.
`,
    deployment: `# Publicación

Elige el visor oficial para un repositorio público, pública tu propio GitHub Pages o aloja un export estático compilado desde el runtime.

## Visor oficial

Haz commit de la carpeta \`gitpagedocs/\` generada en tu repositorio público. Abre \`https://vidigal-code.github.io/git-page-docs/OWNER/REPOSITORY/\` y elige versión e idioma. El visor obtiene configuración y contenido del repositorio. Esta URL no convierte un repositorio privado en público.

## Tu sitio en GitHub Pages

Requisitos: repositorio Git, origin GitHub, permiso de push y GitHub CLI autenticado (\`gh auth login\`) cuando la CLI configura Pages.

\`\`\`bash
npx gitpagedocs pages deploy --owner OWNER --repo REPOSITORY
\`\`\`

El flujo confirma el destino, genera docs y \`.github/workflows/gitpagedocs-pages.yml\`, hace commit y push y solicita GitHub Actions como fuente de Pages. Para cambiar solo la fuente, utiliza \`npx gitpagedocs pages actions\`. Para publicar en una subruta, pasa \`--path docs\`.

Revisa GitHub Actions hasta que termine el despliegue; la URL impresa por la CLI puede aparecer antes de finalizar el build remoto. Los sitios de proyecto normalmente utilizan \`https://OWNER.github.io/REPOSITORY/\`; los sitios de usuario/organización utilizan la raíz del repositorio \`OWNER.github.io\`.

## Contrato del build

El workflow instala las dependencias del workspace con pnpm fijado, compila el visor y sube el artefacto estático mediante las actions oficiales de Pages. El job de despliegue necesita \`pages: write\`, \`id-token: write\` y el entorno \`github-pages\`.

- \`GITHUB_ACTIONS=true\` activa el export estático de Next.js.
- \`GITHUB_REPOSITORY=OWNER/REPOSITORY\` determina la base del repositorio.
- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` activa el build de búsqueda inicial.
- \`GITPAGEDOCS_BASE_PATH\` sobrescribe explícitamente la base; \`GITPAGEDOCS_PATH\` define la subruta de docs.
- \`GITPAGEDOCS_DIST_DIR\` separa las salidas de build/dev para dos servidores locales.

\`pnpm build\` sin el entorno de Pages produce un build de producción Next.js; por sí solo no verifica un export estático. Conserva \`.nojekyll\` al alojar el export en Pages.

## Export independiente

En un checkout del runtime con dependencias instaladas, \`node cli/index.mjs --home --output gitpagedocshome --no-interactive\` compila \`frontend/\` y empaqueta una distribución estática. \`--search true\` activa la búsqueda inicial de repositorios. La salida incluye archivos estáticos, README, Dockerfile y ejemplo de entorno; la carpeta de destino se recrea. Un servidor estático sirve los archivos; cambiar una opción de entorno utilizada en el build requiere compilar de nuevo.

## Releases npm para mantenedores

El monorepo pública \`@gitpagedocs/tools\`, \`@gitpagedocs/mcp\` y \`@gitpagedocs/cli\`; raíz y frontend son privados. El \`npm-publish.yml\` actual se ejecuta en pushes a \`main\` y omite una versión de CLI ya publicada. Utiliza el secret \`NPM_TOKEN\` del repositorio y pública workspaces en orden de dependencia. Crear solo una release de GitHub no es su disparador.

Sincroniza versiones y dependencias internas, regenera docs/baselines, ejecuta typecheck, lint, pruebas, smoke, build y Playwright y revisa antes del push. Confirma las tres versiones en npm y el resultado de Pages. La CLI de configuración ignora \`prebuilt/\`; el workflow de publicación no requiere esa carpeta.
`,
    architecture: `# Arquitectura

El proyecto está organizado por fronteras de feature y responsabilidades de runtime.

## Paquetes

- **frontend/** — visor Next.js (Feature-Sliced: app / widgets / features / entities / shared); export estatico.
- **cli/** — el bin publicado \`gitpagedocs\` (hexagonal) + \`cli/ai/\` (CLI de documentación con IA).
- **tools/** — \`@gitpagedocs/tools\`: ai/ security/ crypto/ cache/ config/ logger/ errors/ filesystem/ documentation/ i18n/ ports/.
- **mcp/** — \`@gitpagedocs/mcp\`: herramientas + recursos MCP que delegan a tools/.

## Modulos principales (frontend)

- \`frontend/src/app/[[...repo]]/page.tsx\` — parser de rutas, generateStaticParams, selección de shell.
- \`frontend/src/entities/docs/api/load-docs-data.ts\` — config local/remota, versión, parse markdown, layouts + temas.
- \`frontend/src/widgets/docs-shell/docs-shell.tsx\` — UI, estado idioma/versión/tema, sync de URL, montaje del chat de IA.

## Seguridad: credenciales de IA cifradas

La consola \`/ai\` y el panel de chat exigen una contraseña local que deriva (PBKDF2) una clave AES-256-GCM; las claves quedan cifradas en \`localStorage\` y solo se descifran durante la sesión (\`@gitpagedocs/tools/security\`). El panel se bloquea solo tras \`site.AiChatAutoLockSeconds\` segundos sin uso (por defecto 30; \`0\` lo desactiva): un modal centrado con cuenta regresiva, en el idioma seleccionado, permite cancelar o bloquear ahora, y volver exige la contraseña de nuevo. En la CLI, la clave de \`.gitpagedocsconfig\` queda sellada en la bóveda cifrada \`.gitpagedocsvault\` y la contraseña de la bóveda se pide en cada ejecución.

## Flujo de datos

1. Llega la ruta (\`/owner/repo/v/x.y.z\` o equivalente local)
2. Se resuelve config (local o remoto)
3. Config de versión sobreescribe rutas/menús base
4. Markdown se carga y convierte a HTML
5. Template de layout se resuelve y aplica en CSS vars
6. Shell renderiza contenido y controles

## Puntos de resiliencia

- fallback de carga para layouts/templates
- carga de markdown por idioma con fallback de error
- sincronización de idioma/versión/tema vía localStorage
`,
    githubIssuesProjects: `# GitHub Issues y Projects

Aprende a usar GitHub Issues y Projects para gestionar tu trabajo.

## Conceptos

- Issues para rastrear tareas y bugs
- Projects para visualizar y organizar el trabajo
- Flujos recomendados para equipos
`,
    gitIntroduction: `# Introduccion a Git

Conceptos basicos de Git para principiantes.

## Comandos esenciales

- \`git init\` - iniciar repositorio
- \`git add\` - preparar cambios
- \`git commit\` - registrar commit
- \`git push\` - enviar a remoto
`,
    authorizedRoutes: `# Rutas autorizadas

Protege rutas por clave de acceso, roles requeridos y proveedores externos.

## Ubicacion del config de versión

Configura en:

- \`gitpagedocs/docs/versions/<version>/config.json\`

## Sección global auth

Usa \`auth\` en la raiz del config de versión:

- \`accessKeys\`: mapa de ids de clave al secreto esperado
- \`rolesStorageKey\`: clave de localStorage para bootstrap de roles
- \`providers\`: lista de proveedores externos (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Autorización por ruta

Dentro de cada ruta (\`routes-md\`, \`routes-html\`, \`routes-video\`):

- \`authorization.accessKeyId\`
- \`authorization.requiredRoles\`
- \`authorization.requireExternalAuth\`
- \`authorization.allowedProviders\`

## Fases

### Fase A - Clave de acceso

Define \`authorization.accessKeyId\` y la clave correspondiente en \`auth.accessKeys\`.

### Fase B - Roles

Define \`authorization.requiredRoles\` con uno o más roles.

Los roles pueden venir de:

- query param \`?authRoles=admin,maintainer\`
- localStorage (\`rolesStorageKey\`)
- claims de proveedores externos

### Fase C - Proveedores externos

Define \`authorization.requireExternalAuth=true\` y opcionalmente \`allowedProviders\`.

Adaptadores soportados:

- Auth.js (\`type: "authjs"\`)
- Clerk (\`type: "clerk"\`)
- Firebase Auth (\`type: "firebase"\`)
- JWT custom (\`type: "jwt"\`)
`,
    themes: `# Temas y layouts

Los temas son templates JSON mapeados por \`layoutsConfig.json\`.

## Archivos

- \`gitpagelayouts/layoutsConfig.json\`
- \`gitpagelayouts/layoutsFallbackConfig.json\`
- \`gitpagelayouts/templates/*.json\`

## Modelo de template

Cada template normalmente incluye:

- \`id\`, \`name\`, \`author\`, \`version\`
- \`mode\` y metadatos de par dark/light
- \`colors\`
- \`typography\`
- tokens de \`components\`
- \`animations\`

## Comportamiento en runtime

- tema activo viene de config/selección de usuario
- toggle light/dark resuelve tema pareado por referencia
- variables CSS se generan desde tokens del template

## Buenas practicas

- mantener contraste accesible
- mantener escala consistente de espacios y bordes
- ofrecer variantes dark y light cuando sea posible

## Elegir y personalizar

Elige un tema mediante el selector o configura \`site.ThemeDefault\` con su ID exacto. \`ThemeModeDefault\` define el modo inicial claro/oscuro. \`HideThemeSelector\` oculta el selector; el tema seleccionado sigue aplicado.

En tu repositorio, ejecuta la CLI con \`--layoutconfig\`, edita la plantilla generada y conserva el ID coherente con \`layoutsConfig.json\`. El contenido de ruta y \`site.icons\` son independientes del catálogo de temas. Usa \`currentColor\` para iconos que heredan el color de texto o configura colores claros/oscuros con contraste suficiente.

Al contribuir en Git Page Docs, la fuente es \`gitpagelayouts/v2/base.json\` junto con \`gitpagelayouts/v2/layouts/<id>.json\`. Ejecuta \`pnpm layouts:sync\` para generar plantillas y documentación. La sincronización puede sobrescribir las ediciones directas de plantillas generadas.
`,
    mcp: `# Servidor MCP

El servidor Model Context Protocol expone 20 tools y 7 resources mediante **stdio**. Se inicia como proceso hijo del cliente MCP. No abre un puerto HTTP ni ejecuta un daemon en segundo plano.

## Instalar y conectar

Utiliza Node.js 20+. Instala la CLI en el proyecto con \`npm install --save-dev @gitpagedocs/cli\`; incluye el servidor y el runtime TypeScript. Una instalación global también permite \`gitpagedocs mcp start\`. Para una ejecución puntual, utiliza \`npx --yes @gitpagedocs/cli mcp start\`.

En VS Code, crea \`.vscode/mcp.json\` con la siguiente configuración. El directorio de trabajo del proceso es la raíz del proyecto; el comando MCP no tiene flags \`--root\` o \`--cwd\`.

\`\`\`json
{
  "servers": {
    "gitpagedocs": {
      "type": "stdio",
      "command": "node",
      "args": [
        "\${workspaceFolder}/node_modules/@gitpagedocs/cli/index.mjs",
        "mcp",
        "start"
      ],
      "cwd": "\${workspaceFolder}"
    }
  }
}
\`\`\`

Abre los controles del servidor MCP del cliente, inicia GitPageDocs y lista sus tools/resources. Prueba \`list_files\` con \`{"path":".","recursive":false}\` y lee \`project://readme\`. Estas operaciones no necesitan una clave de proveedor. Un terminal iniciado con \`mcp start\` espera JSON-RPC; el texto común en stdin no es un comando de chat. En un checkout del código, la entrada directa es \`node --import tsx mcp/src/bin.ts\`, no \`index.ts\`.

## Configurar un proveedor

Las llamadas al proveedor leen credenciales del entorno del proceso MCP. MCP no carga \`.env\` ni la bóveda cifrada de la CLI automáticamente. Utiliza la función de entrada protegida/secretos del cliente para inyectar variables; nunca guardes claves reales en configuración versionada. Reinicia el proceso MCP después de cambiar su entorno.

Selecciona el proveedor con \`configure_ai_provider\` o con \`.gitpagedocs-mcp.json\` en la raíz del proyecto:

\`\`\`json
{
  "provider": "ollama",
  "model": "llama3"
}
\`\`\`

| Provider | Environment |
| --- | --- |
| \`openai\` | \`OPENAI_API_KEY\` |
| \`anthropic\` | \`ANTHROPIC_API_KEY / CLAUDE_API_KEY\` |
| \`gemini\` | \`GEMINI_API_KEY / GOOGLE_API_KEY\` |
| \`openrouter\` | \`OPENROUTER_API_KEY\` |
| \`ollama\` | \`OLLAMA_BASE_URL\` |
| \`azure-openai\` | \`AZURE_OPENAI_API_KEY + AZURE_OPENAI_BASE_URL\` |
| \`mistral\` | \`MISTRAL_API_KEY\` |
| \`deepseek\` | \`DEEPSEEK_API_KEY\` |
| \`cohere\` | \`COHERE_API_KEY\` |
| \`groq\` | \`GROQ_API_KEY\` |
| \`xai\` | \`XAI_API_KEY\` |
| \`together\` | \`TOGETHER_API_KEY\` |
| \`fireworks\` | \`FIREWORKS_API_KEY\` |
| \`perplexity\` | \`PERPLEXITY_API_KEY\` |

Sin una selección válida, el proveedor predeterminado es OpenAI. Ollama no requiere clave de API; el servicio local y el modelo elegido deben estar disponibles. \`OLLAMA_BASE_URL\` es opcional. La URL base de Azure es la URL completa de la operación de chat, incluido deployment y versión de API cuando sean necesarios. La lista de modelos es un catálogo distribuido, no una comprobación en tiempo real.

## Referencia de tools

\`?\` indica un argumento opcional. Rutas y contenido son strings; \`recursive\` es booleano. Los identificadores de proveedor proceden del catálogo. Ejecuta las tools mediante la interfaz de herramientas del cliente MCP.

| Tool | Argumentos | Comportamiento |
| --- | --- | --- |
| \`list_files\` | \`path?, recursive?\` | Lista archivos (por defecto: directorio actual, sin recursión) |
| \`read_file\` | \`path\` | Lee texto UTF-8 |
| \`write_file\` | \`path, content\` | Escribe todo el archivo; crea carpetas necesarias |
| \`search_project\` | \`query, extension?\` | Busca por fragmento sin distinguir mayúsculas |
| \`list_ai_providers\` | \`—\` | Consulta el catálogo de proveedores |
| \`list_ai_models\` | \`provider?\` | Consulta el catálogo local de modelos |
| \`configure_ai_provider\` | \`provider, model?\` | Guarda .gitpagedocs-mcp.json |
| \`ask_ai\` | \`prompt, provider?, model?, system?\` | Devuelve una respuesta, sin historial de conversación |
| \`generate_documentation\` | \`path, provider?\` | Documenta un archivo fuente |
| \`generate_api_docs\` | \`path, provider?\` | Describe la API de un archivo |
| \`generate_database_docs\` | \`path, provider?\` | Describe modelos de datos de un archivo |
| \`analyze_source_code\` | \`path, provider?\` | Analiza un archivo fuente |
| \`generate_readme\` | \`provider?\` | Utiliza el árbol y package.json |
| \`generate_architecture_docs\` | \`provider?\` | Utiliza el árbol del repositorio |
| \`analyze_repository\` | \`provider?\` | Analiza el árbol del repositorio |
| \`analyze_project\` | \`provider?\` | Analiza el árbol y package.json |
| \`generate_changelog\` | \`provider?\` | Utiliza hasta 80 commits; utiliza el árbol si no están disponibles |
| \`generate_release_notes\` | \`provider?\` | Utiliza el mismo contexto del changelog |
| \`validate_docs\` | \`provider?\` | Solicita al proveedor una revisión del Markdown recopilado |
| \`update_documentation\` | \`path, instructions?, provider?\` | Genera y escribe una región administrada |

\`generate_*\`, \`analyze_*\`, \`ask_ai\` y \`validate_docs\` devuelven texto; no lo guardan automáticamente. \`validate_docs\` es una revisión del proveedor, no un verificador determinista de enlaces. Solo \`write_file\`, \`configure_ai_provider\` y \`update_documentation\` escriben archivos. \`update_documentation\` conserva texto fuera de \`<!-- gitpagedocs:start -->\` / \`<!-- gitpagedocs:end -->\`; agrega una región si no existe el par válido. El servidor no muestra confirmación propia; configura los permisos en el cliente MCP.

## Referencia de resources

| URI | Contenido |
| --- | --- |
| \`project://structure\` | Árbol del repositorio |
| \`project://docs\` | Documentos Markdown recopilados |
| \`project://config\` | Configuración resuelta y sourcePath |
| \`project://repository\` | Contenido de package.json |
| \`project://readme\` | README.md |
| \`project://ai/providers\` | Catálogo de proveedores |
| \`project://ai/models\` | Catálogo de modelos por proveedor |

## Ejemplo de uso

1. Lee \`project://structure\` y \`project://readme\`.
2. Ejecuta \`list_ai_providers\` y \`list_ai_models\` para elegir proveedor/modelo.
3. Ejecuta \`generate_api_docs\` con \`{"path":"src/index.ts"}\` y revisa el texto devuelto.
4. Guarda el texto aprobado con \`write_file\`, o utiliza \`update_documentation\` con \`{"path":"docs/api.md","instructions":"Documenta la API pública en español."}\` para una región administrada.

La generación envía el contenido seleccionado del proyecto al proveedor configurado.

## Límites y diagnóstico

- Lectura de archivos: hasta 512.000 bytes. Listado: hasta 2.000 entradas; árboles recopilados del proyecto: 400 entradas.
- Búsqueda: hasta 5.000 entradas, 200 resultados y 240 caracteres por línea encontrada.
- Recopilación de documentación: primeros 40 archivos Markdown entre hasta 2.000 entradas; se omiten archivos superiores a 40.000 bytes. El contexto del proveedor se limita a 24.000 caracteres.
- El listado omite carpetas de dependencias/build como \`node_modules\`, \`.git\`, \`.next\`, \`out\`, \`dist\`, \`prebuilt\`, \`.turbo\` y \`coverage\`. No interpreta \`.gitignore\`; archivos como \`.env\` no se excluyen automáticamente. Ejecuta solo en proyectos de confianza y selecciona el contenido que se expondrá.
- La verificación de rutas es léxica; el proceso no es un sandbox del sistema operativo ni garantiza aislamiento de symlinks/junctions. Leer \`project://config\` puede importar configuración JavaScript/TypeScript.
- Los fallos de tools incluyen \`isError: true\`. Los resources ausentes devuelven \`Unavailable: ...\`. Revisa stderr en el cliente para errores de inicio; stdout está reservado para JSON-RPC.
- Si las tools funcionan pero la generación falla, comprueba selección del proveedor, credenciales del entorno, modelo y conectividad.
`,
    cli: `# Referencia de la CLI

## Comandos CLI

| Comando | Descripción |
|---------|-------------|
| \`npx @gitpagedocs/cli\` | Genera config y docs en \`gitpagedocs/\` |
| \`npx @gitpagedocs/cli --layoutconfig\` | Tambien genera layouts/templates locales en \`gitpagelayouts/\` |
| \`npx @gitpagedocs/cli --home\` | Distribucion standalone (\`gitpagedocshome/\`) |
| \`npx @gitpagedocs/cli --push --owner X --repo Y\` | Configura workflow, commit, push |
| \`npx @gitpagedocs/cli --interactive\` / \`-i\` | Modo interactivo con prompts (por defecto en una terminal) |
| \`npx @gitpagedocs/cli --no-interactive\` / \`--yes\` / \`-y\` | Nunca pregunta; usa flags y valores por defecto |
| \`gitpagedocs ai\` | Generador interactivo de documentación con IA |
| \`gitpagedocs chat [pregunta]\` | Chat de IA con streaming en la terminal (REPL en TTY; respuesta única con pregunta o stdin) |
| \`gitpagedocs provider [id]\` / \`models [provider]\` | Lista proveedores de IA / modelos del catálogo |
| \`gitpagedocs document[:repo\\|:file\\|:folder]\` | Genera documentación con IA |
| \`gitpagedocs deploy\` / \`pages [actions\\|deploy]\` | Configura GitHub Pages vía Actions + push |
| \`gitpagedocs docs\` | Actualiza las regiones gestionadas de README/CONTRIBUTING/SECURITY |
| \`gitpagedocs password\` | Define la contraseña de acceso a la documentación (clave pública en \`site.docsAccess\`) |
| \`gitpagedocs config\` / \`config clear\` | Muestra la config resuelta / borra la config guardada y la bóveda de claves |
| \`gitpagedocs doctor\` / \`version\` / \`update\` | Diagnóstico / versión / comprobación de actualización en el registro |
| \`gitpagedocs mcp start\` | Inicia el servidor MCP por stdio |

Instala globalmente con \`npm install -g @gitpagedocs/cli\` o ejecuta sin instalar con \`npx @gitpagedocs/cli\`.

## Opciones CLI

| Opcion | Descripción |
|--------|-------------|
| \`--owner <user>\` | Owner de GitHub |
| \`--repo <repo>\` | Repositorio GitHub |
| \`--path <subpath>\` | Subruta de docs (ej: \`docs\`); sin ella, base path = nombre del repo para CSS/JS en project sites |
| \`--output <dir>\` | Directorio de salida (default: \`gitpagedocs\`) |
| \`--search <true-or-false>\` | Habilita/deshabilita búsqueda de repositorio (\`--home\`) |
| \`--layoutconfig\` | Genera layouts locales en \`gitpagelayouts/\` |
| \`--layouts-dir <dir>\` | Carpeta de layouts locales (por defecto: \`gitpagelayouts\`) |
| \`--push\` | Crea workflow, commit de artefactos, push |
| \`--pages-actions\` | Solo cambia la fuente de GitHub Pages a GitHub Actions (igual que \`pages actions\`) |
| \`--home\` | Genera \`gitpagedocshome/\` (estatico + .env + Dockerfile) |

## Salida generada

- \`gitpagedocs/config.json\` – config raiz
- \`gitpagedocs/icon.svg\` – icono por defecto
- \`gitpagedocs/docs/versions/<ver>/config.json\` – rutas por versión
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` – docs en markdown
- \`gitpagelayouts/\` – solo con \`--layoutconfig\` (carpeta configurable con \`--layouts-dir\`)

## Ejemplos y límites de los comandos

\`\`\`bash
npx gitpagedocs --no-interactive --owner octocat --repo handbook
npx gitpagedocs --layoutconfig --layouts-dir assets/layouts --no-interactive
npx gitpagedocs chat "Explica este proyecto" --provider ollama --model llama3
npx gitpagedocs pages deploy --owner octocat --repo handbook --path docs
npx gitpagedocs mcp start
\`\`\`

- \`init\` es un alias de generación. \`providers\` equivale a \`provider\`; \`--version\` y \`-v\` equivalen a \`version\`.
- \`document\`, \`document:repo\`, \`document:file\`, \`document:folder\` y \`--ai\` seleccionan el flujo interactivo de documentación. Elige directorios en sus preguntas; estos alias no implementan una API separada de archivo/carpeta mediante argumento posicional.
- \`chat\` acepta \`--provider <id>\`, \`--model <id>\` y \`--system <prompt>\`. Con una pregunta o stdin responde una vez; un terminal interactivo sin pregunta inicia una conversación.
- \`--build\`, \`--serve\` y \`--full\` son flags de compatibilidad: el scaffold habitual sigue siendo solo configuración y no inician un servidor local.
- \`--home\` compila \`frontend/\` desde un checkout del runtime y escribe el export estático con archivos auxiliares. La carpeta de salida se recrea cuando no es \`.\`; conserva la documentación fuente fuera de ella. Instalar solo la CLI no proporciona \`frontend/\`.
- \`pages actions\` solo configura la fuente de Pages; \`pages deploy\` y \`--push\` generan, hacen commit y push. Una URL impresa no significa que el build remoto haya terminado: revisa GitHub Actions.
- \`update\` consulta npm e imprime un comando de instalación; no actualiza la CLI silenciosamente.

## Configuración y credenciales

Las opciones visuales están en \`gitpagedocs/config.json\`. El generador interactivo/chat guarda \`.gitpagedocsconfig\` y su bóveda cifrada \`.gitpagedocsvault\` en la carpeta de configuración del usuario: \`%APPDATA%/gitpagedocs\` en Windows, \`~/Library/Application Support/gitpagedocs\` en macOS y la carpeta XDG en Linux. \`config clear\` elimina esa configuración y la bóveda. MCP utiliza \`.gitpagedocs-mcp.json\` en la raíz del proyecto y el entorno del proceso; consulta la página MCP.

\`gitpagedocs docs\` actualiza solo regiones delimitadas por marcadores en README.md, CONTRIBUTING.md y SECURITY.md, conservando el texto alrededor. \`password\` configura el par de claves de acceso a la documentación; los controles de presentación del cliente no vuelven confidenciales los archivos de un repositorio público.
`,
    navigation: `# Navegación y submenús

Las rutas definen el contenido; los menús definen cómo encontrarlo. Configúralos en \`gitpagedocs/docs/versions/<version>/config.json\`. Las opciones visuales globales están en \`gitpagedocs/config.json\`.

\`\`\`json
{
  "site": {
    "nestedMenusEnabled": true,
    "RouteGuide": true
  }
}
\`\`\`

## Crear el árbol de menús

Cada entrada de \`menus-header-md\` tiene \`id\` y objetos \`pt\`, \`en\`, \`es\` con \`title\` y \`path-click\` opcional. Añade \`submenus\` con nuevas entradas para anidar el árbol. El objeto de un idioma también acepta \`submenus\` localizados con título/ruta. Utiliza una forma de manera consistente para no listar el mismo hijo dos veces.

Los grupos sin \`path-click\` organizan sus hijos. Para el destino de una ruta Markdown, utiliza su ruta localizada real de \`routes-md[].path\`. Las rutas source-viewer, vídeo, audio, PDF y las composiciones explícitas de \`pages\` registran \`page:<id>\`; una ruta Markdown simple utiliza la ruta del archivo. El ejemplo utiliza la versión \`0.0.8\`: sustituye ese segmento por la versión editada y crea los tres archivos chapter.

\`\`\`json
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
\`\`\`

## Comportamiento del anidamiento

Un padre puede ser documento y grupo a la vez. Conserva su \`path-click\` localizado junto con \`submenus\`: el título abre su página Markdown y la flecha separada expande o contrae los hijos. El scaffold incluye resúmenes útiles para los ocho grupos padres. Los antecesores de los breadcrumbs enlazan a esos documentos; el destino actual sigue marcado como actual. Un grupo sin ruta puede organizar hijos, pero no tiene un destino para abrir.

El siguiente fragmento utiliza las rutas Markdown 31, 32 y 13 incluidas en el scaffold. Combínalo con \`menus-header-md\` y conserva las definiciones correspondientes en \`routes-md\` y sus archivos:

\`\`\`json
${PARENT_MENU_JSON}
\`\`\`

\`site.nestedMenusEnabled: true\` muestra menús recursivos expandibles. Puedes añadir \`submenus\` en cualquier nodo: no existe un límite fijo de profundidad en la aplicación. La configuración debe ser finita y adecuada para la memoria del navegador y la usabilidad. Con \`false\`, los destinos aparecen en una lista plana; las páginas anidadas no se eliminan.

El árbol sirve para navegación lateral, etiquetas de búsqueda, expansión de padres y rutas de navegación. Mantén IDs estables y sin ambigüedad; los destinos protegidos siguen las reglas de autorización de su página. La misma estructura se aplica a \`menus-header-source-viewer\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\` y \`menus-header-pdf\`. \`hierarchyMenu\` ordena las secciones por tipo; \`hierarchyPage\` ordena los contenedores que comparten el ID de página.

## Ruta de navegación: RouteGuide

\`RouteGuide\` controla los breadcrumbs. La prioridad es \`routes-md[].RouteGuide\` de la página, después \`routeDefaults.RouteGuide\` de la versión, después \`site.RouteGuide\`, con \`true\` como valor final por defecto. El ejemplo desactiva la ruta de navegación para la versión y la activa en el capítulo 101. Los archivos existentes de la versión \`0.0.8\` aceptan los mismos campos.

\`RouteguideBrand\` y \`RouteguideBrandPosition\` son opciones separadas del índice de títulos del documento; no controlan los breadcrumbs.

## URLs y anterior/siguiente

Las URLs versionadas utilizan \`/v/<version>/\`; \`?lang=pt\` elige el idioma y \`?id=101\` elige la página. \`?name=chapter\` selecciona el slug del documento. Mantén \`VersionControl.versions[].path\` apuntando al config de la versión correspondiente. \`site.ActiveNavigation\` activa la navegación rápida y su atajo Ctrl+K. Los controles anterior/siguiente del pie siguen los destinos disponibles en el menú; la navegación entre documentos en modo foco tiene su propia opción. Consulta Modo foco para controles de sección y documento.

Los botones anterior/siguiente del pie usan \`site.icons.DocumentPrevious\` (\`LuChevronLeft\`) y \`site.icons.DocumentNext\` (\`LuChevronRight\`) por defecto. Define \`reactIcon: false\` en cualquier entrada para mostrar su texto traducido; cada entrada también acepta \`tag\`, \`size\`, \`colorDark\` y \`colorLight\`. La apariencia no cambia la navegación: el pie aparece cuando hay más de un destino disponible en el menú, y la dirección no disponible permanece desactivada en los extremos.

Prueba un menú nuevo desde la barra lateral, por URL directa y en cada idioma habilitado; confirma que el destino existe y está permitido para el lector actual.
`,
    focusMode: `# Modo foco

El modo foco abre el documento Markdown actual en un diálogo de lectura. Actívalo con \`site.FocusMode\`; el control solo está disponible para una página Markdown real. \`site.icons.FocusMode\` cambia la apariencia de icono/texto y no activa ni desactiva la función.

## Configurar los controles

Combina este fragmento con \`gitpagedocs/config.json\`:

\`\`\`json
{
  "site": {
    "FocusMode": true,
    "focusMode": {
      "copyEnabled": true,
      "downloadEnabled": true,
      "sectionNavigationEnabled": true,
      "documentNavigationEnabled": true
    }
  }
}
\`\`\`

Cada opción tiene valor predeterminado \`true\`; \`false\` oculta la acción o el grupo de navegación correspondiente. Con \`sectionNavigationEnabled: false\`, el modo foco muestra el documento completo sin paginación por secciones. Las configuraciones existentes sin el nuevo objeto \`focusMode\` mantienen los controles activados.

## Secciones y documentos

- La navegación por secciones tiene cuatro botones: primera sección, sección anterior, sección siguiente y última sección del documento actual.
- La navegación por documentos tiene cuatro botones: primer documento, documento anterior, documento siguiente y último documento en el orden del menú, incluidos los submenús.
- \`sectionNavigationEnabled\` controla los cuatro botones de sección; \`documentNavigationEnabled\` controla los cuatro botones de documento. Las direcciones no disponibles quedan desactivadas en los extremos.
- Se omiten documentos sin traducción en el idioma activo, destinos que no son Markdown y páginas sin permiso.
- Cambiar de documento mantiene abierto el diálogo y vuelve a la primera sección. Los contadores de sección/documento muestran la posición actual.
- \`site.ActiveNavigation\` controla la navegación rápida; no desactiva la navegación de documentos en modo foco.

## Copiar y descargar

En una página compuesta, foco lee los bloques Markdown autorizados en orden, incluidas las repeticiones. Copiar/descargar une esas fuentes y utiliza \`page-<id>.md\`; las acciones individuales de los bloques conservan sus nombres originales. Consulta Bloques de contenido ordenados para el contrato completo.

Copiar y descargar utilizan el **Markdown original completo en el idioma seleccionado**, incluidas las secciones que no están visibles. No exportan el HTML renderizado ni solo la sección actual.

La descarga conserva el nombre base Markdown del \`path\` localizado de la ruta; si no está disponible, el nombre del archivo es \`document.md\`. El portapapeles sigue las reglas de permisos y contexto seguro del navegador. Si la copia falla, utiliza la descarga y consulta el error mostrado.

## Teclado y lectura

El diálogo tiene nombre accesible, gestión de foco del teclado y control de cierre. Usa Tab para recorrer controles y Escape para cerrar. Los controles de solo icono conservan nombres traducidos accesibles. Cerrar el diálogo vuelve a la documentación.

La narración se configura por separado en Accesibilidad. Cambiar de documento o idioma cancela la narración anterior para que no siga leyendo contenido antiguo.
`,
    accessibility: `# Accesibilidad y narración

Los controles de accesibilidad incluyen narración nativa del navegador para el documento Markdown actual. La narración utiliza Web Speech API (\`speechSynthesis\`); no necesita clave de API ni un servicio externo de voz de GitPageDocs.

## Configuración

Combina estas opciones con \`gitpagedocs/config.json\`:

\`\`\`json
{
  "site": {
    "accessibility": {
      "enabled": true,
      "narration": {
        "enabled": true,
        "defaultRate": 1,
        "defaultVolume": 1
      }
    },
    "mediaExclusivePlayback": true
  }
}
\`\`\`

- \`site.accessibility.enabled\`: activa la interfaz de accesibilidad.
- \`site.accessibility.narration.enabled\`: activa la narración del documento.
- \`defaultRate\`: velocidad inicial de \`0.5\` a \`2\`, en pasos de \`0.25\`; el valor predeterminado es \`1\`.
- \`defaultVolume\`: volumen inicial de \`0\` (silencio) a \`1\` (máximo), en pasos de \`0.1\`; el valor predeterminado es \`1\`.
- Todos los controles de activación tienen valor predeterminado \`true\`; las opciones ausentes usan los valores distribuidos.

## Leer un documento en voz alta

1. Abre una página Markdown y los controles de accesibilidad/narración.
2. Elige voz e idioma entre los que ofrece el navegador; ajusta velocidad y volumen.
3. Inicia la lectura. Pausa temporalmente, reanuda la voz pausada o detén la sesión.
4. Para cambiar opciones de lectura de manera previsible, detén, ajusta los controles e inicia de nuevo.

La narración empieza solo después de tu acción; no hay reproducción automática. La selección automática de voz sigue el idioma del documento; elegir una voz explícitamente utiliza el idioma de esa voz. La narración no traduce el documento.

La voz utiliza texto legible extraído del Markdown renderizado. Se excluyen scripts, estilos, contenido SVG y elementos ocultos para tecnologías de asistencia. Los documentos largos se leen completos en bloques sucesivos. Cambiar de documento o idioma, desactivar la narración o salir de la página cancela la voz anterior.

La vista habitual y el modo foco comparten preferencias de voz, velocidad y volumen mientras la página permanece montada. Las preferencias no se guardan entre recargas. Los valores no numéricos de velocidad o volumen usan \`1\`; los valores numéricos fuera de los rangos admitidos se limitan al extremo más cercano.

## Un audio a la vez

Con \`site.mediaExclusivePlayback: true\` (por defecto), iniciar o reanudar la narración pausa radio, pistas de audio y vídeos de ruta. Iniciar esos medios detiene la narración. Los vídeos silenciados quedan fuera de la regla. Utiliza \`false\` cuando la reproducción simultánea sea intencional.

La configuración se comparte con la reproducción de medios existente; no hay una segunda flag de exclusividad para narración. La página sigue siendo legible con la narración desactivada.

## Disponibilidad del navegador y las voces

El soporte de voz y las voces dependen del navegador, sistema operativo y voces instaladas o proporcionadas remotamente. La lista puede llegar después de cargar la página. Distintos navegadores y dispositivos pueden ofrecer idiomas diferentes.

La falta de soporte y los errores de reproducción se muestran en la interfaz. Comprueba que haya una voz utilizable, que el audio del sistema esté activo y que exista una interacción del usuario con la página. Una lista vacía de voces no indica que el documento no se haya cargado.

No supongas que todas las voces funcionan sin conexión: pueden ser locales o remotas. Esta función habla texto; no graba el micrófono. La narración complementa la navegación por teclado y los lectores de pantalla, sin sustituirlos.

Consulta la [referencia de Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) para el comportamiento del navegador.
`,
    faq: `# FAQ

## ¿Por qué repositorios remotos no abren en local?

Verifica:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` en \`.env\`
- repositorio objetivo contiene \`gitpagedocs/config.json\`
- paths markdown del repositorio coinciden con su config de rutas

## ¿Por qué una ruta de versión muestra contenido incorrecto?

Verifica:

- \`VersionControl.versions[*].path\` en \`gitpagedocs/config.json\`
- config de versión tiene \`routes\` y \`menus-header\` válidos
- markdown existe para cada idioma

## ¿Por qué tema no se aplica correctamente?

Verifica:

- \`layoutsConfig.json\` referencia templates válidos
- ids de template son únicos
- tema seleccionado existe en el mapa de temas cargados

## ¿Por qué GitHub Pages puede comportarse distinto a local?

Porque el build de GitHub Pages habilita la página inicial de búsqueda y comportamiento específico de exportación.

## ¿Por qué el icono sigue mostrando texto?

Define \`site.icons.<Control>.reactIcon\` como booleano \`true\`, con el nombre exacto exportado por React Icons en \`tag\`. LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious y DocumentNext usan iconos por defecto; cambia cualquier entrada a \`false\` para mostrar texto. Los campos planos \`Icon*ReactIcones\` tienen prioridad si existen ambos formatos. Comprueba si la propia función está desactivada mediante \`HideThemeSelector\`, \`FocusMode\` o las acciones PDF.

## ¿Por qué los hijos del menú o breadcrumbs son diferentes?

\`nestedMenusEnabled: false\` aplana los destinos intencionalmente. Revisa \`submenus\`, objetos de idioma y \`path-click\`; confirma que las páginas existan y sean accesibles. Los breadcrumbs utilizan \`RouteGuide\`, con prioridad ruta > versión > sitio. \`RouteguideBrand\` controla el índice de títulos.

## ¿Por qué la narración está muda o se interrumpe?

Comprueba soporte del navegador, voz disponible, idioma, volumen y salida de audio. Las voces pueden cargar después o requerir un servicio remoto. Con \`mediaExclusivePlayback: true\`, otra fuente de audio/vídeo detiene la narración por diseño. Cambiar de documento cancela la voz anterior. Consulta Accesibilidad.

## ¿Por qué MCP espera o falla una tool?

\`mcp start\` espera un cliente MCP por stdio; no es un chat de terminal. Comprueba cwd y utiliza la entrada de CLI publicada o \`mcp/src/bin.ts\`. Las tools de archivos/catálogo no necesitan proveedor; la generación requiere credenciales en el entorno del proceso MCP. La bóveda de CLI y \`.env\` no se cargan automáticamente; revisa \`isError\` y stderr del cliente.

## ¿Por qué regenerar cambió mis páginas?

El scaffold vuelve a escribir rutas, configs y documentación generada. Revisa Git y conserva el contenido específico en sus fuentes. En este repositorio, edita \`cli/content/docs-{en,pt,es}.mjs\` y los metadatos de rutas antes de regenerar; no uses las copias generadas como única fuente.
`,
  };
