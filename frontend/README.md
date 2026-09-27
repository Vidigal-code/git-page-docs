# Git Page Docs — Frontend

The Next.js 15 (App Router) documentation viewer for `git-page-docs`. It renders multi-version, multi-language docs with a 36-theme layout system, an in-docs **AI chat drawer**, and a standalone **`/ai` console** — and static-exports to plain HTML for GitHub Pages.

> This README covers the **frontend package only**. For the whole monorepo (CLI, MCP server, shared `tools/` core, deploy) see the [root README](../README.md).

## Where it lives

The app lives in `frontend/` but is **built from the repository root** so the docs loaders can resolve `gitpagedocs/` via `process.cwd()`:

```bash
# from the repo root
pnpm dev                 # → next dev frontend   (http://localhost:3000)
pnpm build               # generate gitpagedocs/ + next build frontend
next build frontend      # produces frontend/out/  (the Pages workflow then moves it to out/)
```

`next build frontend` keeps `cwd` = repo root (where `gitpagedocs/` lives) and emits the static export to `frontend/out/`.

## Structure (Feature-Sliced Design)

```text
frontend/
|-- package.json              # @gitpagedocs/frontend (private) — declares next/react/… deps
|-- next.config.ts            # output:export, basePath logic, transpilePackages
|-- tsconfig.json             # extends ../tsconfig.base.json (@/* → ./src/*)
|-- public/                   # static assets, robots.txt, sitemap.xml (export-safe)
|-- .env / .env.example       # GITPAGEDOCS_REPOSITORY_SEARCH, GITPAGEDOCS_PATH
`-- src/
    |-- app/                  # App Router: [[...repo]] catch-all, /ai, layout, not-found
    |-- widgets/              # docs-shell, ai-chat-drawer (+ inactivity-lock-dialog)
    |-- features/             # ask-ai (chat, retry-policy, inactivity-lock), ai-console, route-authorization
    |-- entities/            # docs (config/content/io/layouts), ai-config
    `-- shared/               # ui, lib (ai-storage, ai-secure-storage, base-path), config, icons
```

FSD import direction is enforced by the root `eslint.config.mjs` (`app → widgets → features → entities → shared`).

## AI surfaces

Two independent surfaces share the same encrypted vault from `@gitpagedocs/tools`:

- **`/ai` console** (`src/app/ai`, `src/features/ai-console`) — full-page provider/model selection + chat.
- **Chat drawer** (`src/widgets/ai-chat-drawer`, `src/features/ask-ai`) — opens over the docs.

Both are gated by a **local password**: it creates/unlocks an AES-256-GCM vault (`src/shared/lib/ai-secure-storage.ts` → `EncryptedCredentialVault`), keys are stored encrypted in `localStorage` (`gitpagedocs:vault`) and decrypted only in-session. The chat itself runs through the shared 14-provider AI core, so the service layer never reads keys from storage — credentials are injected per request.

**Inactivity auto-lock (drawer).** `useInactivityLock` (`src/features/ask-ai/model/inactivity-lock.ts`) watches pointer/key/wheel/touch activity while the drawer is open and unlocked. `site.AiChatAutoLockSeconds` from `gitpagedocs/config.json` (default `30`, `0` disables, invalid → `30`) sets the idle limit; 10 seconds before it, `InactivityLockDialog` (`src/widgets/ai-chat-drawer/ui/inactivity-lock-dialog.tsx`) opens centered over the drawer with a live countdown, focus trap (Tab/Shift+Tab/Escape), `aria-modal`, theme tokens and phone-width layout. Cancel keeps the session; confirm or the countdown reaching zero drops the in-memory password (`lockVault`), so the vault stays encrypted and the password gate returns. Labels come from `langmenu` (`aiChatAutoLockTitle`, `aiChatAutoLockDesc` with `{seconds}`, `aiChatAutoLockConfirmBtn`, `aiChatAutoLockCancelBtn`).

**Providers.** `src/shared/config/ai-config.ts` derives the drawer's provider/model options from `PROVIDER_CATALOG` (`@gitpagedocs/tools/ai`), so the picker never offers a retired model id and a stored one is self-healed to the provider default (`normalizeProviderAndModel`; Ollama models pass through). Options are labelled `Provider · Model` (provider name from `langmenu`, model name from the catalog's `ModelDescriptor.label`), and `ApiKeyForm` renders them through the shared `DropdownSelector` (the language/theme control) rather than a native `<select>`, whose popup ignores the theme.

**Theme tokens derived from the palette.** `entities/docs/lib/theme/to-css-vars.ts` emits, besides the layout colours, `--primary-foreground` (near-black on a light primary, white on a deep one, from WCAG luminance) and `--color-scheme` (the layout's `mode`, else read off the background) so primary buttons stay readable on every theme and native controls follow light/dark. `useDocumentThemeVars` mirrors them onto `<html>`, where `globals.css` applies `color-scheme: var(--color-scheme)`. `SharedLlmService` retries a whole failed attempt on transient statuses (408/425/429/500/502/503/504, `api/retry-policy.ts`, 3 attempts, exponential backoff) and keeps status-less errors status-less (no fake 500). Error messages rendered in the chat have no brackets and end with the `aiChatRetryHint` label ("Try again!").

## Documentation access gate

When `site.docsAccess.enabled` is set in `gitpagedocs/config.json` (via the `gitpagedocs password` CLI command), the whole documentation is blocked behind a full-page gate (`src/features/docs-access`). Visitors unlock with the **password or the private key**, verified against the stored public key with `verifyDocAccess` from `@gitpagedocs/tools/crypto/web` (double-hash SHA-256). The unlock is cached in `localStorage` (only the public hash), and a lock button in the sidebar re-blocks by clearing it. All gate/chat strings come from the language bundles (the `gitpagedocs/langs/<lang>.json` files that `site.languages` in `config.json` enables, folded into `site.langmenu` by `localizeConfig`; legacy inline `langmenu` still works).

## Introduction guide motion

`/introduction-guide` (repository-search builds only) uses Motion for React (`motion`) through `src/page-slices/introduction-guide/ui/motion/`:

- `GuideMotionProvider` wraps the page in `MotionConfig reducedMotion="user"` and `LazyMotion features={domAnimation} strict`, so only the lightweight `m.*` components ship.
- `GuideParallaxBackdrop` draws three blurred glows tinted with `--primary` / `--secondary` (every theme matches) that drift at different speeds with `useScroll` + `useTransform`; the hero content drifts and fades as it leaves the viewport; `GuideReveal` fades each section in once with `whileInView`.
- Every distance, duration and easing lives in `model/motion-config.ts`. Reduced motion maps travel to 0 and makes reveals instant without changing the markup, because the static render cannot know the visitor's preference and a different element would keep the server's hidden style after hydration.

## Environment

`.env` (frontend-local; copy from `.env.example`):

| Variable | Purpose |
| --- | --- |
| `GITPAGEDOCS_REPOSITORY_SEARCH` | `true` shows the repo-search home; `false` opens docs directly (typical local dev) |
| `GITPAGEDOCS_PATH` | Optional base subpath for local dev (e.g. `localhost:3000/<path>`) |

On GitHub Pages (`GITHUB_ACTIONS=true`) the runtime enables Pages behavior and base-path handling automatically.

## Testing

End-to-end specs live in the repo-root `e2e/` and run against `pnpm dev` (Playwright `webServer`):

```bash
# from the repo root
npx playwright test                 # desktop + mobile projects
PORT=3100 npx playwright test       # use an alternate port if 3000 is taken
```

`e2e/ai-console.spec.ts` and `e2e/ai-chat-drawer.spec.ts` verify the password gate, encrypted persistence (no plaintext key in `localStorage`), and reload behavior. `e2e/docs.spec.ts` checks the docs home renders with no horizontal overflow.

## Static export notes

- `output: "export"` — no server runtime; `images.unoptimized` is required and respected.
- SEO files are **static** (`public/robots.txt`, `public/sitemap.xml`) — dynamic `app/robots.ts`/`sitemap.ts` routes break `output: export`.
- The deployed site shape and public URLs are documented in the [root README](../README.md#url-routes-and-query-parameters).
