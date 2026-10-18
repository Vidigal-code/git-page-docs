# Sakura Breeze Dark

Rose petals and small highlights carried across a spring breeze (dark)

| Field | Value |
| --- | --- |
| Id | `sakura-breeze-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/sakura-breeze-dark.json`](../templates/sakura-breeze-dark.json) |
| Light/dark pairing | Paired light/dark group: `sakura-breeze` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#281420` |
| `primary` | `#FDA4AF` |
| `secondary` | `#F0ABFC` |
| `text` | `#FCEAF3` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#3C2132` |
| `cardBorder` | `#664056` |
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
| `sakura-breeze-orbs-1` | `orbs` | 26 | `#FDA4AF`, `#F0ABFC` |
| `sakura-breeze-stars-2` | `stars` | 14 | `#FDA4AF`, `#F0ABFC` |
| `sakura-breeze-waves-3` | `waves` | 3 | `#FDA4AF`, `#F0ABFC` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 50% 10%, #3C2132 0%, #281420 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.8500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 20,
    "scroll": 0.075
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "sakura-breeze-orbs-1",
      "kind": "orbs",
      "count": 26,
      "colors": [
        "#FDA4AF",
        "#F0ABFC"
      ],
      "opacity": 0.4,
      "size": {
        "min": 6,
        "max": 16
      },
      "duration": {
        "min": 22,
        "max": 44
      },
      "travel": {
        "x": 90,
        "y": 85
      },
      "position": {
        "x": -4,
        "y": -3
      },
      "blur": 1,
      "glow": 0,
      "rotation": 0,
      "depth": 1.6,
      "seed": 3607
    },
    {
      "id": "sakura-breeze-stars-2",
      "kind": "stars",
      "count": 14,
      "colors": [
        "#FDA4AF",
        "#F0ABFC"
      ],
      "opacity": 0.32,
      "size": {
        "min": 2,
        "max": 4
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": 65,
        "y": 48
      },
      "position": {
        "x": -4,
        "y": 0
      },
      "blur": 0,
      "glow": 4,
      "rotation": 0,
      "depth": 0.7,
      "seed": 3626
    },
    {
      "id": "sakura-breeze-waves-3",
      "kind": "waves",
      "count": 3,
      "colors": [
        "#FDA4AF",
        "#F0ABFC"
      ],
      "opacity": 0.1,
      "size": {
        "min": 340,
        "max": 560
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 20,
        "y": -6
      },
      "position": {
        "x": -4,
        "y": 3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 25,
      "depth": 0.35,
      "seed": 3645
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "sakura-breeze-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=sakura-breeze-dark`.
