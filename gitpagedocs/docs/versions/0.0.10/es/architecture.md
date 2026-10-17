# Arquitectura

El proyecto esta organizado por fronteras de feature y responsabilidades de runtime.

## Paquetes

- **frontend/** — visor Next.js (Feature-Sliced: app / widgets / features / entities / shared); export estatico.
- **cli/** — el bin publicado `gitpagedocs` (hexagonal) + `cli/ai/` (CLI de documentacion con IA).
- **tools/** — `@gitpagedocs/tools`: ai/ security/ crypto/ cache/ config/ logger/ errors/ filesystem/ documentation/ i18n/ ports/.
- **mcp/** — `@gitpagedocs/mcp`: herramientas + recursos MCP que delegan a tools/.

## Modulos principales (frontend)

- `frontend/src/app/[[...repo]]/page.tsx` — parser de rutas, generateStaticParams, seleccion de shell.
- `frontend/src/entities/docs/api/load-docs-data.ts` — config local/remota, version, parse markdown, layouts + temas.
- `frontend/src/widgets/docs-shell/docs-shell.tsx` — UI, estado idioma/version/tema, sync de URL, montaje del chat de IA.

## Seguridad: credenciales de IA cifradas

La consola `/ai` y el panel de chat exigen una contrasena local que deriva (PBKDF2) una clave AES-256-GCM; las claves quedan cifradas en `localStorage` y solo se descifran durante la sesion (`@gitpagedocs/tools/security`). El panel se bloquea solo tras `site.AiChatAutoLockSeconds` segundos sin uso (por defecto 30; `0` lo desactiva): un modal centrado con cuenta regresiva, en el idioma seleccionado, permite cancelar o bloquear ahora, y volver exige la contrasena de nuevo. En la CLI, la clave de `.gitpagedocsconfig` queda sellada en la boveda cifrada `.gitpagedocsvault` y la contrasena de la boveda se pide en cada ejecucion.

## Flujo de datos

1. Llega la ruta (`/owner/repo/v/x.y.z` o equivalente local)
2. Se resuelve config (local o remoto)
3. Config de version sobreescribe rutas/menus base
4. Markdown se carga y convierte a HTML
5. Template de layout se resuelve y aplica en CSS vars
6. Shell renderiza contenido y controles

## Puntos de resiliencia

- fallback de carga para layouts/templates
- carga de markdown por idioma con fallback de error
- sincronizacion de idioma/version/tema via localStorage

> Version (ES): 0.0.10
