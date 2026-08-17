# GitHub Light

GitHub-inspired light theme

| Field | Value |
| --- | --- |
| Id | `github-light` |
| Mode | `light` |
| Author | Kauan Vidigal |
| Template | [`templates/github-light.json`](../templates/github-light.json) |
| Light/dark pairing | Paired light/dark group: `github-1` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#FFFFFF` |
| `primary` | `#0969DA` |
| `secondary` | `#1A7F37` |
| `text` | `#1F2328` |
| `textSecondary` | `#57606A` |
| `cardBackground` | `#FFFFFF` |
| `cardBorder` | `#D0D7DE` |
| `error` | `#D1242F` |
| `success` | `#1A7F37` |

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
{ "site": { "ThemeDefault": "github-light" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=github-light`.
