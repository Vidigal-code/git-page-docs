# Documentos PDF

PDF es un tipo de contenido propio junto con Markdown, HTML, código fuente, vídeo y audio. La vista previa utiliza el visor nativo de PDF del navegador. Las acciones de descarga y apertura en una pestaña nueva se configuran de forma independiente.

## Guía del proyecto en inglés

El scaffold incluye la [Guía del proyecto GitPageDocs (PDF, inglés)](https://github.com/Vidigal-code/git-page-docs/blob/main/cli/content/assets/gitpagedocs-project-guide.pdf). Explica el proyecto, paquetes, configuración, iconos, modo foco, narración, CLI, MCP y publicación. El PDF está en inglés; esta referencia está disponible en español, inglés y portugués.

La CLI copia los bytes del anexo a `gitpagedocs/docs/versions/<versión>/en/gitpagedocs-project-guide.pdf`. Los tres idiomas del ejemplo apuntan a ese archivo en inglés. Para ofrecer traducciones, añade los PDFs traducidos y cambia la ruta de cada idioma.

## Valores predeterminados del sitio

Añade este bloque dentro de `site` en `gitpagedocs/config.json`:

```json
{
  "pdf": {
    "enabled": true,
    "previewEnabled": true,
    "downloadEnabled": true,
    "openInNewTabEnabled": true
  }
}
```

`enabled` es el interruptor general del contenido PDF. Los demás campos controlan la vista previa, el botón de descarga y el botón de nueva pestaña. Cada campo omitido toma el valor `true`, también en configuraciones antiguas.

La precedencia de las acciones es `ruta.pdf.<flag>` > `site.pdf.<flag>` > `true`. Un `true` explícito en la ruta activa esa acción aunque el valor del sitio sea `false`; `site.pdf.enabled: false` sigue desactivando todos los PDFs. Si falta la ruta del idioma seleccionado, el PDF no está disponible; no hay cambio automático de idioma.

Las acciones PDF usan iconos por defecto. Configura `site.icons.PdfDownload` (`LuDownload`) y `site.icons.PdfOpenInNewTab` (`LuExternalLink`) por separado con `reactIcon`, `tag`, `size`, `colorDark` y `colorLight`. Por ejemplo, `"PdfDownload": { "reactIcon": false }` muestra texto en descarga mientras la nueva pestaña conserva su icono. La apariencia no cambia las opciones de activación anteriores.

## Ejemplo de ruta y menú

En `gitpagedocs/docs/versions/0.0.12/config.json`, conserva las listas de rutas y menús en el nivel principal:

```json
{
  "routes-pdf": [{
    "id": 23,
    "title": { "en": "Project guide (English)", "pt": "Guia do projeto (inglês)", "es": "Guía del proyecto (inglés)" },
    "pdf": {
      "pathPdf": {
        "en": "gitpagedocs/docs/versions/0.0.12/en/gitpagedocs-project-guide.pdf",
        "pt": "gitpagedocs/docs/versions/0.0.12/en/gitpagedocs-project-guide.pdf",
        "es": "gitpagedocs/docs/versions/0.0.12/en/gitpagedocs-project-guide.pdf"
      },
      "previewEnabled": true,
      "downloadEnabled": true,
      "openInNewTabEnabled": true
    }
  }],
  "menus-header-pdf": [{
    "id": 23,
    "en": { "title": "Project guide (English)", "path-click": "page:23" },
    "pt": { "title": "Guia do projeto (inglês)", "path-click": "page:23" },
    "es": { "title": "Guía del proyecto (inglés)", "path-click": "page:23" }
  }]
}
```

El mapa `pdf.pathPdf` selecciona el archivo del idioma actual. Usa `page:<id>` en los destinos del menú PDF. Se admite la misma estructura recursiva de `submenus` que en otros menús. El scaffold reserva el ID 23 para el ejemplo PDF y el ID 24 para esta referencia Markdown; utiliza IDs únicos para las páginas adicionales.

Las opciones de la ruta se colocan dentro de `pdf`. La presentación compartida, `container`, `RouteGuide` y la autorización permanecen en el nivel de la ruta. `routeDefaults` también se aplica a las rutas PDF. Añade `"pdf": 5` en `hierarchyPage` y `hierarchyMenu` para colocar los PDFs después del audio; ajusta los valores según el orden deseado.

## Archivos y publicación

Los PDF y archivos nativos de audio/vídeo compatibles dentro de `gitpagedocs/` se copian a los assets públicos del visor al iniciar o compilar Next.js. La URL respeta el subdirectorio de publicación de GitHub Pages. Incluye estos archivos en Git y publícalos junto con la documentación generada. Los archivos fuera de `gitpagedocs/` deben estar en `frontend/public/` del visor o ser accesibles mediante una URL HTTP(S).

Usa la URL del PDF binario, no una página HTML de vista previa del repositorio. Para repositorios remotos, la ruta se resuelve dentro de ese repositorio. La vista previa, la descarga y la apertura en una nueva pestaña obtienen los bytes del archivo, por lo que un servidor externo debe permitir CORS para las tres acciones. El visor valida la firma PDF y crea una URL Blob temporal de tipo `application/pdf`. La vista previa y la nueva pestaña utilizan el visor PDF nativo del navegador; la política de incorporación y las cabeceras de tipo/disposición del servidor de origen no controlan esta vista Blob.

El botón de nueva pestaña abre el Blob PDF validado en lugar de navegar a la URL raw del repositorio. También funciona con la vista previa desactivada: la carga comienza cuando el lector descarga o abre el documento. Los bytes cargados se reutilizan para el PDF actual. Los fallos de red/CORS, los PDFs inválidos y el bloqueo de nuevas pestañas muestran un error; no hay fallback automático a la URL raw. El soporte PDF nativo y las preferencias de descarga del navegador siguen determinando cómo se muestra el archivo en la nueva pestaña.

## Lectura y diagnóstico

- Los controles nativos de PDF, teclado, zoom y navegación dependen del visor del navegador. Algunos navegadores móviles abren o descargan el archivo en vez de incorporarlo.
- La vista previa no convierte PDF en Markdown. El modo foco, la navegación por secciones, la copia de Markdown y la narración actúan sobre documentos Markdown, no sobre el PDF incorporado.
- Desactivar la vista previa puede conservar la descarga y la nueva pestaña. Desactivar todas las acciones deja el PDF sin controles interactivos.
- Ocultar un botón no controla el acceso. Los PDFs alojados públicamente siguen disponibles mediante su URL. Los documentos confidenciales necesitan alojamiento protegido.
- Si la vista previa está vacía, confirma que la ruta devuelve un PDF y permite acceso mediante CORS; después prueba la nueva pestaña. Permite ventanas emergentes para el sitio si el navegador bloquea esa acción. Los fallos de descarga y apertura se muestran en la página.

> Versión: 0.0.12
