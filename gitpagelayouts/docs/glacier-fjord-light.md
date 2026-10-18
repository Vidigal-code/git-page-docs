# Glacier Fjord Light

Icy contours, crystalline geometry and sparse drifting snow (light)

| Field | Value |
| --- | --- |
| Id | `glacier-fjord-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/glacier-fjord-light.json`](../templates/glacier-fjord-light.json) |
| Light/dark pairing | Paired light/dark group: `glacier-fjord` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F0FCFF` |
| `primary` | `#0E7490` |
| `secondary` | `#4338CA` |
| `text` | `#25404F` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#C1DFE9` |
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
| `glacier-fjord-waves-1` | `waves` | 6 | `#0E7490`, `#4338CA` |
| `glacier-fjord-grid-2` | `grid` | 2 | `#0E7490`, `#4338CA` |
| `glacier-fjord-stars-3` | `stars` | 28 | `#0E7490`, `#4338CA` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 20% 50%, #FFFFFF 0%, #F0FCFF 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.65
  },
  "parallax": {
    "enabled": true,
    "pointer": 28,
    "scroll": 0.045
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "glacier-fjord-waves-1",
      "kind": "waves",
      "count": 6,
      "colors": [
        "#0E7490",
        "#4338CA"
      ],
      "opacity": 0.158,
      "size": {
        "min": 260,
        "max": 560
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 14,
        "y": 6
      },
      "position": {
        "x": 4,
        "y": -3
      },
      "blur": 0,
      "glow": 0,
      "rotation": -10,
      "depth": 1.2,
      "seed": 3809
    },
    {
      "id": "glacier-fjord-grid-2",
      "kind": "grid",
      "count": 2,
      "colors": [
        "#0E7490",
        "#4338CA"
      ],
      "opacity": 0.065,
      "size": {
        "min": 180,
        "max": 280
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -8,
        "y": 4
      },
      "position": {
        "x": 4,
        "y": 0
      },
      "blur": 0,
      "glow": 0,
      "rotation": 28,
      "depth": 0.45,
      "seed": 3828
    },
    {
      "id": "glacier-fjord-stars-3",
      "kind": "stars",
      "count": 28,
      "colors": [
        "#0E7490",
        "#4338CA"
      ],
      "opacity": 0.36,
      "size": {
        "min": 1,
        "max": 4
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 12,
        "y": 95
      },
      "position": {
        "x": 4,
        "y": 3
      },
      "blur": 0,
      "glow": 2,
      "rotation": 0,
      "depth": 1.8,
      "seed": 3847
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "glacier-fjord-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=glacier-fjord-light`.
