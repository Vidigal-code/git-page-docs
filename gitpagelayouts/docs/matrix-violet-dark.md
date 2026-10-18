# Matrix Violet

Lavender code rain with magenta atmospheric light

| Field | Value |
| --- | --- |
| Id | `matrix-violet-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/matrix-violet-dark.json`](../templates/matrix-violet-dark.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#10071D` |
| `primary` | `#D8B4FE` |
| `secondary` | `#F9A8D4` |
| `text` | `#EAF2FF` |
| `textSecondary` | `#A7B9CE` |
| `cardBackground` | `#211032` |
| `cardBorder` | `#55316D` |
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
| `matrix-1` | `matrix` | 14 | `#D8B4FE`, `#F9A8D4` |
| `orbs-2` | `orbs` | 4 | `#D8B4FE`, `#F9A8D4` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 75% 0%, #211032 0%, #10071D 70%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 1
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
      "count": 14,
      "opacity": 0.28,
      "size": {
        "min": 13,
        "max": 17
      },
      "duration": {
        "min": 19,
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
        "#D8B4FE",
        "#F9A8D4"
      ],
      "seed": 2160
    },
    {
      "id": "orbs-2",
      "kind": "orbs",
      "count": 4,
      "opacity": 0.18,
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
        "#D8B4FE",
        "#F9A8D4"
      ],
      "seed": 2177
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "matrix-violet-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=matrix-violet-dark`.
