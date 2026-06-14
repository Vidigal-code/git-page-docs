
<!-- gitpagedocs:audit -->
# Legacy Contract Audit — Git Page Docs V2 refactor

This file is the **regression checklist** for the V2 monorepo refactor. Every item
below works in `gitpagedocs@1.1.43` and MUST keep working through all phases.
Automated coverage is noted per item (see `tools/smoke/`).

> Generated as Phase 1/3 output. Do not delete generated regions between the
> `gitpagedocs:*` markers; they are refreshed by tooling.

## 1. CLI invocation

- Binary: `bin.gitpagedocs` → `cli/index.mjs` (Node, shebang) → spawns
  `node --import tsx cli/presentation/index.ts`. Published via `files: ["cli","prebuilt"]`.
- Entry orchestration: `cli/presentation/index.ts` → `resolveOptions()` → `dispatchMode()`.
- Banner printed before, credits after (`cli/presentation/ui/banner`).

## 2. Flags → options contract (`cli/presentation/options/parser.ts`)

Known flags: `--build --serve --layoutconfig --full --push --home --search --path --output --interactive -i --ai` plus positional `ai`, and `--owner` / `--repo`.

| Invocation | Resulting mode / key options | Automated by |
|---|---|---|
| _(no args)_ | mode `config-only`, `hasArgs=false`, `outputDir=gitpagedocs` | flag-contract + cli-smoke |
| `--layoutconfig` | `useLocalLayoutConfig=true`, mode `config-only` | flag-contract |
| `--push --owner O --repo R --path docs` | `shouldPush=true`, `githubOwner=O`, `githubRepo=R`, `docsPath=docs`, `basePath=docs` | flag-contract |
| `--home` | mode `home`, `outputDir=gitpagedocshome`, `repositorySearch=false` | flag-contract |
| `--interactive` / `-i` | `isInteractive=true` | flag-contract |
| `--build` (or env `GITPAGEDOCS_BUILD=1`) | `isBuild=true`, mode `config-only` | flag-contract |
| `--serve` | `isServe=true`, mode `config-only` | flag-contract |
| `--full` | mode `full` | flag-contract |
| `ai` / `--ai` | mode `ai`; `ai <cmd>` sets `aiCommand` | flag-contract |
| `--search true|false` | `repositorySearch` true/false (home default false) | flag-contract |
| bare positional owner/repo fallback | first two unknown `--x` map to owner/repo | flag-contract |

## 3. Generated artifacts (config-only — `node cli/index.mjs`)

- `gitpagedocs/config.json` (has `site` + `VersionControl`).
- `gitpagedocs/icon.svg`.
- Per version in `DOC_VERSIONS = ["1.0.0","1.1.0","1.1.1"]` (`cli/contracts/doc-versions.mjs`):
  `gitpagedocs/docs/versions/<v>/config.json` with array `routes-md` + `routes-html`.
- `gitpagedocs/docs/versions/1.0.0/en/source-viewer` (HTML snapshot of the repo source — **drifts on every source change; not a regression signal**, see memory).
- **Contract invariant** for the refactor = the `config.json` files stay byte-stable (baseline.snapshot.json). `source-viewer` drift is expected.

## 4. Human-facing report lines (`cli/application/report/config-only-reporter.mjs`)

- Always: `Generated: <outputDir>/ (config-only)`, `No index.html/index.js generated.`
- Layouts: local → `Local layouts generated in gitpagedocs/layouts/ (--layoutconfig).`; else `Using official remote layouts config by default (...).`
- With owner+repo: `Configured rendering URL: https://<owner>.github.io/<repo>/` + official viewer URL.
- `--push`: `Generated: .github/workflows/gitpagedocs-pages.yml` + push confirmation.
- `--build`: compatibility-flag line. `--full`/`--serve`: external-commands-skipped line. `prebuilt/` present: ignored-by-config-only line.
- Coverage: flag-contract asserts the reporter output mapping.

## 5. `--push` side effects (`cli/application/config-only/handler.mjs`, `cli/runtime/git-ops.mjs`)

- Requires owner+repo (throws otherwise). Ensures `.github/workflows/gitpagedocs-pages.yml`, `git add` gitpagedocs + workflow, commit `chore: setup gitpagedocs pages workflow`, `git push -u origin <branch>`, then best-effort `gh` Pages→Actions config.
- **Not run in automated smoke** (destructive/network). Verified manually per release; parser + reporter contract is automated.

## 6. `--home` distribution (`cli/application/home/handler.mjs`)

- Builds artifacts into `gitpagedocs/` (ARTIFACTS_DIR), runs `next build` with `GITHUB_ACTIONS=true`, copies static `out/` + artifacts into `<outputDir>/`, writes `.env`, `Dockerfile`, `README.md`, `.nojekyll`. Logs serve/docker hints.
- **Not run in automated smoke** (full build/network). Parser contract automated.

## 7. Config loading contract (frontend — `src/entities/docs/api/io/config-loader.ts`)

- `CONFIG_EXTENSIONS = [".json",".js",".ts"]`, base `gitpagedocs/config`, default `gitpagedocs/config.json`.
- `.json` via `JSON.parse`; `.js/.ts` via dynamic `import(pathToFileURL)`.

## 8. Deploy (`.github/workflows/gitpagedocs-pages.yml`)

- Clones runtime, copies user `gitpagedocs/` + `icon.svg`, installs, `next build` with `output:"export"`, relocates `out/` under path segment, generates redirect `index.html` from config default version+language, `.nojekyll`, uploads + deploys Pages.
- `next.config.ts` basePath logic (user-page vs project-page, `GITPAGEDOCS_PATH`, `GITPAGEDOCS_BASE_PATH`) must be preserved.

## 9. Validation commands (the regression wall)

```
pnpm run smoke:cli       # config-only artifacts + schemas
pnpm run smoke:flags     # parser + reporter flag contract (Phase 3)
pnpm run baseline:check  # byte-level config.json contract
pnpm run smoke:all       # all of the above
```
<!-- gitpagedocs:audit-end -->
