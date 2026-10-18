# Cloud Harbor Light

Slow cloud banks drifting above a calm open horizon (light)

| Field | Value |
| --- | --- |
| Id | `cloud-harbor-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/cloud-harbor-light.json`](../templates/cloud-harbor-light.json) |
| Light/dark pairing | Paired light/dark group: `cloud-harbor` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F3FAFF` |
| `primary` | `#0369A1` |
| `secondary` | `#92400E` |
| `text` | `#213D50` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#C8E0EC` |
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
| `cloud-harbor-orbs-1` | `orbs` | 10 | `#0369A1`, `#92400E` |
| `cloud-harbor-waves-2` | `waves` | 4 | `#0369A1`, `#92400E` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 35% 50%, #FFFFFF 0%, #F3FAFF 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.75
  },
  "parallax": {
    "enabled": true,
    "pointer": 16,
    "scroll": 0.06
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "cloud-harbor-orbs-1",
      "kind": "orbs",
      "count": 10,
      "colors": [
        "#0369A1",
        "#92400E"
      ],
      "opacity": 0.137,
      "size": {
        "min": 260,
        "max": 500
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 34,
        "y": -3
      },
      "position": {
        "x": -8,
        "y": -3
      },
      "blur": 44,
      "glow": 0,
      "rotation": 0,
      "depth": 0.8,
      "seed": 3506
    },
    {
      "id": "cloud-harbor-waves-2",
      "kind": "waves",
      "count": 4,
      "colors": [
        "#0369A1",
        "#92400E"
      ],
      "opacity": 0.094,
      "size": {
        "min": 440,
        "max": 720
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -20,
        "y": 5
      },
      "position": {
        "x": -8,
        "y": 0
      },
      "blur": 0,
      "glow": 0,
      "rotation": -4,
      "depth": 1.35,
      "seed": 3525
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "cloud-harbor-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=cloud-harbor-light`.
