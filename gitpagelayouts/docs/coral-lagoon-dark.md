# Coral Lagoon Dark

Turquoise lagoon currents with coral highlights and rising bubbles (dark)

| Field | Value |
| --- | --- |
| Id | `coral-lagoon-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/coral-lagoon-dark.json`](../templates/coral-lagoon-dark.json) |
| Light/dark pairing | Paired light/dark group: `coral-lagoon` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#07252A` |
| `primary` | `#5EEAD4` |
| `secondary` | `#FDA4AF` |
| `text` | `#E6FFFB` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#103B3F` |
| `cardBorder` | `#2D6062` |
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
| `coral-lagoon-orbs-1` | `orbs` | 20 | `#5EEAD4`, `#FDA4AF` |
| `coral-lagoon-waves-2` | `waves` | 6 | `#5EEAD4`, `#FDA4AF` |
| `coral-lagoon-streaks-3` | `streaks` | 4 | `#5EEAD4`, `#FDA4AF` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 65% 50%, #103B3F 0%, #07252A 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 20,
    "scroll": 0.09
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "coral-lagoon-orbs-1",
      "kind": "orbs",
      "count": 20,
      "colors": [
        "#5EEAD4",
        "#FDA4AF"
      ],
      "opacity": 0.32,
      "size": {
        "min": 5,
        "max": 28
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": -8,
        "y": -110
      },
      "position": {
        "x": -4,
        "y": -3
      },
      "blur": 0,
      "glow": 4,
      "rotation": 0,
      "depth": 1.7,
      "seed": 4112
    },
    {
      "id": "coral-lagoon-waves-2",
      "kind": "waves",
      "count": 6,
      "colors": [
        "#5EEAD4",
        "#FDA4AF"
      ],
      "opacity": 0.2,
      "size": {
        "min": 180,
        "max": 450
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": 28,
        "y": 10
      },
      "position": {
        "x": -4,
        "y": 0
      },
      "blur": 0,
      "glow": 0,
      "rotation": 8,
      "depth": 0.9,
      "seed": 4131
    },
    {
      "id": "coral-lagoon-streaks-3",
      "kind": "streaks",
      "count": 4,
      "colors": [
        "#5EEAD4",
        "#FDA4AF"
      ],
      "opacity": 0.11,
      "size": {
        "min": 2,
        "max": 5
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 5,
        "y": 20
      },
      "position": {
        "x": -4,
        "y": 3
      },
      "blur": 6,
      "glow": 0,
      "rotation": 24,
      "depth": 0.3,
      "length": 220,
      "seed": 4150
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "coral-lagoon-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=coral-lagoon-dark`.
