import { ANIMATED_BACKGROUNDS, ANIMATED_LAYOUTS } from "../data/animated-layouts.mjs";

const SITE_EXAMPLE = JSON.stringify({
  site: {
    ThemeDefault: "matrix-rain-dark",
    backgroundEffects: {
      enabled: true,
      overrides: {
        animation: { speed: 0.6 }, parallax: { enabled: false },
        accessibility: { showPauseButton: true },
      },
      themes: {
        "matrix-rain-dark": {
          layers: [{
            id: "code", kind: "matrix", count: 12,
            colors: ["#4ADE80", "#BEF264"], opacity: 0.22,
            size: { min: 13, max: 17 }, duration: { min: 20, max: 36 },
            travel: { x: 0, y: 115 }, characters: "0123456789ABCDEF", rows: 16, seed: 1049,
          }],
        },
      },
    },
    icons: {
      BackgroundAnimationPause: { reactIcon: true, tag: "FiPause", size: "22px", colorDark: "currentColor", colorLight: "currentColor" },
      BackgroundAnimationResume: { reactIcon: true, tag: "FiPlay", size: "22px", colorDark: "currentColor", colorLight: "currentColor" },
    },
  },
}, null, 2);

function catalogRows() {
  return ANIMATED_LAYOUTS.map((layout) => {
    const layers = ANIMATED_BACKGROUNDS[layout.id].layers.map(({ kind }) => `\`${kind}\``).join(" + ");
    return `| \`${layout.id}\` | ${layout.name} | \`${layout.mode}\` | ${layers} |`;
  }).join("\n");
}

const CATALOG_ROWS = catalogRows();

export const THEME_BACKGROUND_DOCS = {
  en: `## Animated backgrounds and 20 paired parallax families

The catalog contains 124 themes: 64 original themes, 20 standalone animated presets and 20 additional families with dark and light variants (40 entries). All 84 earlier themes retain their palettes, components and behavior. Existing Matrix Dark and Matrix Light remain unchanged; select **Matrix Rain** for falling characters. The 60 animated presets use the existing Motion renderer, with no extra runtime dependency.

| ID | Name | Mode | Layers |
| --- | --- | --- | --- |
${CATALOG_ROWS}

### Switch a family between dark and light

Choose a paired theme such as \`aurora-borealis-dark\`, then use the existing light/dark control to switch to \`aurora-borealis-light\`. The 20 families cover auroras, fireflies, ocean currents, forests, rainfall, clouds, sakura, embers, glaciers, dunes, mist, lagoons, bamboo, storm horizons, crystals, ponds, savannas, meadows, cosmic tides and lanterns. Each pair shares its composition and deterministic seed, with a separate readable palette and softer effects in light mode. Both modes enable pointer and scroll parallax by default.

Pairing is declared in the catalog: both entries use \`supportsLightAndDarkModes: true\` and the same \`supportsLightAndDarkModesReference\` (for example, \`aurora-borealis\`), with different \`mode\` values. IDs end in \`-dark\` or \`-light\`; older standalone presets are not silently paired or replaced. A per-theme override targets one exact ID, so configure both IDs when a family needs the same custom override.

### Configure everything in JSON

No JavaScript edits are needed. Select a preset with \`site.ThemeDefault\` or the theme selector. A template's optional top-level \`backgroundEffects\` defines its background. In \`gitpagedocs/config.json\`, \`site.backgroundEffects\` controls all backgrounds and customizes individual themes:

\`\`\`json
${SITE_EXAMPLE}
\`\`\`

Resolution order is template → \`site.backgroundEffects.overrides\` → \`site.backgroundEffects.themes[themeId]\`. Nested settings merge; \`layers\` replaces the entire layer array, so include every layer you want to keep. The example replaces Matrix Rain's grid and character layers with one custom character layer. Other themes retain their layers and receive only the global speed/parallax overrides.

- Set \`site.backgroundEffects.enabled: false\` to turn off every background. A per-theme \`enabled: true\` cannot bypass this master switch.
- Set \`themes[themeId].enabled: false\` to disable one theme's background.
- Set \`animation.enabled: false\` and \`parallax.enabled: false\` for a static background. \`animation.speed\` multiplies movement speed; smaller values are slower.
- Change \`count\`, \`colors\`, \`size\`, \`duration\` and \`opacity\` inside a layer to adjust density, palette, scale, timing and visibility. A count of zero removes that layer.
- Themes without \`backgroundEffects\` remain static unless you explicitly supply an enabled background and valid layers through these settings.

### Pause from the navigation menu

The pause/resume control sits beside the navigation lock in the documentation menu, including the collapsed sidebar and mobile menu. Search pages expose it in their header. A manual pause remains active when opening or closing menus and when changing themes; use Resume to continue. Reduced-motion and hidden-tab protections still take precedence.

\`site.backgroundEffects.overrides.accessibility.showPauseButton\` defaults explicitly to \`true\`. Set it to \`false\` to hide the control only; this does not stop animation. Disable all backgrounds with the master \`site.backgroundEffects.enabled: false\`. Customize \`site.icons.BackgroundAnimationPause\` (\`FiPause\`) and \`BackgroundAnimationResume\` (\`FiPlay\`) independently using \`reactIcon\`, \`tag\`, \`size\`, \`colorDark\` and \`colorLight\`. The defaults are icons, 22px and \`currentColor\`; \`reactIcon: false\` shows localized action text while retaining the accessible name.

### Background and layer fields

| Field | Meaning and accepted range |
| --- | --- |
| \`enabled\`, \`surface\`, \`opacity\` | Enable the background, choose its CSS color/gradient, and set total opacity from 0 to 1 |
| \`animation.enabled\`, \`animation.speed\` | Enable automatic movement; speed multiplier from 0.05 to 4 |
| \`parallax.enabled\` | Enable pointer/scroll depth independently of automatic movement |
| \`parallax.pointer\`, \`parallax.scroll\` | Pointer displacement from 0 to 80 px; scroll ratio from 0 to 0.3 |
| \`accessibility.reducedMotion\` | \`static\` retains a still composition; \`hide\` hides it when reduced motion is requested |
| \`accessibility.showPauseButton\` | Show the visitor's pause/resume control; enabled in every new preset |
| \`layers[].id\`, \`kind\` | Unique layer ID and one of \`stars\`, \`streaks\`, \`matrix\`, \`orbs\`, \`grid\`, \`waves\` |
| \`count\`, \`colors\`, \`opacity\` | 0–80 elements, up to 8 CSS colors, and layer opacity 0–1 |
| \`size.min/max\`, \`duration.min/max\` | Size range in px (0.5–800), duration range in seconds (2–120) |
| \`travel.x/y\`, \`position.x/y\` | Travel in vw/vh (−200–200); initial percentage offsets (−100–100) |
| \`blur\`, \`glow\`, \`rotation\`, \`depth\` | Blur/glow 0–80 px, rotation −360–360 degrees, parallax depth 0–2 |
| \`length\` | Streak length from 1 to 500 px |
| \`characters\`, \`rows\` | Matrix alphabet and 1–48 characters per column |
| \`seed\` | Integer 0–2147483647 for a repeatable particle arrangement |

At most 8 layers and 200 configured elements are used. Invalid layer kinds/IDs and duplicate IDs are ignored; finite numbers outside their range are clamped, and invalid numeric values use defaults. Lower counts, smaller blur and slower movement are useful on modest devices. Keep text and controls readable over the background, and retain the pause control for continuously moving presets. Reduced-motion preferences apply even when animation is enabled in JSON.

Colors accept CSS values such as hex, \`rgb(...)\` or \`var(--primary)\`. An omitted/empty color list falls back to \`var(--primary)\` and \`var(--secondary)\`, following the active palette. Text fields are trimmed and limited to 2048 characters; reversed min/max ranges are ordered automatically. Counts, rows and seeds become integers. An enabled background needs at least one valid layer; absent automatic-animation/parallax settings default to enabled for that background.

### Authoring and compatibility

In this repository, add a preset under \`gitpagelayouts/v2/layouts/\` with \`overrides.backgroundEffects\` and register its metadata in \`layoutsConfig.json\`. \`pnpm run layouts:sync\` expands the template, documents the preset and compiles the same background/palette into package-local CLI data. Do not edit \`cli/data/animated-layouts.mjs\` directly. The generated template uses top-level \`backgroundEffects\`, not a field inside \`animations\`.

The official catalog and \`npx @gitpagedocs/cli --layoutconfig\` expose the same 124 themes, including all 60 animated presets. Existing configurations and all 84 earlier themes keep working. Older viewers without background support still use the template's ordinary colors and components.

For an unpublished source-checkout preview, set \`GITPAGEDOCS_LAYOUTS_SOURCE=local\` before starting the development server. Only \`NODE_ENV=development\` honors this switch: it reads the local \`gitpagelayouts/\` catalog without changing the saved configuration. Production and an unset/unknown value continue following JSON configuration. To use local templates in production, configure \`site.layoutsConfigPathOficial: false\` and the appropriate local/custom layout paths instead.
`,
  pt: `## Fundos animados e 20 famílias com paralaxe em dois modos

O catálogo contém 124 temas: 64 originais, 20 presets animados independentes e mais 20 famílias com versões escura e clara (40 entradas). Todos os 84 temas anteriores preservam suas paletas, componentes e comportamento. Matrix Dark e Matrix Light continuam iguais; escolha **Matrix Rain** para letras caindo. Os 60 presets animados utilizam o renderer Motion existente, sem dependência adicional em tempo de execução.

| ID | Nome | Modo | Camadas |
| --- | --- | --- | --- |
${CATALOG_ROWS}

### Alternar uma família entre escuro e claro

Escolha um tema pareado, como \`aurora-borealis-dark\`, e use o controle existente de modo claro/escuro para alternar para \`aurora-borealis-light\`. As 20 famílias incluem auroras, vaga-lumes, correntes marinhas, florestas, chuva, nuvens, cerejeiras, brasas, geleiras, dunas, névoa, lagoas, bambus, tempestades no horizonte, cristais, lagos, savanas, prados, marés cósmicas e lanternas. Cada par compartilha composição e semente determinística, com paletas legíveis próprias e efeitos mais suaves no modo claro. Ambos os modos habilitam paralaxe do ponteiro e da rolagem por padrão.

O pareamento fica no catálogo: as duas entradas usam \`supportsLightAndDarkModes: true\` e a mesma \`supportsLightAndDarkModesReference\` (por exemplo, \`aurora-borealis\`), com valores de \`mode\` diferentes. Os IDs terminam em \`-dark\` ou \`-light\`; os presets independentes anteriores não são pareados nem substituídos automaticamente. Um ajuste por tema aponta para um ID exato: configure os dois IDs quando a família precisar do mesmo ajuste personalizado.

### Personalizar tudo em JSON

Não é necessário editar JavaScript. Escolha o preset em \`site.ThemeDefault\` ou no seletor. O campo opcional \`backgroundEffects\`, na raiz do template, define o fundo. Em \`gitpagedocs/config.json\`, \`site.backgroundEffects\` controla todos os fundos e permite ajustes por tema:

\`\`\`json
${SITE_EXAMPLE}
\`\`\`

A precedência é template → \`site.backgroundEffects.overrides\` → \`site.backgroundEffects.themes[themeId]\`. Objetos internos são mesclados; \`layers\` substitui o array inteiro, portanto inclua todas as camadas que deseja manter. O exemplo troca a grade e as letras originais de Matrix Rain por uma camada personalizada de caracteres. Os demais temas mantêm suas camadas e recebem apenas os ajustes globais de velocidade e paralaxe.

- Use \`site.backgroundEffects.enabled: false\` para desligar todos os fundos. Um \`enabled: true\` específico não supera essa chave principal.
- Use \`themes[themeId].enabled: false\` para desativar o fundo de um tema.
- Use \`animation.enabled: false\` e \`parallax.enabled: false\` para um fundo estático. \`animation.speed\` multiplica a velocidade; valores menores deixam o movimento mais lento.
- Altere \`count\`, \`colors\`, \`size\`, \`duration\` e \`opacity\` de cada camada para ajustar densidade, paleta, tamanho, tempo e visibilidade. Contagem zero remove a camada.
- Temas sem \`backgroundEffects\` permanecem estáticos, a menos que você forneça explicitamente um fundo habilitado com camadas válidas nessas opções.

### Pausar pelo menu de navegação

O controle de pausar/retomar fica junto do cadeado de navegação no menu da documentação, inclusive na barra lateral recolhida e no menu móvel. Nas páginas de busca, ele aparece no cabeçalho. A pausa manual permanece ao abrir ou fechar menus e ao trocar de tema; use Retomar para continuar. As proteções de movimento reduzido e aba oculta continuam tendo prioridade.

\`site.backgroundEffects.overrides.accessibility.showPauseButton\` tem padrão explícito \`true\`. Defina \`false\` para ocultar somente o controle; isso não interrompe a animação. Desative todos os fundos com o interruptor geral \`site.backgroundEffects.enabled: false\`. Personalize \`site.icons.BackgroundAnimationPause\` (\`FiPause\`) e \`BackgroundAnimationResume\` (\`FiPlay\`) independentemente com \`reactIcon\`, \`tag\`, \`size\`, \`colorDark\` e \`colorLight\`. Os padrões são ícones, 22px e \`currentColor\`; \`reactIcon: false\` mostra o texto localizado da ação e mantém seu nome acessível.

### Campos do fundo e das camadas

| Campo | Significado e intervalo aceito |
| --- | --- |
| \`enabled\`, \`surface\`, \`opacity\` | Habilita o fundo, define sua cor/gradiente CSS e a opacidade total de 0 a 1 |
| \`animation.enabled\`, \`animation.speed\` | Movimento automático; multiplicador de velocidade de 0,05 a 4 |
| \`parallax.enabled\` | Profundidade pelo ponteiro/rolagem, independente do movimento automático |
| \`parallax.pointer\`, \`parallax.scroll\` | Deslocamento pelo ponteiro de 0 a 80 px; razão da rolagem de 0 a 0,3 |
| \`accessibility.reducedMotion\` | \`static\` mantém a composição parada; \`hide\` oculta o fundo quando o usuário pede movimento reduzido |
| \`accessibility.showPauseButton\` | Mostra o controle de pausar/retomar; habilitado nos 60 presets animados |
| \`layers[].id\`, \`kind\` | ID único e tipo \`stars\`, \`streaks\`, \`matrix\`, \`orbs\`, \`grid\` ou \`waves\` |
| \`count\`, \`colors\`, \`opacity\` | 0–80 elementos, até 8 cores CSS e opacidade da camada de 0 a 1 |
| \`size.min/max\`, \`duration.min/max\` | Tamanho em px (0,5–800) e duração em segundos (2–120) |
| \`travel.x/y\`, \`position.x/y\` | Deslocamento em vw/vh (−200–200); posição inicial em porcentagem (−100–100) |
| \`blur\`, \`glow\`, \`rotation\`, \`depth\` | Desfoque/brilho de 0–80 px, rotação de −360–360 graus e profundidade de 0–2 |
| \`length\` | Comprimento dos rastros de 1 a 500 px |
| \`characters\`, \`rows\` | Alfabeto Matrix e 1–48 caracteres por coluna |
| \`seed\` | Inteiro de 0 a 2147483647 para uma distribuição repetível das partículas |

São usadas até 8 camadas e 200 elementos configurados. Tipos/IDs inválidos e IDs repetidos são ignorados; números finitos fora da faixa são limitados, e valores numéricos inválidos usam o padrão. Em dispositivos modestos, reduza contagens e desfoque e prefira movimentos lentos. Preserve a leitura dos textos e controles e mantenha o botão de pausa em fundos contínuos. A preferência por movimento reduzido vale mesmo com a animação habilitada no JSON.

As cores aceitam valores CSS como hexadecimal, \`rgb(...)\` ou \`var(--primary)\`. Uma lista ausente/vazia usa \`var(--primary)\` e \`var(--secondary)\`, acompanhando a paleta ativa. Campos de texto perdem espaços nas extremidades e são limitados a 2048 caracteres; intervalos min/max invertidos são ordenados automaticamente. Contagens, linhas e sementes são inteiros. Um fundo habilitado precisa de ao menos uma camada válida; animação automática e paralaxe ficam habilitadas quando suas opções são omitidas nesse fundo.

### Autoria dos temas e compatibilidade

Neste repositório, adicione o preset em \`gitpagelayouts/v2/layouts/\` usando \`overrides.backgroundEffects\` e cadastre seus metadados em \`layoutsConfig.json\`. \`pnpm run layouts:sync\` expande o template, documenta o tema e compila o mesmo fundo/paleta nos dados empacotados da CLI. Não edite \`cli/data/animated-layouts.mjs\` diretamente. O template gerado usa \`backgroundEffects\` na raiz, separado de \`animations\`.

O catálogo oficial e \`npx @gitpagedocs/cli --layoutconfig\` oferecem os mesmos 124 temas, incluindo os 60 presets animados. Configurações antigas e todos os 84 temas anteriores continuam funcionando. Visualizadores antigos sem suporte aos fundos continuam usando as cores e os componentes normais do template.

Para visualizar alterações ainda não publicadas neste checkout, defina \`GITPAGEDOCS_LAYOUTS_SOURCE=local\` antes de iniciar o servidor de desenvolvimento. Somente \`NODE_ENV=development\` aceita essa opção: o catálogo local \`gitpagelayouts/\` é lido sem alterar a configuração salva. Produção e valores ausentes/desconhecidos continuam seguindo o JSON. Para usar templates locais em produção, configure \`site.layoutsConfigPathOficial: false\` e os caminhos locais/personalizados correspondentes.
`,
  es: `## Fondos animados y 20 familias con paralaje en dos modos

El catálogo contiene 124 temas: 64 originales, 20 presets animados independientes y otras 20 familias con versiones oscura y clara (40 entradas). Los 84 temas anteriores conservan sus paletas, componentes y comportamiento. Matrix Dark y Matrix Light no cambian; elige **Matrix Rain** para caracteres que caen. Los 60 presets animados utilizan el renderer Motion existente, sin otra dependencia en tiempo de ejecución.

| ID | Nombre | Modo | Capas |
| --- | --- | --- | --- |
${CATALOG_ROWS}

### Alternar una familia entre oscuro y claro

Elige un tema emparejado, como \`aurora-borealis-dark\`, y utiliza el control existente de modo claro/oscuro para cambiar a \`aurora-borealis-light\`. Las 20 familias incluyen auroras, luciérnagas, corrientes marinas, bosques, lluvia, nubes, cerezos, brasas, glaciares, dunas, niebla, lagunas, bambú, tormentas en el horizonte, cristales, estanques, sabanas, praderas, mareas cósmicas y faroles. Cada pareja comparte composición y semilla determinista, con paletas legibles propias y efectos más suaves en modo claro. Ambos modos habilitan el paralaje del puntero y del desplazamiento por defecto.

El emparejamiento se declara en el catálogo: ambas entradas utilizan \`supportsLightAndDarkModes: true\` y la misma \`supportsLightAndDarkModesReference\` (por ejemplo, \`aurora-borealis\`), con valores de \`mode\` diferentes. Los IDs terminan en \`-dark\` o \`-light\`; los presets independientes anteriores no se emparejan ni se reemplazan automáticamente. Un ajuste por tema apunta a un ID exacto: configura ambos IDs si la familia necesita el mismo ajuste personalizado.

### Personalizar todo mediante JSON

No necesitas editar JavaScript. Selecciona un preset mediante \`site.ThemeDefault\` o el selector. El campo opcional \`backgroundEffects\`, en la raíz de la plantilla, define su fondo. En \`gitpagedocs/config.json\`, \`site.backgroundEffects\` controla todos los fondos y permite ajustes individuales:

\`\`\`json
${SITE_EXAMPLE}
\`\`\`

La precedencia es plantilla → \`site.backgroundEffects.overrides\` → \`site.backgroundEffects.themes[themeId]\`. Los objetos internos se combinan; \`layers\` sustituye el array completo, por lo que debes incluir todas las capas que quieras conservar. El ejemplo sustituye la cuadrícula y las letras originales de Matrix Rain por una capa de caracteres personalizada. Los demás temas conservan sus capas y solo reciben los ajustes globales de velocidad y paralaje.

- Usa \`site.backgroundEffects.enabled: false\` para desactivar todos los fondos. Un \`enabled: true\` individual no anula este interruptor principal.
- Usa \`themes[themeId].enabled: false\` para desactivar el fondo de un tema.
- Usa \`animation.enabled: false\` y \`parallax.enabled: false\` para un fondo estático. \`animation.speed\` multiplica la velocidad; los valores menores producen movimientos más lentos.
- Cambia \`count\`, \`colors\`, \`size\`, \`duration\` y \`opacity\` por capa para ajustar densidad, paleta, tamaño, tiempo y visibilidad. Una cantidad de cero elimina la capa.
- Los temas sin \`backgroundEffects\` permanecen estáticos, salvo que añadas explícitamente un fondo habilitado con capas válidas mediante estas opciones.

### Pausar desde el menú de navegación

El control de pausa/reanudación aparece junto al candado de navegación en el menú de documentación, incluida la barra lateral contraída y el menú móvil. Las páginas de búsqueda lo muestran en su cabecera. La pausa manual se conserva al abrir o cerrar menús y al cambiar de tema; utiliza Reanudar para continuar. Las protecciones de movimiento reducido y pestaña oculta siguen teniendo prioridad.

\`site.backgroundEffects.overrides.accessibility.showPauseButton\` tiene el valor explícito \`true\` por defecto. Define \`false\` para ocultar solo el control; esto no detiene la animación. Desactiva todos los fondos con el interruptor general \`site.backgroundEffects.enabled: false\`. Personaliza \`site.icons.BackgroundAnimationPause\` (\`FiPause\`) y \`BackgroundAnimationResume\` (\`FiPlay\`) de forma independiente mediante \`reactIcon\`, \`tag\`, \`size\`, \`colorDark\` y \`colorLight\`. Los valores predeterminados son iconos, 22px y \`currentColor\`; \`reactIcon: false\` muestra el texto localizado de la acción y conserva su nombre accesible.

### Campos del fondo y las capas

| Campo | Significado e intervalo aceptado |
| --- | --- |
| \`enabled\`, \`surface\`, \`opacity\` | Habilita el fondo, define su color/degradado CSS y la opacidad total de 0 a 1 |
| \`animation.enabled\`, \`animation.speed\` | Movimiento automático; multiplicador de velocidad entre 0,05 y 4 |
| \`parallax.enabled\` | Profundidad con el puntero/desplazamiento, independiente del movimiento automático |
| \`parallax.pointer\`, \`parallax.scroll\` | Desplazamiento del puntero de 0 a 80 px; proporción de desplazamiento de 0 a 0,3 |
| \`accessibility.reducedMotion\` | \`static\` mantiene una composición inmóvil; \`hide\` la oculta cuando se solicita movimiento reducido |
| \`accessibility.showPauseButton\` | Muestra el control de pausa/reanudación; habilitado en los 60 presets animados |
| \`layers[].id\`, \`kind\` | ID único y tipo \`stars\`, \`streaks\`, \`matrix\`, \`orbs\`, \`grid\` o \`waves\` |
| \`count\`, \`colors\`, \`opacity\` | 0–80 elementos, hasta 8 colores CSS y opacidad de capa de 0 a 1 |
| \`size.min/max\`, \`duration.min/max\` | Tamaño en px (0,5–800) y duración en segundos (2–120) |
| \`travel.x/y\`, \`position.x/y\` | Recorrido en vw/vh (−200–200); posición inicial porcentual (−100–100) |
| \`blur\`, \`glow\`, \`rotation\`, \`depth\` | Desenfoque/brillo de 0–80 px, rotación de −360–360 grados y profundidad de 0–2 |
| \`length\` | Longitud de los rastros entre 1 y 500 px |
| \`characters\`, \`rows\` | Alfabeto Matrix y 1–48 caracteres por columna |
| \`seed\` | Entero entre 0 y 2147483647 para una distribución repetible de partículas |

Se utilizan hasta 8 capas y 200 elementos configurados. Se omiten tipos/IDs inválidos e IDs duplicados; los números finitos fuera del intervalo se limitan y los valores numéricos inválidos usan los predeterminados. Para dispositivos modestos, reduce cantidades y desenfoque y utiliza movimientos lentos. Conserva la legibilidad de textos y controles y mantén el botón de pausa en fondos continuos. La preferencia de movimiento reducido se aplica aunque la animación esté habilitada en JSON.

Los colores aceptan valores CSS como hexadecimal, \`rgb(...)\` o \`var(--primary)\`. Una lista ausente/vacía utiliza \`var(--primary)\` y \`var(--secondary)\`, siguiendo la paleta activa. Los textos pierden espacios en los extremos y se limitan a 2048 caracteres; los intervalos min/max invertidos se ordenan automáticamente. Cantidades, filas y semillas se convierten en enteros. Un fondo habilitado necesita al menos una capa válida; la animación automática y el paralaje se habilitan cuando se omiten sus opciones en ese fondo.

### Creación de temas y compatibilidad

En este repositorio, añade el preset en \`gitpagelayouts/v2/layouts/\` con \`overrides.backgroundEffects\` y registra sus metadatos en \`layoutsConfig.json\`. \`pnpm run layouts:sync\` expande la plantilla, documenta el tema y compila el mismo fondo/paleta en los datos incluidos en la CLI. No edites \`cli/data/animated-layouts.mjs\` directamente. La plantilla generada usa \`backgroundEffects\` en su raíz, separado de \`animations\`.

El catálogo oficial y \`npx @gitpagedocs/cli --layoutconfig\` ofrecen los mismos 124 temas, incluidos los 60 presets animados. Las configuraciones antiguas y los 84 temas anteriores siguen funcionando. Los visores antiguos sin soporte para fondos siguen utilizando los colores y componentes normales de la plantilla.

Para previsualizar cambios aún no publicados en este checkout, define \`GITPAGEDOCS_LAYOUTS_SOURCE=local\` antes de iniciar el servidor de desarrollo. Solo \`NODE_ENV=development\` acepta esta opción: lee el catálogo local \`gitpagelayouts/\` sin modificar la configuración guardada. Producción y valores ausentes/desconocidos siguen respetando el JSON. Para utilizar plantillas locales en producción, configura \`site.layoutsConfigPathOficial: false\` y las rutas locales/personalizadas correspondientes.
`,
};
