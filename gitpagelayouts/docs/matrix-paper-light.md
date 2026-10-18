# Matrix Paper

Quiet green code on a readable paper canvas

| Field | Value |
| --- | --- |
| Id | `matrix-paper-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/matrix-paper-light.json`](../templates/matrix-paper-light.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F6FAF5` |
| `primary` | `#166534` |
| `secondary` | `#4D7C0F` |
| `text` | `#17233B` |
| `textSecondary` | `#475569` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#D1E3CD` |
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
| `matrix-1` | `matrix` | 12 | `#166534`, `#4D7C0F` |
| `grid-2` | `grid` | 1 | `#166534`, `#4D7C0F` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 15% 0%, #FFFFFF 0%, #F6FAF5 70%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.8
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
      "count": 12,
      "opacity": 0.18200000000000002,
      "size": {
        "min": 13,
        "max": 17
      },
      "duration": {
        "min": 20,
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
        "#166534",
        "#4D7C0F"
      ],
      "seed": 2261
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
        "#166534",
        "#4D7C0F"
      ],
      "seed": 2278
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "matrix-paper-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=matrix-paper-light`.
