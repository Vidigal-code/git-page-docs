# Duet Dark

Polarity-flipped ink duet: white pill controls and flat elevated cards on black

| Field | Value |
| --- | --- |
| Id | `duet-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/duet-dark.json`](../templates/duet-dark.json) |
| Light/dark pairing | Paired light/dark group: `duet-1` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#000000` |
| `primary` | `#FFFFFF` |
| `secondary` | `#AFAFAF` |
| `text` | `#FFFFFF` |
| `textSecondary` | `#AFAFAF` |
| `cardBackground` | `#282828` |
| `cardBorder` | `#4B4B4B` |
| `error` | `#FFFFFF` |
| `success` | `#FFFFFF` |

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
{ "site": { "ThemeDefault": "duet-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=duet-dark`.
