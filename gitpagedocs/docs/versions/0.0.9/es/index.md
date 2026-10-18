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
- **Bloques de contenido ordenados**: repite y ordena Markdown, HTML, vídeo, audio y PDF en una página; posiciona títulos y descripciones configurados de forma independiente.
- **Modo foco**: copiar/descargar Markdown y navegar por sección/documento.
- **Accesibilidad y narración**: voces del navegador, controles e interacción con medios.
- **Documentos PDF**: vista previa nativa, descarga/nueva pestaña y la guía incluida en inglés.
- **Recetas de configuración**: un sitio multilingüe completo y un menú con secciones dentro de secciones.
- **Migración y compatibilidad**: actualizar configuraciones desde la versión 0.0.1 conservando tu contenido.
- **Solución de problemas**: UTF-8, rutas locales y de Pages, carga de PDF, voces e inicio de MCP.
- **Contribución y validación**: archivos fuente, generación, contratos públicos y comprobaciónes de publicación.
- **Contenedores HTML**: páginas locales y externas, configuración de rutas/menús y el ejemplo interactivo DOOM.

El menú generado mantiene Primeros pasos y la descripción general del proyecto al principio. Guías contiene Configura tu sitio, Lee y explora y Automatiza e integra; cada categoría contiene sus páginas relacionadas. Operación y desarrollo agrupa publicación, mantenimiento y contribución. Git y GitHub contiene los ejemplos del repositorio. Las categorías pueden contener otras categorías sin un límite fijo de niveles.

> Versión: 0.0.9
