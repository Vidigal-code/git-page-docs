# Petal Parallax

Rose and lilac layers floating like soft petals

| Field | Value |
| --- | --- |
| Id | `petal-parallax-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/petal-parallax-light.json`](../templates/petal-parallax-light.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#FDF2F8` |
| `primary` | `#A21CAF` |
| `secondary` | `#BE185D` |
| `text` | `#17233B` |
| `textSecondary` | `#475569` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#F2CBE6` |
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
| `orbs-1` | `orbs` | 4 | `#A21CAF`, `#BE185D` |
| `waves-2` | `waves` | 3 | `#A21CAF`, `#BE185D` |
| `stars-3` | `stars` | 36 | `#A21CAF`, `#BE185D` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 55% 0%, #FFFFFF 0%, #FDF2F8 70%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.8
  },
  "parallax": {
    "enabled": true,
    "pointer": 24,
    "scroll": 0.08
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "orbs-1",
      "kind": "orbs",
      "count": 4,
      "opacity": 0.11699999999999999,
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
        "#A21CAF",
        "#BE185D"
      ],
      "seed": 2867
    },
    {
      "id": "waves-2",
      "kind": "waves",
      "count": 3,
      "opacity": 0.10400000000000001,
      "size": {
        "min": 180,
        "max": 300
      },
      "duration": {
        "min": 32,
        "max": 60
      },
      "travel": {
        "x": 15,
        "y": 7
      },
      "blur": 24,
      "glow": 0,
      "rotation": -12,
      "depth": 1,
      "colors": [
        "#A21CAF",
        "#BE185D"
      ],
      "seed": 2884
    },
    {
      "id": "stars-3",
      "kind": "stars",
      "count": 36,
      "opacity": 0.36400000000000005,
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
        "#A21CAF",
        "#BE185D"
      ],
      "seed": 2901
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "petal-parallax-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=petal-parallax-light`.
