# Paper Lanterns Light

Warm lantern-like lights ascending through a quiet evening haze (light)

| Field | Value |
| --- | --- |
| Id | `paper-lanterns-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/paper-lanterns-light.json`](../templates/paper-lanterns-light.json) |
| Light/dark pairing | Paired light/dark group: `paper-lanterns` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#FFF5F0` |
| `primary` | `#9A3412` |
| `secondary` | `#BE185D` |
| `text` | `#522C36` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#EDCDBF` |
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
| `paper-lanterns-orbs-1` | `orbs` | 15 | `#9A3412`, `#BE185D` |
| `paper-lanterns-streaks-2` | `streaks` | 10 | `#9A3412`, `#BE185D` |
| `paper-lanterns-waves-3` | `waves` | 3 | `#9A3412`, `#BE185D` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 65% 30%, #FFFFFF 0%, #FFF5F0 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 32,
    "scroll": 0.09
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "paper-lanterns-orbs-1",
      "kind": "orbs",
      "count": 15,
      "colors": [
        "#9A3412",
        "#BE185D"
      ],
      "opacity": 0.302,
      "size": {
        "min": 18,
        "max": 54
      },
      "duration": {
        "min": 30,
        "max": 58
      },
      "travel": {
        "x": 12,
        "y": -115
      },
      "position": {
        "x": 8,
        "y": -3
      },
      "blur": 2,
      "glow": 14,
      "rotation": 0,
      "depth": 1.6,
      "seed": 4920
    },
    {
      "id": "paper-lanterns-streaks-2",
      "kind": "streaks",
      "count": 10,
      "colors": [
        "#9A3412",
        "#BE185D"
      ],
      "opacity": 0.202,
      "size": {
        "min": 1,
        "max": 3
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -5,
        "y": -95
      },
      "position": {
        "x": 8,
        "y": 0
      },
      "blur": 0,
      "glow": 6,
      "rotation": 0,
      "depth": 0.9,
      "length": 24,
      "seed": 4939
    },
    {
      "id": "paper-lanterns-waves-3",
      "kind": "waves",
      "count": 3,
      "colors": [
        "#9A3412",
        "#BE185D"
      ],
      "opacity": 0.072,
      "size": {
        "min": 360,
        "max": 650
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 16,
        "y": 4
      },
      "position": {
        "x": 8,
        "y": 3
      },
      "blur": 0,
      "glow": 0,
      "rotation": -8,
      "depth": 0.35,
      "seed": 4958
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "paper-lanterns-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=paper-lanterns-light`.
