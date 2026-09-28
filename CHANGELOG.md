# Changelog

All notable changes to Git Page Docs are documented here. Versions follow semver and count from the
0.0.1 baseline below.

## Unreleased

### Introduction guide scroll story

- `/introduction-guide` opens with a scroll-driven tour: the page pins a stage while you scroll and plays
  one chapter per section, with a large outlined numeral, a balanced headline, the lead, the first
  paragraph and up to four highlights (list items, table keys or commands) moving at different depths.
- A progress bar, a `01 / 10` counter and a chapter rail show where you are; the rail jumps to any
  chapter and a skip link goes straight to the full guide below.
- Every chapter stays in the document for readers and search. With reduced motion the tour renders as a
  static list. New `storyLabel`, `storySkip`, `storyScrollHint` and `storyChaptersLabel` strings in
  en/pt/es.

### Introduction guide hero motion

- The hero now enters with a staggered focus-in: each row sharpens from a soft blur one after another
  and the title's letters rise into place. While the hero scrolls away, every row drifts at its own
  depth (eyebrow least, actions most) and the block fades. The title stays one heading for screen
  readers.
- The tour's numeral zooms from near to far between chapters, the highlights cascade at increasing
  depths, and on desktop the numeral has its own row above the headline so it never covers text.
  Chapter titles size to their column, so long words such as "Configuração" never break mid-word.

### Fixed

- Opening a page with `?theme=` after the theme catalogue was cached logged a React hydration error: the
  theme preload script paints the cached palette on `<html>` before hydration, so its inline style
  differs from the server HTML by design. The root `<html>` now sets `suppressHydrationWarning`, which
  covers only that element's own attributes. An E2E test reloads with a cached theme and asserts no
  hydration error.
- The hero's two calls to action did not match: the primary button did not inherit the page font and
  used the page background as its text colour. Both now share one style (font, 46px height, padding,
  focus ring) with spring hover and press feedback.
- The tour's "skip the tour" link showed on top of the hero buttons; it is now hidden until it gets
  keyboard focus.
- `--primary-foreground` now picks whichever of white or near-black has the higher WCAG contrast on
  the theme's primary. The old fixed luminance cutoff put white text on mid-tone primaries such as
  emerald (3.8:1); they now get near-black (5.5:1).

## 0.0.5 - 2026-09-27 - markdown copy/download on the published site

### Fixed

- The copy and download buttons beside the fullscreen button did not appear on the published site: the
  remote docs loader (used on GitHub Pages and by the prebuilt viewer shipped in `@gitpagedocs/cli`)
  rendered the markdown to HTML and dropped the original text the buttons need. It now reads each file
  once and keeps the original text (`sourceByLanguage`) next to the HTML, like the local loader.

## 0.0.4 - 2026-09-27 - AI chat guide, markdown actions, compact config, layouts v2, guide motion

### Compact gitpagedocs config (no repeated values)

- `gitpagedocs/config.json` stores the header icons as `site.icons` (`defaults` + one entry per icon
  with its `tag` and differences) instead of 279 flat `Icon*` keys: 16 KB -> 5.4 KB.
- Version configs store the settings every route shares once in `routeDefaults`: 26.5 KB -> 18.5 KB
  for the shipped version.
- New browser-safe `@gitpagedocs/tools/config-format` (`compactSiteIcons` / `expandSiteIcons`,
  `factorRouteDefaults` / `applyRouteDefaults`): the generator compacts on write, the viewer expands in
  `withConfigDefaults` and in both version-config readers, and the site baseline stays flat. Flat
  0.0.x configs keep working; a flat key or a value on a route wins over the compact form. Round-trip
  tests guard that expanding a compacted config gives back exactly the original.

### Introduction guide motion

- `/introduction-guide` gains scroll motion built with Motion for React (`motion` 13, `LazyMotion` +
  `domAnimation` + `m.*` components to keep the bundle small): a parallax backdrop of three glows
  tinted with the active theme's primary/secondary colours (so every layout, light or dark, matches),
  hero content that drifts up and fades as it scrolls away, and sections that fade in the first time
  they enter the viewport. All tuning lives in `model/motion-config.ts`.
- Reduced motion is honoured end to end (`MotionConfig reducedMotion="user"`, zero parallax travel,
  instant reveals) while keeping the same markup as the static render, so hydration never leaves
  content hidden. New E2E spec `e2e/introduction-guide.spec.ts` covers three themes, desktop and
  mobile, horizontal overflow and reduced motion (it skips where the route is disabled, i.e. without
  `GITPAGEDOCS_REPOSITORY_SEARCH=true`).

### Removed: pre-0.0.1 compatibility

0.0.1 is the first official release; data and configs from 0.0.1 on keep working, and the shims for
the earlier 1.1.x formats are gone:

- The `gitpagedocs/langs.json` language manifest (1.1.68): languages come only from `site.languages`.
  `loadLanguageBundles` loads exactly the languages it is given; `LANGS_MANIFEST_FILENAME`,
  `DEFAULT_LANGS_MANIFEST_PATH`, `parseLanguageManifest` and `LanguageManifest` are no longer exported
  by `@gitpagedocs/tools/i18n`, and `languageArtifactPaths()` has no `legacyManifest`.
- The `<outputDir>/layouts/` layouts folder: the viewer reads only `gitpagelayouts/` (or a configured
  path), the old official URL is gone, and the CLI's interactive layouts migration was removed.
- The plaintext browser key `gitpagedocs_ai_key` and its migration into the vault (`aiStorage` keeps only
  the provider choice; `migratePlaintextKey` left `@gitpagedocs/tools/security`). `useAiChat` takes an
  options object with a required `resolveCredentials`.
- The repo-root `.gitpagedocsconfig` migration: the CLI reads the config only from the per-user config
  directory (`AiConfigFileRepository` has no `cwd` / `onMigrate` options any more). The 0.0.1 plaintext
  `apiKey` is still sealed into the vault on first read.
- Generator clean-ups for `docs/<lang>/` root folders and `source-viewer` HTML snapshots.

### Quality

- SonarQube fixes: warning badge contrast (new `--warning` / `--warning-foreground` theme tokens), a
  backtracking regex in the markdown file-name slug (now `\p{M}` plus split/join), the deprecated
  `document.execCommand` copy fallback (Clipboard API only) and the copy status announced through
  `<output>`. The chat guide sections are data-driven (`INFO_SECTIONS`) instead of a five-argument
  helper with flag parameters.
- `AGENTS.md` describes this repository's contributor workflow: TDD, the validation commands,
  SonarQube per changed file and how generated artifacts are refreshed.

### Frontend viewer

- **"How to use and risks" guide in the AI chat.** A new exclamation-mark button in the drawer header
  opens a tab (available even before a password exists) that explains in pt, en and es how the
  assistant works (local password, encrypted vault, per-request decryption, locking), how to use it,
  everything that can happen in the flow (wrong or forgotten password, inactivity lock with the
  configured seconds, retries, invalid key, retired model, Ollama/CORS, offline, cleared browser data)
  and the risks the user takes (key visible in DevTools during use, Gemini key in the URL, weak
  passwords, shared computers, extensions, data sent to the provider, billing, wrong answers). Copy lives
  in the new `langmenu` keys `aiChatInfo*` (items one per line).
- **Copy and download on markdown pages.** Two buttons beside the fullscreen button copy the page's
  original `.md` text to the clipboard (with a "Copied!" confirmation) or download it as a `.md` file,
  in the language being read. The loader now keeps the original file text next to the rendered HTML
  (`sourceByLanguage`), reading each file once. New icons `FiCopy`, `FiDownload`, `FiCheck` and
  `langmenu` keys `mdCopyLabel`, `mdCopiedLabel`, `mdCopyErrorLabel`, `mdDownloadLabel` in
  `gitpagedocs/langs/{pt,en,es}.json`.

### Layouts

- **De-duplicated layout source (`gitpagelayouts/v2/`).** Each of the 64 layouts used to repeat the
  same typography, component sizes, dark/light defaults and palette-derived control colours in its
  template (3,392 values, 132 KB). The source of truth is now `v2/base.json` (shared values, per-mode
  defaults and palette rules such as `"1px solid {cardBorder}"` / `"{primary|0.7}"`) plus one small
  `v2/layouts/<id>.json` per layout with only identity, colours and overrides (30 KB; only the two
  `duet` layouts need overrides). `pnpm run layouts:sync` expands them into the unchanged
  `templates/<id>.json` format, so viewers and remote consumers are not affected; a test fails if the
  committed templates drift from `v2/`. The expansion also fixes the 29 light layouts whose button
  hover glow was still the generic violet: it now follows each palette's primary colour.

- **Select and button controls follow each layout's palette.** The 62 layout templates that carried
  the generic slate values (`#0F172A` / `#FFFFFF` background, `#334155` / `#E2E8F0` border, cyan and
  violet hover/focus colours) now derive `components.select` and `components.button` from their own
  `cardBackground`, `cardBorder` and `primary`, so the dropdown panel (language, theme and AI provider
  pickers) matches the theme instead of showing a navy box on a green or amber layout. `duet-dark` and
  `duet-light`, which define their own controls, are untouched. `gitpagedocs --layoutconfig` generates
  the same palette-derived controls, and the viewer's built-in fallbacks now point at
  `var(--card-background)` / `var(--card-border)` instead of fixed colours.

## 0.0.3 - 2026-09-27 - themed provider picker and palette-derived contrast

### Frontend viewer

- **Provider picker standardized.** The AI chat drawer's provider/model control is now the shared
  theme-aware `DropdownSelector` (the same control as the language and theme selectors) instead of a
  native `<select>`, whose open list ignored dark themes. Every option reads `Provider · Model`
  (`OpenAI · GPT-4o mini`, `Anthropic Claude · Sonnet 4.6`, `Google Gemini · 2.5 Flash`,
  `Ollama · Llama 3`); model names come from the catalog and provider names from the `langmenu`
  keys `aiChatProviderOpenAI` / `Claude` / `Gemini` / `Ollama`, which now hold plain provider names
  (a legacy `"OpenAI (GPT-4o-mini)"` value keeps only the name).
- **Readable primary buttons on every theme.** New palette-derived tokens `--primary-foreground`
  (near-black on light primaries such as `carbon-dark` and `duet-dark`, white on deep tones) and
  `--color-scheme` (layout `mode`, else background luminance) are emitted by the theme CSS-variable
  builder and mirrored onto `<html>`; the drawer buttons, the inactivity-lock dialog and the shell's
  external-link button use `--primary-foreground`, and native controls follow `color-scheme`.
- The "Configure AI" title gradient now uses the theme's primary/secondary colours.

### Shared core (`@gitpagedocs/tools`)

- `PROVIDER_CATALOG` models of OpenAI, Anthropic, Gemini and Ollama carry a human-readable
  `label` (`ModelDescriptor.label`); ids are unchanged.

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
