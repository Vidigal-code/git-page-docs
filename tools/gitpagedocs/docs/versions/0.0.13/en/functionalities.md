# Functionalities

Complete reference of CLI options, configuration keys, and runtime features.

## Command line

See **CLI reference** for all commands, flags, examples and compatibility behavior. See **MCP server** for editor integration.

## Content types

| Type | Config key | Description |
|------|------------|-------------|
| Markdown | `routes-md` | .md files with `path` per language |
| HTML | `routes-html` | local `path` or external `url` |
| Video | `routes-video` | `video.pathVideo`, `video.videoType` |
| Audio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |
| PDF | `routes-pdf` | `pdf.pathPdf` per language; native preview and download |

## Source code viewer

The version config can render a **Source code** container through `routes-source-viewer` and `menus-header-source-viewer`. The viewer reads GitHub repository trees at runtime and applies the current documentation theme.

- Repository tree from `source-viewer-path`; branch defaults to `main`
- Folder navigation and file filtering
- GitHub-style directory listing
- Code rendering with line numbers
- Markdown preview/code toggle, including `README.md`
- Collapsible folders in the sidebar

## Config keys (site)

- `name`, `defaultLanguage`
- `docsVersion`, `rendering`, `ThemeDefault`, `ThemeModeDefault`
- `ProjectLink`, `layoutsConfigPathOficial`, `layoutsConfigPath`
- Languages: `site.languages` (enable/disable each one); UI strings: `gitpagedocs/langs/<lang>.json`

## Media playback (one sound at a time)

`site.mediaExclusivePlayback` (default `true`): playing a route video pauses the radio and the audio tracks, and playing the radio or an audio track pauses the video. It works with YouTube and Vimeo (through their player APIs), native files (`mp4`, `webm`, …) and any other embed.

To show a video without sound while the radio or an audio track explains it, set `"muted": true` in that route's `video` object: the video plays only the picture and stays out of the rule. `"mediaExclusivePlayback": false` turns the rule off for the whole site.

## Environment variables

- `GITPAGEDOCS_REPOSITORY_SEARCH` – repository search (local)
- `GITHUB_ACTIONS` – GitHub Pages build mode

## AI assistant

The docs ship an AI assistant in two surfaces: an in-docs **chat drawer** (the AI chat button in the sidebar, enabled via `site.AiChatEnabled`) and a dedicated **`/ai` console** page.

- **14 providers** via one shared core: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure OpenAI, Mistral, DeepSeek, Cohere, Groq, xAI, Together, Fireworks, Perplexity.
- **Model selection** — pick from each provider's catalog (`gitpagedocs models <provider>`); a stored model id the provider has retired is replaced by the provider default automatically.
- **Encrypted at rest** — your API key is sealed with AES-256-GCM behind a **local password** and is never stored in plaintext or logged.
- **Inactivity auto-lock** — the chat drawer locks itself after `site.AiChatAutoLockSeconds` idle seconds (default 30, `0` disables): a centered countdown modal in your language lets you cancel or lock now, and unlocking asks for the password again.
- **Resilient providers** — transient provider errors are retried (3 attempts) and a final failure is a plain message ending with "Try again!".
- **AI documentation generation** — `gitpagedocs ai` scans chosen paths and writes multilingual markdown (pt/en/es); reusable via `.gitpagedocsconfig`, whose API key lives sealed in the encrypted `.gitpagedocsvault` (the vault password is asked on every run). `gitpagedocs chat` brings the same assistant to the terminal.

## MCP server

`gitpagedocs mcp start` runs a Model Context Protocol server (stdio) exposing **20 tools** (filesystem, AI, doc generation/analysis) and **7 resources** (`project://structure|docs|config|repository|readme|ai/providers|ai/models`) for editors and AI agents.

> Version: 0.0.13
