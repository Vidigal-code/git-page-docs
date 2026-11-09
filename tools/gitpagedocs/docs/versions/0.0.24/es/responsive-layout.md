# Pantallas estrechas y plegables

Un documento de GitPageDocs debe seguir siendo legible cuando cambia el ancho disponible del navegador. Un teléfono plegable puede ofrecer una pantalla exterior estrecha, una pantalla interior más amplia, modo de pantalla dividida y distintas orientaciones. El ancho en píxeles CSS importa más que el nombre del dispositivo: no supongas que todos los Galaxy Z Fold muestran el mismo ancho.

## Configura un menú fácil de recorrer

Usa etiquetas traducidas concisas y agrupa las páginas relacionadas bajo categorías claras. Un padre puede abrir su introducción mientras un control separado despliega sus hijos. Mantén los destinos importantes cerca del principio. Si una jerarquía profunda dificulta un sitio pequeño, configura `nestedMenusEnabled` como false para mostrar los destinos existentes en una lista plana.

El siguiente fragmento pertenece a `site`, en `gitpagedocs/config.json`:

```json
{
  "nestedMenusEnabled": true,
  "RouteGuide": true,
  "ActiveNavigation": true,
  "documentNavigation": { "position": "center" },
  "RouteguideBrandPositionDefault": "left",
  "RouteguideBrandContainerTopDefault": false,
  "backgroundEffects": {
    "enabled": true,
    "overrides": { "accessibility": { "showPauseButton": true } }
  }
}
```

`RouteGuide` mantiene disponibles las rutas de navegación; `ActiveNavigation` habilita la navegación rápida. Estas opciones no definen un breakpoint por dispositivo. El visor adapta el diseño al espacio disponible. Usa el control del menú móvil para acceder al idioma, tema y animaciones cuando la cabecera esté contraída.

## Limita el índice de forma deliberada

En una referencia Markdown extensa, indexa la jerarquía principal de títulos en lugar de todos los párrafos. Añade el fragmento a la ruta correspondiente en `routes-md`:

```json
{
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteguideBrandPosition": "left"
}
```

Los títulos inferiores a los niveles elegidos siguen visibles en el documento. Si una página necesita el índice sobre el contenido en todos los anchos, configura `RouteguideBrandContainerTop` como true en esa ruta y revisa el orden de lectura. Consulta [Configura la guía del documento](route-guide.md) para listas vacías, comportamiento anterior, filtros por ID y marcadores explícitos.

## Escribe contenido adaptable

Prefiere enlaces con etiquetas breves a URLs completas, tablas estrechas a muchas columnas y bloques de código con su lenguaje indicado. Conserva los comandos largos para copiarlos; el desplazamiento horizontal dentro de un bloque es distinto del desbordamiento de toda la página. Divide ejemplos grandes en fragmentos concretos e indica dónde debe aplicarse cada uno.

En demostraciones HTML locales, incluye la metaetiqueta viewport, usa anchos relativos, permite saltos de texto y evita anchos mínimos mayores que el iframe. Comprueba el teclado y los gestos táctiles aparte del visor. El lector PDF nativo, las voces del navegador y los reproductores externos tienen limitaciones móviles propias; ofrece texto útil y acciones alternativas cuando estén disponibles.

## Comprueba el plegado y los cambios de tamaño

Usa esta secuencia con anchos de 280, 320, 344, 390 y 768 píxeles CSS; después repite los recorridos importantes en un dispositivo real:

1. Abre directamente una referencia larga y comprueba que el cuerpo del documento no desborde la ventana.
2. Abre y cierra el menú principal, expande un padre, sigue una página anidada y regresa por su ruta de navegación.
3. Cambia idioma y tema; comprueba que las etiquetas traducidas y los indicadores de foco sigan visibles.
4. Abre la guía, sigue una entrada cercana al final y vuelve al principio.
5. Abre el modo enfoque, usa los controles de sección y documento y ciérralo sin perder la orientación.
6. Cambia el ancho con el menú o la guía abiertos. En un dispositivo plegable, también abre y cierra el dispositivo y cambia su orientación.
7. Repite con texto ampliado, navegación por teclado y la preferencia del sistema de movimiento reducido.

Estos anchos forman una matriz de comprobación, no una certificación de todos los navegadores, estados de plegado, niveles de zoom o modelos Galaxy Z Fold. Registra navegador, ancho, orientación, ruta, idioma y comportamiento observado para obtener un informe reproducible.

## Mantén las animaciones opcionales

La acción de pausa de la cabecera controla la animación decorativa sin ocultar la documentación. La preferencia del sistema de movimiento reducido tiene prioridad. Para desactivar los efectos de fondo del sitio, configura `site.backgroundEffects.enabled` como false. Prueba una página larga al desplazarte y abrir menús; los efectos no deben retrasar el acceso al contenido. Consulta [Temas y diseños](themes.md) para las opciones por tema y de rendimiento.


## Sigue la página activa en el menú

Con el candado de navegación desbloqueado, Anterior y Siguiente centran el destino actual dentro del área de desplazamiento del propio menú. Abrir o desbloquear el menú también muestra ese destino. Se aplica a la barra lateral de escritorio y al panel móvil; el rango disponible limita el centrado cerca del inicio o final. El documento no se mueve cuando se centra el menú.

El desplazamiento manual del menú se conserva entre cambios de página. Redimensionar o desplegar la pantalla centra el elemento activo; bloquear el menú conserva su posición y desactiva el seguimiento automático. Prueba ambos estados del candado al pasar de 344 a 768 píxeles CSS y volver, también en orientación horizontal.

## Muestra los controles desde el primer renderizado

Los controles de idioma, tema y animación usan los iconos oficiales predeterminados mientras la configuración del shell independiente carga o no está disponible. La búsqueda de repositorios, la carga de documentación, la apertura del repositorio, la guía introductoria, el visor de código y las páginas no encontradas conservan nombres accesibles en los botones. La opción explícita `reactIcon: false` sigue siendo válida para texto localizado al cargar la configuración; los valores de iconos predeterminados no la reemplazan.

Los breadcrumbs tienen `1.75rem` de espacio arriba y abajo (28 píxeles CSS con el tamaño raíz predeterminado). Los selectores móviles llenan las filas del menú con iconos centrados; los del encabezado de escritorio conservan dimensiones compactas.

Desde 0.0.22, los controles del encabezado de la documentación muestran un icono predeterminado mientras carga el icono configurado, evitando controles vacíos. El icono configurado sustituye ese valor cuando está listo; una preferencia explícita por texto conserva el texto. En pantallas estrechas, los controles de acciones Markdown reservan su propio espacio antes del título del documento, sin cubrirlo.

> Versión: 0.0.24
