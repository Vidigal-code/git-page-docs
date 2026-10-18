# Bamboo Dawn Light

Slender bamboo-like shafts with warm dawn light and drifting pollen (light)

| Field | Value |
| --- | --- |
| Id | `bamboo-dawn-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/bamboo-dawn-light.json`](../templates/bamboo-dawn-light.json) |
| Light/dark pairing | Paired light/dark group: `bamboo-dawn` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F7FBEF` |
| `primary` | `#3F6212` |
| `secondary` | `#854D0E` |
| `text` | `#344626` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#D1DFBD` |
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
| `bamboo-dawn-streaks-1` | `streaks` | 13 | `#3F6212`, `#854D0E` |
| `bamboo-dawn-orbs-2` | `orbs` | 4 | `#3F6212`, `#854D0E` |
| `bamboo-dawn-stars-3` | `stars` | 24 | `#3F6212`, `#854D0E` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 20% 10%, #FFFFFF 0%, #F7FBEF 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.65
  },
  "parallax": {
    "enabled": true,
    "pointer": 24,
    "scroll": 0.045
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "bamboo-dawn-streaks-1",
      "kind": "streaks",
      "count": 13,
      "colors": [
        "#3F6212",
        "#854D0E"
      ],
      "opacity": 0.13,
      "size": {
        "min": 4,
        "max": 10
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 3,
        "y": 12
      },
      "position": {
        "x": 0,
        "y": -3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 4,
      "depth": 1.2,
      "length": 420,
      "seed": 4213
    },
    {
      "id": "bamboo-dawn-orbs-2",
      "kind": "orbs",
      "count": 4,
      "colors": [
        "#3F6212",
        "#854D0E"
      ],
      "opacity": 0.115,
      "size": {
        "min": 180,
        "max": 340
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": 8,
        "y": -8
      },
      "position": {
        "x": 0,
        "y": 0
      },
      "blur": 48,
      "glow": 0,
      "rotation": 0,
      "depth": 0.4,
      "seed": 4232
    },
    {
      "id": "bamboo-dawn-stars-3",
      "kind": "stars",
      "count": 24,
      "colors": [
        "#3F6212",
        "#854D0E"
      ],
      "opacity": 0.23,
      "size": {
        "min": 1,
        "max": 4
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 28,
        "y": 45
      },
      "position": {
        "x": 0,
        "y": 3
      },
      "blur": 0,
      "glow": 3,
      "rotation": 0,
      "depth": 1.7,
      "seed": 4251
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "bamboo-dawn-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=bamboo-dawn-light`.
