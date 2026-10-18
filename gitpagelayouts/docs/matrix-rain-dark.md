# Matrix Rain

Green code rain with a restrained terminal grid

| Field | Value |
| --- | --- |
| Id | `matrix-rain-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/matrix-rain-dark.json`](../templates/matrix-rain-dark.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#020A05` |
| `primary` | `#4ADE80` |
| `secondary` | `#A3E635` |
| `text` | `#EAF2FF` |
| `textSecondary` | `#A7B9CE` |
| `cardBackground` | `#06190D` |
| `cardBorder` | `#17452B` |
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
| `matrix-1` | `matrix` | 14 | `#4ADE80`, `#A3E635` |
| `grid-2` | `grid` | 1 | `#4ADE80`, `#A3E635` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 15% 0%, #06190D 0%, #020A05 70%)",
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
        "#4ADE80",
        "#A3E635"
      ],
      "seed": 1857
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
        "#4ADE80",
        "#A3E635"
      ],
      "seed": 1874
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "matrix-rain-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=matrix-rain-dark`.
