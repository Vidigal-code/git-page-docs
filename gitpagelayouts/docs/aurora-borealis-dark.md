# Aurora Borealis Dark

Luminous ribbons and distant stars over polar skies (dark)

| Field | Value |
| --- | --- |
| Id | `aurora-borealis-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/aurora-borealis-dark.json`](../templates/aurora-borealis-dark.json) |
| Light/dark pairing | Paired light/dark group: `aurora-borealis` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#06181C` |
| `primary` | `#6EE7B7` |
| `secondary` | `#A5B4FC` |
| `text` | `#DDFBF3` |
| `textSecondary` | `#B9C8CB` |
| `cardBackground` | `#10272E` |
| `cardBorder` | `#2A4B50` |
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
| `aurora-borealis-orbs-1` | `orbs` | 4 | `#6EE7B7`, `#A5B4FC` |
| `aurora-borealis-waves-2` | `waves` | 5 | `#6EE7B7`, `#A5B4FC` |
| `aurora-borealis-stars-3` | `stars` | 22 | `#6EE7B7`, `#A5B4FC` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 20% 10%, #10272E 0%, #06181C 78%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.65
  },
  "parallax": {
    "enabled": true,
    "pointer": 16,
    "scroll": 0.045
  },
  "accessibility": {
    "reducedMotion": "static",
    "showPauseButton": true
  },
  "layers": [
    {
      "id": "aurora-borealis-orbs-1",
      "kind": "orbs",
      "count": 4,
      "colors": [
        "#6EE7B7",
        "#A5B4FC"
      ],
      "opacity": 0.24,
      "size": {
        "min": 280,
        "max": 520
      },
      "duration": {
        "min": 32,
        "max": 58
      },
      "travel": {
        "x": 34,
        "y": -12
      },
      "position": {
        "x": -8,
        "y": -3
      },
      "blur": 54,
      "glow": 0,
      "rotation": 0,
      "depth": 0.6,
      "seed": 3001
    },
    {
      "id": "aurora-borealis-waves-2",
      "kind": "waves",
      "count": 5,
      "colors": [
        "#6EE7B7",
        "#A5B4FC"
      ],
      "opacity": 0.23,
      "size": {
        "min": 380,
        "max": 700
      },
      "duration": {
        "min": 37,
        "max": 65
      },
      "travel": {
        "x": 24,
        "y": 8
      },
      "position": {
        "x": -8,
        "y": 0
      },
      "blur": 0,
      "glow": 0,
      "rotation": -18,
      "depth": 1.4,
      "seed": 3020
    },
    {
      "id": "aurora-borealis-stars-3",
      "kind": "stars",
      "count": 22,
      "colors": [
        "#6EE7B7",
        "#A5B4FC"
      ],
      "opacity": 0.5,
      "size": {
        "min": 1,
        "max": 3
      },
      "duration": {
        "min": 42,
        "max": 72
      },
      "travel": {
        "x": 4,
        "y": -14
      },
      "position": {
        "x": -8,
        "y": 3
      },
      "blur": 0,
      "glow": 5,
      "rotation": 0,
      "depth": 0.35,
      "seed": 3039
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "aurora-borealis-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=aurora-borealis-dark`.
