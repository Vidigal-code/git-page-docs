# CLI reference

## CLI commands

| Command | Description |
|---------|--------------|
| `gitpagedocs` | Generate config and docs in `gitpagedocs/` |
| `gitpagedocs --layoutconfig` | Also generate local layouts/templates in `gitpagelayouts/` |
| `gitpagedocs --home` | Standalone distribution (`gitpagedocshome/`) |
| `gitpagedocs --push --owner X --repo Y` | Setup workflow, commit, push |
| `gitpagedocs --interactive` / `-i` | Interactive mode with prompts (the default in a terminal) |
| `gitpagedocs --no-interactive` / `--yes` / `-y` | Never prompt; use flags and defaults |
| `gitpagedocs ai` | Interactive AI documentation generator |
| `gitpagedocs chat [question]` | Streaming AI chat in the terminal (REPL on a TTY; one-shot with a question or piped stdin) |
| `gitpagedocs provider [id]` / `models [provider]` | List AI providers / catalog models |
| `gitpagedocs document[:repo\|:file\|:folder]` | Generate documentation with AI |
| `gitpagedocs deploy` / `pages [actions\|deploy]` | Configure GitHub Pages via Actions + push |
| `gitpagedocs docs` | Refresh README/CONTRIBUTING/SECURITY managed regions |
| `gitpagedocs password` | Set a documentation access password (public key in `site.docsAccess`) |
| `gitpagedocs config` / `config clear` | Show the resolved config / delete the stored config and key vault |
| `gitpagedocs doctor` / `version` / `update` | Diagnostics / version / registry update check |
| `gitpagedocs mcp start` | Start the MCP server over stdio |

Install globally with `npm install -g @gitpagedocs/cli`, or run one-off with `npx @gitpagedocs/cli`.

## CLI options

| Option | Description |
|--------|-------------|
| `--owner <user>` | GitHub owner |
| `--repo <repo>` | GitHub repository |
| `--path <subpath>` | Docs subpath (e.g. `docs`); without it, base path = repo name for correct CSS/JS on project sites |
| `--output <dir>` | Output directory (default: `gitpagedocs`) |
| `--search <true-or-false>` | Enable/disable repository search (`--home`) |
| `--layoutconfig` | Generate local layouts in `gitpagelayouts/` |
| `--layouts-dir <dir>` | Folder for local layouts (default: `gitpagelayouts`) |
| `--push` | Create workflow, commit artifacts, push |
| `--pages-actions` | Only switch GitHub Pages to GitHub Actions (same as `pages actions`) |
| `--home` | Generate `gitpagedocshome/` (static + .env + Dockerfile) |

## Generated output

- `gitpagedocs/config.json` – root config
- `gitpagedocs/icon.svg` – default icon
- `gitpagedocs/docs/versions/<ver>/config.json` – per-version routes
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md` – markdown docs
- `gitpagelayouts/` – only with `--layoutconfig` (folder configurable with `--layouts-dir`)

## Examples and command boundaries

```bash
npx gitpagedocs --no-interactive --owner octocat --repo handbook
npx gitpagedocs --layoutconfig --layouts-dir assets/layouts --no-interactive
npx gitpagedocs chat "Explain this project" --provider ollama --model llama3
npx gitpagedocs pages deploy --owner octocat --repo handbook --path docs
npx gitpagedocs mcp start
```

- `init` is an alias of generation. `providers` aliases `provider`; `--version` and `-v` alias `version`.
- `document`, `document:repo`, `document:file`, `document:folder` and `--ai` select the interactive documentation workflow. Select directories in its prompts; these aliases do not implement a separate positional file/folder API.
- `chat` accepts `--provider <id>`, `--model <id>` and `--system <prompt>`. With a question or piped stdin it answers once; an interactive terminal without a question starts a conversation.
- `--build`, `--serve` and `--full` are compatibility flags: the ordinary scaffold remains config-only and they do not start a local server.
- `--home` builds `frontend/` from a runtime checkout and writes the static export plus supporting files. Its output directory is recreated when it is not `.`; keep your source documentation outside that destination. Installing the CLI alone does not supply `frontend/`.
- `pages actions` only configures the Pages source; `pages deploy` and `--push` generate, commit and push. A printed URL does not mean the remote build has finished: check GitHub Actions.
- `update` checks npm and prints an installation command; it does not silently upgrade the CLI.

## Configuration and credentials

Site display settings are in `gitpagedocs/config.json`. The interactive generator/chat stores `.gitpagedocsconfig` and its encrypted `.gitpagedocsvault` in the per-user OS configuration directory: `%APPDATA%/gitpagedocs` on Windows, `~/Library/Application Support/gitpagedocs` on macOS, and the XDG config location on Linux. `config clear` removes those saved settings and the vault. MCP uses its own project-local `.gitpagedocs-mcp.json` plus process environment; see the MCP page.

`gitpagedocs docs` updates only marker-bounded regions of README.md, CONTRIBUTING.md and SECURITY.md, preserving surrounding prose. `password` configures the documentation access key pair; client-side presentation controls do not make public repository files confidential.

> Version: 0.0.12
