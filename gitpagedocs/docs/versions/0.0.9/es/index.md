# Git Page Docs

Git Page Docs es un runtime de documentación multilenguaje para repositorios que incluyen la carpeta `gitpagedocs/`.

## Qué ofrece este proyecto

- Renderizado markdown multilenguaje (`en`, `pt`, `es`)
- Ruteo por versión (`/v/:version`)
- Sistema de temas con templates JSON
- Ejecución local y en GitHub Pages
- Búsqueda de repositorio + render remoto opcional

## Contrato de carpetas

El runtime espera esta estructura:

- `gitpagedocs/config.json`
- `gitpagedocs/docs/<lang>/*.md`
- `gitpagedocs/docs/versions/<version>/config.json`
- `gitpagedocs/docs/versions/<version>/<lang>/*.md`
- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/templates/*.json`

## Navegación rápida

- Abre **Primeros pasos** para setup local.
- Abre **Configuración** para detalle completo de `config.json`.
- Abre **Publicación** para comportamiento local/producción/GitHub Pages.
- Abre **Arquitectura** para mapa de código y flujo de datos.
- Abre **Temas y layouts** para creación de templates.
- Abre **Rutas autorizadas** para configurar clave, roles y autenticación externa.
- Abre **FAQ** para troubleshooting.

## Referencias detalladas

- **Referencia de la CLI**: instalación, todos los comandos y flags de compatibilidad.
- **Servidor MCP**: cliente, 20 tools, 7 resources y configuración de proveedores.
- **Navegación y submenús**: árboles recursivos, URLs y prioridad de breadcrumbs.
- **Modo foco**: copiar/descargar Markdown y navegar por sección/documento.
- **Accesibilidad y narración**: voces del navegador, controles e interacción con medios.

> Versión: 0.0.9
