# Git Page Docs — Frontend

The Next.js 15 App Router viewer for `git-page-docs` renders versioned, multilingual documentation with 124 themes, an in-docs **AI chat drawer** and a standalone **`/ai` console**. GitHub Pages builds export plain HTML and static assets. The stack uses React 19, TypeScript 5.9 and Motion 13.

> This README covers the **frontend package only**. For the whole monorepo (CLI, MCP server, shared `tools/` core, deploy) see the [root README](../README.md).

## Where it lives

The app lives in `frontend/` but is **built from the repository root** so the docs loaders can resolve `gitpagedocs/` via `process.cwd()`:

```bash
# from the repo root
pnpm dev                 # → next dev frontend with the repository-search home (http://localhost:3000)
pnpm dev:e2e             # → next dev frontend opening the local docs directly (what Playwright runs)
pnpm build               # generate gitpagedocs/ + next build frontend
pnpm exec cross-env GITHUB_ACTIONS=true GITHUB_REPOSITORY=OWNER/REPO next build frontend
                         # Pages export: frontend/out/ (the workflow moves it to out/)
```

Keep `cwd` at the repository root, where `gitpagedocs/` lives. A normal production build uses the Next.js runtime; `GITHUB_ACTIONS=true` enables `output: "export"` and writes `frontend/out/` with the repository base path.

## Structure (Feature-Sliced Design)

```text
frontend/
|-- package.json              # @gitpagedocs/frontend (private) — declares next/react/… deps
|-- next.config.ts            # output:export, basePath logic, transpilePackages
|-- tsconfig.json             # extends ../tsconfig.base.json (@/* → ./src/*)
|-- public/                   # static assets, robots.txt, sitemap.xml (export-safe)
|-- .env / .env.example       # GITPAGEDOCS_REPOSITORY_SEARCH, GITPAGEDOCS_PATH
`-- src/
    |-- app/                  # App Router: [[...repo]] catch-all, /ai, /introduction-guide, /source-viewer, layout, not-found
    |-- page-slices/          # page compositions: docs-route, introduction-guide, source-viewer
    |-- widgets/              # docs-shell, ai-chat-drawer (+ inactivity-lock-dialog), repository-source-browser,
    |                         #   search-shell-header, search-shell-layout, not-found-shell
    |-- features/             # ask-ai, ai-console, audio-player, video-playback, docs-access, route-authorization, route-guide,
    |                         #   language/theme/version selectors, quick-navigation, repository-search-form,
    |                         #   source-viewer-link, source-viewer-search, source-code-highlight, …
    |-- entities/             # docs (config/content/embed/layouts/theme), source-viewer
    `-- shared/               # ui (dropdown-selector, selection-dialog, confirm-popup, …), lib (media-playback, …), config, api
```

FSD import direction is enforced by the root `eslint.config.mjs` (`app → page-slices → widgets → features → entities → shared`).

## AI surfaces

Two independent surfaces share the same encrypted vault from `@gitpagedocs/tools`:

- **`/ai` console** (`src/app/ai`, `src/features/ai-console`) — full-page provider/model selection + chat.
- **Chat drawer** (`src/widgets/ai-chat-drawer`, `src/features/ask-ai`) — opens over the docs.

Both are gated by a **local password**: it creates/unlocks an AES-256-GCM vault (`src/shared/lib/ai-secure-storage.ts` → `EncryptedCredentialVault`), keys are stored encrypted in `localStorage` (`gitpagedocs:vault`) and decrypted only in-session. The chat itself runs through the shared 14-provider AI core, so the service layer never reads keys from storage — credentials are injected per request.

**Inactivity auto-lock (drawer).** `useInactivityLock` (`src/features/ask-ai/model/inactivity-lock.ts`) watches pointer/key/wheel/touch activity while the drawer is open and unlocked. `site.AiChatAutoLockSeconds` from `gitpagedocs/config.json` (default `30`, `0` disables, invalid → `30`) sets the idle limit; 10 seconds before it, `InactivityLockDialog` (`src/widgets/ai-chat-drawer/ui/inactivity-lock-dialog.tsx`) opens centered over the drawer with a live countdown, focus trap (Tab/Shift+Tab/Escape), `aria-modal`, theme tokens and phone-width layout. Cancel keeps the session; confirm or the countdown reaching zero drops the in-memory password (`lockVault`), so the vault stays encrypted and the password gate returns. Labels come from `langmenu` (`aiChatAutoLockTitle`, `aiChatAutoLockDesc` with `{seconds}`, `aiChatAutoLockConfirmBtn`, `aiChatAutoLockCancelBtn`).

**Providers.** `src/shared/config/ai-config.ts` derives the drawer's provider/model options from `PROVIDER_CATALOG` (`@gitpagedocs/tools/ai`), so the picker uses the bundled model list and a stored model absent from that list is normalized to the provider default (`normalizeProviderAndModel`; Ollama models pass through). The catalog is not a live provider-availability check. Options are labelled `Provider · Model` (provider name from `langmenu`, model name from the catalog's `ModelDescriptor.label`), and `ApiKeyForm` renders them through the shared `DropdownSelector` (the language/theme control) rather than a native `<select>`, whose popup ignores the theme.

**Theme tokens derived from the palette.** `entities/docs/lib/theme/to-css-vars.ts` emits, besides the layout colours, `--primary-foreground` (near-black on a light primary, white on a deep one, from WCAG luminance) and `--color-scheme` (the layout's `mode`, else read off the background) so primary buttons stay readable on every theme and native controls follow light/dark. `useDocumentThemeVars` mirrors them onto `<html>`, where `globals.css` applies `color-scheme: var(--color-scheme)`. `SharedLlmService` retries a whole failed attempt on transient statuses (408/425/429/500/502/503/504, `api/retry-policy.ts`, 3 attempts, exponential backoff) and keeps status-less errors status-less (no fake 500). Error messages rendered in the chat have no brackets and end with the `aiChatRetryHint` label ("Try again!").

## Documentation access gate

When `site.docsAccess.enabled` is set in `gitpagedocs/config.json` (via the `gitpagedocs password` CLI command), the whole documentation is blocked behind a full-page gate (`src/features/docs-access`). Visitors unlock with the **password or the private key**, verified against the stored public key with `verifyDocAccess` from `@gitpagedocs/tools/crypto/web` (double-hash SHA-256). The unlock is cached in `localStorage` (only the public hash), and a lock button in the sidebar re-blocks by clearing it. All gate/chat strings come from the language bundles (the `gitpagedocs/langs/<lang>.json` files that `site.languages` in `config.json` enables, folded into `site.langmenu` by `localizeConfig`; legacy inline `langmenu` still works).

## Theme backgrounds and introduction guide motion

The catalog contains 64 original themes, 20 standalone animated presets and 20 additional families with both light and dark variants. All 84 earlier entries retain their appearance. Paired entries share `supportsLightAndDarkModesReference`; the existing mode toggle resolves the matching entry by reference and mode.

`entities/docs` validates optional template `backgroundEffects` and merges `site.backgroundEffects.overrides` followed by `themes[themeId]`. Nested settings merge; `layers` replaces the array. The global `enabled: false` switch always disables the background. `features/theme-background` renders six seeded primitives with Motion: stars, streaks, Matrix characters, orbs, grids and waves. The shell loads the renderer dynamically when an active background needs it.

The shell owns playback state so a manual pause persists across theme changes and menu expansion. Its pause/resume control sits beside the navigation lock in the docs sidebar, collapsed rail and mobile menu; search pages place it in the header. `overrides.accessibility.showPauseButton` defaults to `true`; setting it to `false` hides the control without disabling the effect. `site.icons.BackgroundAnimationPause` and `BackgroundAnimationResume` support the usual icon/text, tag, size and theme-color settings. Reduced motion and hidden tabs suspend movement, including opacity and parallax; effects and listeners are cleaned up on unmount.

`/introduction-guide` (repository-search builds only) uses Motion for React (`motion`) through `src/page-slices/introduction-guide/ui/motion/`:

- `GuideMotionProvider` wraps the page in `MotionConfig reducedMotion="user"` and `LazyMotion features={domAnimation} strict`, so only the lightweight `m.*` components ship.
- When the active theme has no configured background, `GuideParallaxBackdrop` draws three blurred glows tinted with `--primary` / `--secondary`. A configured theme background replaces this decorative backdrop so its pause control governs all background motion. The hero content still drifts and fades as it leaves the viewport; `GuideReveal` fades each section in once with `whileInView`.
- Every distance, duration and easing lives in `model/motion-config.ts`. Markup and props never depend on `useReducedMotion` (the static render cannot know the preference; even a gesture prop such as `whileTap` adds `tabindex`, so dropping it breaks hydration). Reduced motion is handled by `MotionConfig reducedMotion="user"`, which skips transforms but keeps opacity and filter, plus parallax travel mapped to 0.

- `GuideHero` enters with Motion variants: rows focus in with a stagger, and the title splits into grapheme glyphs (`model/hero-motion.ts`) that rise in while a visually hidden copy keeps the heading readable as one name. Each row drifts at its own `HERO_PARALLAX.depthPx` as the hero scrolls away.
- `GuideStory` (`ui/story/`) is a scroll-driven tour placed before the full guide. The section is one viewport tall per chapter and a sticky stage plays one chapter per slice of the page's own scroll (wheel, touch, keyboard and scrollbar keep working). Each chapter's numeral, headline and details move at different depths; the keyframes come from `chapterTimeline` in `model/story.ts` and run through function-form `useTransform` with `interpolate`, because the range form hands opacity to the native scroll timeline, which left the first chapter half visible. Adjacent chapters crossfade across overlapping scroll windows, keeping the stage visible at every boundary. A rail jumps to any chapter, a skip link goes straight to the full guide, and with reduced motion the tour still crossfades while CSS pins every layer in place.

## Media playback

`shared/lib/media-playback` holds the page-wide playback arbiter: every player registers a `pause`
and calls `claim` before it starts, which pauses all the others. The radio and the audio tracks
(`features/audio-player`) and the route videos (`features/video-playback`) use it, so with
`site.mediaExclusivePlayback` (default `true`) only one of them sounds at a time.

Native Web Speech narration participates in the same coordination: starting narration pauses other audible media, and starting another source stops narration. Voice, rate and volume controls are shared between the document and its focus view while mounted. Narration starts only after a user action and depends on voices available through the browser.

`features/video-playback` picks a controller per source (`resolveVideoProvider`): the official YouTube
IFrame Player API attached to the existing iframe (`enablejsapi=1&origin=…`; it falls back to the
generic rule if the script cannot load), the Vimeo player `postMessage` protocol, the native media
`play` event, or, for any other embed, focus moving into the iframe (paused by reloading it).
`useVideoPlayback` wires the controller to the arbiter and rebuilds it when the source changes; the
page origin comes from `usePageOrigin`, empty in the static render so the exported markup stays
stable. A route video with `video.muted: true` starts without sound and stays out of the rule.

## Documents, navigation and containers

Version configs support Markdown, HTML, video, audio, source-viewer and PDF routes. `pages[].blocks` composes ordered, repeatable Markdown/HTML/video/audio/PDF blocks into one destination; each block references an existing route. Recursive `submenus` can have their own Markdown destination, with a title link and separate expand control. Breadcrumb ancestors navigate to those parent documents; their compact spacing leaves 0.75rem (12px at the default font size) above and below the trail.

`site.documentNavigation.position` groups Previous, Next and Back to top at the document footer. It accepts `left`, `center` or `right`, defaulting to `center` for omitted or invalid values. The group retains its order and alignment on desktop and mobile. `site.backToTop` independently controls whether the top arrow appears on a long page; the introduction-guide arrow keeps its existing position.

Routes for Markdown, HTML, video, audio and PDF can define ordered `pagination.items` referencing routes of the same type. Each container selects its own file without changing the page URL. `site.containerPagination` defaults to bottom/right icon controls for first, previous, next and last plus a current/total count; route options override enablement, placement, alignment, appearance, labels and individual controls. Focus mode keeps Markdown file pagination available, and Ctrl+K can open available items in their owner container. The generated page 50 demonstrates all five types; `container-pagination.md` documents the contract.

`routes-md[].markdownMarkers` selects visible text or Markdown elements and always combines a theme-aware highlight with a scrolling index link. Configure exact `text` or scoped CSS `selector`, unique `id`, one-based `occurrence`, localized `label`, enablement and color overrides. Shared defaults live in `site.markdownMarkers`. The heading filter `RouteGuideSpeciFicbrand` remains independent, with an empty array including all headings. Repeated Markdown blocks receive unique targets; copy/download retains the original source. See the generated `markdown-markers.md` reference.

The native focus dialog supports Markdown source copy/download and first/previous/next/last navigation for both documents and sections. Authorized Markdown blocks from a composed page remain readable in order. PDF preview, download and new-tab actions fetch and validate PDF bytes and use an `application/pdf` Blob; external files need CORS, and browser viewer/pop-up capabilities still apply. Local PDFs and supported native audio/video files under `gitpagedocs/` are staged into public assets during dev/build, respecting the deployment subpath. Remote repository loaders resolve native media against raw-file URLs.

Language, theme, version, focus, Ctrl+K, PDF actions and footer navigation support `site.icons` configuration. `VersionSelector` defaults to `LuGitBranch`; `reactIcon: false` shows the selected version text. It is hidden for zero/one unique version. The selector keeps a localized accessible name; its tooltip includes the selected version. The chat title icon has no circular background or shadow and retains its configured size and theme color.

## Environment

`.env` (frontend-local; copy from `.env.example`):

| Variable | Purpose |
| --- | --- |
| `GITPAGEDOCS_REPOSITORY_SEARCH` | `true` shows the repo-search home; `false` opens docs directly (typical local dev) |
| `GITPAGEDOCS_PATH` | Optional base subpath for local dev (e.g. `localhost:3000/<path>`) |
| `GITPAGEDOCS_LAYOUTS_SOURCE` | `local` previews this checkout's layout catalog only in development; unset/other values and production follow JSON layout configuration |

On GitHub Pages (`GITHUB_ACTIONS=true`) the runtime enables Pages behavior and base-path handling automatically.

## Testing

End-to-end specs live in the repo-root `e2e/`. Playwright starts two dev servers: `pnpm dev:e2e` (local docs mode, on `PORT`) for the docs shell specs, and `pnpm dev:e2e:guide` (repository-search mode, on `PORT + 1`, build folder `frontend/.next-guide`) for the introduction guide, which only exists in repository-search builds. The `desktop`/`mobile` projects run against the first, `guide-desktop`/`guide-mobile` against the second.

```bash
# from the repo root
pnpm run test:e2e                   # all projects
PORT=3100 pnpm run test:e2e         # ports 3100 and 3101 when 3000 is taken
```

- `e2e/ai-console.spec.ts` and `e2e/ai-chat-drawer.spec.ts` verify the password gate, encrypted persistence (no plaintext key in `localStorage`), and reload behavior.
- `e2e/docs.spec.ts` checks the docs home renders with no horizontal overflow.
- `e2e/audio-playback.spec.ts` covers the audio route's centered fullscreen view and the mutual exclusion between the route player and the header radio.
- `e2e/media-playback.spec.ts` plays the YouTube route video over the header radio and back (needs network access to youtube.com).
- `e2e/introduction-guide.spec.ts` checks the guide's backdrop, reveal and layout across light, dark and white-primary themes.
- `e2e/animated-themes.spec.ts` covers the catalog, light/dark pairing, theme backgrounds, pause/resume, reduced motion and narrow screens.
- `e2e/ai-chat-title-icon.spec.ts` checks the transparent chat title icon in light/dark themes and desktop/mobile layouts.

## Static export notes

- Pages builds use `output: "export"`, without a server runtime; `images.unoptimized` is required and respected.
- SEO files are **static** (`public/robots.txt`, `public/sitemap.xml`) — dynamic `app/robots.ts`/`sitemap.ts` routes break `output: export`.
- The deployed site shape and public URLs are documented in the [root README](../README.md#url-routes-and-query-parameters).
