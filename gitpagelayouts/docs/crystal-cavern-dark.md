# Crystal Cavern Dark

Faceted grids and luminous mineral trails inside a violet cavern (dark)

| Field | Value |
| --- | --- |
| Id | `crystal-cavern-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/crystal-cavern-dark.json`](../templates/crystal-cavern-dark.json) |
| Light/dark pairing | Paired light/dark group: `crystal-cavern` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#1B1530` |
| `primary` | `#C4B5FD` |
| `secondary` | `#67E8F9` |
| `text` | `#F2EBFF` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#2C2445` |
| `cardBorder` | `#53446F` |
| `error` | `#FDA4AF` |
| `success` | `#86EFAC` |

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
| `crystal-cavern-grid-1` | `grid` | 4 | `#C4B5FD`, `#67E8F9` |
| `crystal-cavern-streaks-2` | `streaks` | 8 | `#C4B5FD`, `#67E8F9` |
| `crystal-cavern-stars-3` | `stars` | 26 | `#C4B5FD`, `#67E8F9` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 50% 50%, #2C2445 0%, #1B1530 78%)",
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
        "#C4B5FD",
        "#67E8F9"
      ],
      "opacity": 0.13,
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
        "#C4B5FD",
        "#67E8F9"
      ],
      "opacity": 0.28,
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
        "#C4B5FD",
        "#67E8F9"
      ],
      "opacity": 0.48,
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
{ "site": { "ThemeDefault": "crystal-cavern-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=crystal-cavern-dark`.
