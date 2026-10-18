# Silver Rain Dark

Slanted silver rainfall, broad ripples and low mist (dark)

| Field | Value |
| --- | --- |
| Id | `silver-rain-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/silver-rain-dark.json`](../templates/silver-rain-dark.json) |
| Light/dark pairing | Paired light/dark group: `silver-rain` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#101B2B` |
| `primary` | `#93C5FD` |
| `secondary` | `#CBD5E1` |
| `text` | `#ECF2FC` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#1A2B40` |
| `cardBorder` | `#3D526D` |
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
| `silver-rain-streaks-1` | `streaks` | 34 | `#93C5FD`, `#CBD5E1` |
| `silver-rain-waves-2` | `waves` | 5 | `#93C5FD`, `#CBD5E1` |
| `silver-rain-orbs-3` | `orbs` | 3 | `#93C5FD`, `#CBD5E1` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 20% 30%, #1A2B40 0%, #101B2B 78%)",
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
        "#93C5FD",
        "#CBD5E1"
      ],
      "opacity": 0.42,
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
        "#93C5FD",
        "#CBD5E1"
      ],
      "opacity": 0.17,
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
        "#93C5FD",
        "#CBD5E1"
      ],
      "opacity": 0.1,
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
{ "site": { "ThemeDefault": "silver-rain-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=silver-rain-dark`.
