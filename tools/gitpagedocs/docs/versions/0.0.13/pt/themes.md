# Temas e layouts

Temas são templates JSON mapeados por `layoutsConfig.json`.

## Arquivos

- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/layoutsFallbackConfig.json`
- `gitpagelayouts/templates/*.json`

## Modelo de template

Cada template normalmente contém:

- `id`, `name`, `author`, `version`
- `mode` e metadados de par dark/light
- `colors`
- `typography`
- tokens de `components`
- `animations`

## Comportamento em runtime

- tema ativo vem de config/usuário
- toggle light/dark resolve o tema pareado por referência
- variáveis CSS são geradas dos tokens do template

## Boas práticas

- mantenha contraste acessível
- padronize escala de espaço e borda
- ofereça variantes dark e light quando possível

## Escolher e personalizar

Escolha um tema pelo seletor ou configure `site.ThemeDefault` com seu ID exato. `ThemeModeDefault` define o modo inicial claro/escuro. `HideThemeSelector` esconde o seletor; o tema selecionado continua aplicado.

No seu repositório, execute a CLI com `--layoutconfig`, edite o template gerado e mantenha o ID coerente com `layoutsConfig.json`. O conteúdo da rota e `site.icons` são independentes do catálogo de temas. Use `currentColor` para ícones que herdam a cor do texto ou configure cores claras/escuras com contraste suficiente.

Ao contribuir no Git Page Docs, a fonte autoral é `gitpagelayouts/v2/base.json` com `gitpagelayouts/v2/layouts/<id>.json`. Execute `pnpm layouts:sync` para gerar templates e documentação. Edições diretas nos templates gerados podem ser substituídas pela sincronização.

## Fundos animados e 20 famílias com paralaxe em dois modos

O catálogo contém 124 temas: 64 originais, 20 presets animados independentes e mais 20 famílias com versões escura e clara (40 entradas). Todos os 84 temas anteriores preservam suas paletas, componentes e comportamento. Matrix Dark e Matrix Light continuam iguais; escolha **Matrix Rain** para letras caindo. Os 60 presets animados utilizam o renderer Motion existente, sem dependência adicional em tempo de execução.

| ID | Nome | Modo | Camadas |
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

### Alternar uma família entre escuro e claro

Escolha um tema pareado, como `aurora-borealis-dark`, e use o controle existente de modo claro/escuro para alternar para `aurora-borealis-light`. As 20 famílias incluem auroras, vaga-lumes, correntes marinhas, florestas, chuva, nuvens, cerejeiras, brasas, geleiras, dunas, névoa, lagoas, bambus, tempestades no horizonte, cristais, lagos, savanas, prados, marés cósmicas e lanternas. Cada par compartilha composição e semente determinística, com paletas legíveis próprias e efeitos mais suaves no modo claro. Ambos os modos habilitam paralaxe do ponteiro e da rolagem por padrão.

O pareamento fica no catálogo: as duas entradas usam `supportsLightAndDarkModes: true` e a mesma `supportsLightAndDarkModesReference` (por exemplo, `aurora-borealis`), com valores de `mode` diferentes. Os IDs terminam em `-dark` ou `-light`; os presets independentes anteriores não são pareados nem substituídos automaticamente. Um ajuste por tema aponta para um ID exato: configure os dois IDs quando a família precisar do mesmo ajuste personalizado.

### Personalizar tudo em JSON

Não é necessário editar JavaScript. Escolha o preset em `site.ThemeDefault` ou no seletor. O campo opcional `backgroundEffects`, na raiz do template, define o fundo. Em `gitpagedocs/config.json`, `site.backgroundEffects` controla todos os fundos e permite ajustes por tema:

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

A precedência é template → `site.backgroundEffects.overrides` → `site.backgroundEffects.themes[themeId]`. Objetos internos são mesclados; `layers` substitui o array inteiro, portanto inclua todas as camadas que deseja manter. O exemplo troca a grade e as letras originais de Matrix Rain por uma camada personalizada de caracteres. Os demais temas mantêm suas camadas e recebem apenas os ajustes globais de velocidade e paralaxe.

- Use `site.backgroundEffects.enabled: false` para desligar todos os fundos. Um `enabled: true` específico não supera essa chave principal.
- Use `themes[themeId].enabled: false` para desativar o fundo de um tema.
- Use `animation.enabled: false` e `parallax.enabled: false` para um fundo estático. `animation.speed` multiplica a velocidade; valores menores deixam o movimento mais lento.
- Altere `count`, `colors`, `size`, `duration` e `opacity` de cada camada para ajustar densidade, paleta, tamanho, tempo e visibilidade. Contagem zero remove a camada.
- Temas sem `backgroundEffects` permanecem estáticos, a menos que você forneça explicitamente um fundo habilitado com camadas válidas nessas opções.

### Pausar pelo menu de navegação

O controle de pausar/retomar fica junto do cadeado de navegação no menu da documentação, inclusive na barra lateral recolhida e no menu móvel. Nas páginas de busca, ele aparece no cabeçalho. A pausa manual permanece ao abrir ou fechar menus e ao trocar de tema; use Retomar para continuar. As proteções de movimento reduzido e aba oculta continuam tendo prioridade.

`site.backgroundEffects.overrides.accessibility.showPauseButton` tem padrão explícito `true`. Defina `false` para ocultar somente o controle; isso não interrompe a animação. Desative todos os fundos com o interruptor geral `site.backgroundEffects.enabled: false`. Personalize `site.icons.BackgroundAnimationPause` (`FiPause`) e `BackgroundAnimationResume` (`FiPlay`) independentemente com `reactIcon`, `tag`, `size`, `colorDark` e `colorLight`. Os padrões são ícones, 22px e `currentColor`; `reactIcon: false` mostra o texto localizado da ação e mantém seu nome acessível.

### Campos do fundo e das camadas

| Campo | Significado e intervalo aceito |
| --- | --- |
| `enabled`, `surface`, `opacity` | Habilita o fundo, define sua cor/gradiente CSS e a opacidade total de 0 a 1 |
| `animation.enabled`, `animation.speed` | Movimento automático; multiplicador de velocidade de 0,05 a 4 |
| `parallax.enabled` | Profundidade pelo ponteiro/rolagem, independente do movimento automático |
| `parallax.pointer`, `parallax.scroll` | Deslocamento pelo ponteiro de 0 a 80 px; razão da rolagem de 0 a 0,3 |
| `accessibility.reducedMotion` | `static` mantém a composição parada; `hide` oculta o fundo quando o usuário pede movimento reduzido |
| `accessibility.showPauseButton` | Mostra o controle de pausar/retomar; habilitado nos 60 presets animados |
| `layers[].id`, `kind` | ID único e tipo `stars`, `streaks`, `matrix`, `orbs`, `grid` ou `waves` |
| `count`, `colors`, `opacity` | 0–80 elementos, até 8 cores CSS e opacidade da camada de 0 a 1 |
| `size.min/max`, `duration.min/max` | Tamanho em px (0,5–800) e duração em segundos (2–120) |
| `travel.x/y`, `position.x/y` | Deslocamento em vw/vh (−200–200); posição inicial em porcentagem (−100–100) |
| `blur`, `glow`, `rotation`, `depth` | Desfoque/brilho de 0–80 px, rotação de −360–360 graus e profundidade de 0–2 |
| `length` | Comprimento dos rastros de 1 a 500 px |
| `characters`, `rows` | Alfabeto Matrix e 1–48 caracteres por coluna |
| `seed` | Inteiro de 0 a 2147483647 para uma distribuição repetível das partículas |

São usadas até 8 camadas e 200 elementos configurados. Tipos/IDs inválidos e IDs repetidos são ignorados; números finitos fora da faixa são limitados, e valores numéricos inválidos usam o padrão. Em dispositivos modestos, reduza contagens e desfoque e prefira movimentos lentos. Preserve a leitura dos textos e controles e mantenha o botão de pausa em fundos contínuos. A preferência por movimento reduzido vale mesmo com a animação habilitada no JSON.

As cores aceitam valores CSS como hexadecimal, `rgb(...)` ou `var(--primary)`. Uma lista ausente/vazia usa `var(--primary)` e `var(--secondary)`, acompanhando a paleta ativa. Campos de texto perdem espaços nas extremidades e são limitados a 2048 caracteres; intervalos min/max invertidos são ordenados automaticamente. Contagens, linhas e sementes são inteiros. Um fundo habilitado precisa de ao menos uma camada válida; animação automática e paralaxe ficam habilitadas quando suas opções são omitidas nesse fundo.

### Autoria dos temas e compatibilidade

Neste repositório, adicione o preset em `gitpagelayouts/v2/layouts/` usando `overrides.backgroundEffects` e cadastre seus metadados em `layoutsConfig.json`. `pnpm run layouts:sync` expande o template, documenta o tema e compila o mesmo fundo/paleta nos dados empacotados da CLI. Não edite `cli/data/animated-layouts.mjs` diretamente. O template gerado usa `backgroundEffects` na raiz, separado de `animations`.

O catálogo oficial e `npx @gitpagedocs/cli --layoutconfig` oferecem os mesmos 124 temas, incluindo os 60 presets animados. Configurações antigas e todos os 84 temas anteriores continuam funcionando. Visualizadores antigos sem suporte aos fundos continuam usando as cores e os componentes normais do template.

Para visualizar alterações ainda não publicadas neste checkout, defina `GITPAGEDOCS_LAYOUTS_SOURCE=local` antes de iniciar o servidor de desenvolvimento. Somente `NODE_ENV=development` aceita essa opção: o catálogo local `gitpagelayouts/` é lido sem alterar a configuração salva. Produção e valores ausentes/desconhecidos continuam seguindo o JSON. Para usar templates locais em produção, configure `site.layoutsConfigPathOficial: false` e os caminhos locais/personalizados correspondentes.

> Versão: 0.0.13
