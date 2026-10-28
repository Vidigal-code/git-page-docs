# @gitpagedocs/cli

The **published npm package** of the [Git Page Docs](../README.md) monorepo (the command it installs is `gitpagedocs`). It scaffolds the `gitpagedocs/` docs contract, generates docs with AI, configures GitHub Pages, and runs the MCP server.

```bash
npm install -g @gitpagedocs/cli   # global (installs the `gitpagedocs` command)
gitpagedocs                       # generate gitpagedocs/ config (config-only)

# or one-off, no install:
npx @gitpagedocs/cli
```

> This package ships its TypeScript sources and runs them via `tsx`; it depends on the workspace packages `@gitpagedocs/tools` and `@gitpagedocs/mcp` (published alongside it).

## Commands

| Command | Description |
|---|---|
| `gitpagedocs` | Generate `gitpagedocs/` config + versioned docs (config-only) |
| `gitpagedocs --layoutconfig` | Also emit local layout templates in `gitpagelayouts/` |
| `gitpagedocs --layouts-dir <dir>` | Folder for local layouts (default: `gitpagelayouts`) |
| `gitpagedocs --no-interactive` / `-y` | Never prompt; use flags and defaults |
| `gitpagedocs --push --owner <o> --repo <r> [--path <sub>]` | Generate, configure Pages, create workflow, commit + push |
| `gitpagedocs --home` | Standalone distribution (`gitpagedocshome/`: static site + .env + Dockerfile) |
| `gitpagedocs -i` / `--interactive` | Interactive prompts |
| `gitpagedocs ai` | Interactive AI documentation generator — writes pages in the gitpagedocs pattern (see below) |
| `gitpagedocs chat [question]` | Streaming AI chat in the terminal — REPL on a TTY, one-shot with a question or piped stdin; `--provider`, `--model`, `--system` (see below) |
| `gitpagedocs provider [id]` · `models [provider]` | List AI providers / catalog models |
| `gitpagedocs document[:repo\|:file\|:folder]` | Generate documentation with AI in the gitpagedocs pattern |
| `gitpagedocs password` | Set a documentation access password (writes the public key to `config.json`, prints the private key) |
| `gitpagedocs deploy` / `pages deploy` | Configure GitHub Pages via Actions, generate, commit and push |
| `gitpagedocs pages actions` | Switch the repository's Pages source to GitHub Actions; no generation or push |
| `gitpagedocs docs` | Refresh managed regions of README/CONTRIBUTING/SECURITY |
| `gitpagedocs config clear` | Delete the stored `.gitpagedocsconfig` **and** the encrypted key vault `.gitpagedocsvault` (wipes saved AI credentials) |
| `gitpagedocs doctor` · `version` · `update` | Diagnostics / version / registry update check |
| `gitpagedocs mcp start` | Start the MCP server over stdio |

The AI-CLI implementation lives in `cli/ai/` (relocated from the frontend so the published package is self-contained).

## Generated documentation and themes

Version 0.0.16 registers documentation versions 0.0.16, 0.0.15, 0.0.14, 0.0.13, 0.0.12, 0.0.11, 0.0.10 and 0.0.9, newest first, with English, Portuguese and Spanish pages. Existing older folders are preserved. Source content lives in `content/`; defaults and UI labels live in `data/`; edit these sources before regeneration. The published package includes the English PDF guide and the local HTML integration for the externally hosted DOOM player.

The scaffold includes independent file pagination for Markdown, HTML, video, audio and PDF in page 50, with two localized HTML samples, local WAV tracks and a PDF reference. Configure shared controls in `site.containerPagination` and each sequence in its route's `pagination.items`. The generated pagination and Markdown markers guides explain defaults, route overrides, focus/search integration and theme-aware highlights linked from the document index. `RouteGuideSpeciFicbrand` keeps its existing heading-filter behavior.

The scaffold demonstrates parent Markdown destinations with recursive submenus and navigable breadcrumbs, PDF routes/actions, and a page with ordered, repeated Markdown/HTML/video/audio/PDF blocks. Route titles and descriptions have independent placement settings. Focus mode provides source actions and eight document/section navigation controls; browser narration is configured separately. See the generated configuration, content-blocks, focus, accessibility and HTML/PDF guides for complete examples.

`gitpagedocs --layoutconfig` ships all 124 themes: 64 original themes, 20 standalone animated presets and 20 additional dark/light parallax pairs. New presets originate in `gitpagelayouts/v2/` and are compiled into package-local data by `pnpm run layouts:sync`; a standalone CLI installation does not need the source repository to emit them. Customize backgrounds through `site.backgroundEffects`, including global/per-theme settings, colors, density, speed and parallax. The master switch disables backgrounds; `overrides.accessibility.showPauseButton: false` hides only the pause control.

`site.icons.VersionSelector` and `BackgroundAnimationPause`/`BackgroundAnimationResume` use the same `reactIcon`, `tag`, `size`, `colorDark` and `colorLight` contract as other controls. Pause/resume appears in the navigation menu beside its lock; a manual pause persists across theme and menu changes. `reactIcon: false` selects localized text independently for each control.

The [MCP reference](../mcp/README.md) documents installation, client configuration, all 20 tools and seven resources. MCP runs over stdio and reads provider credentials from its environment; it does not automatically unlock the CLI vault.

## Packaging and release

Root and frontend workspaces are private. The public packages are `@gitpagedocs/tools`, `@gitpagedocs/mcp` and `@gitpagedocs/cli`; their versions, internal ranges and lockfile must agree. The npm workflow checks a new CLI version, installs with a frozen lockfile, runs typecheck and contract self-tests, then publishes the workspaces. GitHub Pages builds the viewer in its separate workflow. Neither workflow creates GitHub release notes or tags automatically.

The package allowlist includes its source, templates, data and assets. `prebuilt/` is optional and is not created by the npm workflow. The config-only command generates repository data without starting a server. Run the full project checks and inspect package contents before publication; verify the published package and deployed site afterward.

# CLI Architecture (Clean Architecture + SOLID)

## Layer Overview

```
cli/
|-- index.mjs                          # Node entry (bootstraps TS presentation via tsx)
|-- package.json                       # the published `gitpagedocs` package
|-- ai/                                # AI CLI: docs generator + terminal chat
|   |-- application/                   # run-ai-cli-command, resolve-chat-credentials, ai-credentials (seal/unseal), vault-password
|   |-- infrastructure/                # ai-config-file (.gitpagedocsconfig), ai-key-vault (.gitpagedocsvault), file-system-adapter, version-docs-writer
|   |-- core/                          # chat-session, config models + parser
|   `-- presentation/                  # @clack prompts (ai-prompts, vault-prompts)
|-- contracts/                         # Stable contracts for external tooling
|   `-- doc-versions.mjs
|
|-- presentation/                      # Interface/composition root
|   |-- index.ts
|   |-- commands/                      # chat, config-clear, config-info, docs, pages, password, mcp, diagnostics, ai-info
|   |-- options/
|   `-- ui/
|
|-- application/                       # Use-cases and ports
|   |-- config-only/handler.mjs
|   |-- home/handler.mjs
|   |-- report/config-only-reporter.mjs
|   |-- use-cases/dispatch-mode.ts
|   `-- ports/cli-runtime-ports.ts
|
|-- domain/                            # Business rules
|   `-- services/sanitize-segment.mjs
|
|-- infrastructure/                    # Side effects and adapters
|   |-- config-only/runtime.mjs
|   `-- home/runtime.mjs
|
|-- builders/                          # Pure config builders
|-- data/                              # Constants and metadata
|-- content/                           # Static docs content
|-- runtime/                           # Low-level runtime helpers
`-- home/                              # Home templates/files
```

## SOLID Principles

| Principle | Application |
|-----------|-------------|
| **SRP** | `application/report` only formats messages; handlers only orchestrate |
| **OCP** | New runtime implementations can be injected through ports |
| **LSP** | `dispatch-mode` works with any runner implementing `CliCommandRunner` |
| **ISP** | Split runtime contracts (`ConfigOnlyRuntimePort`, `HomeRuntimePort`) |
| **DIP** | Use-cases depend on `application/ports`, not concrete fs/git/exec |

## Clean Architecture

- **Interfaces/Presentation**: parse CLI args, resolve mode, wire dependencies in `presentation/index.ts`
- **Application**: orchestrate flows with explicit ports, without direct fs/git/exec imports
- **Domain**: sanitize and core rules with no infrastructure dependencies
- **Infrastructure**: concrete adapters for runtime side effects
- **Contracts**: `tools/smoke` consumes `cli/contracts` instead of internal CLI modules

## Authorized Routes Pipeline

The CLI now generates authorized-route docs and config entries in PT/EN/ES.

- Source content: `cli/content/docs.mjs` (`authorizedRoutes` key per language)
- Route metadata: `cli/data/route-metas.mjs` (`ROUTE_META_ID6`)
- Route path mapping: `cli/data/path-mappings.mjs` (`authorized-routes.md`)
- Version config composition: `cli/builders/version-config-builder.mjs`
- Doc key resolution: `cli/runtime/doc-path-resolver.mjs`

Generated artifacts include:

- `gitpagedocs/docs/versions/<version>/config.json` with `auth` and route `authorization`
- `gitpagedocs/docs/versions/<version>/{pt,en,es}/authorized-routes.md`
- `menus-header-md` entry dedicated to Authorized Routes

## GitHub Pages Push Paths

- Default project-site publish (`--push` without `--path`) targets `/<repo>/`.
- Custom project subpath publish (`--push --path <segment>`) targets `/<repo>/<segment>/`.
- `--path` accepts a single sanitized segment (letters, numbers, `.`, `_`, `-`).

Example:

```bash
npx @gitpagedocs/cli --owner vidigal-code --repo energy-bill-ai-parser --path git-docs --push
```

Expected URL after deployment:

```text
https://vidigal-code.github.io/energy-bill-ai-parser/git-docs/
```

## AI CLI (interactive + config file)

The CLI now includes a dedicated interactive AI mode:

```bash
npx @gitpagedocs/cli ai
```

### What it does

- asks for a provider from the shared catalog (14 providers, including OpenAI, Anthropic, Gemini and Ollama)
- asks API key or Ollama URL
- asks paths to scan (supports one or many paths, including other repositories)
- generates documentation in `pt`, `en`, `es` **in the gitpagedocs pattern**
- optionally persists config in `.gitpagedocsconfig`, sealing the API key in the encrypted
  vault `.gitpagedocsvault` (vault password created on first use, asked on every run)

### gitpagedocs pattern output

The model is given a gitpagedocs-aware system prompt and returns documentation split into
pages (delimited by `=== PAGE: <slug> | <Title> ===`). The CLI scaffolds the base
`gitpagedocs/` structure first, then writes each page to
`gitpagedocs/docs/versions/<latest>/<lang>/<slug>.md` for every language and **wires it into
that version's `config.json`** (`routes-md` + `menus-header-md`) so the pages render in the
viewer menu. Entries are tagged `aiGenerated` and idempotent (re-running replaces them). A
later plain `gitpagedocs` rebuild drops the wiring — re-run `gitpagedocs ai` to restore.

### `.gitpagedocsconfig` (manual mode)

The file lives in the per-user OS config directory (never inside the repository, so
the API key cannot be committed by accident) and is written with owner-only
permissions on POSIX systems:

- Windows: `%APPDATA%\gitpagedocs\.gitpagedocsconfig`
- macOS: `~/Library/Application Support/gitpagedocs/.gitpagedocsconfig`
- Linux: `$XDG_CONFIG_HOME/gitpagedocs/.gitpagedocsconfig` (or `~/.config/gitpagedocs/.gitpagedocsconfig`)

Set `GITPAGEDOCS_CONFIG_DIR` to override the directory; delete the stored file,
the vault and their credentials with `gitpagedocs config clear`. This example describes
a saved configuration whose key already exists in the encrypted vault. Edit its non-secret
settings and then run `npx @gitpagedocs/cli ai`. For a new installation, run the interactive
setup first; if no key exists, decline reuse of the configuration and enter the credentials.

```json
{
	"version": 1,
	"ai": {
		"provider": "openai",
		"apiKeyEncrypted": true,
		"paths": ["src", "cli", "../another-repo/src"],
		"languages": ["pt", "en", "es"],
		"outputDir": "gitpagedocs/docs",
		"filePrefix": "ai-generated",
		"contextPrompt": "Write clear technical documentation for this project."
	}
}
```

**The API key is not in this file.** Saving a configuration seals the key into the
encrypted vault `.gitpagedocsvault` in the same directory (`cli/ai/infrastructure/ai-key-vault.ts`
over `EncryptedCredentialVault` + `FileVaultStorage` from `@gitpagedocs/tools`: AES-256-GCM, key
derived from your password with PBKDF2-HMAC-SHA-256, 210k iterations) and the config only keeps
`"apiKeyEncrypted": true`.

- The **vault password is created on first use** (typed twice, at least 4 characters) and
  **asked on every run** of `gitpagedocs ai` / `gitpagedocs chat` that uses the stored key
  (3 attempts, then the run aborts with `Vault password rejected`).
- `GITPAGEDOCS_VAULT_PASSWORD` supplies the password without a prompt (CI, pipes, no TTY);
  on a first run it initializes the vault, otherwise it must match the existing one.
- A plaintext `"apiKey"` written by 0.0.1 is sealed into the vault and removed from the file
  when `ai` or `chat` reuses that configuration and unlocks it with the vault password.
- If you hand-write the file, leave the key out: enter it in the `gitpagedocs ai` prompt (it is
  sealed on save). `gitpagedocs chat` can also read the provider's environment variable
  (`gitpagedocs provider <id>` lists it) when no key is stored.

For Ollama, use `baseUrl` instead of an API key (no vault involved).

### `gitpagedocs chat`

```bash
gitpagedocs chat                                  # REPL on a TTY: /clear · /help · /exit (or Ctrl+C twice)
gitpagedocs chat "what does cli/ai do?"           # one-shot answer, then exit
git diff | gitpagedocs chat "review this diff"    # piped stdin is appended to the question
gitpagedocs chat --provider gemini --model gemini-2.5-pro --system "Answer in Portuguese" "..."
```

Credentials are resolved in this order: `--provider`/`--model` flags, the stored
`.gitpagedocsconfig` (its key is decrypted after the vault password prompt, or from
`GITPAGEDOCS_VAULT_PASSWORD`), then the provider's environment variable. Output streams to
stdout while status lines go to stderr, so the answer can be piped.

### Interactive fallback

If a directory is not found, CLI offers fallback choices:

- fix paths and retry
- skip missing paths and continue
- abort safely
