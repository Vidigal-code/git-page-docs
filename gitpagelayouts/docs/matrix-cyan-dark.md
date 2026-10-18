# Matrix Cyan

Cyan code streams over a precise blue grid

| Field | Value |
| --- | --- |
| Id | `matrix-cyan-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/matrix-cyan-dark.json`](../templates/matrix-cyan-dark.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#03131B` |
| `primary` | `#22D3EE` |
| `secondary` | `#7DD3FC` |
| `text` | `#EAF2FF` |
| `textSecondary` | `#A7B9CE` |
| `cardBackground` | `#082331` |
| `cardBorder` | `#164B60` |
| `error` | `#FDA4AF` |
| `success` | `#86EFAC` |

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
| `matrix-1` | `matrix` | 13 | `#22D3EE`, `#7DD3FC` |
| `grid-2` | `grid` | 1 | `#22D3EE`, `#7DD3FC` |
| `stars-3` | `stars` | 36 | `#22D3EE`, `#7DD3FC` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 55% 0%, #082331 0%, #03131B 70%)",
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
      "opacity": 0.28,
      "size": {
        "min": 13,
        "max": 17
      },
      "duration": {
        "min": 18,
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
        "#22D3EE",
        "#7DD3FC"
      ],
      "seed": 2059
    },
    {
      "id": "grid-2",
      "kind": "grid",
      "count": 1,
      "opacity": 0.12,
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
        "#22D3EE",
        "#7DD3FC"
      ],
      "seed": 2076
    },
    {
      "id": "stars-3",
      "kind": "stars",
      "count": 36,
      "opacity": 0.56,
      "size": {
        "min": 1,
        "max": 3
      },
      "duration": {
        "min": 24,
        "max": 48
      },
      "travel": {
        "x": 4,
        "y": 110
      },
      "blur": 0,
      "glow": 3,
      "rotation": 0,
      "depth": 0.7,
      "colors": [
        "#22D3EE",
        "#7DD3FC"
      ],
      "seed": 2093
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "matrix-cyan-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=matrix-cyan-dark`.
