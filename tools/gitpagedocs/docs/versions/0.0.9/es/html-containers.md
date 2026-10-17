# Contenedores HTML y ejemplos interactivos

Una ruta HTML muestra un documento local o una página externa dentro de un iframe. Úsala para una demostración interactiva de confianza que Markdown no puede representar. El scaffold incluye **DOOM: ejemplo HTML**, ruta 29, con título, descripción y botón traducidos. El reproductor externo solo se carga cuando el visitante decide jugar. El juego permanece alojado por su proveedor; el paquete npm incluye la página HTML de presentación, no los archivos del juego.

## Configura una ruta HTML local

Añade esta ruta al array `routes-html` existente en la configuración de la versión. Conserva las demás rutas y utiliza un ID distinto para cada destino. Crea cada archivo referenciado como HTML UTF-8 o genera el ejemplo incluido mediante la CLI.

```json
{
  "id": 29,
  "title": {
    "en": "DOOM: HTML example",
    "pt": "DOOM: exemplo HTML",
    "es": "DOOM: ejemplo HTML"
  },
  "description": {
    "en": "An interactive HTML container",
    "pt": "Um container HTML interativo",
    "es": "Un contenedor HTML interactivo"
  },
  "titleIsVisible": true,
  "descriptionIsVisible": true,
  "path": {
    "en": "gitpagedocs/docs/versions/0.0.10/en/doom.html",
    "pt": "gitpagedocs/docs/versions/0.0.10/pt/doom.html",
    "es": "gitpagedocs/docs/versions/0.0.10/es/doom.html"
  },
  "container": "full",
  "fullscreenEnabled": true,
  "blockLink": true
}
```

Añade un elemento traducido en `menus-header-html`. Cada `path-click` debe coincidir con la ruta de su idioma, como `gitpagedocs/docs/versions/0.0.10/es/doom.html`; no sustituyas esta ruta HTML local por `page:29`. Una etiqueta de menú no crea una ruta. HTML admite la misma estructura recursiva `submenus` que los demás menús.

## Tamaño, contenido y URLs externas

`container: "full"` establece una altura mínima relacionada con la ventana; un número positivo fija la altura en píxeles. Omítelo para utilizar el contenedor normal. `fullscreenEnabled` controla la acción de pantalla completa del visor. El título y la descripción de la ruta son independientes de los encabezados escritos dentro del HTML.

Para una página alojada, usa `url: { "en": "https://example.com/demo", "pt": "https://example.com/demo", "es": "https://example.com/demo" }` en lugar de `path`. Una ruta URL navega el iframe; el HTML local se carga en `srcDoc`. En contenido local, prefiere estilos incluidos y URLs HTTPS explícitas: srcDoc no resuelve automáticamente los recursos respecto al directorio del archivo original.

El servidor externo puede impedir la incorporación mediante CSP o X-Frame-Options. Los hosts conocidos que bloquean iframe reciben una alternativa para abrir en otra pestaña; no se detectan universalmente los fallos de cualquier servidor. Prueba el destino real en el sitio publicado. `blockLink: true` establece otra pestaña como destino predeterminado de los enlaces del HTML local; no impide la navegación de scripts o enlaces con destino propio.

## Utiliza y mantén el ejemplo del juego

Selecciona la entrada HTML, lee el aviso del proveedor y pulsa el botón de carga. Se necesita conexión; después sigue los controles de inicio y teclado del reproductor. La página incluye un enlace directo al proveedor si falla la incorporación. Prueba el foco del teclado, pantallas pequeñas, pantalla completa y el regreso a la documentación. La disponibilidad del reproductor y las capacidades del navegador pueden cambiar independientemente de GitPageDocs.

Revisa el HTML y sus dependencias antes de publicar. El iframe actual permite scripts y contenido del mismo origen, por lo que no es una barrera de seguridad para HTML arbitrario no confiable. No incluyas secretos en HTML, URLs ni configuración del cliente. El alojamiento estático expone los archivos independientemente de la visibilidad del menú o autorización de la ruta. En local y Pages, versiona la página junto con su configuración y valida las rutas generadas antes de publicar.

> Versión: 0.0.9
