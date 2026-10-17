# Git Page Docs

Git Page Docs es un runtime de documentacion multilenguaje para repositorios que incluyen la carpeta `gitpagedocs/`.

## Que entrega este proyecto

- Renderizado markdown multilenguaje (`en`, `pt`, `es`)
- Ruteo por version (`/v/:version`)
- Sistema de temas con templates JSON
- Ejecucion local y en GitHub Pages
- Busqueda de repositorio + render remoto opcional

## Contrato de carpetas

El runtime espera esta estructura:

- `gitpagedocs/config.json`
- `gitpagedocs/docs/<lang>/*.md`
- `gitpagedocs/docs/versions/<version>/config.json`
- `gitpagedocs/docs/versions/<version>/<lang>/*.md`
- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/templates/*.json`

## Navegacion rapida

- Abre **Primeros pasos** para setup local.
- Abre **Configuracion** para detalle completo de `config.json`.
- Abre **Publicacion** para comportamiento local/produccion/GitHub Pages.
- Abre **Arquitectura** para mapa de codigo y flujo de datos.
- Abre **Temas y layouts** para creacion de templates.
- Abre **Rutas autorizadas** para configurar clave, roles y autenticacion externa.
- Abre **FAQ** para troubleshooting.

## Referencias detalladas

- **Referencia de la CLI**: instalación, todos los comandos y flags de compatibilidad.
- **Servidor MCP**: cliente, 20 tools, 7 resources y configuración de proveedores.
- **Navegación y submenús**: árboles recursivos, URLs y prioridad de breadcrumbs.
- **Modo foco**: copiar/descargar Markdown y navegar por sección/documento.
- **Accesibilidad y narración**: voces del navegador, controles e interacción con medios.

> Version (ES): 0.0.9
