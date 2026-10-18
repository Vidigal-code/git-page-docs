# Desert Mirage Light

Sweeping dune contours and fine sand moving in a warm mirage (light)

| Field | Value |
| --- | --- |
| Id | `desert-mirage-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/desert-mirage-light.json`](../templates/desert-mirage-light.json) |
| Light/dark pairing | Paired light/dark group: `desert-mirage` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#FFF9EB` |
| `primary` | `#92400E` |
| `secondary` | `#9A3412` |
| `text` | `#4B3922` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#E9D6AF` |
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
| `desert-mirage-waves-1` | `waves` | 8 | `#92400E`, `#9A3412` |
| `desert-mirage-orbs-2` | `orbs` | 4 | `#92400E`, `#9A3412` |
| `desert-mirage-stars-3` | `stars` | 30 | `#92400E`, `#9A3412` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 35% 10%, #FFFFFF 0%, #FFF9EB 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.75
  },
  "parallax": {
    "enabled": true,
    "pointer": 32,
    "scroll": 0.06
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "desert-mirage-waves-1",
      "kind": "waves",
      "count": 8,
      "colors": [
        "#92400E",
        "#9A3412"
      ],
      "opacity": 0.144,
      "size": {
        "min": 360,
        "max": 700
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 26,
        "y": 4
      },
      "position": {
        "x": 8,
        "y": -3
      },
      "blur": 0,
      "glow": 0,
      "rotation": -9,
      "depth": 1.2,
      "seed": 3910
    },
    {
      "id": "desert-mirage-orbs-2",
      "kind": "orbs",
      "count": 4,
      "colors": [
        "#92400E",
        "#9A3412"
      ],
      "opacity": 0.101,
      "size": {
        "min": 180,
        "max": 380
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -15,
        "y": 8
      },
      "position": {
        "x": 8,
        "y": 0
      },
      "blur": 48,
      "glow": 0,
      "rotation": 0,
      "depth": 0.45,
      "seed": 3929
    },
    {
      "id": "desert-mirage-stars-3",
      "kind": "stars",
      "count": 30,
      "colors": [
        "#92400E",
        "#9A3412"
      ],
      "opacity": 0.252,
      "size": {
        "min": 1,
        "max": 2
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 115,
        "y": 16
      },
      "position": {
        "x": 8,
        "y": 3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 0,
      "depth": 1.7,
      "seed": 3948
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "desert-mirage-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=desert-mirage-light`.
