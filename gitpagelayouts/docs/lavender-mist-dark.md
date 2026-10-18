# Lavender Mist Dark

Lavender fog, quiet contour waves and distant pearl lights (dark)

| Field | Value |
| --- | --- |
| Id | `lavender-mist-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/lavender-mist-dark.json`](../templates/lavender-mist-dark.json) |
| Light/dark pairing | Paired light/dark group: `lavender-mist` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#21192F` |
| `primary` | `#D8B4FE` |
| `secondary` | `#C4B5FD` |
| `text` | `#F5EEFF` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#322540` |
| `cardBorder` | `#58446D` |
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
| `lavender-mist-orbs-1` | `orbs` | 8 | `#D8B4FE`, `#C4B5FD` |
| `lavender-mist-waves-2` | `waves` | 5 | `#D8B4FE`, `#C4B5FD` |
| `lavender-mist-stars-3` | `stars` | 16 | `#D8B4FE`, `#C4B5FD` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 50% 30%, #322540 0%, #21192F 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.8500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 16,
    "scroll": 0.075
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "lavender-mist-orbs-1",
      "kind": "orbs",
      "count": 8,
      "colors": [
        "#D8B4FE",
        "#C4B5FD"
      ],
      "opacity": 0.17,
      "size": {
        "min": 220,
        "max": 450
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 18,
        "y": -10
      },
      "position": {
        "x": -8,
        "y": -3
      },
      "blur": 58,
      "glow": 0,
      "rotation": 0,
      "depth": 0.65,
      "seed": 4011
    },
    {
      "id": "lavender-mist-waves-2",
      "kind": "waves",
      "count": 5,
      "colors": [
        "#D8B4FE",
        "#C4B5FD"
      ],
      "opacity": 0.13,
      "size": {
        "min": 300,
        "max": 600
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -16,
        "y": 5
      },
      "position": {
        "x": -8,
        "y": 0
      },
      "blur": 0,
      "glow": 0,
      "rotation": 14,
      "depth": 1.2,
      "seed": 4030
    },
    {
      "id": "lavender-mist-stars-3",
      "kind": "stars",
      "count": 16,
      "colors": [
        "#D8B4FE",
        "#C4B5FD"
      ],
      "opacity": 0.3,
      "size": {
        "min": 1,
        "max": 3
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 5,
        "y": -22
      },
      "position": {
        "x": -8,
        "y": 3
      },
      "blur": 0,
      "glow": 6,
      "rotation": 0,
      "depth": 1.6,
      "seed": 4049
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "lavender-mist-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=lavender-mist-dark`.
