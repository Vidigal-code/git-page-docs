# Duet Light

Black-and-white editorial duet: pill controls, flat 16px cards, ink footer band

| Field | Value |
| --- | --- |
| Id | `duet-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/duet-light.json`](../templates/duet-light.json) |
| Light/dark pairing | Paired light/dark group: `duet-1` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#FFFFFF` |
| `primary` | `#000000` |
| `secondary` | `#5E5E5E` |
| `text` | `#000000` |
| `textSecondary` | `#5E5E5E` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#E2E2E2` |
| `error` | `#000000` |
| `success` | `#000000` |

## Typography

- Font family: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`

| Size token | Value |
| --- | --- |
| `small` | `0.875rem` |
| `base` | `1rem` |
| `medium` | `1.125rem` |
| `large` | `1.5rem` |
| `xlarge` | `2.25rem` |

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "duet-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=duet-light`.
