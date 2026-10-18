# Golden Savanna Light

Golden grass-like trails and warm dust drifting across open plains (light)

| Field | Value |
| --- | --- |
| Id | `golden-savanna-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/golden-savanna-light.json`](../templates/golden-savanna-light.json) |
| Light/dark pairing | Paired light/dark group: `golden-savanna` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#FFFAEC` |
| `primary` | `#854D0E` |
| `secondary` | `#9A3412` |
| `text` | `#4D3D22` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#E8D7B3` |
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
| `golden-savanna-streaks-1` | `streaks` | 18 | `#854D0E`, `#9A3412` |
| `golden-savanna-stars-2` | `stars` | 28 | `#854D0E`, `#9A3412` |
| `golden-savanna-orbs-3` | `orbs` | 3 | `#854D0E`, `#9A3412` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 20% 30%, #FFFFFF 0%, #FFFAEC 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.65
  },
  "parallax": {
    "enabled": true,
    "pointer": 20,
    "scroll": 0.045
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "golden-savanna-streaks-1",
      "kind": "streaks",
      "count": 18,
      "colors": [
        "#854D0E",
        "#9A3412"
      ],
      "opacity": 0.173,
      "size": {
        "min": 2,
        "max": 5
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 12,
        "y": 5
      },
      "position": {
        "x": -4,
        "y": -3
      },
      "blur": 0,
      "glow": 0,
      "rotation": -24,
      "depth": 1.5,
      "length": 150,
      "seed": 4617
    },
    {
      "id": "golden-savanna-stars-2",
      "kind": "stars",
      "count": 28,
      "colors": [
        "#854D0E",
        "#9A3412"
      ],
      "opacity": 0.252,
      "size": {
        "min": 1,
        "max": 3
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": 80,
        "y": -18
      },
      "position": {
        "x": -4,
        "y": 0
      },
      "blur": 0,
      "glow": 4,
      "rotation": 0,
      "depth": 0.8,
      "seed": 4636
    },
    {
      "id": "golden-savanna-orbs-3",
      "kind": "orbs",
      "count": 3,
      "colors": [
        "#854D0E",
        "#9A3412"
      ],
      "opacity": 0.108,
      "size": {
        "min": 240,
        "max": 440
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": -12,
        "y": 6
      },
      "position": {
        "x": -4,
        "y": 3
      },
      "blur": 50,
      "glow": 0,
      "rotation": 0,
      "depth": 0.3,
      "seed": 4655
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "golden-savanna-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=golden-savanna-light`.
