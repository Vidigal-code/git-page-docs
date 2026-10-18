# Dune Parallax

Sand-colored contour waves with terracotta depth

| Field | Value |
| --- | --- |
| Id | `dune-parallax-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/dune-parallax-light.json`](../templates/dune-parallax-light.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#FCF7ED` |
| `primary` | `#92400E` |
| `secondary` | `#9A3412` |
| `text` | `#17233B` |
| `textSecondary` | `#475569` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#E8D5AF` |
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
| `waves-1` | `waves` | 3 | `#92400E`, `#9A3412` |
| `grid-2` | `grid` | 1 | `#92400E`, `#9A3412` |
| `orbs-3` | `orbs` | 4 | `#92400E`, `#9A3412` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 75% 0%, #FFFFFF 0%, #FCF7ED 70%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9
  },
  "parallax": {
    "enabled": true,
    "pointer": 24,
    "scroll": 0.08
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "waves-1",
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
        "#92400E",
        "#9A3412"
      ],
      "seed": 2968
    },
    {
      "id": "grid-2",
      "kind": "grid",
      "count": 1,
      "opacity": 0.078,
      "size": {
        "min": 48,
        "max": 64
      },
      "duration": {
        "min": 48,
        "max": 70
      },
      "travel": {
        "x": 3,
        "y": 4
      },
      "blur": 0,
      "glow": 0,
      "rotation": 0,
      "depth": 0.25,
      "colors": [
        "#92400E",
        "#9A3412"
      ],
      "seed": 2985
    },
    {
      "id": "orbs-3",
      "kind": "orbs",
      "count": 4,
      "opacity": 0.11699999999999999,
      "size": {
        "min": 140,
        "max": 260
      },
      "duration": {
        "min": 28,
        "max": 52
      },
      "travel": {
        "x": 12,
        "y": -8
      },
      "blur": 36,
      "glow": 0,
      "rotation": 0,
      "depth": 1.2,
      "colors": [
        "#92400E",
        "#9A3412"
      ],
      "seed": 3002
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "dune-parallax-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=dune-parallax-light`.
