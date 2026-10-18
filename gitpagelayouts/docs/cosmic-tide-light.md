# Cosmic Tide Light

Orbital wave fields, fine stars and slow galactic currents (light)

| Field | Value |
| --- | --- |
| Id | `cosmic-tide-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/cosmic-tide-light.json`](../templates/cosmic-tide-light.json) |
| Light/dark pairing | Paired light/dark group: `cosmic-tide` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#F3F6FF` |
| `primary` | `#4338CA` |
| `secondary` | `#A21CAF` |
| `text` | `#293657` |
| `textSecondary` | `#526269` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#C8D4EF` |
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
| `cosmic-tide-waves-1` | `waves` | 7 | `#4338CA`, `#A21CAF` |
| `cosmic-tide-stars-2` | `stars` | 38 | `#4338CA`, `#A21CAF` |
| `cosmic-tide-orbs-3` | `orbs` | 4 | `#4338CA`, `#A21CAF` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 50% 10%, #FFFFFF 0%, #F3F6FF 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.8500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 28,
    "scroll": 0.075
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "cosmic-tide-waves-1",
      "kind": "waves",
      "count": 7,
      "colors": [
        "#4338CA",
        "#A21CAF"
      ],
      "opacity": 0.158,
      "size": {
        "min": 240,
        "max": 620
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 18,
        "y": -12
      },
      "position": {
        "x": 4,
        "y": -3
      },
      "blur": 0,
      "glow": 3,
      "rotation": 38,
      "depth": 1.3,
      "seed": 4819
    },
    {
      "id": "cosmic-tide-stars-2",
      "kind": "stars",
      "count": 38,
      "colors": [
        "#4338CA",
        "#A21CAF"
      ],
      "opacity": 0.36,
      "size": {
        "min": 1,
        "max": 3
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -16,
        "y": 65
      },
      "position": {
        "x": 4,
        "y": 0
      },
      "blur": 0,
      "glow": 5,
      "rotation": 0,
      "depth": 0.4,
      "seed": 4838
    },
    {
      "id": "cosmic-tide-orbs-3",
      "kind": "orbs",
      "count": 4,
      "colors": [
        "#4338CA",
        "#A21CAF"
      ],
      "opacity": 0.108,
      "size": {
        "min": 160,
        "max": 340
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 22,
        "y": 9
      },
      "position": {
        "x": 4,
        "y": 3
      },
      "blur": 42,
      "glow": 0,
      "rotation": 0,
      "depth": 1.8,
      "seed": 4857
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "cosmic-tide-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=cosmic-tide-light`.
