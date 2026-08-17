# Mono Pro Dark

Minimal dark theme with lime accent and high readability

| Field | Value |
| --- | --- |
| Id | `mono-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/mono-dark.json`](../templates/mono-dark.json) |
| Light/dark pairing | Paired light/dark group: `mono-1` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#0B0F0C` |
| `primary` | `#A3E635` |
| `secondary` | `#65A30D` |
| `text` | `#ECFCCB` |
| `textSecondary` | `#BEF264` |
| `cardBackground` | `#141A16` |
| `cardBorder` | `#365314` |
| `error` | `#F87171` |
| `success` | `#84CC16` |

## Typography

- Font family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif`

| Size token | Value |
| --- | --- |
| `small` | `0.875rem` |
| `base` | `1rem` |
| `medium` | `1.125rem` |
| `large` | `1.25rem` |
| `xlarge` | `2rem` |

## Usage

Set it as the default theme in `gitpagedocs/config.json`:

```json
{ "site": { "ThemeDefault": "mono-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=mono-dark`.
