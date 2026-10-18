# Meteor Copper

Copper meteors crossing a charcoal sky

| Field | Value |
| --- | --- |
| Id | `meteor-copper-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/meteor-copper-dark.json`](../templates/meteor-copper-dark.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#17100F` |
| `primary` | `#FDBA74` |
| `secondary` | `#FB7185` |
| `text` | `#EAF2FF` |
| `textSecondary` | `#A7B9CE` |
| `cardBackground` | `#2B1B18` |
| `cardBorder` | `#634134` |
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
| `streaks-1` | `streaks` | 6 | `#FDBA74`, `#FB7185` |
| `stars-2` | `stars` | 40 | `#FDBA74`, `#FB7185` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 75% 0%, #2B1B18 0%, #17100F 70%)",
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
      "id": "streaks-1",
      "kind": "streaks",
      "count": 6,
      "opacity": 0.5,
      "size": {
        "min": 1,
        "max": 2
      },
      "duration": {
        "min": 12,
        "max": 25
      },
      "travel": {
        "x": -28,
        "y": 120
      },
      "blur": 0,
      "glow": 5,
      "rotation": 24,
      "depth": 1.1,
      "length": 120,
      "colors": [
        "#FDBA74",
        "#FB7185"
      ],
      "seed": 1756
    },
    {
      "id": "stars-2",
      "kind": "stars",
      "count": 40,
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
        "#FDBA74",
        "#FB7185"
      ],
      "seed": 1773
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "meteor-copper-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=meteor-copper-dark`.
