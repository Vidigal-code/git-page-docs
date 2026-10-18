# Thunder Horizon Light

Slow storm clouds and distant rain without flashing effects (light)

| Field | Value |
| --- | --- |
| Id | `thunder-horizon-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/thunder-horizon-light.json`](../templates/thunder-horizon-light.json) |
| Light/dark pairing | Paired light/dark group: `thunder-horizon` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F3F5FF` |
| `primary` | `#4338CA` |
| `secondary` | `#0369A1` |
| `text` | `#2B3350` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#CCD2EB` |
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
| `thunder-horizon-orbs-1` | `orbs` | 7 | `#4338CA`, `#0369A1` |
| `thunder-horizon-streaks-2` | `streaks` | 22 | `#4338CA`, `#0369A1` |
| `thunder-horizon-waves-3` | `waves` | 4 | `#4338CA`, `#0369A1` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 35% 30%, #FFFFFF 0%, #F3F5FF 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.75
  },
  "parallax": {
    "enabled": true,
    "pointer": 28,
    "scroll": 0.06
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "thunder-horizon-orbs-1",
      "kind": "orbs",
      "count": 7,
      "colors": [
        "#4338CA",
        "#0369A1"
      ],
      "opacity": 0.144,
      "size": {
        "min": 260,
        "max": 520
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": -24,
        "y": 5
      },
      "position": {
        "x": 4,
        "y": -3
      },
      "blur": 44,
      "glow": 0,
      "rotation": 0,
      "depth": 0.55,
      "seed": 4314
    },
    {
      "id": "thunder-horizon-streaks-2",
      "kind": "streaks",
      "count": 22,
      "colors": [
        "#4338CA",
        "#0369A1"
      ],
      "opacity": 0.216,
      "size": {
        "min": 1,
        "max": 2
      },
      "duration": {
        "min": 14,
        "max": 24
      },
      "travel": {
        "x": -25,
        "y": 135
      },
      "position": {
        "x": 4,
        "y": 0
      },
      "blur": 0,
      "glow": 0,
      "rotation": 16,
      "depth": 1.7,
      "length": 110,
      "seed": 4333
    },
    {
      "id": "thunder-horizon-waves-3",
      "kind": "waves",
      "count": 4,
      "colors": [
        "#4338CA",
        "#0369A1"
      ],
      "opacity": 0.101,
      "size": {
        "min": 400,
        "max": 680
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 18,
        "y": -5
      },
      "position": {
        "x": 4,
        "y": 3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 0,
      "depth": 1.1,
      "seed": 4352
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "thunder-horizon-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=thunder-horizon-light`.
