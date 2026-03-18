# Funcionalidades

Referencia completa de opciones CLI, claves de configuracion y funciones del runtime.

## Comandos CLI

| Comando | Descripcion |
|---------|-------------|
| `npx gitpagedocs` | Genera config y docs en `gitpagedocs/` |
| `npx gitpagedocs --layoutconfig` | Tambien genera layouts/templates locales |
| `npx gitpagedocs --home` | Distribucion standalone (`gitpagedocshome/`) |
| `npx gitpagedocs --push --owner X --repo Y` | Configura workflow, commit, push |
| `npx gitpagedocs --interactive` / `-i` | Modo interactivo con prompts |

## Opciones CLI

| Opcion | Descripcion |
|--------|-------------|
| `--owner <user>` | Owner de GitHub |
| `--repo <repo>` | Repositorio GitHub |
| `--path <subpath>` | Subruta de docs (ej: `docs`); sin ella, base path = nombre del repo para CSS/JS en project sites |
| `--output <dir>` | Directorio de salida (default: `gitpagedocs`) |
| `--search true|false` | Habilita/deshabilita busqueda de repositorio (`--home`) |
| `--layoutconfig` | Genera `gitpagedocs/layouts/` |
| `--push` | Crea workflow, commit de artefactos, push |
| `--home` | Genera `gitpagedocshome/` (estatico + .env + Dockerfile) |

## Salida generada

- `gitpagedocs/config.json` – config raiz
- `gitpagedocs/icon.svg` – icono por defecto
- `gitpagedocs/docs/versions/<ver>/config.json` – rutas por version
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md` – docs en markdown
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer` – visor de codigo (estilo GitHub)
- `gitpagedocs/layouts/` – solo con `--layoutconfig`

## Tipos de contenido

| Tipo | Clave config | Descripcion |
|------|--------------|-------------|
| Markdown | `routes-md` | Archivos .md con `path` por idioma |
| HTML | `routes-html` | `path` (ej: source-viewer) o `url` externa |
| Video | `routes-video` | `video.pathVideo`, `video.videoType` |
| Audio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |

## Visor de codigo fuente

La CLI genera una pagina **Codigo fuente** por version. Escanea `src/`, `cli/` y archivos raiz (README.md, package.json, next.config.ts, etc.) y construye un visor estilo GitHub en modo oscuro con:

- Arbol de archivos en barra lateral con expandir/colapsar carpetas
- Filtro de busqueda
- Resaltado de sintaxis (TypeScript, JavaScript, JSON, CSS, Markdown)
- Boton copiar, numeros de linea
- Alternar vista previa/codigo del README.md
- Controles Expandir todo / Colapsar todo

## Configuracion

La configuracion de runtime esta en `gitpagedocs/config.json`.

### Seccion `site`

| Clave | Descripcion |
|-------|-------------|
| `name` | Nombre del sitio |
| `defaultLanguage` | Idioma por defecto (`en`, `pt`, `es`) |
| `supportedLanguages` | Lista de idiomas soportados |
| `docsVersion` | Version por defecto de docs |
| `rendering` | URL de GitHub Pages para self-hosted |
| `ThemeDefault` | Id del tema por defecto |
| `ThemeModeDefault` | Modo por defecto (`dark`/`light`) |
| `ProjectLink` | Enlace del proyecto/repo |

### Claves de layout

| Clave | Descripcion |
|-------|-------------|
| `layoutsConfigPathOficial` | `true` = layouts oficiales; `false` = locales |
| `layoutsConfigPath` | Ruta de layouts locales |

### Seccion `VersionControl`

`VersionControl.versions` define por version: `id`, `path` y metadatos opcionales.

## Publicacion

1. **Sitio oficial**: `https://vidigal-code.github.io/git-page-docs/` – proporcione owner + repositorio para cargar docs.
2. **GitHub Pages self-hosted**: Genere con `npx gitpagedocs`, configure `site.rendering` a su URL Pages, haga build y publique via workflow.

## Arquitectura

Modulos principales: Parser de rutas (`src/app/[[...repo]]/page.tsx`), Cargar docs (`src/entities/docs/api/load-docs-data.ts`), Docs shell (`src/widgets/docs-shell/docs-shell.tsx`). Flujo: request → config → version → markdown → layout → shell.

## Temas y layouts

Los temas son templates JSON en `layoutsConfig.json`. Modo por defecto usa layouts oficiales; Modo local (`--layoutconfig`) usa `gitpagedocs/layouts/`.

## FAQ

### Por que repositorios remotos no abren en local?

Verifica: `GITPAGEDOCS_REPOSITORY_SEARCH=true` en `.env`; repo objetivo tiene `gitpagedocs/config.json`; paths markdown coinciden con config de rutas.

### Por que ruta de version muestra contenido incorrecto?

Verifica: `VersionControl.versions[*].path` en config; config de version tiene `routes` y `menus-header` validos; archivos markdown existen por idioma.

### Por que tema no aplica correctamente?

Verifica: `layoutsConfig.json` referencia templates validos; ids son unicos; tema seleccionado existe en el mapa de temas.

### Por que GitHub Pages puede comportarse distinto del local?

El modo build GitHub Pages habilita pagina de busqueda y comportamiento especifico de export estatico.

## Variables de entorno

| Variable | Descripcion |
|----------|-------------|
| `GITPAGEDOCS_REPOSITORY_SEARCH` | Activa/desactiva busqueda remota (local) |
| `GITHUB_ACTIONS` | Modo build GitHub Pages |

> Version (ES): 1.0.0
