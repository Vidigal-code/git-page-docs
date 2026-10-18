export const overviewsEs = {
  guides: `# Guías

Elige un recorrido por la documentación según lo que necesites hacer. Esta página también es el destino del elemento Guías: pulsar su título abre el documento; la flecha separada expande o contrae los submenús.

## Elige el siguiente paso

- **Configura tu sitio** conecta ajustes globales, rutas de versión, temas y navegación. Empieza aquí para adaptar el scaffold a tu repositorio.
- **Lee y explora** explica modo foco, narración del navegador, documentos PDF y HTML interactivo.
- **Automatiza e integra** reúne comandos CLI, servidor MCP y autorización de rutas.

## Recorre una sección

Un elemento padre puede tener \`path-click\` traducido y \`submenus\` a la vez. Sus hijos conservan destinos propios. El breadcrumb sigue la misma jerarquía: un ancestro con documento disponible es navegable y la página actual indica tu posición. Por ejemplo, Guías → Configura tu sitio → Configuración permite volver a cualquier introducción sin perder la estructura del menú.
`,
  configureYourSite: `# Configura tu sitio

Separa la presentación global del contenido de cada versión. El archivo raíz \`gitpagedocs/config.json\` selecciona idiomas, temas y controles de lectura. La configuración de la versión define rutas, archivos por idioma y el árbol de menús.

## Configura en un orden práctico

1. Lee **Configuración** para localizar el ajuste y su valor predeterminado.
2. Usa **Recetas de configuración** para ejemplos JSON completos y una estructura multilingüe inicial.
3. Elige **Temas y diseños** para tokens visuales y cambios de plantillas.
4. Lee **Navegación y submenús** para conectar rutas, documentos de los padres, submenús y breadcrumbs.

## Comprueba el resultado

Mantén un archivo existente para cada idioma habilitado y destino. Un título por sí solo no crea un documento. Asigna al padre su propia ruta Markdown cuando necesite una introducción y conserva sus hijos en \`submenus\`. Valida primero un idioma; después comprueba los demás, el menú plano y un enlace directo a una página anidada. Conserva los ajustes propios del repositorio al regenerar ejemplos.
`,
  readAndExplore: `# Lee y explora

Elige una forma de lectura adecuada al documento. Markdown ofrece encabezados, enlaces e índice; PDF utiliza el visor nativo; HTML puede alojar una demostración interactiva de confianza. Todos siguen accesibles desde el mismo menú.

## Opciones de lectura

- **Modo foco** mantiene Markdown en un diálogo con copia/descarga y navegación al primer, anterior, siguiente y último documento o sección.
- **Accesibilidad y narración** explica voces, controles y compatibilidad del navegador.
- **Documentos PDF** cubre vista previa, descarga, nueva pestaña y requisitos CORS del alojamiento externo.
- **Contenedores HTML** explica archivos locales, páginas alojadas y el ejemplo DOOM.
- **Contenedores paginados** explica secuencias independientes de archivos Markdown, HTML, vídeo, audio y PDF; prueba los cinco tipos en el ejemplo incluido.
- **Marcadores de Markdown** resalta textos o elementos y añade enlaces al índice sin cambiar el filtro de títulos existente.

## Controla la reproducción

La narración comienza solo cuando se solicita. El contenido audible se coordina mediante \`site.mediaExclusivePlayback\`; voces nativas y reproductores externos dependen de sus proveedores. En el juego HTML, usa el control Play del reproductor. Los documentos de elementos padre, como este, también participan en la navegación entre documentos cuando su Markdown está disponible y el acceso está permitido.
`,
  automateAndIntegrate: `# Automatiza e integra

Usa automatización para tareas repetibles, manteniendo el repositorio como fuente de verdad. La CLI genera configuración y documentación. El servidor MCP ofrece operaciones del proyecto a un cliente MCP. La autorización de rutas gobierna la experiencia de acceso del visor.

## Elige la interfaz adecuada

- **Referencia de la CLI** enumera instalación, comandos, opciones y operaciones que escriben o publican archivos.
- **Servidor MCP** describe stdio, todas las tools y resources, variables de proveedores y límites del sistema de archivos.
- **Rutas autorizadas** explica claves, roles y proveedores externos de identidad.

## Revisa antes de publicar

Mantén credenciales en el entorno o almacenamiento apropiado, nunca en configuración generada. Inspecciona los cambios antes del commit y valida rutas de la versión e idioma elegidos. Los archivos estáticos públicos siguen accesibles por sus URLs aunque el menú los oculte. Empieza por comandos informativos y directorios de salida explícitos al comparar una generación candidata con un sitio existente.
`,
  operationsAndDevelopment: `# Operación y desarrollo

Mantener un sitio de documentación implica su contenido publicado y el runtime que lo muestra. Elige el recorrido relacionado con el cambio: actualizar contenido no siempre requiere modificar el frontend, y corregir el visor no debería reescribir documentos históricos sin necesidad.

## Dos recorridos por el proyecto

- **Pública y mantén** agrupa publicación, migración, diagnóstico y preguntas frecuentes. Úsalo para preparar una actualización o investigar un fallo publicado.
- **Desarrolla el proyecto** agrupa arquitectura, contribución/pruebas y funcionalidades. Úsalo para localizar la fuente y la frontera de validación.

## Mantén publicaciones rastreables

Registra la versión prevista, revisa archivos generados y conserva documentos usados por enlaces existentes. Valida por separado el comportamiento local y la ruta publicada. Cuando cambie un reproductor externo, una voz o una política de alojamiento, distingue esa dependencia del comportamiento del repositorio antes de modificar la implementación. Las guías hijas ofrecen comandos y comprobaciónes concretos para cada tarea.
`,
  shipAndMaintain: `# Pública y mantén

Trata la publicación como un cambio validado de una versión concreta. Genera e inspecciona el sitio antes de confiar únicamente en el éxito del workflow: una página publicada aún puede apuntar a una ruta incorrecta o a un recurso externo no disponible.

## Antes y después de publicar

1. Lee **Publicación** para ejecución local, rutas de GitHub Pages y configuración del workflow.
2. Usa **Migración y compatibilidad** para comparar actualizaciones conservando contenido propio y configuración histórica compatible.
3. Sigue **Solución de problemas** cuando documentos, PDF, narración o integraciones varíen entre entornos.
4. Consulta **Preguntas frecuentes** para respuestas breves sobre ajustes habituales.

## Verifica una muestra útil

Abre directamente una página Markdown anidada, cambia el idioma, sigue su breadcrumb y prueba las acciones PDF habilitadas. Confirma el commit publicado y la versión del paquete. Conserva un commit recuperable para actualizaciones y verifica la URL pública después de un rollback. No regeneres un repositorio personalizado solo para repetir un despliegue sin revisar qué se sustituirá.
`,
  developTheProject: `# Desarrolla el proyecto

Empieza por el módulo responsable del comportamiento que quieres cambiar. El frontend sigue Feature-Sliced Design; la CLI contiene las plantillas del scaffold; tools proporciona servicios compartidos de configuración y documentación; MCP expone esos servicios mediante su protocolo.

## Localiza la fuente y la frontera de prueba

- **Arquitectura** describe paquetes, responsabilidades y flujo de datos.
- **Contribución y pruebas** identifica plantillas fuente, salidas generadas y comandos de validación.
- **Funcionalidades** ofrece una referencia amplia de capacidades y ajustes existentes.

## Produce un cambio revisable

Describe el comportamiento observable, reprodúcelo mediante la interfaz pública y actualiza la fuente antes de generar artefactos. Prueba controles renderizados, configuraciones devueltas o archivos escritos, en lugar de helpers privados. Revisa traducciones y accesibilidad al cambiar controles visibles. Ejecuta las comprobaciónes de los paquetes afectados e inspecciona el diff generado antes del commit. Conserva directorios de versiones existentes salvo que el cambio requiera explícitamente actualizar su contenido.
`,
  gitAndGitHub: `# Git y GitHub

El control de versiones conecta archivos de documentación, historial de revisión y despliegue. Estos ejemplos presentan prácticas del repositorio usadas en el proyecto y complementan las guías de configuración de GitPageDocs.

## Empieza por la guía adecuada

- **Introducción a Git** explica commits, branches y colaboración básica, con un ejemplo de vídeo.
- **GitHub Issues y Projects** muestra cómo registrar trabajo y organizar su avance.

## Aplica el flujo a la documentación

Mantén cambios relacionados de fuente y archivos generados en el mismo commit revisado. Usa una branch para migrar configuración, inspecciona diferencias antes de publicar y registra el commit desplegado por Actions. Describe un defecto con versión, idioma, URL y resultado esperado para que otro colaborador pueda reproducirlo. Antes de compartir logs o ejemplos, elimina credenciales y contenido privado: un repositorio público y su sitio Pages exponen los archivos versionados.
`,
};
