# Changelog

All notable changes to Git Page Docs are documented here. Versions follow semver and count from the
0.0.1 baseline below.

## 0.0.2 - 2026-09-27 - encrypted CLI vault, chat auto-lock, provider hardening

### CLI (`@gitpagedocs/cli`)

- **API key never stored in plaintext.** `gitpagedocs ai` seals the key into the encrypted vault file
  `.gitpagedocsvault` (AES-256-GCM, key derived with PBKDF2-HMAC-SHA-256, 210k iterations) next to
  `.gitpagedocsconfig`, which now only records `"apiKeyEncrypted": true`. The vault password is created
  on first use and asked on every run of `gitpagedocs ai` and `gitpagedocs chat` that uses the stored
  key; `GITPAGEDOCS_VAULT_PASSWORD` supplies it for non-interactive runs. A legacy plaintext `apiKey`
  is migrated into the vault and removed from the file. `gitpagedocs config clear` deletes the vault too.
- Default models refreshed: `claude-sonnet-4-6` and `gemini-2.5-flash` (`gemini-2.5-pro` and
  `gemini-2.0-flash` stay selectable).
- `gitpagedocs docs` managed regions now list `chat [question]`, `config clear` and `docs`, and the
  security note documents both vaults.

### Frontend viewer

- **Inactivity auto-lock for the AI chat drawer.** New `site.AiChatAutoLockSeconds` in
  `gitpagedocs/config.json` (default `30`; `0` disables; invalid values fall back to `30`). Ten seconds
  before the limit a centered, focus-trapped, theme-aware and responsive modal shows a countdown in the
  selected language (pt *Salvar*/*Cancelar*, en *OK*/*Cancel*, es *Guardar*/*Cancelar*). Confirming, or
  letting the countdown finish, drops the session password: the keys stay encrypted in the vault and the
  password gate comes back. Activity in the drawer resets the timer; nothing locks while a reply streams.
- Provider/model select generated from the shared `PROVIDER_CATALOG` (aligned custom chevron,
  standardized 44px controls, theme tokens). A stored model id retired by its provider self-heals to the
  provider default (Ollama models are left untouched).
- Provider calls retry transient failures (HTTP 408/425/429/500/502/503/504) up to 3 attempts with
  exponential backoff; status-less errors are no longer reported as HTTP 500.
- Chat error messages lose the `[...]` brackets and end with *Try again!* / *Tente novamente!* /
  *¡Inténtalo de nuevo!* (`langmenu.aiChatRetryHint`).
- New `langmenu` keys `aiChatRetryHint`, `aiChatAutoLockTitle`, `aiChatAutoLockDesc`,
  `aiChatAutoLockConfirmBtn`, `aiChatAutoLockCancelBtn`; provider labels now read
  "Anthropic Claude (Sonnet 4.6)" and "Google Gemini (2.5 Flash)".

### Documentation

- Every Markdown file re-checked against the code: `.gitpagedocsconfig` + vault contract, auto-lock,
  the root scripts table, the CLI architecture tree, AUDIT validation commands and the version paths.
- Example URLs: the HTML-fullscreen sample was removed (this repository configures no `routes-html`)
  and the heading-anchor sample now points to an existing heading (`#prerequisites`).

## 0.0.1 - 2026-09-27 - first official stable release

### Versioning reset

The 1.1.x line (npm `1.1.44` to `1.1.71`, GitHub releases `v1.1.56` to `v1.1.67`) was the pre-stable
iteration of the project. `0.0.1` is the first official stable baseline and every later release counts
from it.

- **npm**: `@gitpagedocs/cli`, `@gitpagedocs/mcp` and `@gitpagedocs/tools` are published as `0.0.1` and
  the `latest` dist-tag points to it. The 1.1.x versions are marked deprecated with a pointer to the
  stable line; they stay installable for existing lockfiles because the npm registry only allows
  removing versions younger than 72 hours (or with fewer than 300 weekly downloads).
- **GitHub**: the 1.1.x releases and tags were removed. Their commits stay in the `main` history; the
  release `v0.0.1` is the only one.
- **Docs**: the published documentation lives under `gitpagedocs/docs/versions/0.0.1/`.

### What ships in 0.0.1

**CLI (`@gitpagedocs/cli`, binary `gitpagedocs`)**

- Generates the `gitpagedocs/` folder: `config.json` (site + VersionControl), `langs/<lang>.json` UI
  bundles, versioned docs (`docs/versions/<version>/`), `icon.svg`.
- Flags: `--build`, `--serve`, `--layoutconfig`, `--full`, `--push`, `--home`, `--search`, `--path`,
  plus `--owner/--repo` scaffolds for any repository.
- Commands: `docs` (AI documentation generator, 14 providers), `chat` (streaming terminal AI chat),
  `pages` (GitHub Pages workflow scaffold), `config` (prints the effective site config, languages and
  disabled languages), diagnostics (`update` check against the registry).
- AI credentials in `.gitpagedocsconfig` (OS config directory), encrypted; environment variables per
  provider as an alternative.
- Layouts migration and `layouts:sync` against the canonical `gitpagelayouts` catalog.

**Frontend viewer (Next.js static export for GitHub Pages)**

- Docs shell with Markdown, HTML, video, audio and source-viewer content types, version selector,
  language selector, theme selector with light/dark mode toggle (precedence: URL `theme`/`modetheme` >
  localStorage > repository `ThemeDefault` > default).
- Quick navigation (Ctrl+K), focus mode, linear previous/next navigation, route guide breadcrumb with
  table of contents, browse-all paging per content type.
- Fullscreen for any content, shareable through URL parameters (`mdfull`, `htmlfull`, `videofull`,
  `audiofull`).
- Authorized routes (password or key protected pages) and a documentation-wide password gate.
- AI chat drawer with an encrypted local key vault and the same 14 providers as the CLI.
- Background audio player with playlist popover, loop and restart controls, sequential playback and an
  exclusive playback arbiter (header radio and route audio never play together); captions track on
  native video and audio.
- Repository search home (open any public repository's docs), standalone source viewer (GitHub tree
  browser with VS Code grade highlighting via Shiki, markdown preview, deep links, and a back button
  beside the GitHub link that returns to the site keeping the current theme), introduction guide page.
- Theme-aware scrollbars, overlay desktop sidebar, fallback icons vendored for a small first load.

**MCP server (`@gitpagedocs/mcp`)**

- 20 tools and 7 resources exposing the documentation generator, configuration and AI surface to MCP
  clients; structured errors when no API key is configured.

**Shared core (`@gitpagedocs/tools`)**

- i18n: language bundles, `site.languages` toggles (`{ "en": true, "pt": true, "es": true }`), legacy
  `langs.json` fallback, baseline backfill for older configs.
- AI: provider catalog, registry and factory, SSE/NDJSON streaming, legacy provider adapter.
- Security: encrypted vault, web storage cache, browser security primitives.

**Languages**

- Portuguese, English and Spanish UI bundles; any language can be added through
  `gitpagedocs/langs/<lang>.json` and `site.languages`.

**Quality and automation**

- SonarQube: 0 issues, 0 security hotspots, 96.7% line coverage.
- 1,672 unit tests in 155 files (Vitest, jsdom for hooks and components), 14 Playwright E2E scenarios,
  smoke suites for the CLI, commands, flags, core, AI, security, MCP and docs, plus a baseline snapshot
  that keeps the generated artifacts byte-stable.
- Push to `main` deploys GitHub Pages and publishes the npm packages when the version changes; a manual
  workflow deprecates npm versions.
