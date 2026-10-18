# Paper Lanterns Dark

Warm lantern-like lights ascending through a quiet evening haze (dark)

| Field | Value |
| --- | --- |
| Id | `paper-lanterns-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/paper-lanterns-dark.json`](../templates/paper-lanterns-dark.json) |
| Light/dark pairing | Paired light/dark group: `paper-lanterns` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#2B1721` |
| `primary` | `#FDBA74` |
| `secondary` | `#F9A8D4` |
| `text` | `#FFF0F1` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#422532` |
| `cardBorder` | `#724555` |
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
| `paper-lanterns-orbs-1` | `orbs` | 15 | `#FDBA74`, `#F9A8D4` |
| `paper-lanterns-streaks-2` | `streaks` | 10 | `#FDBA74`, `#F9A8D4` |
| `paper-lanterns-waves-3` | `waves` | 3 | `#FDBA74`, `#F9A8D4` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 65% 30%, #422532 0%, #2B1721 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 32,
    "scroll": 0.09
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "paper-lanterns-orbs-1",
      "kind": "orbs",
      "count": 15,
      "colors": [
        "#FDBA74",
        "#F9A8D4"
      ],
      "opacity": 0.42,
      "size": {
        "min": 18,
        "max": 54
      },
      "duration": {
        "min": 30,
        "max": 58
      },
      "travel": {
        "x": 12,
        "y": -115
      },
      "position": {
        "x": 8,
        "y": -3
      },
      "blur": 2,
      "glow": 14,
      "rotation": 0,
      "depth": 1.6,
      "seed": 4920
    },
    {
      "id": "paper-lanterns-streaks-2",
      "kind": "streaks",
      "count": 10,
      "colors": [
        "#FDBA74",
        "#F9A8D4"
      ],
      "opacity": 0.28,
      "size": {
        "min": 1,
        "max": 3
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -5,
        "y": -95
      },
      "position": {
        "x": 8,
        "y": 0
      },
      "blur": 0,
      "glow": 6,
      "rotation": 0,
      "depth": 0.9,
      "length": 24,
      "seed": 4939
    },
    {
      "id": "paper-lanterns-waves-3",
      "kind": "waves",
      "count": 3,
      "colors": [
        "#FDBA74",
        "#F9A8D4"
      ],
      "opacity": 0.1,
      "size": {
        "min": 360,
        "max": 650
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 16,
        "y": 4
      },
      "position": {
        "x": 8,
        "y": 3
      },
      "blur": 0,
      "glow": 0,
      "rotation": -8,
      "depth": 0.35,
      "seed": 4958
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "paper-lanterns-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=paper-lanterns-dark`.
