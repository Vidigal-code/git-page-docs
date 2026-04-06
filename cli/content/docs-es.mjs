export const docsEs = {
    index: `# Git Page Docs

Git Page Docs es un runtime de documentacion multilenguaje para repositorios que incluyen la carpeta \`gitpagedocs/\`.

## Que entrega este proyecto

- Renderizado markdown multilenguaje (\`en\`, \`pt\`, \`es\`)
- Ruteo por version (\`/v/:version\`)
- Sistema de temas con templates JSON
- Ejecucion local y en GitHub Pages
- Busqueda de repositorio + render remoto opcional

## Contrato de carpetas

El runtime espera esta estructura:

- \`gitpagedocs/config.json\`
- \`gitpagedocs/docs/<lang>/*.md\`
- \`gitpagedocs/docs/versions/<version>/config.json\`
- \`gitpagedocs/docs/versions/<version>/<lang>/*.md\`
- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

## Navegacion rapida

- Abre **Primeros pasos** para setup local.
- Abre **Configuracion** para detalle completo de \`config.json\`.
- Abre **Publicacion** para comportamiento local/produccion/GitHub Pages.
- Abre **Arquitectura** para mapa de codigo y flujo de datos.
- Abre **Temas y layouts** para creacion de templates.
- Abre **Rutas autorizadas** para configurar clave, roles y autenticacion externa.
- Abre **FAQ** para troubleshooting.
`,
    gettingStarted: `# Primeros pasos

Esta guia lleva el proyecto desde cero hasta docs corriendo.

## Requisitos

- Node.js 20+
- npm 10+ (o pnpm)

## Setup local

1. Instala dependencias:
   - \`npm install\`
2. Genera/actualiza artefactos de docs:
   - \`npm run gitpagedocs\`
3. Inicia desarrollo:
   - \`npm run dev\`
4. Build + ejecucion local de produccion:
   - \`npm run build\`
   - \`npm start\`

## Comportamiento de la CLI

\`npx gitpagedocs\` (o \`npm run gitpagedocs\`) genera artefactos en la carpeta oficial \`gitpagedocs/\`.

- Genera solo markdown/json
- No genera \`index.html\`
- No genera \`index.js\`
- No ejecuta comandos de instalacion

## Modo de busqueda por repositorio

En local, se controla por variable:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\`
- \`GITPAGEDOCS_REPOSITORY_SEARCH=false\`

En build de GitHub Pages (\`GITHUB_ACTIONS=true\`), la busqueda de repositorio siempre esta activa.
`,
    projectOverview: `# Vision general del proyecto

Git Page Docs esta impulsado por Next.js 15, React 19, TypeScript y Node.js. Genera documentacion multilingue para GitHub Pages.

## Stack

- Next.js 15
- React 19
- TypeScript
- Node.js 20+

## Objetivo

Construir documentacion multilingue para repositorios GitHub con soporte para versiones, temas y contenido md/html/video.
`,
    functionalities: `# Funcionalidades

Referencia completa de opciones CLI, claves de configuracion y funciones del runtime.

## Comandos CLI

| Comando | Descripcion |
|---------|-------------|
| \`npx gitpagedocs\` | Genera config y docs en \`gitpagedocs/\` |
| \`npx gitpagedocs --layoutconfig\` | Tambien genera layouts/templates locales |
| \`npx gitpagedocs --home\` | Distribucion standalone (\`gitpagedocshome/\`) |
| \`npx gitpagedocs --push --owner X --repo Y\` | Configura workflow, commit, push |
| \`npx gitpagedocs --interactive\` / \`-i\` | Modo interactivo con prompts |

## Opciones CLI

| Opcion | Descripcion |
|--------|-------------|
| \`--owner <user>\` | Owner de GitHub |
| \`--repo <repo>\` | Repositorio GitHub |
| \`--path <subpath>\` | Subruta de docs (ej: \`docs\`); sin ella, base path = nombre del repo para CSS/JS en project sites |
| \`--output <dir>\` | Directorio de salida (default: \`gitpagedocs\`) |
| \`--search true|false\` | Habilita/deshabilita busqueda de repositorio (\`--home\`) |
| \`--layoutconfig\` | Genera \`gitpagedocs/layouts/\` |
| \`--push\` | Crea workflow, commit de artefactos, push |
| \`--home\` | Genera \`gitpagedocshome/\` (estatico + .env + Dockerfile) |

## Salida generada

- \`gitpagedocs/config.json\` – config raiz
- \`gitpagedocs/icon.svg\` – icono por defecto
- \`gitpagedocs/docs/versions/<ver>/config.json\` – rutas por version
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` – docs en markdown
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer\` – visor de codigo (estilo GitHub)
- \`gitpagedocs/layouts/\` – solo con \`--layoutconfig\`

## Tipos de contenido

| Tipo | Clave config | Descripcion |
|------|--------------|-------------|
| Markdown | \`routes-md\` | Archivos .md con \`path\` por idioma |
| HTML | \`routes-html\` | \`path\` (ej: source-viewer) o \`url\` externa |
| Video | \`routes-video\` | \`video.pathVideo\`, \`video.videoType\` |
| Audio | \`routes-audio\` | \`audio.pathAudio\`, \`audio.audioType\` |

## Visor de codigo fuente

La CLI genera una pagina **Codigo fuente** por version. Escanea \`src/\`, \`cli/\` y archivos raiz (README.md, package.json, next.config.ts, etc.) y construye un visor estilo GitHub en modo oscuro con:

- Arbol de archivos en barra lateral con expandir/colapsar carpetas
- Filtro de busqueda
- Resaltado de sintaxis (TypeScript, JavaScript, JSON, CSS, Markdown)
- Boton copiar, numeros de linea
- Alternar vista previa/codigo del README.md
- Controles Expandir todo / Colapsar todo

## Claves de config (site)

- \`name\`, \`defaultLanguage\`, \`supportedLanguages\`
- \`docsVersion\`, \`rendering\`, \`ThemeDefault\`, \`ThemeModeDefault\`
- \`ProjectLink\`, \`layoutsConfigPathOficial\`, \`layoutsConfigPath\`

## Variables de entorno

- \`GITPAGEDOCS_REPOSITORY_SEARCH\` – busqueda de repositorio (local)
- \`GITHUB_ACTIONS\` – modo build GitHub Pages
`,
    configuration: `# Configuracion

La configuracion de runtime esta en \`gitpagedocs/config.json\`.

## Seccion \`site\`

Claves principales:

- \`name\`: titulo del proyecto en UI
- \`defaultLanguage\`: idioma por defecto
- \`supportedLanguages\`: lista de idiomas disponibles
- \`HideThemeSelector\`: ocultar/mostrar selector de tema
- \`ThemeDefault\`: id del tema inicial
- \`ThemeModeDefault\`: modo inicial (\`light\` o \`dark\`)
- \`ProjectLink\`: URL de repositorio para acciones de cabecera
- \`docsVersion\`: version seleccionada por defecto
- \`ActiveNavigation\`: habilita anterior/siguiente
- \`FocusMode\`: habilita modo foco/lectura
- \`IconImageMenuHeaderImgWidth\`, \`IconImageMenuHeaderImgHeight\`: tamano del icono principal
- \`IconImageMenuHeaderLightImg\`, \`IconImageMenuHeaderDarkImg\`: icono principal (light/dark)
- \`IconProjectLinkImgWidth\`, \`IconProjectLinkImgHeight\`: tamano del icono enlace del proyecto
- \`IconProjectLinkLightImg\`, \`IconProjectLinkDarkImg\`: icono enlace del proyecto
- \`IconVersionLinksImgWidth\`, \`IconVersionLinksImgHeight\`: tamano del icono enlaces de version
- \`IconVersionLinksLightImg\`, \`IconVersionLinksDarkImg\`: icono enlaces de version
- \`IconInfoHeaderMenuImgWidth\`, \`IconInfoHeaderMenuImgHeight\`: tamano del icono info
- \`IconInfoHeaderMenuLightImg\`, \`IconInfoHeaderMenuDarkImg\`: icono info
- \`IconPreviewProjectLinkImgWidth\`, \`IconPreviewProjectLinkImgHeight\`: tamano del icono preview
- \`IconPreviewProjectLinkLightImg\`, \`IconPreviewProjectLinkDarkImg\`: icono preview
- \`layoutsConfigPath\`: fallback remoto de layouts
- \`rendering\`: URL canonica publicada

## Seccion \`VersionControl\`

\`VersionControl.versions\` define:

- \`id\`: identificador de version
- \`path\`: ruta de config de version
- links opcionales (\`ProjectLink\`, \`branch\`, \`release\`, \`commit\`)

## Navegacion y rutas

- \`routes\`: rutas markdown por idioma (legado)
- \`menus-header\`: menu jerarquico
- \`translations\`: etiquetas UI para not-found y navegacion

## Autorizacion (config de version)

- \`auth\`: configuraciones globales de autorizacion para esa version
- \`auth.accessKeys\`: mapa de claves usado por \`authorization.accessKeyId\`
- \`auth.rolesStorageKey\`: clave de localStorage para bootstrap de roles
- \`auth.providers\`: adaptadores de proveedor (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Tipos de contenido (config de version)

Los configs de version soportan multiples tipos:

- \`routes-md\`: Rutas markdown con \`title\`, \`description\` (centrados via \`titlePosition\`, \`descriptionPosition\`)
- \`routes-html\`: Rutas de paginas HTML por idioma
- \`routes-video\`: Config de video con \`video.videoType\` (youtube, vimeo, mp4, etc.) y \`video.pathVideo\`
- \`routes-audio\`: Config de audio con \`audio.audioType\` (youtube, mp3, etc.) y \`audio.pathAudio\`
- \`authorization\` (md/html/video): guardia de acceso por clave, roles y autenticacion externa
- \`menus-header-md\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\`: menus por tipo
- \`hierarchyPage\`: orden de contenedores en la pagina \`{ md: 0, html: 1, video: 2, audio: 3 }\`
- \`hierarchyMenu\`: orden de secciones del menu \`{ md: 0, html: 1, video: 2, audio: 3 }\`

Cada ruta puede incluir \`title\`, \`description\` (por idioma), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

## Variables por ruta (blockLink, container, url, browseAll)

Opciones por ruta en \`routes-md\`, \`routes-html\` y \`routes-video\`:

- **\`blockLink\`** (defecto: true) – Para HTML: si true, los enlaces abren en nueva pestaña (\`target="_blank"\`); si false, en el mismo contexto.
- **\`container\`** – \`"full"\` = altura automatica; numero (ej: \`500\`) = altura fija en px con overflow auto. Se aplica a md, html y video.
- **\`url\`** – Solo en \`routes-html\`: \`Record<LanguageCode, string>\` con URLs externas. Al definirse, el iframe usa \`src={url}\` en vez de HTML local via \`srcDoc\`. Las rutas con \`url\` no generan archivos HTML locales.
- **\`browseAll\`** (defecto: false) – Si true, el contenedor muestra botones Anterior/Siguiente para navegar entre todos los items de ese tipo.

## Tipos de contenido: path vs url (HTML)

- **Markdown (\`routes-md\`)**: usa \`path\` apuntando a archivos \`.md\` locales.
- **HTML (\`routes-html\`)**: usa \`path\` para archivos HTML locales (sin extension .html en config, ej: \`source-viewer\`) o \`url\` para URLs externas. Con \`url\`, el iframe carga la pagina externa; no se genera archivo local. La CLI genera un visor **Codigo fuente** (estilo GitHub) por version.
- **Video (\`routes-video\`)**: usa \`video.pathVideo\` y \`video.videoType\` (youtube, vimeo, mp4, etc.).

## Variables de entorno

- \`GITPAGEDOCS_REPOSITORY_SEARCH\`: activa/desactiva busqueda remota en local
- \`GITHUB_ACTIONS\`: habilita comportamiento especifico de GitHub Pages
`,
    deployment: `# Publicacion

Git Page Docs corre como app Next.js con dos objetivos: servidor local y GitHub Pages.

## Publicacion local

Usa:

1. \`npm run build\`
2. \`npm start\`

Esto inicia runtime Node + Next.js usando \`gitpagedocs/\` local.

## Publicacion en GitHub Pages

En build de GitHub Actions:

- \`GITHUB_ACTIONS=true\`
- el comportamiento de export estatico se habilita por configuracion
- la pagina inicial de busqueda de repositorios queda activa

## Flujo de publish del paquete

Para publicar en npm:

- actualiza version en \`package.json\`
- ejecuta \`npm publish --access public\`
- valida autenticacion con \`npm whoami\`

Si \`build:prebuilt\` se omite en Windows, usa CI para generar artefactos prebuilt.
`,
    architecture: `# Arquitectura

El proyecto esta organizado por fronteras de feature y responsabilidades de runtime.

## Modulos principales

- \`src/app/[[...repo]]/page.tsx\`
  - parser de rutas
  - generateStaticParams
  - seleccion de shell (docs vs repository search)
- \`src/entities/docs/api/load-docs-data.ts\`
  - carga de config local/remota
  - resolucion de version
  - pipeline fetch + parse markdown
  - carga de layouts + temas
- \`src/widgets/docs-shell/docs-shell.tsx\`
  - render de UI
  - estado de idioma/version/tema
  - sincronizacion de URL

## Flujo de datos

1. Llega la ruta (\`/owner/repo/v/x.y.z\` o equivalente local)
2. Se resuelve config (local o remoto)
3. Config de version sobreescribe rutas/menus base
4. Markdown se carga y convierte a HTML
5. Template de layout se resuelve y aplica en CSS vars
6. Shell renderiza contenido y controles

## Puntos de resiliencia

- fallback de carga para layouts/templates
- carga de markdown por idioma con fallback de error
- sincronizacion de idioma/version/tema via localStorage
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

## Ubicacion del config de version

Configura en:

- \`gitpagedocs/docs/versions/<version>/config.json\`

## Seccion global auth

Usa \`auth\` en la raiz del config de version:

- \`accessKeys\`: mapa de ids de clave al secreto esperado
- \`rolesStorageKey\`: clave de localStorage para bootstrap de roles
- \`providers\`: lista de proveedores externos (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Autorizacion por ruta

Dentro de cada ruta (\`routes-md\`, \`routes-html\`, \`routes-video\`):

- \`authorization.accessKeyId\`
- \`authorization.requiredRoles\`
- \`authorization.requireExternalAuth\`
- \`authorization.allowedProviders\`

## Fases

### Fase A - Clave de acceso

Define \`authorization.accessKeyId\` y la clave correspondiente en \`auth.accessKeys\`.

### Fase B - Roles

Define \`authorization.requiredRoles\` con uno o mas roles.

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

- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/layoutsFallbackConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

## Modelo de template

Cada template normalmente incluye:

- \`id\`, \`name\`, \`author\`, \`version\`
- \`mode\` y metadatos de par dark/light
- \`colors\`
- \`typography\`
- tokens de \`components\`
- \`animations\`

## Comportamiento en runtime

- tema activo viene de config/seleccion de usuario
- toggle light/dark resuelve tema pareado por referencia
- variables CSS se generan desde tokens del template

## Buenas practicas

- mantener contraste accesible
- mantener escala consistente de espacios y bordes
- ofrecer variantes dark y light cuando sea posible
`,
    faq: `# FAQ

## Por que repositorios remotos no abren en local?

Verifica:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` en \`.env\`
- repositorio objetivo contiene \`gitpagedocs/config.json\`
- paths markdown del repositorio coinciden con su config de rutas

## Por que una ruta de version muestra contenido incorrecto?

Verifica:

- \`VersionControl.versions[*].path\` en \`gitpagedocs/config.json\`
- config de version tiene \`routes\` y \`menus-header\` validos
- markdown existe para cada idioma

## Por que tema no se aplica correctamente?

Verifica:

- \`layoutsConfig.json\` referencia templates validos
- ids de template son unicos
- tema seleccionado existe en el mapa de temas cargados

## Por que GitHub Pages puede comportarse distinto a local?

Porque el build de GitHub Pages habilita la pagina inicial de busqueda y comportamiento especifico de exportacion.
`,
  };
