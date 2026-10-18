# Autumn Embers Dark

Copper embers rising through layers of warm autumn haze (dark)

| Field | Value |
| --- | --- |
| Id | `autumn-embers-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/autumn-embers-dark.json`](../templates/autumn-embers-dark.json) |
| Light/dark pairing | Paired light/dark group: `autumn-embers` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#28180F` |
| `primary` | `#FDBA74` |
| `secondary` | `#FCA5A5` |
| `text` | `#FFF0DF` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#3C271A` |
| `cardBorder` | `#6C4931` |
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
| `autumn-embers-streaks-1` | `streaks` | 14 | `#FDBA74`, `#FCA5A5` |
| `autumn-embers-stars-2` | `stars` | 26 | `#FDBA74`, `#FCA5A5` |
| `autumn-embers-orbs-3` | `orbs` | 4 | `#FDBA74`, `#FCA5A5` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 65% 30%, #3C271A 0%, #28180F 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 24,
    "scroll": 0.09
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "autumn-embers-streaks-1",
      "kind": "streaks",
      "count": 14,
      "colors": [
        "#FDBA74",
        "#FCA5A5"
      ],
      "opacity": 0.52,
      "size": {
        "min": 2,
        "max": 4
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 18,
        "y": -95
      },
      "position": {
        "x": 0,
        "y": -3
      },
      "blur": 0,
      "glow": 9,
      "rotation": -15,
      "depth": 1.6,
      "length": 22,
      "seed": 3708
    },
    {
      "id": "autumn-embers-stars-2",
      "kind": "stars",
      "count": 26,
      "colors": [
        "#FDBA74",
        "#FCA5A5"
      ],
      "opacity": 0.45,
      "size": {
        "min": 1,
        "max": 4
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -12,
        "y": -65
      },
      "position": {
        "x": 0,
        "y": 0
      },
      "blur": 0,
      "glow": 7,
      "rotation": 0,
      "depth": 0.8,
      "seed": 3727
    },
    {
      "id": "autumn-embers-orbs-3",
      "kind": "orbs",
      "count": 4,
      "colors": [
        "#FDBA74",
        "#FCA5A5"
      ],
      "opacity": 0.15,
      "size": {
        "min": 130,
        "max": 310
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 9,
        "y": 4
      },
      "position": {
        "x": 0,
        "y": 3
      },
      "blur": 42,
      "glow": 0,
      "rotation": 0,
      "depth": 0.4,
      "seed": 3746
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "autumn-embers-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=autumn-embers-dark`.
