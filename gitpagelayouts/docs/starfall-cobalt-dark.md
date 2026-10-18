# Starfall Cobalt

Silver starfall across a deep cobalt sky

| Field | Value |
| --- | --- |
| Id | `starfall-cobalt-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/starfall-cobalt-dark.json`](../templates/starfall-cobalt-dark.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#060F2B` |
| `primary` | `#60A5FA` |
| `secondary` | `#BFDBFE` |
| `text` | `#EAF2FF` |
| `textSecondary` | `#A7B9CE` |
| `cardBackground` | `#101F40` |
| `cardBorder` | `#294575` |
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
| `stars-1` | `stars` | 32 | `#60A5FA`, `#BFDBFE` |
| `streaks-2` | `streaks` | 6 | `#60A5FA`, `#BFDBFE` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 35% 0%, #101F40 0%, #060F2B 70%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9
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
      "count": 32,
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
        "#60A5FA",
        "#BFDBFE"
      ],
      "seed": 1150
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
      "length": 120,
      "colors": [
        "#60A5FA",
        "#BFDBFE"
      ],
      "seed": 1167
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "starfall-cobalt-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=starfall-cobalt-dark`.
