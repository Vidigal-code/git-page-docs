# Funcionalidades

Referencia completa de opciones CLI, claves de configuracion y funciones del runtime.

## Comandos CLI

| Comando | Descripcion |
|---------|-------------|
| `npx @gitpagedocs/cli` | Genera config y docs en `gitpagedocs/` |
| `npx @gitpagedocs/cli --layoutconfig` | Tambien genera layouts/templates locales en `gitpagelayouts/` |
| `npx @gitpagedocs/cli --home` | Distribucion standalone (`gitpagedocshome/`) |
| `npx @gitpagedocs/cli --push --owner X --repo Y` | Configura workflow, commit, push |
| `npx @gitpagedocs/cli --interactive` / `-i` | Modo interactivo con prompts (por defecto en una terminal) |
| `npx @gitpagedocs/cli --no-interactive` / `-y` | Nunca pregunta; usa flags y valores por defecto |

## Opciones CLI

| Opcion | Descripcion |
|--------|-------------|
| `--owner <user>` | Owner de GitHub |
| `--repo <repo>` | Repositorio GitHub |
| `--path <subpath>` | Subruta de docs (ej: `docs`); sin ella, base path = nombre del repo para CSS/JS en project sites |
| `--output <dir>` | Directorio de salida (default: `gitpagedocs`) |
| `--search true|false` | Habilita/deshabilita busqueda de repositorio (`--home`) |
| `--layoutconfig` | Genera layouts locales en `gitpagelayouts/` |
| `--layouts-dir <dir>` | Carpeta de layouts locales (por defecto: `gitpagelayouts`) |
| `--push` | Crea workflow, commit de artefactos, push |
| `--home` | Genera `gitpagedocshome/` (estatico + .env + Dockerfile) |

## Salida generada

- `gitpagedocs/config.json` – config raiz
- `gitpagedocs/icon.svg` – icono por defecto
- `gitpagedocs/docs/versions/<ver>/config.json` – rutas por version
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md` – docs en markdown
- `gitpagelayouts/` – solo con `--layoutconfig` (carpeta configurable con `--layouts-dir`)

## Tipos de contenido

| Tipo | Clave config | Descripcion |
|------|--------------|-------------|
| Markdown | `routes-md` | Archivos .md con `path` por idioma |
| HTML | `routes-html` | `path` local o `url` externa |
| Video | `routes-video` | `video.pathVideo`, `video.videoType` |
| Audio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |

## Visor de codigo fuente

El config de version puede renderizar un contenedor **Codigo fuente** via `routes-source-viewer` y `menus-header-source-viewer`. El viewer lee el arbol del repositorio en GitHub en tiempo de ejecucion y aplica el tema actual de la documentacion.

- Arbol del repositorio desde `source-viewer-path`; la branch por defecto es `main`
- Navegacion por carpetas y filtro de archivos
- Listado de directorios estilo GitHub
- Renderizado de codigo con numeros de linea
- Alternancia vista previa/codigo para Markdown, incluido `README.md`
- Carpetas colapsables en la barra lateral

## Claves de config (site)

- `name`, `defaultLanguage`
- `docsVersion`, `rendering`, `ThemeDefault`, `ThemeModeDefault`
- `ProjectLink`, `layoutsConfigPathOficial`, `layoutsConfigPath`
- Idiomas: `site.languages` (activa/desactiva cada uno); textos de la UI: `gitpagedocs/langs/<lang>.json`

## Variables de entorno

- `GITPAGEDOCS_REPOSITORY_SEARCH` – busqueda de repositorio (local)
- `GITHUB_ACTIONS` – modo build GitHub Pages

## Asistente de IA

Los docs traen un asistente de IA en dos superficies: un **panel de chat** dentro de los docs (boton de chat de IA en la barra lateral, activado por `site.AiChatEnabled`) y una pagina **consola `/ai`** dedicada.

- **14 proveedores** en un unico core compartido: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure OpenAI, Mistral, DeepSeek, Cohere, Groq, xAI, Together, Fireworks, Perplexity.
- **Eleccion de modelo** — desde el catalogo de cada proveedor (`gitpagedocs models <proveedor>`); un id de modelo guardado que el proveedor retiro se reemplaza por el predeterminado del proveedor automaticamente.
- **Cifrado en reposo** — tu clave de API se sella con AES-256-GCM detras de una **contrasena local** y nunca queda en texto plano ni en logs.
- **Bloqueo por inactividad** — el panel de chat se bloquea solo tras `site.AiChatAutoLockSeconds` segundos sin uso (por defecto 30, `0` lo desactiva): un modal centrado con cuenta regresiva, en tu idioma, permite cancelar o bloquear ahora, y desbloquear pide la contrasena de nuevo.
- **Proveedores resilientes** — los errores transitorios del proveedor se reintentan (3 intentos) y un fallo final es un mensaje simple que termina en "¡Inténtalo de nuevo!".
- **Generacion de documentacion con IA** — `gitpagedocs ai` recorre las rutas elegidas y escribe markdown multilingue (pt/en/es); reutilizable via `.gitpagedocsconfig`, cuya clave de API queda sellada en la boveda cifrada `.gitpagedocsvault` (la contrasena de la boveda se pide en cada ejecucion). `gitpagedocs chat` lleva el mismo asistente a la terminal.

## Servidor MCP

`gitpagedocs mcp start` levanta un servidor Model Context Protocol (stdio) que expone **20 tools** (sistema de archivos, IA, generacion/analisis de docs) y **7 resources** (`project://structure|docs|config|repository|readme|ai/providers|ai/models`) para editores y agentes de IA.

> Version (ES): 0.0.3
