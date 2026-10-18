# Crystal Cavern Light

Faceted grids and luminous mineral trails inside a violet cavern (light)

| Field | Value |
| --- | --- |
| Id | `crystal-cavern-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/crystal-cavern-light.json`](../templates/crystal-cavern-light.json) |
| Light/dark pairing | Paired light/dark group: `crystal-cavern` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F7F3FF` |
| `primary` | `#6D28D9` |
| `secondary` | `#0E7490` |
| `text` | `#382D50` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#D7CAEB` |
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
| `crystal-cavern-grid-1` | `grid` | 4 | `#6D28D9`, `#0E7490` |
| `crystal-cavern-streaks-2` | `streaks` | 8 | `#6D28D9`, `#0E7490` |
| `crystal-cavern-stars-3` | `stars` | 26 | `#6D28D9`, `#0E7490` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 50% 50%, #FFFFFF 0%, #F7F3FF 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.8500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 32,
    "scroll": 0.075
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "crystal-cavern-grid-1",
      "kind": "grid",
      "count": 4,
      "colors": [
        "#6D28D9",
        "#0E7490"
      ],
      "opacity": 0.094,
      "size": {
        "min": 100,
        "max": 210
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 10,
        "y": -8
      },
      "position": {
        "x": 8,
        "y": -3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 45,
      "depth": 1.1,
      "seed": 4415
    },
    {
      "id": "crystal-cavern-streaks-2",
      "kind": "streaks",
      "count": 8,
      "colors": [
        "#6D28D9",
        "#0E7490"
      ],
      "opacity": 0.202,
      "size": {
        "min": 2,
        "max": 5
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": 12,
        "y": 45
      },
      "position": {
        "x": 8,
        "y": 0
      },
      "blur": 0,
      "glow": 10,
      "rotation": -25,
      "depth": 1.6,
      "length": 170,
      "seed": 4434
    },
    {
      "id": "crystal-cavern-stars-3",
      "kind": "stars",
      "count": 26,
      "colors": [
        "#6D28D9",
        "#0E7490"
      ],
      "opacity": 0.346,
      "size": {
        "min": 1,
        "max": 4
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": -6,
        "y": -18
      },
      "position": {
        "x": 8,
        "y": 3
      },
      "blur": 0,
      "glow": 7,
      "rotation": 0,
      "depth": 0.45,
      "seed": 4453
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "crystal-cavern-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=crystal-cavern-light`.
