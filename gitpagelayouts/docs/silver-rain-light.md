# Silver Rain Light

Slanted silver rainfall, broad ripples and low mist (light)

| Field | Value |
| --- | --- |
| Id | `silver-rain-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/silver-rain-light.json`](../templates/silver-rain-light.json) |
| Light/dark pairing | Paired light/dark group: `silver-rain` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F1F5FA` |
| `primary` | `#1D4ED8` |
| `secondary` | `#475569` |
| `text` | `#24354B` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#CAD5E3` |
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
| `silver-rain-streaks-1` | `streaks` | 34 | `#1D4ED8`, `#475569` |
| `silver-rain-waves-2` | `waves` | 5 | `#1D4ED8`, `#475569` |
| `silver-rain-orbs-3` | `orbs` | 3 | `#1D4ED8`, `#475569` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 20% 30%, #FFFFFF 0%, #F1F5FA 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.65
  },
  "parallax": {
    "enabled": true,
    "pointer": 32,
    "scroll": 0.045
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "silver-rain-streaks-1",
      "kind": "streaks",
      "count": 34,
      "colors": [
        "#1D4ED8",
        "#475569"
      ],
      "opacity": 0.302,
      "size": {
        "min": 1,
        "max": 2
      },
      "duration": {
        "min": 10,
        "max": 20
      },
      "travel": {
        "x": -20,
        "y": 150
      },
      "position": {
        "x": 8,
        "y": -3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 10,
      "depth": 1.5,
      "length": 84,
      "seed": 3405
    },
    {
      "id": "silver-rain-waves-2",
      "kind": "waves",
      "count": 5,
      "colors": [
        "#1D4ED8",
        "#475569"
      ],
      "opacity": 0.122,
      "size": {
        "min": 180,
        "max": 500
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": 8,
        "y": 3
      },
      "position": {
        "x": 8,
        "y": 0
      },
      "blur": 0,
      "glow": 0,
      "rotation": 0,
      "depth": 0.6,
      "seed": 3424
    },
    {
      "id": "silver-rain-orbs-3",
      "kind": "orbs",
      "count": 3,
      "colors": [
        "#1D4ED8",
        "#475569"
      ],
      "opacity": 0.072,
      "size": {
        "min": 280,
        "max": 500
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": -12,
        "y": 4
      },
      "position": {
        "x": 8,
        "y": 3
      },
      "blur": 56,
      "glow": 0,
      "rotation": 0,
      "depth": 0.25,
      "seed": 3443
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "silver-rain-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=silver-rain-light`.
