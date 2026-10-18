
<!-- gitpagedocs:audit -->
# Current Contract Audit — Git Page Docs

This file records the public contracts checked by `tools/smoke/` and the current
viewer tests. Supported compatibility starts at version **0.0.1**; legacy 1.1.x
formats are outside the supported baseline. Version 0.0.12 adds capabilities
without removing existing 0.0.x routes, configuration or documentation folders.

> Keep the contract checks and this checklist aligned when changing the scaffold.
> The markers delimit this audit; the regular `docs` command updates README,
> CONTRIBUTING and SECURITY regions separately.

## 1. CLI invocation

- Binary: `bin.gitpagedocs` → `cli/index.mjs` (Node, shebang) → spawns
  `node --import tsx cli/presentation/index.ts`. The CLI package allowlist includes
  its entry points, source layers, contracts, builders, content/assets and data;
  an optional `prebuilt/` folder is not created by the npm publication workflow.
- Entry orchestration: `cli/presentation/index.ts` → `resolveOptions()` → `dispatchMode()`.
- Banner printed before, credits after (`cli/presentation/ui/banner`).

## 2. Flags → options contract (`cli/presentation/options/parser.ts`)

Flags include `--build --serve --layoutconfig --layouts-dir --full --push --home --search --path --output --interactive -i --no-interactive --yes -y --pages-actions --ai`, positional commands, and `--owner` / `--repo`. The parser and command registry remain the authoritative inventories.

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

- `gitpagedocs/config.json` contains `site` and `VersionControl`; language bundles hold generated UI strings, while legacy inline strings remain readable.
- `site.languages` in `gitpagedocs/config.json` (`{ "en": true, "pt": true, "es": true }`) + `gitpagedocs/langs/<lang>.json` (`langmenu` + `translations` per language; `cli/contracts/languages.mjs`, `cli/contracts/langs-paths.mjs`).
- `gitpagedocs/icon.svg`.
- Per version in `DOC_VERSIONS` (`cli/contracts/doc-versions.mjs`; currently `0.0.12`, `0.0.11`, `0.0.10`):
  `gitpagedocs/docs/versions/<v>/config.json` contains `routes-md`, `routes-html`, `routes-source-viewer`, `routes-video`, `routes-audio`, `routes-pdf` and corresponding `menus-header-*`. `pages[].blocks` adds ordered, repeated MD/HTML/video/audio/PDF references without replacing legacy routes. Localized Markdown and the HTML demo come from `cli/content/`; the included English PDF is copied unchanged.
- The source-viewer route points at the GitHub tree URL (`source-viewer-path`), so no HTML snapshot is generated any more; the byte-stable contract covers `config.json` + `langs/*.json` only.
- Deterministic configuration and language bundles are checked against the approved `baseline.snapshot.json`. Intentional default changes require regeneration, review and baseline refresh; existing user-authored documents are preserved by the normal output policy.
- The catalog contains 124 entries: 64 original themes, 20 standalone animated presets and 20 dark/light parallax pairs. JSON v2 sources expand into official templates and package-local CLI data. Native pairing metadata, background limits, pause controls and icon/text overrides have public tests.

## 4. Human-facing report lines (`cli/application/report/config-only-reporter.mjs`)

- Always: `Generated: <outputDir>/ (config-only)`, `No index.html/index.js generated.`
- Layouts: local → `Local layouts generated in <layoutsDir>/ (--layoutconfig).` (default `gitpagelayouts`); else `Using official remote layouts config by default (...).`
- With owner+repo: `Configured rendering URL: https://<owner>.github.io/<repo>/` + official viewer URL.
- `--push`: `Generated: .github/workflows/gitpagedocs-pages.yml` + push confirmation.
- `--build`: compatibility-flag line. `--full`/`--serve`: external-commands-skipped line. `prebuilt/` present: ignored-by-config-only line.
- Coverage: flag-contract asserts the reporter output mapping.

## 5. `--push` side effects (`cli/application/config-only/handler.mjs`, `cli/runtime/git-ops.mjs`)

- Requires owner+repo (throws otherwise). Ensures `.github/workflows/gitpagedocs-pages.yml`, `git add` gitpagedocs + workflow, commit `chore: setup gitpagedocs pages workflow`, `git push -u origin <branch>`, then best-effort `gh` Pages→Actions config.
- **Not run in automated smoke** (destructive/network). Verified manually per release; parser + reporter contract is automated.

## 6. `--home` distribution (`cli/application/home/handler.mjs`)

- Requires a buildable viewer runtime/source checkout. Builds artifacts into `gitpagedocs/` (ARTIFACTS_DIR), runs `next build` with `GITHUB_ACTIONS=true`, copies the static output and artifacts into `<outputDir>/`, and writes `.env`, `Dockerfile`, `README.md` and `.nojekyll`. Logs serve/docker hints.
- **Not run in automated smoke** (full build/network). Parser contract automated.

## 7. Config loading contract (frontend — `src/entities/docs/api/io/config-loader.ts`)

- `CONFIG_EXTENSIONS = [".json",".js",".ts"]`, base `gitpagedocs/config`, default `gitpagedocs/config.json`.
- JSON preserves UTF-8 and accepts a leading BOM; `.js/.ts` use dynamic `import(pathToFileURL)` where supported by the local loader. Remote/static clients load JSON rather than executing arbitrary configuration modules.

## 8. Deploy (`.github/workflows/gitpagedocs-pages.yml`)

- The repository workflow clones the runtime, copies `gitpagedocs/` and `gitpagelayouts/`, installs with a frozen lockfile, builds `frontend/` with the Pages environment, moves `frontend/out` to the artifact folder, adds `.nojekyll`, and uploads/deploys it. Generated target-repository workflows can use their configured project subpath.
- `next.config.ts` basePath logic (user-page vs project-page, `GITPAGEDOCS_PATH`, `GITPAGEDOCS_BASE_PATH`) must be preserved.

## 9. Validation commands (the regression wall)

```
pnpm run smoke:cli       # config-only artifacts + schemas
pnpm run smoke:commands  # CLI command verbs (config, provider, models, chat, ...)
pnpm run smoke:flags     # parser + reporter flag contract (Phase 3)
pnpm run smoke:core      # tools core self-test (config loader, caches, logger, filesystem)
pnpm run smoke:ai        # AI provider catalog / factory / streaming self-test
pnpm run smoke:secweb    # web crypto + encrypted vault self-test
pnpm run smoke:mcp       # MCP server self-test (20 tools, 7 resources)
pnpm run smoke:docs      # documentation automation self-test (managed regions)
pnpm run baseline:check  # byte-level config.json + langs contract
pnpm run smoke:all       # all of the above
```
<!-- gitpagedocs:audit-end -->
