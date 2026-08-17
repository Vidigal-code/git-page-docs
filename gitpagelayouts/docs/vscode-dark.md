# VSCode Dark

Visual Studio Code Dark+ theme with editor blue accents

| Field | Value |
| --- | --- |
| Id | `vscode-dark` |
| Mode | `dark` |
| Author | Kauan Vidigal |
| Template | [`templates/vscode-dark.json`](../templates/vscode-dark.json) |
| Light/dark pairing | Paired light/dark group: `vscode-1` |

## Colors

| Token | Value |
| --- | --- |
| `background` | `#1E1E1E` |
| `primary` | `#007ACC` |
| `secondary` | `#4EC9B0` |
| `text` | `#D4D4D4` |
| `textSecondary` | `#858585` |
| `cardBackground` | `#252526` |
| `cardBorder` | `#3C3C3C` |
| `error` | `#F14C4C` |
| `success` | `#4EC9B0` |

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
{ "site": { "ThemeDefault": "vscode-dark" } }
```

Or preview it on any Git Page Docs site via the URL parameter `?theme=vscode-dark`.
