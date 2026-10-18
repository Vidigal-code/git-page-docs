# Polaris Parallax

Polar light ribbons and a sparse distant sky

| Field | Value |
| --- | --- |
| Id | `polaris-parallax-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/polaris-parallax-dark.json`](../templates/polaris-parallax-dark.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#081522` |
| `primary` | `#7DD3FC` |
| `secondary` | `#A5B4FC` |
| `text` | `#EAF2FF` |
| `textSecondary` | `#A7B9CE` |
| `cardBackground` | `#14283C` |
| `cardBorder` | `#35516F` |
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
| `waves-1` | `waves` | 3 | `#7DD3FC`, `#A5B4FC` |
| `stars-2` | `stars` | 40 | `#7DD3FC`, `#A5B4FC` |
| `orbs-3` | `orbs` | 4 | `#7DD3FC`, `#A5B4FC` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 75% 0%, #14283C 0%, #081522 70%)",
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
      "id": "waves-1",
      "kind": "waves",
      "count": 3,
      "opacity": 0.16,
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
        "#7DD3FC",
        "#A5B4FC"
      ],
      "seed": 2564
    },
    {
      "id": "stars-2",
      "kind": "stars",
      "count": 40,
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
        "#7DD3FC",
        "#A5B4FC"
      ],
      "seed": 2581
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
        "#7DD3FC",
        "#A5B4FC"
      ],
      "seed": 2598
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "polaris-parallax-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=polaris-parallax-dark`.
