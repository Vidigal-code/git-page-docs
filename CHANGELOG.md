# Changelog

All notable changes to Git Page Docs are documented here. Versions follow semver and count from the
0.0.1 baseline below.

## 0.0.15 - 2026-10-22 - filesystem containment security fix

- Check both lexical and canonical filesystem paths before reading, listing or writing project files. Reject existing symlinks and junctions that resolve outside the project root, and skip unsafe linked files during search.
- Validate the nearest existing parent before creating directories and reject symbolic links at write destinations, including internal and dangling links. Preserve supported internal directory aliases, project-root aliases and ordinary filenames beginning with two dots.
- Make `update_documentation` create a new document only when the existing file is missing. Propagate containment and access errors before calling a provider or writing output.
- Add filesystem and MCP regression coverage for linked paths, directory creation, aliases and error handling. Document the boundary against concurrent path replacement and the separate configuration and provider-selection paths.
- Update the CLI, shared tools and MCP packages to 0.0.15. Register documentation versions 0.0.15 through 0.0.9, preserve older folders and synchronize the English, Portuguese and Spanish guides.
- Keep configuration recipe IDs, documentation versions and paths consistent with each retained documentation folder while preserving package installation commands and the version history.

## 0.0.14 - 2026-10-18 - paginated containers and Markdown markers

- Paginate Markdown, HTML, video, audio and PDF files inside individual containers with ordered route references and localized titles/descriptions. Configure shared defaults through `site.containerPagination` and override them per route; the default is four icon controls and a page counter below the content, aligned right.
- Keep each container's selection independent. Switch Markdown files in focus mode without closing it, reset to the first section, update source actions and find available files through Ctrl+K. Preserve route access checks and exclusive media playback.
- Keep Ctrl+K input and keyboard selection responsive while the documentation page renders, so pressing Enter immediately after typing opens the filtered result.
- Add `markdownMarkers` for text phrases or Markdown elements, with localized labels, repeated-match selection, theme colors and enablement controls. Every valid marker highlights its target and adds a scrolling index link; `RouteGuideSpeciFicbrand` remains the separate heading filter, including all headings when empty.
- Preserve Unicode text, unique targets across repeated Markdown blocks, focus-mode highlights and the original source used by copy/download. Report invalid marker settings without adding broken index links.
- Preserve the selected theme and control colors across language/version changes, loading states and refreshed catalogs. Apply the correct light/dark color scheme before hydration.
- Group Previous, Next and Back to top in that order with matching alignment and 12px gaps. Configure `site.documentNavigation.position` as `left`, `center` or `right`, defaulting to `center`; keep the existing conditional back-to-top visibility. Set breadcrumb spacing to 12px above and below.
- Overlap introduction-guide chapter transitions to prevent empty stages between chapters while preserving native scrolling.
- Stage supported native audio/video files alongside PDFs during development and builds. Resolve local assets under deployment subpaths and remote media through repository raw-file URLs.
- Include a five-type pagination example with localized HTML, local WAV tracks and a PDF reference. Add complete pagination and Markdown-marker guides in English, Portuguese and Spanish, with 35 Markdown pages per language.
- Update the CLI, shared tools and MCP packages to 0.0.14. Register documentation versions 0.0.14 through 0.0.9, preserve older folders and synchronize generated configuration and package references.

## 0.0.13 - 2026-10-18 - reading controls and retained documentation versions

- Narrate only the visible section in focus mode. Stop the previous speech when changing sections or documents and when entering or leaving focus mode, while preserving voice, speed and volume preferences. Disabling section navigation keeps the whole document visible and available for narration.
- Show a back-to-top arrow on long documentation pages and the introduction guide. Configure visibility with `site.backToTop.enabled` and the minimum page height with `site.backToTop.minPageHeightViewports`, which defaults to three viewport heights.
- Apply the active theme to the native voice selector and its options while preserving browser keyboard behavior.
- Register every documentation version from 0.0.9 through 0.0.13 in descending order, with localized configuration and reading guides. Preserve older folders and the existing PDF guide.
- Correct the project overview to describe the current catalog of 124 themes and synchronize the generated documentation in English, Portuguese and Spanish.

## 0.0.12 - 2026-10-18 - animated themes and configurable playback controls

- Expand the theme catalog from 64 to 124 entries with 20 standalone animated presets and 20 additional parallax families, each with dark and light variants. Preserve the existing themes and native light/dark pairing.
- Configure layered stars, streaks, Matrix characters, orbs, grids and waves through JSON, including colors, density, timing, opacity and pointer/scroll depth. Compile the same presets into the official catalog and standalone CLI data.
- Move background pause/resume into the navigation menu beside its lock and into search-page headers. Keep a manual pause across menu and theme changes, respect reduced motion and hidden tabs, and support configurable icon or localized-text controls.
- Add a configurable version-selector icon with a text override, accessible selector labels and a tooltip showing the selected version.
- Remove the circular background and shadow from the chat title icon while retaining its configured size and theme color. Load the configured translation icon consistently.
- Reduce breadcrumb spacing to 4px above and below the trail while preserving responsive alignment and navigable ancestors.
- Add a development-only local-catalog preview and matching syntax-highlighting themes for all new layouts.
- Write newly generated CLI documentation to the current package version while preserving explicit version selection in the documentation writer.
- Refresh English package guides, configuration references and the changelog; keep Portuguese and Spanish documentation synchronized. Clarify MCP credentials, context limits and shared configuration exports.
- Ship documentation versions 0.0.12, 0.0.11 and 0.0.10 together while retaining older folders and the existing English PDF guide.

## 0.0.11 - 2026-10-17 - composable pages and themed controls

- Open parent menu sections as Markdown documents while keeping their expand/collapse controls separate. Add eight overview pages and navigable breadcrumb ancestors; breadcrumb navigation does not open the sidebar automatically.
- Compose one page from ordered, repeatable Markdown, HTML, video, audio and PDF blocks. Include a twelve-block example and a complete configuration guide in English, Portuguese and Spanish.
- Read authorized Markdown blocks together in focus mode, with ordered source copying/downloading and distinct heading anchors.
- Configure the placement and before/after position of route titles and descriptions independently. Markdown labels stay outside the document.
- Show the DOOM player's native controls without duplicate introductory content or a custom loading button.
- Apply consistent theme colors and responsive alignment to selectors, with updated descriptive icons, including translation and pencil controls.
- Apply configured video audio settings when the player is ready, correcting YouTube's stored mute state once while preserving later user changes.
- Make the Ctrl+K results list 24 pixels shorter and close selection dialogs with Escape without closing their surrounding panel.
- Correct Portuguese and Spanish accents in interface labels and documentation, including localized version badges.
- Ship updated documentation versions 0.0.11 and 0.0.10 together. Preserve older version folders and the existing English PDF guide.

## 0.0.10 - 2026-10-17 - reading controls and HTML examples

- Use React Icons by default for language, theme, focus mode and Ctrl+K controls, with independent text overrides.
- Customize PDF download and new-tab actions as text or icons through `site.icons.PdfDownload` and `site.icons.PdfOpenInNewTab`.
- Use configurable left/right arrow icons for document-footer navigation, with independent translated-text overrides.
- Add first/previous/next/last controls for both documents and sections in focus mode.
- Keep narration controls synchronized with native pause/resume events and retain keyboard focus while playback changes state.
- Improve narration controls and focus navigation on narrow screens while keeping the reader's header and navigation visible.
- Preserve UTF-8 site names, Markdown headings and table-of-contents labels, including JSON and Markdown files with a BOM.
- Open validated PDF bytes in the browser's native viewer through an `application/pdf` Blob URL. Reuse loaded bytes, load on demand when preview is disabled and report file, network and pop-up errors.
- Make navigation scrollbars follow the active theme.
- Update the English project guide and documentation in English, Portuguese and Spanish while retaining versions 0.0.8 and 0.0.9.
- Organize the generated menu into real nested sections and add complete configuration recipes, migration, troubleshooting and contributing/testing guides in all three languages.
- Include a localized HTML DOOM example loaded on demand, matching HTML routes and menus, a complete HTML-container guide and an English README configuration example.
- Publish the CLI, shared tools and MCP packages as 0.0.10.

## 0.0.9 - 2026-10-17 - configurable reading, navigation and PDF docs

- Configure language, theme, focus mode and quick-navigation controls as text or React Icons, with custom icons, sizes and light/dark colors. Existing configurations retain their text controls and keyboard shortcuts.
- Organize documentation with recursive menus, expandable categories and an optional flat presentation. Configure breadcrumbs at the site, version or Markdown-route level.
- Copy or download the complete Markdown document from focus mode. Move between sections and accessible documents while keeping the reading dialog open, or disable individual controls. Disabling section navigation displays the full document.
- Read Markdown aloud with native browser voices, speed and volume controls, and pause, resume and stop actions. Narration shares media playback coordination with audio and video and cancels when the document changes.
- Add PDF routes and menus with native previews, downloads and new-tab actions configured per site or document. Ship an English project guide with the CLI and publish PDF references in English, Portuguese and Spanish.
- Expand English, Portuguese and Spanish documentation with dedicated configuration, CLI, MCP, navigation, focus, accessibility, deployment, architecture, themes and troubleshooting pages. The MCP reference covers all 20 tools and 7 resources.
- Update the CLI, shared tools and MCP packages to 0.0.9 while retaining the existing 0.0.8 documentation files.

## 0.0.8 - 2026-09-29 - one sound at a time, GitHub test video, docs in sync with the code

### Media playback

- One sound at a time (`site.mediaExclusivePlayback`, default `true` in `gitpagedocs/config.json`):
  playing a route video pauses the header radio and the audio tracks, and playing either of those
  pauses the video. YouTube is followed through the official IFrame Player API, Vimeo through its
  player `postMessage` protocol, native files (`mp4`, `webm`, …) through the media element, and any
  other embed through focus moving into the player.
- `"muted": true` in a route's `video` object plays only the picture and keeps that video out of the
  rule, so it can run while the radio or an audio track explains it.

### Docs

- The Introduction to Git page shows GitHub's "A brief introduction to Git for beginners" in a video
  container above its markdown; video route 11 is open to every visitor, so the Video menu section
  is always visible.
- README, frontend README, CONTRIBUTING and the generated pages reflect the current code: 64 layout
  themes, Node 20+ / pnpm 10, `pages actions` / `pages deploy` / `--pages-actions`, a "Video routes"
  and a "Media playback" section, and the full command table in every language.

### Quality

- Content containers share one frame, media card and header text helpers; the route builders share
  their defaults (generated config unchanged). SonarQube: 0 issues, 0.0% duplication.
- The introduction guide E2E spec runs on a second, repository-search dev server instead of being
  skipped (58 E2E checks, none skipped).

## 0.0.7 - 2026-09-28 - back-to-top arrow beside the guide, site name "Git Page Docs"

### Introduction guide

- A "back to top" arrow sits beside the guide, never in a row of its own. On wide screens it lives in
  the right margin, travels with the reader and stops level with the last section's content; on
  narrower screens it floats at the bottom-right corner while the guide is on screen. It is the same
  40px badge as the section icons, named "Back to top" (en/pt/es, `backToTop`) for screen readers
  and as its tooltip, scrolls smoothly to the hero (instantly with reduced motion) and moves keyboard
  focus there.
- Section spacing, icon size and action height are single tokens on the guide page
  (`--guide-section-space`, `--guide-icon-size`, `--guide-action-size`).

### Site name

- The default site name is now "Git Page Docs" (was "Git Pages Docs") in the generator defaults, the
  site baseline and the header fallback.

## 0.0.6 - 2026-09-28 - introduction guide scroll story, hero motion, contrast and hydration fixes

### Introduction guide scroll story

- `/introduction-guide` opens with a scroll-driven tour: the page pins a stage while you scroll and plays
  one chapter per section, with a large outlined numeral, a balanced headline, the lead, the first
  paragraph and up to four highlights (list items, table keys or commands) moving at different depths.
- A progress bar, a `01 / 10` counter and a chapter rail show where you are; the rail jumps to any
  chapter and a skip link goes straight to the full guide below.
- Every chapter stays in the document for readers and search. With reduced motion the tour still
  crossfades but nothing moves. New `storyLabel`, `storySkip`, `storyScrollHint` and `storyChaptersLabel` strings in
  en/pt/es.

### Introduction guide hero motion

- The hero now enters with a staggered focus-in: each row sharpens from a soft blur one after another
  and the title's letters rise into place. While the hero scrolls away, every row drifts at its own
  depth (eyebrow least, actions most) and the block fades. The title stays one heading for screen
  readers.
- The tour's numeral zooms from near to far between chapters, the highlights cascade at increasing
  depths, and on desktop the numeral has its own row above the headline so it never covers text.
  Chapter titles size to their column, so long words such as "Configuração" never break mid-word.

### Introduction guide layout

- The hero fills the first screen (content centred), so the tour always starts below the fold instead
  of leaving a half-empty stage with a lone counter under the hero.
- The tour pins just below the sticky header, centres each chapter and scales its type with the
  viewport height as well as the width, so a pinned chapter fills the screen. On phones the number
  stacks above the title (it no longer sits behind the text), the repeated "01 / 10" label is gone,
  and the paragraph is trimmed to a few lines instead of hidden.
- Short screens (landscape phones, split windows) get the tour as a plain stacked list, so nothing is
  clipped. Checked at 320x640 up to 1920x1080 with no horizontal scroll.

### Fixed

- Opening a page with `?theme=` after the theme catalogue was cached logged a React hydration error: the
  theme preload script paints the cached palette on `<html>` before hydration, so its inline style
  differs from the server HTML by design. The root `<html>` now sets `suppressHydrationWarning`, which
  covers only that element's own attributes. An E2E test reloads with a cached theme and asserts no
  hydration error.
- The hero's two calls to action did not match: the primary button did not inherit the page font and
  used the page background as its text colour. Both now share one style (font, 46px height, padding,
  focus ring) with spring hover and press feedback.
- With the system "reduce motion" setting on, the hero logged a hydration error: its buttons dropped
  the hover and tap gestures for those visitors, and the tap gesture adds `tabindex`, so the browser
  markup differed from the static HTML. The hero, reveal and tour now render the same markup for
  everyone. Reduced motion keeps the fades and crossfades (the hero focuses in, the tour stays pinned
  and crossfades chapters) and drops only movement: parallax travel, lifts and zooms.
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
