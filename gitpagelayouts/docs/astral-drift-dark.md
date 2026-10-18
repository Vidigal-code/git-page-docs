# Astral Drift

Cyan stars, slow meteors and violet atmospheric depth

| Field | Value |
| --- | --- |
| Id | `astral-drift-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/astral-drift-dark.json`](../templates/astral-drift-dark.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#050B1B` |
| `primary` | `#38BDF8` |
| `secondary` | `#A5B4FC` |
| `text` | `#EAF2FF` |
| `textSecondary` | `#A7B9CE` |
| `cardBackground` | `#0B162C` |
| `cardBorder` | `#243A58` |
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
| `stars-1` | `stars` | 28 | `#38BDF8`, `#A5B4FC` |
| `streaks-2` | `streaks` | 6 | `#38BDF8`, `#A5B4FC` |
| `orbs-3` | `orbs` | 4 | `#38BDF8`, `#A5B4FC` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 15% 0%, #0B162C 0%, #050B1B 70%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.8
  },
  "parallax": {
    "enabled": true,
    "pointer": 10,
    "scroll": 0.025
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "stars-1",
      "kind": "stars",
      "count": 28,
      "opacity": 0.56,
      "size": {
        "min": 1,
        "max": 3
      },
      "duration": {
        "min": 24,
        "max": 48
      },
      "travel": {
        "x": 4,
        "y": 110
      },
      "blur": 0,
      "glow": 3,
      "rotation": 0,
      "depth": 0.7,
      "colors": [
        "#38BDF8",
        "#A5B4FC"
      ],
      "seed": 1049
    },
    {
      "id": "streaks-2",
      "kind": "streaks",
      "count": 6,
      "opacity": 0.5,
      "size": {
        "min": 1,
        "max": 2
      },
      "duration": {
        "min": 12,
        "max": 25
      },
      "travel": {
        "x": -28,
        "y": 120
      },
      "blur": 0,
      "glow": 5,
      "rotation": 24,
      "depth": 1.1,
      "length": 100,
      "colors": [
        "#38BDF8",
        "#A5B4FC"
      ],
      "seed": 1066
    },
    {
      "id": "orbs-3",
      "kind": "orbs",
      "count": 4,
      "opacity": 0.18,
      "size": {
        "min": 140,
        "max": 260
      },
      "duration": {
        "min": 28,
        "max": 52
      },
      "travel": {
        "x": 12,
        "y": -8
      },
      "blur": 36,
      "glow": 0,
      "rotation": 0,
      "depth": 1.2,
      "colors": [
        "#38BDF8",
        "#A5B4FC"
      ],
      "seed": 1083
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "astral-drift-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=astral-drift-dark`.
