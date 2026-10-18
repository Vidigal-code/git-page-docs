# Temas y layouts

Los temas son templates JSON mapeados por `layoutsConfig.json`.

## Archivos

- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/layoutsFallbackConfig.json`
- `gitpagelayouts/templates/*.json`

## Modelo de template

Cada template normalmente incluye:

- `id`, `name`, `author`, `version`
- `mode` y metadatos de par dark/light
- `colors`
- `typography`
- tokens de `components`
- `animations`

## Comportamiento en runtime

- tema activo viene de config/selección de usuario
- toggle light/dark resuelve tema pareado por referencia
- variables CSS se generan desde tokens del template

## Buenas prácticas

- mantener contraste accesible
- mantener escala consistente de espacios y bordes
- ofrecer variantes dark y light cuando sea posible

## Elegir y personalizar

Elige un tema mediante el selector o configura `site.ThemeDefault` con su ID exacto. `ThemeModeDefault` define el modo inicial claro/oscuro. `HideThemeSelector` oculta el selector; el tema seleccionado sigue aplicado.

En tu repositorio, ejecuta la CLI con `--layoutconfig`, edita la plantilla generada y conserva el ID coherente con `layoutsConfig.json`. El contenido de ruta y `site.icons` son independientes del catálogo de temas. Usa `currentColor` para iconos que heredan el color de texto o configura colores claros/oscuros con contraste suficiente.

Al contribuir en Git Page Docs, la fuente es `gitpagelayouts/v2/base.json` junto con `gitpagelayouts/v2/layouts/<id>.json`. Ejecuta `pnpm layouts:sync` para generar plantillas y documentación. La sincronización puede sobrescribir las ediciones directas de plantillas generadas.

## Fondos animados y 20 familias con paralaje en dos modos

El catálogo contiene 124 temas: 64 originales, 20 presets animados independientes y otras 20 familias con versiones oscura y clara (40 entradas). Los 84 temas anteriores conservan sus paletas, componentes y comportamiento. Matrix Dark y Matrix Light no cambian; elige **Matrix Rain** para caracteres que caen. Los 60 presets animados utilizan el renderer Motion existente, sin otra dependencia en tiempo de ejecución.

| ID | Nombre | Modo | Capas |
| --- | --- | --- | --- |
| `alpine-meadow-dark` | Alpine Meadow Dark | `dark` | `stars` + `waves` + `orbs` |
| `alpine-meadow-light` | Alpine Meadow Light | `light` | `stars` + `waves` + `orbs` |
| `astral-drift-dark` | Astral Drift | `dark` | `stars` + `streaks` + `orbs` |
| `aurora-borealis-dark` | Aurora Borealis Dark | `dark` | `orbs` + `waves` + `stars` |
| `aurora-borealis-light` | Aurora Borealis Light | `light` | `orbs` + `waves` + `stars` |
| `autumn-embers-dark` | Autumn Embers Dark | `dark` | `streaks` + `stars` + `orbs` |
| `autumn-embers-light` | Autumn Embers Light | `light` | `streaks` + `stars` + `orbs` |
| `bamboo-dawn-dark` | Bamboo Dawn Dark | `dark` | `streaks` + `orbs` + `stars` |
| `bamboo-dawn-light` | Bamboo Dawn Light | `light` | `streaks` + `orbs` + `stars` |
| `celestial-ice-light` | Celestial Ice | `light` | `stars` + `waves` |
| `cloud-harbor-dark` | Cloud Harbor Dark | `dark` | `orbs` + `waves` |
| `cloud-harbor-light` | Cloud Harbor Light | `light` | `orbs` + `waves` |
| `comet-trail-dark` | Comet Trail | `dark` | `streaks` + `stars` + `grid` |
| `coral-lagoon-dark` | Coral Lagoon Dark | `dark` | `orbs` + `waves` + `streaks` |
| `coral-lagoon-light` | Coral Lagoon Light | `light` | `orbs` + `waves` + `streaks` |
| `cosmic-tide-dark` | Cosmic Tide Dark | `dark` | `waves` + `stars` + `orbs` |
| `cosmic-tide-light` | Cosmic Tide Light | `light` | `waves` + `stars` + `orbs` |
| `crystal-cavern-dark` | Crystal Cavern Dark | `dark` | `grid` + `streaks` + `stars` |
| `crystal-cavern-light` | Crystal Cavern Light | `light` | `grid` + `streaks` + `stars` |
| `desert-mirage-dark` | Desert Mirage Dark | `dark` | `waves` + `orbs` + `stars` |
| `desert-mirage-light` | Desert Mirage Light | `light` | `waves` + `orbs` + `stars` |
| `dune-parallax-light` | Dune Parallax | `light` | `waves` + `grid` + `orbs` |
| `firefly-grove-dark` | Firefly Grove Dark | `dark` | `stars` + `orbs` + `waves` |
| `firefly-grove-light` | Firefly Grove Light | `light` | `stars` + `orbs` + `waves` |
| `forest-canopy-dark` | Forest Canopy Dark | `dark` | `orbs` + `stars` + `waves` |
| `forest-canopy-light` | Forest Canopy Light | `light` | `orbs` + `stars` + `waves` |
| `glacier-fjord-dark` | Glacier Fjord Dark | `dark` | `waves` + `grid` + `stars` |
| `glacier-fjord-light` | Glacier Fjord Light | `light` | `waves` + `grid` + `stars` |
| `golden-savanna-dark` | Golden Savanna Dark | `dark` | `streaks` + `stars` + `orbs` |
| `golden-savanna-light` | Golden Savanna Light | `light` | `streaks` + `stars` + `orbs` |
| `lavender-mist-dark` | Lavender Mist Dark | `dark` | `orbs` + `waves` + `stars` |
| `lavender-mist-light` | Lavender Mist Light | `light` | `orbs` + `waves` + `stars` |
| `lotus-pond-dark` | Lotus Pond Dark | `dark` | `waves` + `orbs` + `stars` |
| `lotus-pond-light` | Lotus Pond Light | `light` | `waves` + `orbs` + `stars` |
| `lunar-dust-light` | Lunar Dust | `light` | `stars` + `orbs` |
| `matrix-amber-dark` | Matrix Amber | `dark` | `matrix` + `orbs` |
| `matrix-cyan-dark` | Matrix Cyan | `dark` | `matrix` + `grid` + `stars` |
| `matrix-mint-light` | Matrix Mint | `light` | `matrix` + `waves` |
| `matrix-paper-light` | Matrix Paper | `light` | `matrix` + `grid` |
| `matrix-rain-dark` | Matrix Rain | `dark` | `matrix` + `grid` |
| `matrix-violet-dark` | Matrix Violet | `dark` | `matrix` + `orbs` |
| `meteor-copper-dark` | Meteor Copper | `dark` | `streaks` + `stars` |
| `nebula-violet-dark` | Nebula Violet | `dark` | `orbs` + `stars` + `waves` |
| `ocean-depths-dark` | Ocean Depths Dark | `dark` | `waves` + `orbs` + `streaks` |
| `ocean-depths-light` | Ocean Depths Light | `light` | `waves` + `orbs` + `streaks` |
| `paper-lanterns-dark` | Paper Lanterns Dark | `dark` | `orbs` + `streaks` + `waves` |
| `paper-lanterns-light` | Paper Lanterns Light | `light` | `orbs` + `streaks` + `waves` |
| `petal-parallax-light` | Petal Parallax | `light` | `orbs` + `waves` + `stars` |
| `polaris-parallax-dark` | Polaris Parallax | `dark` | `waves` + `stars` + `orbs` |
| `prism-depth-dark` | Prism Depth | `dark` | `orbs` + `grid` + `waves` |
| `reef-parallax-dark` | Reef Parallax | `dark` | `waves` + `orbs` |
| `sakura-breeze-dark` | Sakura Breeze Dark | `dark` | `orbs` + `stars` + `waves` |
| `sakura-breeze-light` | Sakura Breeze Light | `light` | `orbs` + `stars` + `waves` |
| `silver-rain-dark` | Silver Rain Dark | `dark` | `streaks` + `waves` + `orbs` |
| `silver-rain-light` | Silver Rain Light | `light` | `streaks` + `waves` + `orbs` |
| `solar-sparks-dark` | Solar Sparks | `dark` | `streaks` + `orbs` + `stars` |
| `starfall-cobalt-dark` | Starfall Cobalt | `dark` | `stars` + `streaks` |
| `sunrise-parallax-light` | Sunrise Parallax | `light` | `waves` + `orbs` |
| `thunder-horizon-dark` | Thunder Horizon Dark | `dark` | `orbs` + `streaks` + `waves` |
| `thunder-horizon-light` | Thunder Horizon Light | `light` | `orbs` + `streaks` + `waves` |

### Alternar una familia entre oscuro y claro

Elige un tema emparejado, como `aurora-borealis-dark`, y utiliza el control existente de modo claro/oscuro para cambiar a `aurora-borealis-light`. Las 20 familias incluyen auroras, luciérnagas, corrientes marinas, bosques, lluvia, nubes, cerezos, brasas, glaciares, dunas, niebla, lagunas, bambú, tormentas en el horizonte, cristales, estanques, sabanas, praderas, mareas cósmicas y faroles. Cada pareja comparte composición y semilla determinista, con paletas legibles propias y efectos más suaves en modo claro. Ambos modos habilitan el paralaje del puntero y del desplazamiento por defecto.

El emparejamiento se declara en el catálogo: ambas entradas utilizan `supportsLightAndDarkModes: true` y la misma `supportsLightAndDarkModesReference` (por ejemplo, `aurora-borealis`), con valores de `mode` diferentes. Los IDs terminan en `-dark` o `-light`; los presets independientes anteriores no se emparejan ni se reemplazan automáticamente. Un ajuste por tema apunta a un ID exacto: configura ambos IDs si la familia necesita el mismo ajuste personalizado.

### Personalizar todo mediante JSON

No necesitas editar JavaScript. Selecciona un preset mediante `site.ThemeDefault` o el selector. El campo opcional `backgroundEffects`, en la raíz de la plantilla, define su fondo. En `gitpagedocs/config.json`, `site.backgroundEffects` controla todos los fondos y permite ajustes individuales:

```json
{
  "site": {
    "ThemeDefault": "matrix-rain-dark",
    "backgroundEffects": {
      "enabled": true,
      "overrides": {
        "animation": {
          "speed": 0.6
        },
        "parallax": {
          "enabled": false
        },
        "accessibility": {
          "showPauseButton": true
        }
      },
      "themes": {
        "matrix-rain-dark": {
          "layers": [
            {
              "id": "code",
              "kind": "matrix",
              "count": 12,
              "colors": [
                "#4ADE80",
                "#BEF264"
              ],
              "opacity": 0.22,
              "size": {
                "min": 13,
                "max": 17
              },
              "duration": {
                "min": 20,
                "max": 36
              },
              "travel": {
                "x": 0,
                "y": 115
              },
              "characters": "0123456789ABCDEF",
              "rows": 16,
              "seed": 1049
            }
          ]
        }
      }
    },
    "icons": {
      "BackgroundAnimationPause": {
        "reactIcon": true,
        "tag": "FiPause",
        "size": "22px",
        "colorDark": "currentColor",
        "colorLight": "currentColor"
      },
      "BackgroundAnimationResume": {
        "reactIcon": true,
        "tag": "FiPlay",
        "size": "22px",
        "colorDark": "currentColor",
        "colorLight": "currentColor"
      }
    }
  }
}
```

La precedencia es plantilla → `site.backgroundEffects.overrides` → `site.backgroundEffects.themes[themeId]`. Los objetos internos se combinan; `layers` sustituye el array completo, por lo que debes incluir todas las capas que quieras conservar. El ejemplo sustituye la cuadrícula y las letras originales de Matrix Rain por una capa de caracteres personalizada. Los demás temas conservan sus capas y solo reciben los ajustes globales de velocidad y paralaje.

- Usa `site.backgroundEffects.enabled: false` para desactivar todos los fondos. Un `enabled: true` individual no anula este interruptor principal.
- Usa `themes[themeId].enabled: false` para desactivar el fondo de un tema.
- Usa `animation.enabled: false` y `parallax.enabled: false` para un fondo estático. `animation.speed` multiplica la velocidad; los valores menores producen movimientos más lentos.
- Cambia `count`, `colors`, `size`, `duration` y `opacity` por capa para ajustar densidad, paleta, tamaño, tiempo y visibilidad. Una cantidad de cero elimina la capa.
- Los temas sin `backgroundEffects` permanecen estáticos, salvo que añadas explícitamente un fondo habilitado con capas válidas mediante estas opciones.

### Pausar desde el menú de navegación

El control de pausa/reanudación aparece junto al candado de navegación en el menú de documentación, incluida la barra lateral contraída y el menú móvil. Las páginas de búsqueda lo muestran en su cabecera. La pausa manual se conserva al abrir o cerrar menús y al cambiar de tema; utiliza Reanudar para continuar. Las protecciones de movimiento reducido y pestaña oculta siguen teniendo prioridad.

`site.backgroundEffects.overrides.accessibility.showPauseButton` tiene el valor explícito `true` por defecto. Define `false` para ocultar solo el control; esto no detiene la animación. Desactiva todos los fondos con el interruptor general `site.backgroundEffects.enabled: false`. Personaliza `site.icons.BackgroundAnimationPause` (`FiPause`) y `BackgroundAnimationResume` (`FiPlay`) de forma independiente mediante `reactIcon`, `tag`, `size`, `colorDark` y `colorLight`. Los valores predeterminados son iconos, 22px y `currentColor`; `reactIcon: false` muestra el texto localizado de la acción y conserva su nombre accesible.

### Campos del fondo y las capas

| Campo | Significado e intervalo aceptado |
| --- | --- |
| `enabled`, `surface`, `opacity` | Habilita el fondo, define su color/degradado CSS y la opacidad total de 0 a 1 |
| `animation.enabled`, `animation.speed` | Movimiento automático; multiplicador de velocidad entre 0,05 y 4 |
| `parallax.enabled` | Profundidad con el puntero/desplazamiento, independiente del movimiento automático |
| `parallax.pointer`, `parallax.scroll` | Desplazamiento del puntero de 0 a 80 px; proporción de desplazamiento de 0 a 0,3 |
| `accessibility.reducedMotion` | `static` mantiene una composición inmóvil; `hide` la oculta cuando se solicita movimiento reducido |
| `accessibility.showPauseButton` | Muestra el control de pausa/reanudación; habilitado en los 60 presets animados |
| `layers[].id`, `kind` | ID único y tipo `stars`, `streaks`, `matrix`, `orbs`, `grid` o `waves` |
| `count`, `colors`, `opacity` | 0–80 elementos, hasta 8 colores CSS y opacidad de capa de 0 a 1 |
| `size.min/max`, `duration.min/max` | Tamaño en px (0,5–800) y duración en segundos (2–120) |
| `travel.x/y`, `position.x/y` | Recorrido en vw/vh (−200–200); posición inicial porcentual (−100–100) |
| `blur`, `glow`, `rotation`, `depth` | Desenfoque/brillo de 0–80 px, rotación de −360–360 grados y profundidad de 0–2 |
| `length` | Longitud de los rastros entre 1 y 500 px |
| `characters`, `rows` | Alfabeto Matrix y 1–48 caracteres por columna |
| `seed` | Entero entre 0 y 2147483647 para una distribución repetible de partículas |

Se utilizan hasta 8 capas y 200 elementos configurados. Se omiten tipos/IDs inválidos e IDs duplicados; los números finitos fuera del intervalo se limitan y los valores numéricos inválidos usan los predeterminados. Para dispositivos modestos, reduce cantidades y desenfoque y utiliza movimientos lentos. Conserva la legibilidad de textos y controles y mantén el botón de pausa en fondos continuos. La preferencia de movimiento reducido se aplica aunque la animación esté habilitada en JSON.

Los colores aceptan valores CSS como hexadecimal, `rgb(...)` o `var(--primary)`. Una lista ausente/vacía utiliza `var(--primary)` y `var(--secondary)`, siguiendo la paleta activa. Los textos pierden espacios en los extremos y se limitan a 2048 caracteres; los intervalos min/max invertidos se ordenan automáticamente. Cantidades, filas y semillas se convierten en enteros. Un fondo habilitado necesita al menos una capa válida; la animación automática y el paralaje se habilitan cuando se omiten sus opciones en ese fondo.

### Creación de temas y compatibilidad

En este repositorio, añade el preset en `gitpagelayouts/v2/layouts/` con `overrides.backgroundEffects` y registra sus metadatos en `layoutsConfig.json`. `pnpm run layouts:sync` expande la plantilla, documenta el tema y compila el mismo fondo/paleta en los datos incluidos en la CLI. No edites `cli/data/animated-layouts.mjs` directamente. La plantilla generada usa `backgroundEffects` en su raíz, separado de `animations`.

El catálogo oficial y `npx @gitpagedocs/cli --layoutconfig` ofrecen los mismos 124 temas, incluidos los 60 presets animados. Las configuraciones antiguas y los 84 temas anteriores siguen funcionando. Los visores antiguos sin soporte para fondos siguen utilizando los colores y componentes normales de la plantilla.

Para previsualizar cambios aún no publicados en este checkout, define `GITPAGEDOCS_LAYOUTS_SOURCE=local` antes de iniciar el servidor de desarrollo. Solo `NODE_ENV=development` acepta esta opción: lee el catálogo local `gitpagelayouts/` sin modificar la configuración guardada. Producción y valores ausentes/desconocidos siguen respetando el JSON. Para utilizar plantillas locales en producción, configura `site.layoutsConfigPathOficial: false` y las rutas locales/personalizadas correspondientes.

> Versión: 0.0.14
