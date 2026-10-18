# Forest Canopy Light

Soft canopy circles and scattered sunlight between layered leaves (light)

| Field | Value |
| --- | --- |
| Id | `forest-canopy-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/forest-canopy-light.json`](../templates/forest-canopy-light.json) |
| Light/dark pairing | Paired light/dark group: `forest-canopy` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F1F8ED` |
| `primary` | `#166534` |
| `secondary` | `#92400E` |
| `text` | `#253E27` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#C4D8BD` |
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
| `forest-canopy-orbs-1` | `orbs` | 14 | `#166534`, `#92400E` |
| `forest-canopy-stars-2` | `stars` | 22 | `#166534`, `#92400E` |
| `forest-canopy-waves-3` | `waves` | 3 | `#166534`, `#92400E` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 65% 10%, #FFFFFF 0%, #F1F8ED 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 28,
    "scroll": 0.09
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "forest-canopy-orbs-1",
      "kind": "orbs",
      "count": 14,
      "colors": [
        "#166534",
        "#92400E"
      ],
      "opacity": 0.115,
      "size": {
        "min": 90,
        "max": 230
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 16,
        "y": 8
      },
      "position": {
        "x": 4,
        "y": -3
      },
      "blur": 24,
      "glow": 0,
      "rotation": 0,
      "depth": 1.1,
      "seed": 3304
    },
    {
      "id": "forest-canopy-stars-2",
      "kind": "stars",
      "count": 22,
      "colors": [
        "#166534",
        "#92400E"
      ],
      "opacity": 0.245,
      "size": {
        "min": 2,
        "max": 7
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -10,
        "y": 25
      },
      "position": {
        "x": 4,
        "y": 0
      },
      "blur": 0,
      "glow": 8,
      "rotation": 0,
      "depth": 1.8,
      "seed": 3323
    },
    {
      "id": "forest-canopy-waves-3",
      "kind": "waves",
      "count": 3,
      "colors": [
        "#166534",
        "#92400E"
      ],
      "opacity": 0.072,
      "size": {
        "min": 360,
        "max": 640
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 6,
        "y": -4
      },
      "position": {
        "x": 4,
        "y": 3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 42,
      "depth": 0.4,
      "seed": 3342
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "forest-canopy-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=forest-canopy-light`.
