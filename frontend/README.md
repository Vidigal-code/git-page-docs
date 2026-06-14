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
├── next.config.ts            # output:export, basePath logic, transpilePackages
├── tsconfig.json             # extends ../tsconfig.base.json (@/* → ./src/*)
├── public/                   # static assets, robots.txt, sitemap.xml (export-safe)
├── .env / .env.example       # GITPAGEDOCS_REPOSITORY_SEARCH, GITPAGEDOCS_PATH
└── src/
    ├── app/                  # App Router: [[...repo]] catch-all, /ai, layout, not-found
    ├── widgets/              # docs-shell, ai-chat-drawer
    ├── features/             # ask-ai (chat), ai-console, route-authorization
    ├── entities/            # docs (config/content/io/layouts), ai-config
    └── shared/               # ui, lib (ai-storage, ai-secure-storage, base-path), config, icons
```

FSD import direction is enforced by the root `eslint.config.mjs` (`app → widgets → features → entities → shared`).

## AI surfaces

Two independent surfaces share the same encrypted vault from `@gitpagedocs/tools`:

- **`/ai` console** (`src/app/ai`, `src/features/ai-console`) — full-page provider/model selection + chat.
- **Chat drawer** (`src/widgets/ai-chat-drawer`, `src/features/ask-ai`) — opens over the docs.

Both are gated by a **local password**: it creates/unlocks an AES-256-GCM vault (`src/shared/lib/ai-secure-storage.ts` → `EncryptedCredentialVault`), keys are stored encrypted in `localStorage` (`gitpagedocs:vault`) and decrypted only in-session. The legacy plaintext key (`gitpagedocs_ai_key`) is migrated and wiped on first unlock. The chat itself runs through the shared 14-provider AI core, so the service layer never reads keys from storage — credentials are injected per request.

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
