# Firefly Grove Dark

Warm fireflies drifting through soft woodland shadows (dark)

| Field | Value |
| --- | --- |
| Id | `firefly-grove-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/firefly-grove-dark.json`](../templates/firefly-grove-dark.json) |
| Light/dark pairing | Paired light/dark group: `firefly-grove` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#0A1913` |
| `primary` | `#BEF264` |
| `secondary` | `#86EFAC` |
| `text` | `#EFFAE8` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#14291D` |
| `cardBorder` | `#35513C` |
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
| `firefly-grove-stars-1` | `stars` | 36 | `#BEF264`, `#86EFAC` |
| `firefly-grove-orbs-2` | `orbs` | 5 | `#BEF264`, `#86EFAC` |
| `firefly-grove-waves-3` | `waves` | 3 | `#BEF264`, `#86EFAC` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 35% 30%, #14291D 0%, #0A1913 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.75
  },
  "parallax": {
    "enabled": true,
    "pointer": 20,
    "scroll": 0.06
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "firefly-grove-stars-1",
      "kind": "stars",
      "count": 36,
      "colors": [
        "#BEF264",
        "#86EFAC"
      ],
      "opacity": 0.65,
      "size": {
        "min": 2,
        "max": 6
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 12,
        "y": -24
      },
      "position": {
        "x": -4,
        "y": -3
      },
      "blur": 0,
      "glow": 12,
      "rotation": 0,
      "depth": 1.6,
      "seed": 3102
    },
    {
      "id": "firefly-grove-orbs-2",
      "kind": "orbs",
      "count": 5,
      "colors": [
        "#BEF264",
        "#86EFAC"
      ],
      "opacity": 0.13,
      "size": {
        "min": 90,
        "max": 210
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -10,
        "y": 6
      },
      "position": {
        "x": -4,
        "y": 0
      },
      "blur": 34,
      "glow": 0,
      "rotation": 0,
      "depth": 0.55,
      "seed": 3121
    },
    {
      "id": "firefly-grove-waves-3",
      "kind": "waves",
      "count": 3,
      "colors": [
        "#BEF264",
        "#86EFAC"
      ],
      "opacity": 0.09,
      "size": {
        "min": 280,
        "max": 460
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 7,
        "y": 4
      },
      "position": {
        "x": -4,
        "y": 3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 32,
      "depth": 0.3,
      "seed": 3140
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "firefly-grove-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=firefly-grove-dark`.
