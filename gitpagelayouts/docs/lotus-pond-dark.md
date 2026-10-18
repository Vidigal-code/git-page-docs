# Lotus Pond Dark

Layered pond ripples, rose reflections and floating water lights (dark)

| Field | Value |
| --- | --- |
| Id | `lotus-pond-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/lotus-pond-dark.json`](../templates/lotus-pond-dark.json) |
| Light/dark pairing | Paired light/dark group: `lotus-pond` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#102723` |
| `primary` | `#99F6E4` |
| `secondary` | `#F9A8D4` |
| `text` | `#EAF9F2` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#1D3B33` |
| `cardBorder` | `#3D6656` |
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
| `lotus-pond-waves-1` | `waves` | 9 | `#99F6E4`, `#F9A8D4` |
| `lotus-pond-orbs-2` | `orbs` | 9 | `#99F6E4`, `#F9A8D4` |
| `lotus-pond-stars-3` | `stars` | 16 | `#99F6E4`, `#F9A8D4` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 65% 10%, #1D3B33 0%, #102723 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9500000000000001
  },
  "parallax": {
    "enabled": true,
    "pointer": 16,
    "scroll": 0.09
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "lotus-pond-waves-1",
      "kind": "waves",
      "count": 9,
      "colors": [
        "#99F6E4",
        "#F9A8D4"
      ],
      "opacity": 0.22,
      "size": {
        "min": 130,
        "max": 430
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 14,
        "y": 4
      },
      "position": {
        "x": -8,
        "y": -3
      },
      "blur": 0,
      "glow": 0,
      "rotation": 0,
      "depth": 1.4,
      "seed": 4516
    },
    {
      "id": "lotus-pond-orbs-2",
      "kind": "orbs",
      "count": 9,
      "colors": [
        "#99F6E4",
        "#F9A8D4"
      ],
      "opacity": 0.2,
      "size": {
        "min": 12,
        "max": 44
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": -14,
        "y": 7
      },
      "position": {
        "x": -8,
        "y": 0
      },
      "blur": 3,
      "glow": 0,
      "rotation": 0,
      "depth": 0.8,
      "seed": 4535
    },
    {
      "id": "lotus-pond-stars-3",
      "kind": "stars",
      "count": 16,
      "colors": [
        "#99F6E4",
        "#F9A8D4"
      ],
      "opacity": 0.4,
      "size": {
        "min": 1,
        "max": 4
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 5,
        "y": -20
      },
      "position": {
        "x": -8,
        "y": 3
      },
      "blur": 0,
      "glow": 8,
      "rotation": 0,
      "depth": 1.8,
      "seed": 4554
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "lotus-pond-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=lotus-pond-dark`.
