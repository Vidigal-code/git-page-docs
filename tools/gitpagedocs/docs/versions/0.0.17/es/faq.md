# FAQ

## ¿Por qué repositorios remotos no abren en local?

Verifica:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true` en `.env`
- repositorio objetivo contiene `gitpagedocs/config.json`
- paths markdown del repositorio coinciden con su config de rutas

## ¿Por qué una ruta de versión muestra contenido incorrecto?

Verifica:

- `VersionControl.versions[*].path` en `gitpagedocs/config.json`
- config de versión tiene `routes` y `menus-header` válidos
- markdown existe para cada idioma

## ¿Por qué tema no se aplica correctamente?

Verifica:

- `layoutsConfig.json` referencia templates válidos
- ids de template son únicos
- tema seleccionado existe en el mapa de temas cargados

## ¿Por qué GitHub Pages puede comportarse distinto a local?

Porque el build de GitHub Pages habilita la página inicial de búsqueda y comportamiento específico de exportación.

## ¿Por qué el icono sigue mostrando texto?

Define `site.icons.<Control>.reactIcon` como booleano `true`, con el nombre exacto exportado por React Icons en `tag`. LanguageSelector, ThemeSelector, VersionSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious y DocumentNext usan iconos por defecto; cambia cualquier entrada a `false` para mostrar texto. Los campos planos `Icon*ReactIcones` tienen prioridad si existen ambos formatos. Comprueba si la propia función está desactivada mediante `HideThemeSelector`, `FocusMode` o las acciones PDF.

## ¿Por qué los hijos del menú o breadcrumbs son diferentes?

`nestedMenusEnabled: false` aplana los destinos intencionalmente. Revisa `submenus`, objetos de idioma y `path-click`; confirma que las páginas existan y sean accesibles. Los breadcrumbs utilizan `RouteGuide`, con prioridad ruta > versión > sitio. `RouteguideBrand` controla el índice de títulos.

## ¿Por qué la narración está muda o se interrumpe?

Comprueba soporte del navegador, voz disponible, idioma, volumen y salida de audio. Las voces pueden cargar después o requerir un servicio remoto. Con `mediaExclusivePlayback: true`, otra fuente de audio/vídeo detiene la narración por diseño. Cambiar de documento cancela la voz anterior. Consulta Accesibilidad.

## ¿Por qué MCP espera o falla una tool?

`mcp start` espera un cliente MCP por stdio; no es un chat de terminal. Comprueba cwd y utiliza la entrada de CLI publicada o `mcp/src/bin.ts`. Las tools de archivos/catálogo no necesitan proveedor; la generación requiere credenciales en el entorno del proceso MCP. La bóveda de CLI y `.env` no se cargan automáticamente; revisa `isError` y stderr del cliente.

## ¿Por qué regenerar cambió mis páginas?

El scaffold vuelve a escribir rutas, configs y documentación generada. Revisa Git y conserva el contenido específico en sus fuentes. En este repositorio, edita `cli/content/docs-{en,pt,es}.mjs` y los metadatos de rutas antes de regenerar; no uses las copias generadas como única fuente.

> Versión: 0.0.17
