# GitHub Dark

GitHub-inspired dark theme

| Field | Value |
| --- | --- |
| Id | `github-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/github-dark.json`](../templates/github-dark.json) |
| Light/dark pairing | Paired light/dark group: `github-1` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#0D1117` |
| `primary` | `#58A6FF` |
| `secondary` | `#2EA043` |
| `text` | `#E6EDF3` |
| `textSecondary` | `#8B949E` |
| `cardBackground` | `#161B22` |
| `cardBorder` | `#30363D` |
| `error` | `#F85149` |
| `success` | `#3FB950` |

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
{ "site": { "ThemeDefault": "github-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=github-dark`.
