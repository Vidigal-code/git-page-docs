# Funcionalidades

Referencia completa de opciones CLI, claves de configuración y funciones del runtime.

## Línea de comandos

Consulta **Referencia de la CLI** para comandos, flags, ejemplos y compatibilidad. Consulta **Servidor MCP** para integración con editores.

## Tipos de contenido

| Tipo | Clave config | Descripción |
|------|--------------|-------------|
| Markdown | `routes-md` | Archivos .md con `path` por idioma |
| HTML | `routes-html` | `path` local o `url` externa |
| Vídeo | `routes-video` | `video.pathVideo`, `video.videoType` |
| Audio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |
| PDF | `routes-pdf` | `pdf.pathPdf` por idioma; vista previa nativa y descarga |

## Visor de código fuente

El config de versión puede renderizar un contenedor **Código fuente** vía `routes-source-viewer` y `menus-header-source-viewer`. El viewer lee el árbol del repositorio en GitHub en tiempo de ejecución y aplica el tema actual de la documentación.

- Árbol del repositorio desde `source-viewer-path`; la branch por defecto es `main`
- Navegación por carpetas y filtro de archivos
- Listado de directorios estilo GitHub
- Renderizado de código con números de línea
- Alternancia vista previa/código para Markdown, incluido `README.md`
- Carpetas colapsables en la barra lateral

## Claves de config (site)

- `name`, `defaultLanguage`
- `docsVersion`, `rendering`, `ThemeDefault`, `ThemeModeDefault`
- `ProjectLink`, `layoutsConfigPathOficial`, `layoutsConfigPath`
- Idiomas: `site.languages` (activa/desactiva cada uno); textos de la UI: `gitpagedocs/langs/<lang>.json`

## Reproducción de medios (un sonido a la vez)

`site.mediaExclusivePlayback` (por defecto `true`): reproducir un vídeo de ruta pausa la radio y las pistas de audio, y reproducir la radio o una pista de audio pausa el vídeo. Funciona con YouTube y Vimeo (mediante las APIs de sus reproductores), archivos nativos (`mp4`, `webm`, …) y cualquier otro embed.

Para mostrar un vídeo sin sonido mientras la radio o una pista de audio lo explica, usa `"muted": true` en el objeto `video` de la ruta: el vídeo reproduce solo la imagen y queda fuera de la regla. `"mediaExclusivePlayback": false` desactiva la regla en todo el sitio.

## Variables de entorno

- `GITPAGEDOCS_REPOSITORY_SEARCH` – búsqueda de repositorio (local)
- `GITHUB_ACTIONS` – modo build GitHub Pages

## Asistente de IA

Los docs traen un asistente de IA en dos superficies: un **panel de chat** dentro de los docs (botón de chat de IA en la barra lateral, activado por `site.AiChatEnabled`) y una página **consola `/ai`** dedicada.

- **14 proveedores** en un único core compartido: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure OpenAI, Mistral, DeepSeek, Cohere, Groq, xAI, Together, Fireworks, Perplexity.
- **Elección de modelo** — desde el catálogo de cada proveedor (`gitpagedocs models <proveedor>`); un id de modelo guardado que el proveedor retiró se reemplaza por el predeterminado del proveedor automáticamente.
- **Cifrado en reposo** — tu clave de API se sella con AES-256-GCM detrás de una **contraseña local** y nunca queda en texto plano ni en logs.
- **Bloqueo por inactividad** — el panel de chat se bloquea solo tras `site.AiChatAutoLockSeconds` segundos sin uso (por defecto 30, `0` lo desactiva): un modal centrado con cuenta regresiva, en tu idioma, permite cancelar o bloquear ahora, y desbloquear pide la contraseña de nuevo.
- **Proveedores resilientes** — los errores transitorios del proveedor se reintentan (3 intentos) y un fallo final es un mensaje simple que termina en "¡Inténtalo de nuevo!".
- **Generación de documentación con IA** — `gitpagedocs ai` recorre las rutas elegidas y escribe markdown multilingüe (pt/en/es); reutilizable vía `.gitpagedocsconfig`, cuya clave de API queda sellada en la bóveda cifrada `.gitpagedocsvault` (la contraseña de la bóveda se pide en cada ejecución). `gitpagedocs chat` lleva el mismo asistente a la terminal.

## Servidor MCP

`gitpagedocs mcp start` levanta un servidor Model Context Protocol (stdio) que expone **20 tools** (sistema de archivos, IA, generación/análisis de docs) y **7 resources** (`project://structure|docs|config|repository|readme|ai/providers|ai/models`) para editores y agentes de IA.

> Versión: 0.0.16
