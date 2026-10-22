# Accesibilidad y narración

Los controles de accesibilidad incluyen narración nativa del navegador para el documento Markdown actual. La narración utiliza Web Speech API (`speechSynthesis`); no necesita clave de API ni un servicio externo de voz de GitPageDocs.

## Configuración

Combina estas opciones con `gitpagedocs/config.json`:

```json
{
  "site": {
    "accessibility": {
      "enabled": true,
      "narration": {
        "enabled": true,
        "defaultRate": 1,
        "defaultVolume": 1
      }
    },
    "mediaExclusivePlayback": true
  }
}
```

- `site.accessibility.enabled`: activa la interfaz de accesibilidad.
- `site.accessibility.narration.enabled`: activa la narración del documento.
- `defaultRate`: velocidad inicial de `0.5` a `2`, en pasos de `0.25`; el valor predeterminado es `1`.
- `defaultVolume`: volumen inicial de `0` (silencio) a `1` (máximo), en pasos de `0.1`; el valor predeterminado es `1`.
- Todos los controles de activación tienen valor predeterminado `true`; las opciones ausentes usan los valores distribuidos.

## Leer un documento en voz alta

1. Abre una página Markdown y los controles de accesibilidad/narración.
2. Elige voz e idioma entre los que ofrece el navegador; ajusta velocidad y volumen.
3. Inicia la lectura. Pausa temporalmente, reanuda la voz pausada o detén la sesión.
4. Para cambiar opciones de lectura de manera previsible, detén, ajusta los controles e inicia de nuevo.

La narración empieza solo después de tu acción; no hay reproducción automática. La selección automática de voz sigue el idioma del documento; elegir una voz explícitamente utiliza el idioma de esa voz. La narración no traduce el documento.

La voz utiliza texto legible extraído del Markdown renderizado. Se excluyen scripts, estilos, contenido SVG y elementos ocultos para tecnologías de asistencia. El contenido visible largo se lee completo en bloques sucesivos. Cambiar de documento o idioma, desactivar la narración o salir de la página cancela la voz anterior.

En modo foco, la narración usa solo la sección mostrada. Cambiar de sección o documento, entrar o salir del modo foco detiene la lectura anterior. Inicia de nuevo para leer el contenido que ahora está visible. Con `site.focusMode.sectionNavigationEnabled: false`, el documento completo permanece visible y se puede narrar. Estas transiciones conservan la voz, velocidad y volumen seleccionados.

La vista habitual y el modo foco comparten preferencias de voz, velocidad y volumen mientras la página permanece montada. Las preferencias no se guardan entre recargas. Los valores no numéricos de velocidad o volumen usan `1`; los valores numéricos fuera de los rangos admitidos se limitan al extremo más cercano.

## Un audio a la vez

Con `site.mediaExclusivePlayback: true` (por defecto), iniciar o reanudar la narración pausa radio, pistas de audio y vídeos de ruta. Iniciar esos medios detiene la narración. Los vídeos silenciados quedan fuera de la regla. Utiliza `false` cuando la reproducción simultánea sea intencional.

La configuración se comparte con la reproducción de medios existente; no hay una segunda flag de exclusividad para narración. La página sigue siendo legible con la narración desactivada.

## Disponibilidad del navegador y las voces

El soporte de voz y las voces dependen del navegador, sistema operativo y voces instaladas o proporcionadas remotamente. La lista puede llegar después de cargar la página. Distintos navegadores y dispositivos pueden ofrecer idiomas diferentes.

La falta de soporte y los errores de reproducción se muestran en la interfaz. Comprueba que haya una voz utilizable, que el audio del sistema esté activo y que exista una interacción del usuario con la página. Una lista vacía de voces no indica que el documento no se haya cargado.

No supongas que todas las voces funcionan sin conexión: pueden ser locales o remotas. Esta función habla texto; no graba el micrófono. La narración complementa la navegación por teclado y los lectores de pantalla, sin sustituirlos.

Consulta la [referencia de Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) para el comportamiento del navegador.

> Versión: 0.0.15
