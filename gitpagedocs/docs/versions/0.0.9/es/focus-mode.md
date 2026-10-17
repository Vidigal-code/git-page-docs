# Modo foco

El modo foco abre el documento Markdown actual en un diálogo de lectura. Actívalo con `site.FocusMode`; el control solo está disponible para una página Markdown real. `site.icons.FocusMode` cambia la apariencia de icono/texto y no activa ni desactiva la función.

## Configurar los controles

Combina este fragmento con `gitpagedocs/config.json`:

```json
{
  "site": {
    "FocusMode": true,
    "focusMode": {
      "copyEnabled": true,
      "downloadEnabled": true,
      "sectionNavigationEnabled": true,
      "documentNavigationEnabled": true
    }
  }
}
```

Cada opción tiene valor predeterminado `true`; `false` oculta la acción o el grupo de navegación correspondiente. Con `sectionNavigationEnabled: false`, el modo foco muestra el documento completo sin paginación por secciones. Las configuraciones existentes sin el nuevo objeto `focusMode` mantienen los controles activados.

## Secciones y documentos

- La navegación por secciones tiene cuatro botones: primera sección, sección anterior, sección siguiente y última sección del documento actual.
- La navegación por documentos tiene cuatro botones: primer documento, documento anterior, documento siguiente y último documento en el orden del menú, incluidos los submenús.
- `sectionNavigationEnabled` controla los cuatro botones de sección; `documentNavigationEnabled` controla los cuatro botones de documento. Las direcciones no disponibles quedan desactivadas en los extremos.
- Se omiten documentos sin traducción en el idioma activo, destinos que no son Markdown y páginas sin permiso.
- Cambiar de documento mantiene abierto el diálogo y vuelve a la primera sección. Los contadores de sección/documento muestran la posición actual.
- `site.ActiveNavigation` controla la navegación rápida; no desactiva la navegación de documentos en modo foco.

## Copiar y descargar

Copiar y descargar utilizan el **Markdown original completo en el idioma seleccionado**, incluidas las secciones que no están visibles. No exportan el HTML renderizado ni solo la sección actual.

La descarga conserva el nombre base Markdown del `path` localizado de la ruta; si no está disponible, el nombre del archivo es `document.md`. El portapapeles sigue las reglas de permisos y contexto seguro del navegador. Si la copia falla, utiliza la descarga y consulta el error mostrado.

## Teclado y lectura

El diálogo tiene nombre accesible, gestión de foco del teclado y control de cierre. Usa Tab para recorrer controles y Escape para cerrar. Los controles de solo icono conservan nombres traducidos accesibles. Cerrar el diálogo vuelve a la documentación.

La narración se configura por separado en Accesibilidad. Cambiar de documento o idioma cancela la narración anterior para que no siga leyendo contenido antiguo.

> Version (ES): 0.0.9
