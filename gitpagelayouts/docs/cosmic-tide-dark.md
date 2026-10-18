# Cosmic Tide Dark

Orbital wave fields, fine stars and slow galactic currents (dark)

| Field | Value |
| --- | --- |
| Id | `cosmic-tide-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/cosmic-tide-dark.json`](../templates/cosmic-tide-dark.json) |
| Light/dark pairing | Paired light/dark group: `cosmic-tide` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#111A34` |
| `primary` | `#A5B4FC` |
| `secondary` | `#F0ABFC` |
| `text` | `#EDF0FF` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#202D4B` |
| `cardBorder` | `#435779` |
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
| `cosmic-tide-waves-1` | `waves` | 7 | `#A5B4FC`, `#F0ABFC` |
| `cosmic-tide-stars-2` | `stars` | 38 | `#A5B4FC`, `#F0ABFC` |
| `cosmic-tide-orbs-3` | `orbs` | 4 | `#A5B4FC`, `#F0ABFC` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 50% 10%, #202D4B 0%, #111A34 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.8500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 28,
    "scroll": 0.075
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "cosmic-tide-waves-1",
      "kind": "waves",
      "count": 7,
      "colors": [
        "#A5B4FC",
        "#F0ABFC"
      ],
      "opacity": 0.22,
      "size": {
        "min": 240,
        "max": 620
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 18,
        "y": -12
      },
      "position": {
        "x": 4,
        "y": -3
      },
      "blur": 0,
      "glow": 3,
      "rotation": 38,
      "depth": 1.3,
      "seed": 4819
    },
    {
      "id": "cosmic-tide-stars-2",
      "kind": "stars",
      "count": 38,
      "colors": [
        "#A5B4FC",
        "#F0ABFC"
      ],
      "opacity": 0.5,
      "size": {
        "min": 1,
        "max": 3
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -16,
        "y": 65
      },
      "position": {
        "x": 4,
        "y": 0
      },
      "blur": 0,
      "glow": 5,
      "rotation": 0,
      "depth": 0.4,
      "seed": 4838
    },
    {
      "id": "cosmic-tide-orbs-3",
      "kind": "orbs",
      "count": 4,
      "colors": [
        "#A5B4FC",
        "#F0ABFC"
      ],
      "opacity": 0.15,
      "size": {
        "min": 160,
        "max": 340
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 22,
        "y": 9
      },
      "position": {
        "x": 4,
        "y": 3
      },
      "blur": 42,
      "glow": 0,
      "rotation": 0,
      "depth": 1.8,
      "seed": 4857
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "cosmic-tide-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=cosmic-tide-dark`.
