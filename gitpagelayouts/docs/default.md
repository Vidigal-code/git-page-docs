# Default Theme

Clean and minimal default theme

| Field | Value |
| --- | --- |
| Id | `default` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/default.json`](../templates/default.json) |
| Light/dark pairing | Standalone (single mode) |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#FFFFFF` |
| `primary` | `#0EA5E9` |
| `secondary` | `#2563EB` |
| `text` | `#0F172A` |
| `textSecondary` | `#334155` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#E2E8F0` |
| `error` | `#DC2626` |
| `success` | `#16A34A` |

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
{ "site": { "ThemeDefault": "default" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=default`.
