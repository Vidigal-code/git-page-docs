# Contribución y pruebas

Trabaja desde el repositorio de código fuente para cambiar el runtime, la CLI, las herramientas compartidas o MCP. Un repositorio que consume el visor normalmente edita su propio contenido y configuración. Usa una rama enfocada y describe el comportamiento visible y cómo se verificó.

## Trabaja en el paquete responsable

`frontend/` contiene el visor Next.js App Router y sigue Feature-Sliced Design. Los primitivos visuales compartidos pertenecen a `shared`, datos y schemas a `entities`, capacidades del usuario a `features` y la composición del lector a `widgets`. Mantén la carga del sistema de archivos y repositorios fuera de los componentes de presentación.

`cli/` contiene scaffold, comandos, valores predeterminados y plantillas autorales. `tools/` ofrece lógica reutilizable de configuración, documentación y servicios. `mcp/` expone estas capacidades mediante Model Context Protocol. Una corrección visual suele pertenecer al frontend; un default del scaffold debe cambiar en su fuente CLI y regenerarse.

## Edita las fuentes, no las copias generadas

| Cambio | Fuente de verdad | Resultado generado |
| --- | --- | --- |
| Opciones del sitio y textos de idioma | `cli/data/` | Config raíz y `gitpagedocs/langs/` |
| Rutas y secciones del menú | Builders CLI, metadatos, mapeos y `menu-sections.mjs` | Config de versión |
| Documentación | `cli/content/docs-{en,pt,es}.mjs` y módulos importados | Markdown versionado |
| Regiones gestionadas | `tools/src/documentation/sections.ts` | README, CONTRIBUTING y SECURITY |
| Definiciones de diseños | `gitpagelayouts/v2/` | Plantillas y documentación de diseños |

Después de cambiar CLI/contenido, ejecuta `node cli/index.mjs`, copia `gitpagedocs/` a `tools/gitpagedocs/` sin borrar versiones históricas y ejecuta `pnpm run baseline:create`. Usa `node cli/index.mjs docs` para regiones gestionadas y `pnpm run layouts:sync` para diseños. Revisa el diff: la generación no debe sustituir silenciosamente contenido personalizado que querías conservar.

## Verifica interfaces públicas

Escribe una regresión que falle antes de implementar. Prueba el contrato observable: configuración y archivos generados para CLI, respuestas de tools/resources para MCP, controles y teclado para UI, e interacciones reales de navegador para navegación o medios. Evita pruebas que solo repiten el algoritmo de un helper interno.

Cubre éxito, funciones no disponibles, entradas inválidas y límites relevantes. Ejemplos: traducción ausente, ruta denegada, título PDF vacío, ventana bloqueada, error CORS, límites primero/último y lista vacía de voces nativas. Usa carpetas temporales aisladas para generadores. Simula red o APIs del navegador en su frontera pública; conserva colaboradores reales del proyecto cuando sea práctico.

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm exec vitest run
pnpm run smoke:all
pnpm run build
pnpm exec cross-env PORT=3100 pnpm run test:e2e
```

La configuración E2E usa los puertos 3100 y 3101; conserva el servicio existente en 3000. `smoke:all` incluye contratos CLI, servicios compartidos, descubrimiento MCP, documentación y `baseline:check`. `pnpm run test:cov` añade cobertura. El build local de producción es distinto del entorno de exportación estática de Pages, que también debe verificarse si cambian las rutas de publicación.

## Revisión y publicación

Revisa accesibilidad, autorización, validación de entradas, errores, liberación de recursos y coherencia de archivos generados. Analiza cada fuente modificada en el proyecto SonarQube configurado con el alcance de prueba o producción correspondiente; usa parser/linter de la stack para formatos no compatibles. Mantén credenciales y archivos temporales fuera de commits.

Los paquetes publicables son `@gitpagedocs/tools`, `@gitpagedocs/mcp` y `@gitpagedocs/cli`; raíz y frontend son privados. Sincroniza versiones, dependencias internas y lockfile, inspecciona los paquetes y completa las verificaciones antes del push. El workflow npm actual se ejecuta en pushes a main y pública en orden de dependencias cuando la versión CLI es nueva. Confirma npm y Pages después; un build local correcto no equivale a publicar.

> Versión: 0.0.18
