# Matrix Mint

Emerald characters drifting across cool mint

| Field | Value |
| --- | --- |
| Id | `matrix-mint-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/matrix-mint-light.json`](../templates/matrix-mint-light.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#EDFCF7` |
| `primary` | `#047857` |
| `secondary` | `#0F766E` |
| `text` | `#17233B` |
| `textSecondary` | `#475569` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#C1E8DA` |
| `error` | `#B91C1C` |
| `success` | `#15803D` |

## Typography

- Font family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif`

| Size token | Value |
| --- | --- |
| `small` | `0.875rem` |
| `base` | `1rem` |
| `medium` | `1.125rem` |
| `large` | `1.25rem` |
| `xlarge` | `2rem` |

## Animated background

This preset uses Motion for decorative depth and continuous movement. It respects reduced-motion preferences and includes a pause/resume control. Its palette and content remain usable without animation.

| Layer | Kind | Count | Colors |
| --- | --- | --- | --- |
| `matrix-1` | `matrix` | 13 | `#047857`, `#0F766E` |
| `waves-2` | `waves` | 3 | `#047857`, `#0F766E` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 35% 0%, #FFFFFF 0%, #EDFCF7 70%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9
  },
  "parallax": {
    "enabled": true,
    "pointer": 10,
    "scroll": 0.025
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "matrix-1",
      "kind": "matrix",
      "count": 13,
      "opacity": 0.18200000000000002,
      "size": {
        "min": 13,
        "max": 17
      },
      "duration": {
        "min": 21,
        "max": 38
      },
      "travel": {
        "x": 0,
        "y": 115
      },
      "blur": 0,
      "glow": 2,
      "rotation": 0,
      "depth": 0.35,
      "characters": "0123456789アイウエオカキクケコサシスセソ",
      "rows": 16,
      "colors": [
        "#047857",
        "#0F766E"
      ],
      "seed": 2362
    },
    {
      "id": "waves-2",
      "kind": "waves",
      "count": 3,
      "opacity": 0.10400000000000001,
      "size": {
        "min": 180,
        "max": 300
      },
      "duration": {
        "min": 32,
        "max": 60
      },
      "travel": {
        "x": 15,
        "y": 7
      },
      "blur": 24,
      "glow": 0,
      "rotation": -12,
      "depth": 1,
      "colors": [
        "#047857",
        "#0F766E"
      ],
      "seed": 2379
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "matrix-mint-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=matrix-mint-light`.
