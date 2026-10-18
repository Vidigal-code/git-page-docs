# Themes and Layouts

Themes are JSON templates mapped by `layoutsConfig.json`.

## Strategy options

- Default mode (`npx @gitpagedocs/cli`): use official layouts/templates from the upstream repository.
- Local mode (`npx @gitpagedocs/cli --layoutconfig`): generate and use local templates from your repository.

## Local layout files

- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/layoutsFallbackConfig.json`
- `gitpagelayouts/templates/*.json`

## Template model

Each template usually includes:

- `id`, `name`, `author`, `version`
- `mode` + dark/light pairing metadata
- `colors`
- `typography`
- `components`
- `animations`

## Runtime behavior

- Active theme is resolved from config/user selection.
- Light/dark toggle resolves paired theme via reference.
- CSS variables are generated from template tokens.
- Runtime includes fallback behavior if a source is unavailable.

## Choose and customize

Select an installed theme through the theme selector or configure `site.ThemeDefault` with its exact ID. `ThemeModeDefault` sets the initial light/dark mode. `HideThemeSelector` hides the selector; the selected theme still applies.

For your own repository, run the CLI with `--layoutconfig`, then edit the generated template and keep its ID consistent with `layoutsConfig.json`. A route's content and `site.icons` remain independent of the theme catalog. Use `currentColor` for icons that should inherit the active text color, or configure separate dark/light colors with sufficient contrast.

When contributing to Git Page Docs itself, the authoring source is `gitpagelayouts/v2/base.json` plus `gitpagelayouts/v2/layouts/<id>.json`. Run `pnpm layouts:sync` to regenerate templates and documentation. Direct edits to generated templates can be overwritten by that synchronization.

## Animated backgrounds and 20 paired parallax families

The catalog contains 124 themes: 64 original themes, 20 standalone animated presets and 20 additional families with dark and light variants (40 entries). All 84 earlier themes retain their palettes, components and behavior. Existing Matrix Dark and Matrix Light remain unchanged; select **Matrix Rain** for falling characters. The 60 animated presets use the existing Motion renderer, with no extra runtime dependency.

| ID | Name | Mode | Layers |
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

### Switch a family between dark and light

Choose a paired theme such as `aurora-borealis-dark`, then use the existing light/dark control to switch to `aurora-borealis-light`. The 20 families cover auroras, fireflies, ocean currents, forests, rainfall, clouds, sakura, embers, glaciers, dunes, mist, lagoons, bamboo, storm horizons, crystals, ponds, savannas, meadows, cosmic tides and lanterns. Each pair shares its composition and deterministic seed, with a separate readable palette and softer effects in light mode. Both modes enable pointer and scroll parallax by default.

Pairing is declared in the catalog: both entries use `supportsLightAndDarkModes: true` and the same `supportsLightAndDarkModesReference` (for example, `aurora-borealis`), with different `mode` values. IDs end in `-dark` or `-light`; older standalone presets are not silently paired or replaced. A per-theme override targets one exact ID, so configure both IDs when a family needs the same custom override.

### Configure everything in JSON

No JavaScript edits are needed. Select a preset with `site.ThemeDefault` or the theme selector. A template's optional top-level `backgroundEffects` defines its background. In `gitpagedocs/config.json`, `site.backgroundEffects` controls all backgrounds and customizes individual themes:

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

Resolution order is template → `site.backgroundEffects.overrides` → `site.backgroundEffects.themes[themeId]`. Nested settings merge; `layers` replaces the entire layer array, so include every layer you want to keep. The example replaces Matrix Rain's grid and character layers with one custom character layer. Other themes retain their layers and receive only the global speed/parallax overrides.

- Set `site.backgroundEffects.enabled: false` to turn off every background. A per-theme `enabled: true` cannot bypass this master switch.
- Set `themes[themeId].enabled: false` to disable one theme's background.
- Set `animation.enabled: false` and `parallax.enabled: false` for a static background. `animation.speed` multiplies movement speed; smaller values are slower.
- Change `count`, `colors`, `size`, `duration` and `opacity` inside a layer to adjust density, palette, scale, timing and visibility. A count of zero removes that layer.
- Themes without `backgroundEffects` remain static unless you explicitly supply an enabled background and valid layers through these settings.

### Pause from the navigation menu

The pause/resume control sits beside the navigation lock in the documentation menu, including the collapsed sidebar and mobile menu. Search pages expose it in their header. A manual pause remains active when opening or closing menus and when changing themes; use Resume to continue. Reduced-motion and hidden-tab protections still take precedence.

`site.backgroundEffects.overrides.accessibility.showPauseButton` defaults explicitly to `true`. Set it to `false` to hide the control only; this does not stop animation. Disable all backgrounds with the master `site.backgroundEffects.enabled: false`. Customize `site.icons.BackgroundAnimationPause` (`FiPause`) and `BackgroundAnimationResume` (`FiPlay`) independently using `reactIcon`, `tag`, `size`, `colorDark` and `colorLight`. The defaults are icons, 22px and `currentColor`; `reactIcon: false` shows localized action text while retaining the accessible name.

### Background and layer fields

| Field | Meaning and accepted range |
| --- | --- |
| `enabled`, `surface`, `opacity` | Enable the background, choose its CSS color/gradient, and set total opacity from 0 to 1 |
| `animation.enabled`, `animation.speed` | Enable automatic movement; speed multiplier from 0.05 to 4 |
| `parallax.enabled` | Enable pointer/scroll depth independently of automatic movement |
| `parallax.pointer`, `parallax.scroll` | Pointer displacement from 0 to 80 px; scroll ratio from 0 to 0.3 |
| `accessibility.reducedMotion` | `static` retains a still composition; `hide` hides it when reduced motion is requested |
| `accessibility.showPauseButton` | Show the visitor's pause/resume control; enabled in every new preset |
| `layers[].id`, `kind` | Unique layer ID and one of `stars`, `streaks`, `matrix`, `orbs`, `grid`, `waves` |
| `count`, `colors`, `opacity` | 0–80 elements, up to 8 CSS colors, and layer opacity 0–1 |
| `size.min/max`, `duration.min/max` | Size range in px (0.5–800), duration range in seconds (2–120) |
| `travel.x/y`, `position.x/y` | Travel in vw/vh (−200–200); initial percentage offsets (−100–100) |
| `blur`, `glow`, `rotation`, `depth` | Blur/glow 0–80 px, rotation −360–360 degrees, parallax depth 0–2 |
| `length` | Streak length from 1 to 500 px |
| `characters`, `rows` | Matrix alphabet and 1–48 characters per column |
| `seed` | Integer 0–2147483647 for a repeatable particle arrangement |

At most 8 layers and 200 configured elements are used. Invalid layer kinds/IDs and duplicate IDs are ignored; finite numbers outside their range are clamped, and invalid numeric values use defaults. Lower counts, smaller blur and slower movement are useful on modest devices. Keep text and controls readable over the background, and retain the pause control for continuously moving presets. Reduced-motion preferences apply even when animation is enabled in JSON.

Colors accept CSS values such as hex, `rgb(...)` or `var(--primary)`. An omitted/empty color list falls back to `var(--primary)` and `var(--secondary)`, following the active palette. Text fields are trimmed and limited to 2048 characters; reversed min/max ranges are ordered automatically. Counts, rows and seeds become integers. An enabled background needs at least one valid layer; absent automatic-animation/parallax settings default to enabled for that background.

### Authoring and compatibility

In this repository, add a preset under `gitpagelayouts/v2/layouts/` with `overrides.backgroundEffects` and register its metadata in `layoutsConfig.json`. `pnpm run layouts:sync` expands the template, documents the preset and compiles the same background/palette into package-local CLI data. Do not edit `cli/data/animated-layouts.mjs` directly. The generated template uses top-level `backgroundEffects`, not a field inside `animations`.

The official catalog and `npx @gitpagedocs/cli --layoutconfig` expose the same 124 themes, including all 60 animated presets. Existing configurations and all 84 earlier themes keep working. Older viewers without background support still use the template's ordinary colors and components.

For an unpublished source-checkout preview, set `GITPAGEDOCS_LAYOUTS_SOURCE=local` before starting the development server. Only `NODE_ENV=development` honors this switch: it reads the local `gitpagelayouts/` catalog without changing the saved configuration. Production and an unset/unknown value continue following JSON configuration. To use local templates in production, configure `site.layoutsConfigPathOficial: false` and the appropriate local/custom layout paths instead.

> Version: 0.0.14
