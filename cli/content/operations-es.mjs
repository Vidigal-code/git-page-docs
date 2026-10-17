export const operationsEs = {
  migration: `# Migrar una documentación existente

GitPageDocs mantiene compatibilidad con configuraciones y datos desde la versión oficial 0.0.1. Los formatos experimentales anteriores, numerados 1.1.x, quedan fuera de ese contrato. Actualizar el paquete y reescribir la documentación son operaciones distintas: el generador no combina automáticamente páginas, rutas, traducciones ni temas personalizados.

## Guarda un punto de recuperación

Anota el commit publicado, la versión de la CLI y la revisión del workflow. Ejecuta \`git status --short\`, revisa los cambios pendientes y guarda los archivos de origen deseados en un commit específico. Conserva otra copia de los documentos y recursos personalizados todavía sin seguimiento; no añadas credenciales para completar la copia. Crea una rama con \`git switch -c docs/upgrade-0.0.10\`.

Para comparar de forma reproducible, indica el paquete exacto:

\`\`\`sh
npx --yes @gitpagedocs/cli@0.0.10 version
npx --yes @gitpagedocs/cli@0.0.10 --no-interactive --owner TU_USUARIO --repo TU_REPOSITORIO --output gitpagedocs-candidate
git diff --no-index -- gitpagedocs gitpagedocs-candidate
\`\`\`

El último comando devuelve código 1 cuando encuentra diferencias; es normal. La carpeta candidata sirve para revisar y no se convierte automáticamente en el sitio activo. La configuración generada sigue describiendo rutas canónicas en \`gitpagedocs/\`. Cambiar la carpeta de salida no equivale a modificar todas las rutas utilizadas por el visor.

## Combina la configuración deliberadamente

Conserva la identidad del sitio, las opciones de despliegue y las entradas de \`VersionControl.versions\` en \`gitpagedocs/config.json\`. Cada versión apunta a su propio \`docs/versions/<version>/config.json\`; mantén coherentes los archivos, identificadores de documentos, rutas y destinos de menús. Conserva las versiones históricas necesarias para los enlaces existentes. Los arrays de rutas son contenido, no valores predeterminados reconstruidos por el visor.

Copia solamente las opciones nuevas que necesites. El \`routeDefaults\` de cada versión proporciona opciones comunes; un campo explícito de una ruta prevalece sobre ese valor. Conserva Markdown, PDF y los paquetes \`gitpagedocs/langs/<idioma>.json\` de cada idioma. La opción \`site.languages\` habilita idiomas en la interfaz, pero no traduce los documentos.

El formato compacto \`site.icons.defaults\` comparte valores entre iconos, y cada entrada puede sobrescribirlos. Los campos planos \`Icon*ReactIcones\` existentes tienen prioridad sobre las entradas compactas. Elimina duplicados contradictorios después de comprobar el resultado deseado. En 0.0.10, LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious y DocumentNext usan iconos por defecto; configura \`reactIcon: false\` en una entrada para conservar texto.

La apertura de PDF ahora obtiene bytes validados y abre un Blob \`application/pdf\` en otra pestaña. Los servidores externos deben permitir CORS incluso con la vista previa desactivada. Revisa las tres acciones por separado, comprueba el permiso de ventanas emergentes y conserva los errores traducidos. Las preferencias de PDF del navegador siguen aplicándose.

## Valida y publica el resultado revisado

En este repositorio del runtime, cambia las fuentes de generación antes de compilar: el build vuelve a generar la documentación. Ejecuta \`pnpm run typecheck\`, \`pnpm run lint\`, \`pnpm exec vitest run\`, \`pnpm run smoke:all\` y \`pnpm run build\`. Ejecuta \`pnpm run test:e2e\` con \`PORT=3100\` establecido en el shell. Un repositorio consumidor necesita sus propias comprobaciones equivalentes.

Prueba todas las versiones e idiomas conservados, enlaces directos, menús anidados, iconos/texto, acciones PDF y autorización. Comprueba la exportación bajo la subruta real de Pages. Crea el commit revisado y envíalo mediante el workflow existente. El comando inicial \`pages deploy\` genera archivos, crea un commit y hace push; no lo repitas sin revisar sobre documentación personalizada.

Registra el commit publicado cuando Actions termine correctamente. Si falla la comprobación, revierte el commit específico con \`git revert COMMIT_DE_ACTUALIZACION\`, restaura la versión anterior del runtime cuando corresponda, envía y ejecuta de nuevo el despliegue. Confirma el contenido restaurado en la URL pública; revertir por sí solo no publica el sitio.
`,
  troubleshooting: `# Diagnosticar problemas de documentación

Empieza con una URL que falla, su versión e idioma, el resultado esperado y el observado. Registra el commit publicado y la salida de \`gitpagedocs version\`. Ejecuta \`gitpagedocs doctor\` desde la raíz del repositorio para comprobar herramientas y descubrimiento de configuración. Doctor no valida cada documento ni demuestra que el despliegue funcione correctamente.

## Identifica el entorno afectado

- **Solo local:** confirma que el directorio actual contiene \`gitpagedocs/config.json\`. Revisa la salida del servidor y su puerto real. Reinicia después de modificar opciones usadas durante el build. Un archivo situado en otra carpeta del equipo no se convierte en un recurso web público.
- **Solo Pages:** inspecciona la última ejecución de Deploy GitPageDocs en Actions y el commit publicado. Compara las peticiones fallidas con la subruta esperada del repositorio. Si el HTML carga, pero CSS o JavaScript devuelven 404, comprueba primero la ruta del build.
- **Solo repositorio remoto:** confirma que el repositorio sea accesible, que su rama contenga la documentación y que los archivos estén enviados a Git. Localmente, buscar repositorios requiere \`GITPAGEDOCS_REPOSITORY_SEARCH=true\`. Prueba el mismo repositorio directamente antes de investigar otro visor.

Para publicar bajo una subcarpeta, revisa conjuntamente \`GITPAGEDOCS_PATH\`, \`GITPAGEDOCS_BASE_PATH\` y el workflow generado. Next.js incorpora la ruta base durante el build; cambiar una variable después de exportar no reescribe los bundles. Tras publicar otra vez, recarga completamente o prueba una ventana privada para distinguir recursos antiguos del navegador de un 404 del servidor.

## Sigue la configuración hasta el archivo

Sigue \`VersionControl.versions[*].path\` hasta la configuración de versión y después la ruta del idioma seleccionado. Compara escritura y mayúsculas con el archivo rastreado; el servidor puede distinguir mayúsculas aunque tu equipo no lo haga. Un título de menú no crea una ruta. Comprueba el destino y que sus reglas permitan el acceso al lector actual.

Verifica por separado \`site.languages\`, el paquete de interfaz en \`langs/\` y el mapa de idiomas del documento. Los PDF no tienen un idioma alternativo automático. Conserva UTF-8 en JSON y Markdown, incluyendo \`site.name\` y títulos acentuados. Compara el texto guardado con el navegador y el terminal antes de diagnosticar un problema de codificación; las fuentes y los contextos de visualización también pueden diferir. Los nombres ingleses de archivos son una convención, no una prohibición de tildes en el contenido. No elimines acentos para ocultar bytes dañados.

## Investiga PDF y controles de lectura

Inspecciona el estado de la petición PDF y el cuerpo recibido. El archivo debe comenzar con \`%PDF-\`; una página HTML de acceso o vista del repositorio no es PDF, incluso con estado 200. Vista previa, descarga y nueva pestaña necesitan permiso CORS para orígenes externos. Descargar fuera del navegador no demuestra que el navegador tenga acceso.

Permite ventanas emergentes para el sitio y vuelve a pulsar el botón de apertura. El visor abre bytes validados mediante Blob; las cabeceras de descarga del alojamiento original no controlan directamente esa URL nueva. El soporte nativo y las preferencias del navegador varían. Revisa las opciones del sitio y de la ruta antes de considerar un control desactivado como un fallo de carga.

Si la narración no suena, comprueba soporte de voz, voces disponibles, idioma, volumen y salida de audio. Las voces pueden aparecer después de cargar o depender de un servicio remoto. Otra fuente audible interrumpe la narración cuando \`mediaExclusivePlayback\` está habilitado. Cambiar de documento o idioma cancela la lectura anterior.

## Separa acceso y procesos

Ocultar menús y autorizar en el navegador no protege archivos públicos en alojamiento estático. Comprueba los permisos reales del alojamiento confidencial; cambiar roles visuales no protege una URL PDF expuesta.

Que \`gitpagedocs mcp start\` espere es normal: habla por stdio con un cliente, no con un terminal interactivo. Comprueba directorio, ejecutable y entorno heredado. Las credenciales deben existir en ese proceso; el almacén de la CLI y \`.env\` no se cargan automáticamente. Reserva stdout al protocolo, revisa stderr y resultados \`isError\`, y comparte diagnósticos sin secretos.
`,
};
