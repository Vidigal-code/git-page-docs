# Sunrise Parallax

Peach sunrise ribbons with gentle warm parallax

| Field | Value |
| --- | --- |
| Id | `sunrise-parallax-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/sunrise-parallax-light.json`](../templates/sunrise-parallax-light.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#FFF7ED` |
| `primary` | `#C2410C` |
| `secondary` | `#BE185D` |
| `text` | `#17233B` |
| `textSecondary` | `#475569` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#FED7AA` |
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
| `waves-1` | `waves` | 3 | `#C2410C`, `#BE185D` |
| `orbs-2` | `orbs` | 4 | `#C2410C`, `#BE185D` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 35% 0%, #FFFFFF 0%, #FFF7ED 70%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 1
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
      "id": "waves-1",
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
        "#C2410C",
        "#BE185D"
      ],
      "seed": 2766
    },
    {
      "id": "orbs-2",
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
        "#C2410C",
        "#BE185D"
      ],
      "seed": 2783
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "sunrise-parallax-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=sunrise-parallax-light`.
