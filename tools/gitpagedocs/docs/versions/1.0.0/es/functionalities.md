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

## Claves de config (site)

- `name`, `defaultLanguage`, `supportedLanguages`
- `docsVersion`, `rendering`, `ThemeDefault`, `ThemeModeDefault`
- `ProjectLink`, `layoutsConfigPathOficial`, `layoutsConfigPath`

## Variables de entorno

- `GITPAGEDOCS_REPOSITORY_SEARCH` – busqueda de repositorio (local)
- `GITHUB_ACTIONS` – modo build GitHub Pages

> Version (ES): 1.0.0
