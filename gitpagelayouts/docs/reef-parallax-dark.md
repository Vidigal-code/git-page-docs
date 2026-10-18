# Reef Parallax

Ocean currents, coral light and layered underwater depth

| Field | Value |
| --- | --- |
| Id | `reef-parallax-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/reef-parallax-dark.json`](../templates/reef-parallax-dark.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#031C20` |
| `primary` | `#2DD4BF` |
| `secondary` | `#FDA4AF` |
| `text` | `#EAF2FF` |
| `textSecondary` | `#A7B9CE` |
| `cardBackground` | `#0A3035` |
| `cardBorder` | `#246069` |
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
| `waves-1` | `waves` | 3 | `#2DD4BF`, `#FDA4AF` |
| `orbs-2` | `orbs` | 4 | `#2DD4BF`, `#FDA4AF` |

### Editable preset

The following object is the template's top-level `backgroundEffects`. Customize it in your local template, or use `site.backgroundEffects.overrides` and `site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`. Nested settings merge; a supplied `layers` array replaces all layers. Set `site.backgroundEffects.enabled` to `false` to disable every background.

```json
{
  "enabled": true,
  "surface": "radial-gradient(ellipse at 15% 0%, #0A3035 0%, #031C20 70%)",
  "opacity": 1,
  "animation": {
    "enabled": true,
    "speed": 0.9
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
        "#2DD4BF",
        "#FDA4AF"
      ],
      "seed": 2665
    },
    {
      "id": "orbs-2",
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
        "#2DD4BF",
        "#FDA4AF"
      ],
      "seed": 2682
    }
  ]
}
```

`count`, `colors`, `size`, `duration` and `opacity` control density, appearance and timing. `animation.speed` multiplies movement speed; `parallax.pointer` uses pixels and `parallax.scroll` uses a scroll ratio. Set both `animation.enabled` and `parallax.enabled` to `false` for a static composition. Keep the pause button available for moving backgrounds.

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "reef-parallax-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=reef-parallax-dark`.
