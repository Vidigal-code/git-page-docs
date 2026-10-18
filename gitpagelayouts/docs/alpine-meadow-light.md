# Alpine Meadow Light

Fresh meadow light, small floating seeds and cool mountain contours (light)

| Field | Value |
| --- | --- |
| Id | `alpine-meadow-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/alpine-meadow-light.json`](../templates/alpine-meadow-light.json) |
| Light/dark pairing | Paired light/dark group: `alpine-meadow` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F2FCF2` |
| `primary` | `#166534` |
| `secondary` | `#0369A1` |
| `text` | `#294B35` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#C4E1C6` |
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
| `alpine-meadow-stars-1` | `stars` | 32 | `#166534`, `#0369A1` |
| `alpine-meadow-waves-2` | `waves` | 5 | `#166534`, `#0369A1` |
| `alpine-meadow-orbs-3` | `orbs` | 6 | `#166534`, `#0369A1` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 35% 50%, #FFFFFF 0%, #F2FCF2 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.75
  },
  "parallax": {
    "enabled": true,
    "pointer": 24,
    "scroll": 0.06
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "alpine-meadow-stars-1",
      "kind": "stars",
      "count": 32,
      "colors": [
        "#166534",
        "#0369A1"
      ],
      "opacity": 0.302,
      "size": {
        "min": 1,
        "max": 4
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 35,
        "y": -35
      },
      "position": {
        "x": 0,
        "y": -3
      },
      "blur": 0,
      "glow": 3,
      "rotation": 0,
      "depth": 1.7,
      "seed": 4718
    },
    {
      "id": "alpine-meadow-waves-2",
      "kind": "waves",
      "count": 5,
      "colors": [
        "#166534",
        "#0369A1"
      ],
      "opacity": 0.115,
      "size": {
        "min": 320,
        "max": 640
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": 12,
        "y": 6
      },
      "position": {
        "x": 0,
        "y": 0
      },
      "blur": 0,
      "glow": 0,
      "rotation": -14,
      "depth": 0.7,
      "seed": 4737
    },
    {
      "id": "alpine-meadow-orbs-3",
      "kind": "orbs",
      "count": 6,
      "colors": [
        "#166534",
        "#0369A1"
      ],
      "opacity": 0.086,
      "size": {
        "min": 70,
        "max": 180
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": -16,
        "y": 9
      },
      "position": {
        "x": 0,
        "y": 3
      },
      "blur": 30,
      "glow": 0,
      "rotation": 0,
      "depth": 1.2,
      "seed": 4756
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "alpine-meadow-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=alpine-meadow-light`.
