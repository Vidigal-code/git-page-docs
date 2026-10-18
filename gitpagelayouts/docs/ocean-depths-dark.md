# Ocean Depths Dark

Layered ocean currents, rising bubbles and gentle light shafts (dark)

| Field | Value |
| --- | --- |
| Id | `ocean-depths-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/ocean-depths-dark.json`](../templates/ocean-depths-dark.json) |
| Light/dark pairing | Paired light/dark group: `ocean-depths` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#041C2C` |
| `primary` | `#67E8F9` |
| `secondary` | `#60A5FA` |
| `text` | `#E3F5FF` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#0C2C40` |
| `cardBorder` | `#24516A` |
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
| `ocean-depths-waves-1` | `waves` | 7 | `#67E8F9`, `#60A5FA` |
| `ocean-depths-orbs-2` | `orbs` | 14 | `#67E8F9`, `#60A5FA` |
| `ocean-depths-streaks-3` | `streaks` | 5 | `#67E8F9`, `#60A5FA` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 50% 50%, #0C2C40 0%, #041C2C 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.8500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 24,
    "scroll": 0.075
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "ocean-depths-waves-1",
      "kind": "waves",
      "count": 7,
      "colors": [
        "#67E8F9",
        "#60A5FA"
      ],
      "opacity": 0.23,
      "size": {
        "min": 240,
        "max": 620
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 24,
        "y": 10
      },
      "position": {
        "x": 0,
        "y": -3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 0,
      "depth": 1.3,
      "seed": 3203
    },
    {
      "id": "ocean-depths-orbs-2",
      "kind": "orbs",
      "count": 14,
      "colors": [
        "#67E8F9",
        "#60A5FA"
      ],
      "opacity": 0.26,
      "size": {
        "min": 8,
        "max": 38
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": 5,
        "y": -100
      },
      "position": {
        "x": 0,
        "y": 0
      },
      "blur": 0,
      "glow": 6,
      "rotation": 0,
      "depth": 1.8,
      "seed": 3222
    },
    {
      "id": "ocean-depths-streaks-3",
      "kind": "streaks",
      "count": 5,
      "colors": [
        "#67E8F9",
        "#60A5FA"
      ],
      "opacity": 0.13,
      "size": {
        "min": 3,
        "max": 8
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 4,
        "y": 18
      },
      "position": {
        "x": 0,
        "y": 3
      },
      "blur": 12,
      "glow": 0,
      "rotation": 17,
      "depth": 0.25,
      "length": 300,
      "seed": 3241
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "ocean-depths-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=ocean-depths-dark`.
