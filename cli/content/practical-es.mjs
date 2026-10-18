import { HTML_ROUTE_JSON, RECIPE_ROOT_JSON, RECIPE_VERSION_JSON } from "./configuration-examples.mjs";

export const practicalEs = {
  htmlContainers: `# Contenedores HTML y ejemplos interactivos

Una ruta HTML muestra un documento local o una página externa dentro de un iframe. Úsala para una demostración interactiva de confianza que Markdown no puede representar. El scaffold incluye **DOOM: ejemplo HTML**, ruta 29. El título y la descripción pertenecen al contenedor de documentación; el HTML contiene solo el reproductor, sin repetir encabezados, instrucciones ni crear un botón de carga propio. El juego permanece alojado por su proveedor; el paquete npm incluye la integración HTML, no los archivos del juego.

## Configura una ruta HTML local

Añade esta ruta al array \`routes-html\` existente en la configuración de la versión. Conserva las demás rutas y utiliza un ID distinto para cada destino. Crea cada archivo referenciado como HTML UTF-8 o genera el ejemplo incluido mediante la CLI.

\`\`\`json
${HTML_ROUTE_JSON}
\`\`\`

Añade un elemento traducido en \`menus-header-html\`. Cada \`path-click\` debe coincidir con la ruta de su idioma, como \`gitpagedocs/docs/versions/0.0.12/es/doom.html\`; no sustituyas esta ruta HTML local por \`page:29\`. Una etiqueta de menú no crea una ruta. HTML admite la misma estructura recursiva \`submenus\` que los demás menús.

## Tamaño, contenido y URLs externas

\`container: "full"\` establece una altura mínima relacionada con la ventana; un número positivo fija la altura en píxeles. Omítelo para utilizar el contenedor normal. \`fullscreenEnabled\` controla la acción de pantalla completa del visor. El título y la descripción de la ruta son independientes de los encabezados escritos dentro del HTML.

Para una página alojada, usa \`url: { "en": "https://example.com/demo", "pt": "https://example.com/demo", "es": "https://example.com/demo" }\` en lugar de \`path\`. Una ruta URL navega el iframe; el HTML local se carga en \`srcDoc\`. En contenido local, prefiere estilos incluidos y URLs HTTPS explícitas: srcDoc no resuelve automáticamente los recursos respecto al directorio del archivo original.

El servidor externo puede impedir la incorporación mediante CSP o X-Frame-Options. Los hosts conocidos que bloquean iframe reciben una alternativa para abrir en otra pestaña; no se detectan universalmente los fallos de cualquier servidor. Prueba el destino real en el sitio publicado. \`blockLink: true\` establece otra pestaña como destino predeterminado de los enlaces del HTML local; no impide la navegación de scripts o enlaces con destino propio.

## Utiliza y mantén el ejemplo del juego

Selecciona la entrada HTML. El SDK del reproductor se carga al abrir la página; usa su control Play nativo para iniciar el juego. No hay inicio automático ni un botón de carga separado de la documentación. Se necesita conexión. Un fallo de inicialización muestra un error que indica recargar la página; la vista normal contiene solo el reproductor. Prueba el foco del teclado, pantallas pequeñas, pantalla completa y el regreso a la documentación. La disponibilidad del reproductor y las capacidades del navegador pueden cambiar independientemente de GitPageDocs.

Revisa el HTML y sus dependencias antes de publicar. El iframe actual permite scripts y contenido del mismo origen, por lo que no es una barrera de seguridad para HTML arbitrario no confiable. No incluyas secretos en HTML, URLs ni configuración del cliente. El alojamiento estático expone los archivos independientemente de la visibilidad del menú o autorización de la ruta. En local y Pages, versiona la página junto con su configuración y valida las rutas generadas antes de publicar.
`,
  configurationRecipes: `# Recetas de configuración

Esta guía crea un sitio pequeño en tres idiomas, con dos páginas Markdown y un menú de tres niveles. Parte de la configuración generada, revisa los cambios y conserva los archivos originales en el control de versiones. Los ejemplos utilizan los IDs 101 y 102 para distinguirlos de las páginas incluidas.

## 1. Genera y revisa la estructura

El scaffold incluye las versiones 0.0.12, 0.0.11 y 0.0.10 en el selector. Las tres contienen los ejemplos actuales; la versión del paquete es 0.0.12. Las rutas y etiquetas se generan para la versión correspondiente de la documentación. No se eliminan las carpetas existentes de versiones anteriores.

Ejecuta \`npx --yes @gitpagedocs/cli@0.0.12 --no-interactive --owner TU_USUARIO --repo TU_REPOSITORIO\` en un directorio de proyecto nuevo. En este repositorio de código fuente, \`node cli/index.mjs\` ejecuta la versión del checkout. La generación escribe configuración y documentación; no inicia el visor Next.js.

El siguiente JSON completo es un ejemplo mínimo de \`gitpagedocs/config.json\`. Para un sitio existente, combina los campos relevantes y conserva la identidad del repositorio, la publicación, los temas y las demás versiones.

\`\`\`json
${RECIPE_ROOT_JSON}
\`\`\`

Las nueve entradas heredan la presentación común de \`icons.defaults\`. Para mostrar texto en una acción, añade \`"reactIcon": false\` a esa entrada. No cambies un valor compartido solo para modificar un botón. Los campos planos antiguos tienen prioridad sobre los compactos; elimina o actualiza un campo conflictivo tras confirmar su intención.

## 2. Crea la configuración de versión

Guarda el siguiente JSON completo en la ruta del config de versión indicada arriba. Una categoría tiene título y \`submenus\`; una hoja tiene \`path-click\` localizado. Las categorías no necesitan ruta. Los destinos Markdown usan las rutas reales de los archivos, no el alias \`page:<id>\`.

\`\`\`json
${RECIPE_VERSION_JSON}
\`\`\`

Crea \`start.md\` y \`next-steps.md\` en las carpetas \`en\`, \`pt\` y \`es\` de esa versión: seis archivos en total. Escribe cada idioma y guarda como UTF-8. Inicia cada página con un título y añade secciones \`##\` para probar el modo foco. Los bundles de \`langs/\` contienen el texto de interfaz, separado del contenido de los documentos.

## 3. Cambia la presentación conservando destinos

Con \`nestedMenusEnabled: true\`, el lector expande Guías → Primeros pasos → página. Con \`false\`, los mismos destinos aparecen como una lista plana. Añade \`submenus\` recursivamente cuando el contenido lo justifique; no existe un límite fijo de profundidad configurado. Usa identidades distintas entre hermanos y evita repetir destinos solo para hacer más profundo el árbol.

Los breadcrumbs usan \`site.RouteGuide\`, después \`routeDefaults.RouteGuide\` de la versión y finalmente la ruta individual. Gana el valor explícito más específico. \`RouteguideBrand\` controla el índice separado de encabezados. Las flechas anterior/siguiente del pie siguen los destinos disponibles; \`ActiveNavigation\` controla la navegación rápida y Ctrl+K.

## 4. Añade medios y verifica

Consulta Documentos PDF para añadir \`routes-pdf\` y \`menus-header-pdf\`; el ejemplo \`page:23\` apunta a la guía en inglés incluida. Vista previa, descarga y nueva pestaña son independientes de la apariencia de sus iconos. Los PDFs externos necesitan CORS para las tres acciones; los PDFs locales dentro de \`gitpagedocs/\` se preparan al ejecutar o compilar Next.js.

Comprueba todos los idiomas, expande cada categoría y sigue cada hoja. Prueba URLs directas, cambios de texto/icono, primero/anterior/siguiente/último en foco y direcciones desactivadas en los extremos. Inspecciona el config de versión cuando aparece una etiqueta pero falla su destino. Haz commit de la configuración revisada junto con los documentos y anexos referenciados.
`,
  contributing: `# Contribución y pruebas

Trabaja desde el repositorio de código fuente para cambiar el runtime, la CLI, las herramientas compartidas o MCP. Un repositorio que consume el visor normalmente edita su propio contenido y configuración. Usa una rama enfocada y describe el comportamiento visible y cómo se verificó.

## Trabaja en el paquete responsable

\`frontend/\` contiene el visor Next.js App Router y sigue Feature-Sliced Design. Los primitivos visuales compartidos pertenecen a \`shared\`, datos y schemas a \`entities\`, capacidades del usuario a \`features\` y la composición del lector a \`widgets\`. Mantén la carga del sistema de archivos y repositorios fuera de los componentes de presentación.

\`cli/\` contiene scaffold, comandos, valores predeterminados y plantillas autorales. \`tools/\` ofrece lógica reutilizable de configuración, documentación y servicios. \`mcp/\` expone estas capacidades mediante Model Context Protocol. Una corrección visual suele pertenecer al frontend; un default del scaffold debe cambiar en su fuente CLI y regenerarse.

## Edita las fuentes, no las copias generadas

| Cambio | Fuente de verdad | Resultado generado |
| --- | --- | --- |
| Opciones del sitio y textos de idioma | \`cli/data/\` | Config raíz y \`gitpagedocs/langs/\` |
| Rutas y secciones del menú | Builders CLI, metadatos, mapeos y \`menu-sections.mjs\` | Config de versión |
| Documentación | \`cli/content/docs-{en,pt,es}.mjs\` y módulos importados | Markdown versionado |
| Regiones gestionadas | \`tools/src/documentation/sections.ts\` | README, CONTRIBUTING y SECURITY |
| Definiciones de diseños | \`gitpagelayouts/v2/\` | Plantillas y documentación de diseños |

Después de cambiar CLI/contenido, ejecuta \`node cli/index.mjs\`, copia \`gitpagedocs/\` a \`tools/gitpagedocs/\` sin borrar versiones históricas y ejecuta \`pnpm run baseline:create\`. Usa \`node cli/index.mjs docs\` para regiones gestionadas y \`pnpm run layouts:sync\` para diseños. Revisa el diff: la generación no debe sustituir silenciosamente contenido personalizado que querías conservar.

## Verifica interfaces públicas

Escribe una regresión que falle antes de implementar. Prueba el contrato observable: configuración y archivos generados para CLI, respuestas de tools/resources para MCP, controles y teclado para UI, e interacciones reales de navegador para navegación o medios. Evita pruebas que solo repiten el algoritmo de un helper interno.

Cubre éxito, funciones no disponibles, entradas inválidas y límites relevantes. Ejemplos: traducción ausente, ruta denegada, título PDF vacío, ventana bloqueada, error CORS, límites primero/último y lista vacía de voces nativas. Usa carpetas temporales aisladas para generadores. Simula red o APIs del navegador en su frontera pública; conserva colaboradores reales del proyecto cuando sea práctico.

\`\`\`sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm exec vitest run
pnpm run smoke:all
pnpm run build
pnpm exec cross-env PORT=3100 pnpm run test:e2e
\`\`\`

La configuración E2E usa los puertos 3100 y 3101; conserva el servicio existente en 3000. \`smoke:all\` incluye contratos CLI, servicios compartidos, descubrimiento MCP, documentación y \`baseline:check\`. \`pnpm run test:cov\` añade cobertura. El build local de producción es distinto del entorno de exportación estática de Pages, que también debe verificarse si cambian las rutas de publicación.

## Revisión y publicación

Revisa accesibilidad, autorización, validación de entradas, errores, liberación de recursos y coherencia de archivos generados. Analiza cada fuente modificada en el proyecto SonarQube configurado con el alcance de prueba o producción correspondiente; usa parser/linter de la stack para formatos no compatibles. Mantén credenciales y archivos temporales fuera de commits.

Los paquetes publicables son \`@gitpagedocs/tools\`, \`@gitpagedocs/mcp\` y \`@gitpagedocs/cli\`; raíz y frontend son privados. Sincroniza versiones, dependencias internas y lockfile, inspecciona los paquetes y completa las verificaciones antes del push. El workflow npm actual se ejecuta en pushes a main y pública en orden de dependencias cuando la versión CLI es nueva. Confirma npm y Pages después; un build local correcto no equivale a publicar.
`,
};
