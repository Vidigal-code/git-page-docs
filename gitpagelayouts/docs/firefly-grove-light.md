# Firefly Grove Light

Warm fireflies drifting through soft woodland shadows (light)

| Field | Value |
| --- | --- |
| Id | `firefly-grove-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/firefly-grove-light.json`](../templates/firefly-grove-light.json) |
| Light/dark pairing | Paired light/dark group: `firefly-grove` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F6FBEF` |
| `primary` | `#4D7C0F` |
| `secondary` | `#047857` |
| `text` | `#273A1B` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#CEDDBB` |
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
| `firefly-grove-stars-1` | `stars` | 36 | `#4D7C0F`, `#047857` |
| `firefly-grove-orbs-2` | `orbs` | 5 | `#4D7C0F`, `#047857` |
| `firefly-grove-waves-3` | `waves` | 3 | `#4D7C0F`, `#047857` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 35% 30%, #FFFFFF 0%, #F6FBEF 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.75
  },
  "parallax": {
    "enabled": true,
    "pointer": 20,
    "scroll": 0.06
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "firefly-grove-stars-1",
      "kind": "stars",
      "count": 36,
      "colors": [
        "#4D7C0F",
        "#047857"
      ],
      "opacity": 0.468,
      "size": {
        "min": 2,
        "max": 6
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 12,
        "y": -24
      },
      "position": {
        "x": -4,
        "y": -3
      },
      "blur": 0,
      "glow": 12,
      "rotation": 0,
      "depth": 1.6,
      "seed": 3102
    },
    {
      "id": "firefly-grove-orbs-2",
      "kind": "orbs",
      "count": 5,
      "colors": [
        "#4D7C0F",
        "#047857"
      ],
      "opacity": 0.094,
      "size": {
        "min": 90,
        "max": 210
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -10,
        "y": 6
      },
      "position": {
        "x": -4,
        "y": 0
      },
      "blur": 34,
      "glow": 0,
      "rotation": 0,
      "depth": 0.55,
      "seed": 3121
    },
    {
      "id": "firefly-grove-waves-3",
      "kind": "waves",
      "count": 3,
      "colors": [
        "#4D7C0F",
        "#047857"
      ],
      "opacity": 0.065,
      "size": {
        "min": 280,
        "max": 460
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 7,
        "y": 4
      },
      "position": {
        "x": -4,
        "y": 3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 32,
      "depth": 0.3,
      "seed": 3140
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "firefly-grove-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=firefly-grove-light`.
