# Glacier Fjord Dark

Icy contours, crystalline geometry and sparse drifting snow (dark)

| Field | Value |
| --- | --- |
| Id | `glacier-fjord-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/glacier-fjord-dark.json`](../templates/glacier-fjord-dark.json) |
| Light/dark pairing | Paired light/dark group: `glacier-fjord` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#0C2130` |
| `primary` | `#A5F3FC` |
| `secondary` | `#C7D2FE` |
| `text` | `#EAF8FF` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#163547` |
| `cardBorder` | `#3B5A70` |
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
| `glacier-fjord-waves-1` | `waves` | 6 | `#A5F3FC`, `#C7D2FE` |
| `glacier-fjord-grid-2` | `grid` | 2 | `#A5F3FC`, `#C7D2FE` |
| `glacier-fjord-stars-3` | `stars` | 28 | `#A5F3FC`, `#C7D2FE` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 20% 50%, #163547 0%, #0C2130 78%)",
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
        "#A5F3FC",
        "#C7D2FE"
      ],
      "opacity": 0.22,
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
        "#A5F3FC",
        "#C7D2FE"
      ],
      "opacity": 0.09,
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
        "#A5F3FC",
        "#C7D2FE"
      ],
      "opacity": 0.5,
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
{ "site": { "ThemeDefault": "glacier-fjord-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=glacier-fjord-dark`.
