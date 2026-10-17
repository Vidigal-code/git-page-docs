# Referencia de la CLI

## Comandos CLI

| Comando | Descripción |
|---------|-------------|
| `npx @gitpagedocs/cli` | Genera config y docs en `gitpagedocs/` |
| `npx @gitpagedocs/cli --layoutconfig` | Tambien genera layouts/templates locales en `gitpagelayouts/` |
| `npx @gitpagedocs/cli --home` | Distribucion standalone (`gitpagedocshome/`) |
| `npx @gitpagedocs/cli --push --owner X --repo Y` | Configura workflow, commit, push |
| `npx @gitpagedocs/cli --interactive` / `-i` | Modo interactivo con prompts (por defecto en una terminal) |
| `npx @gitpagedocs/cli --no-interactive` / `--yes` / `-y` | Nunca pregunta; usa flags y valores por defecto |
| `gitpagedocs ai` | Generador interactivo de documentación con IA |
| `gitpagedocs chat [pregunta]` | Chat de IA con streaming en la terminal (REPL en TTY; respuesta única con pregunta o stdin) |
| `gitpagedocs provider [id]` / `models [provider]` | Lista proveedores de IA / modelos del catálogo |
| `gitpagedocs document[:repo\|:file\|:folder]` | Genera documentación con IA |
| `gitpagedocs deploy` / `pages [actions\|deploy]` | Configura GitHub Pages vía Actions + push |
| `gitpagedocs docs` | Actualiza las regiones gestionadas de README/CONTRIBUTING/SECURITY |
| `gitpagedocs password` | Define la contraseña de acceso a la documentación (clave pública en `site.docsAccess`) |
| `gitpagedocs config` / `config clear` | Muestra la config resuelta / borra la config guardada y la bóveda de claves |
| `gitpagedocs doctor` / `version` / `update` | Diagnóstico / versión / comprobacion de actualización en el registro |
| `gitpagedocs mcp start` | Inicia el servidor MCP por stdio |

Instala globalmente con `npm install -g @gitpagedocs/cli` o ejecuta sin instalar con `npx @gitpagedocs/cli`.

## Opciones CLI

| Opcion | Descripción |
|--------|-------------|
| `--owner <user>` | Owner de GitHub |
| `--repo <repo>` | Repositorio GitHub |
| `--path <subpath>` | Subruta de docs (ej: `docs`); sin ella, base path = nombre del repo para CSS/JS en project sites |
| `--output <dir>` | Directorio de salida (default: `gitpagedocs`) |
| `--search <true-or-false>` | Habilita/deshabilita búsqueda de repositorio (`--home`) |
| `--layoutconfig` | Genera layouts locales en `gitpagelayouts/` |
| `--layouts-dir <dir>` | Carpeta de layouts locales (por defecto: `gitpagelayouts`) |
| `--push` | Crea workflow, commit de artefactos, push |
| `--pages-actions` | Solo cambia la fuente de GitHub Pages a GitHub Actions (igual que `pages actions`) |
| `--home` | Genera `gitpagedocshome/` (estatico + .env + Dockerfile) |

## Salida generada

- `gitpagedocs/config.json` – config raiz
- `gitpagedocs/icon.svg` – icono por defecto
- `gitpagedocs/docs/versions/<ver>/config.json` – rutas por versión
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md` – docs en markdown
- `gitpagelayouts/` – solo con `--layoutconfig` (carpeta configurable con `--layouts-dir`)

## Ejemplos y límites de los comandos

```bash
npx gitpagedocs --no-interactive --owner octocat --repo handbook
npx gitpagedocs --layoutconfig --layouts-dir assets/layouts --no-interactive
npx gitpagedocs chat "Explica este proyecto" --provider ollama --model llama3
npx gitpagedocs pages deploy --owner octocat --repo handbook --path docs
npx gitpagedocs mcp start
```

- `init` es un alias de generación. `providers` equivale a `provider`; `--version` y `-v` equivalen a `version`.
- `document`, `document:repo`, `document:file`, `document:folder` y `--ai` seleccionan el flujo interactivo de documentación. Elige directorios en sus preguntas; estos alias no implementan una API separada de archivo/carpeta mediante argumento posicional.
- `chat` acepta `--provider <id>`, `--model <id>` y `--system <prompt>`. Con una pregunta o stdin responde una vez; un terminal interactivo sin pregunta inicia una conversación.
- `--build`, `--serve` y `--full` son flags de compatibilidad: el scaffold habitual sigue siendo solo configuración y no inician un servidor local.
- `--home` compila `frontend/` desde un checkout del runtime y escribe el export estático con archivos auxiliares. La carpeta de salida se recrea cuando no es `.`; conserva la documentación fuente fuera de ella. Instalar solo la CLI no proporciona `frontend/`.
- `pages actions` solo configura la fuente de Pages; `pages deploy` y `--push` generan, hacen commit y push. Una URL impresa no significa que el build remoto haya terminado: revisa GitHub Actions.
- `update` consulta npm e imprime un comando de instalación; no actualiza la CLI silenciosamente.

## Configuración y credenciales

Las opciones visuales están en `gitpagedocs/config.json`. El generador interactivo/chat guarda `.gitpagedocsconfig` y su bóveda cifrada `.gitpagedocsvault` en la carpeta de configuración del usuario: `%APPDATA%/gitpagedocs` en Windows, `~/Library/Application Support/gitpagedocs` en macOS y la carpeta XDG en Linux. `config clear` elimina esa configuración y la bóveda. MCP utiliza `.gitpagedocs-mcp.json` en la raíz del proyecto y el entorno del proceso; consulta la página MCP.

`gitpagedocs docs` actualiza solo regiones delimitadas por marcadores en README.md, CONTRIBUTING.md y SECURITY.md, conservando el texto alrededor. `password` configura el par de claves de acceso a la documentación; los controles de presentación del cliente no vuelven confidenciales los archivos de un repositorio público.

> Versión: 0.0.8
