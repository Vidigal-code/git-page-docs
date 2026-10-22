# Diagnosticar problemas de documentación

Empieza con una URL que falla, su versión e idioma, el resultado esperado y el observado. Registra el commit publicado y la salida de `gitpagedocs version`. Ejecuta `gitpagedocs doctor` desde la raíz del repositorio para comprobar herramientas y descubrimiento de configuración. Doctor no valida cada documento ni demuestra que el despliegue funcione correctamente.

## Identifica el entorno afectado

- **Solo local:** confirma que el directorio actual contiene `gitpagedocs/config.json`. Revisa la salida del servidor y su puerto real. Reinicia después de modificar opciones usadas durante el build. Un archivo situado en otra carpeta del equipo no se convierte en un recurso web público.
- **Solo Pages:** inspecciona la última ejecución de Deploy GitPageDocs en Actions y el commit publicado. Compara las peticiones fallidas con la subruta esperada del repositorio. Si el HTML carga, pero CSS o JavaScript devuelven 404, comprueba primero la ruta del build.
- **Solo repositorio remoto:** confirma que el repositorio sea accesible, que su rama contenga la documentación y que los archivos estén enviados a Git. Localmente, buscar repositorios requiere `GITPAGEDOCS_REPOSITORY_SEARCH=true`. Prueba el mismo repositorio directamente antes de investigar otro visor.

Para publicar bajo una subcarpeta, revisa conjuntamente `GITPAGEDOCS_PATH`, `GITPAGEDOCS_BASE_PATH` y el workflow generado. Next.js incorpora la ruta base durante el build; cambiar una variable después de exportar no reescribe los bundles. Tras publicar otra vez, recarga completamente o prueba una ventana privada para distinguir recursos antiguos del navegador de un 404 del servidor.

## Sigue la configuración hasta el archivo

Sigue `VersionControl.versions[*].path` hasta la configuración de versión y después la ruta del idioma seleccionado. Compara escritura y mayúsculas con el archivo rastreado; el servidor puede distinguir mayúsculas aunque tu equipo no lo haga. Un título de menú no crea una ruta. Comprueba el destino y que sus reglas permitan el acceso al lector actual.

Verifica por separado `site.languages`, el paquete de interfaz en `langs/` y el mapa de idiomas del documento. Los PDF no tienen un idioma alternativo automático. Conserva UTF-8 en JSON y Markdown, incluyendo `site.name` y títulos acentuados. Compara el texto guardado con el navegador y el terminal antes de diagnosticar un problema de codificación; las fuentes y los contextos de visualización también pueden diferir. Los nombres ingleses de archivos son una convención, no una prohibición de tildes en el contenido. No elimines acentos para ocultar bytes dañados.

## Investiga PDF y controles de lectura

Inspecciona el estado de la petición PDF y el cuerpo recibido. El archivo debe comenzar con `%PDF-`; una página HTML de acceso o vista del repositorio no es PDF, incluso con estado 200. Vista previa, descarga y nueva pestaña necesitan permiso CORS para orígenes externos. Descargar fuera del navegador no demuestra que el navegador tenga acceso.

Permite ventanas emergentes para el sitio y vuelve a pulsar el botón de apertura. El visor abre bytes validados mediante Blob; las cabeceras de descarga del alojamiento original no controlan directamente esa URL nueva. El soporte nativo y las preferencias del navegador varían. Revisa las opciones del sitio y de la ruta antes de considerar un control desactivado como un fallo de carga.

Si la narración no suena, comprueba soporte de voz, voces disponibles, idioma, volumen y salida de audio. Las voces pueden aparecer después de cargar o depender de un servicio remoto. Otra fuente audible interrumpe la narración cuando `mediaExclusivePlayback` está habilitado. Cambiar de documento o idioma cancela la lectura anterior.

## Separa acceso y procesos

Ocultar menús y autorizar en el navegador no protege archivos públicos en alojamiento estático. Comprueba los permisos reales del alojamiento confidencial; cambiar roles visuales no protege una URL PDF expuesta.

Que `gitpagedocs mcp start` espere es normal: habla por stdio con un cliente, no con un terminal interactivo. Comprueba directorio, ejecutable y entorno heredado. Las credenciales deben existir en ese proceso; el almacén de la CLI y `.env` no se cargan automáticamente. Reserva stdout al protocolo, revisa stderr y resultados `isError`, y comparte diagnósticos sin secretos.

> Versión: 0.0.15
