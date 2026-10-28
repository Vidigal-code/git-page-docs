# Migrar una documentación existente

GitPageDocs mantiene compatibilidad con configuraciones y datos desde la versión oficial 0.0.1. Los formatos experimentales anteriores, numerados 1.1.x, quedan fuera de ese contrato. Actualizar el paquete y reescribir la documentación son operaciones distintas: el generador no combina automáticamente páginas, rutas, traducciones ni temas personalizados.

## Guarda un punto de recuperación

Anota el commit publicado, la versión de la CLI y la revisión del workflow. Ejecuta `git status --short`, revisa los cambios pendientes y guarda los archivos de origen deseados en un commit específico. Conserva otra copia de los documentos y recursos personalizados todavía sin seguimiento; no añadas credenciales para completar la copia. Crea una rama con `git switch -c docs/upgrade-0.0.10`.

Para comparar de forma reproducible, indica el paquete exacto:

```sh
npx --yes @gitpagedocs/cli@0.0.11 version
npx --yes @gitpagedocs/cli@0.0.11 --no-interactive --owner TU_USUARIO --repo TU_REPOSITORIO --output gitpagedocs-candidate
git diff --no-index -- gitpagedocs gitpagedocs-candidate
```

El último comando devuelve código 1 cuando encuentra diferencias; es normal. La carpeta candidata sirve para revisar y no se convierte automáticamente en el sitio activo. La configuración generada sigue describiendo rutas canónicas en `gitpagedocs/`. Cambiar la carpeta de salida no equivale a modificar todas las rutas utilizadas por el visor.

## Combina la configuración deliberadamente

Conserva la identidad del sitio, las opciones de despliegue y las entradas de `VersionControl.versions` en `gitpagedocs/config.json`. Cada versión apunta a su propio `docs/versions/<version>/config.json`; mantén coherentes los archivos, identificadores de documentos, rutas y destinos de menús. Conserva las versiones históricas necesarias para los enlaces existentes. Los arrays de rutas son contenido, no valores predeterminados reconstruidos por el visor.

Copia solamente las opciones nuevas que necesites. El `routeDefaults` de cada versión proporciona opciones comunes; un campo explícito de una ruta prevalece sobre ese valor. Conserva Markdown, PDF y los paquetes `gitpagedocs/langs/<idioma>.json` de cada idioma. La opción `site.languages` habilita idiomas en la interfaz, pero no traduce los documentos.

El formato compacto `site.icons.defaults` comparte valores entre iconos, y cada entrada puede sobrescribirlos. Los campos planos `Icon*ReactIcones` existentes tienen prioridad sobre las entradas compactas. Elimina duplicados contradictorios después de comprobar el resultado deseado. En 0.0.10, LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious y DocumentNext usan iconos por defecto; configura `reactIcon: false` en una entrada para conservar texto.

La apertura de PDF ahora obtiene bytes validados y abre un Blob `application/pdf` en otra pestaña. Los servidores externos deben permitir CORS incluso con la vista previa desactivada. Revisa las tres acciones por separado, comprueba el permiso de ventanas emergentes y conserva los errores traducidos. Las preferencias de PDF del navegador siguen aplicándose.

## Valida y pública el resultado revisado

En este repositorio del runtime, cambia las fuentes de generación antes de compilar: el build vuelve a generar la documentación. Ejecuta `pnpm run typecheck`, `pnpm run lint`, `pnpm exec vitest run`, `pnpm run smoke:all` y `pnpm run build`. Ejecuta `pnpm run test:e2e` con `PORT=3100` establecido en el shell. Un repositorio consumidor necesita sus propias comprobaciónes equivalentes.

Prueba todas las versiones e idiomas conservados, enlaces directos, menús anidados, iconos/texto, acciones PDF y autorización. Comprueba la exportación bajo la subruta real de Pages. Crea el commit revisado y envíalo mediante el workflow existente. El comando inicial `pages deploy` genera archivos, crea un commit y hace push; no lo repitas sin revisar sobre documentación personalizada.

Registra el commit publicado cuando Actions termine correctamente. Si falla la comprobación, revierte el commit específico con `git revert COMMIT_DE_ACTUALIZACION`, restaura la versión anterior del runtime cuando corresponda, envía y ejecuta de nuevo el despliegue. Confirma el contenido restaurado en la URL pública; revertir por sí solo no pública el sitio.

> Versión: 0.0.16
