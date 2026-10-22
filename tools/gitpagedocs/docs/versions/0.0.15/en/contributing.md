# Contributing and testing

Work from the source repository when changing the runtime, CLI, shared tools or MCP server. A consuming documentation repository normally edits its own content and configuration instead. Keep a focused branch and describe the user-visible behavior and how it was verified.

## Work in the owning package

`frontend/` contains the Next.js App Router viewer and follows Feature-Sliced Design. Shared visual primitives live in `shared`, documentation data and schemas in `entities`, user capabilities in `features`, and the assembled reader in `widgets`. Keep filesystem and repository loading out of presentation components.

`cli/` owns the scaffold, commands, data defaults and authoring templates. `tools/` supplies reusable configuration, documentation and service logic. `mcp/` exposes the shared capabilities over Model Context Protocol. A UI fix usually belongs in frontend; a scaffold default must be changed in its CLI source and regenerated.

## Edit sources rather than generated copies

| Change | Source of truth | Generated result |
| --- | --- | --- |
| Site options and language labels | `cli/data/` | Root config and `gitpagedocs/langs/` |
| Routes and menu sections | CLI builders, route metadata, path mappings and `menu-sections.mjs` | Version configuration |
| Documentation prose | `cli/content/docs-{en,pt,es}.mjs` and imported content modules | Versioned Markdown |
| Managed repository documents | `tools/src/documentation/sections.ts` | README, CONTRIBUTING and SECURITY regions |
| Layout definitions | `gitpagelayouts/v2/` | Templates and layout documentation |

After CLI/content changes run `node cli/index.mjs`, copy `gitpagedocs/` into `tools/gitpagedocs/` without deleting historical versions, then run `pnpm run baseline:create`. Use `node cli/index.mjs docs` for managed regions and `pnpm run layouts:sync` for layout changes. Inspect the diff: generation must not silently replace custom material you intended to retain.

## Verify behavior through public interfaces

Write a failing regression before the implementation. Test the observable contract: generated configuration and files for CLI changes, tool/resource responses for MCP, rendered controls and keyboard behavior for UI, and browser interactions for navigation or media. Avoid assertions that only repeat an internal helper's algorithm.

Cover success, unavailable features, malformed inputs and meaningful boundaries. Examples include a missing translation, denied route, empty PDF title, blocked popup, CORS failure, first/last navigation limits and an empty native-voice list. Use isolated temporary output folders for generators. Mock network or browser capabilities at their public boundary; keep the project's own collaborators real when practical.

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm exec vitest run
pnpm run smoke:all
pnpm run build
pnpm exec cross-env PORT=3100 pnpm run test:e2e
```

The E2E configuration uses ports 3100 and 3101; leave port 3000's existing service alone. `smoke:all` includes CLI contracts, shared services, MCP discovery, documentation generation and `baseline:check`. `pnpm run test:cov` adds coverage. A local production build is distinct from the Pages static-export environment, which must also be verified for deployment-path changes.

## Review and release

Review accessibility, authorization, input validation, errors, resource cleanup and generated-file consistency. Analyze each changed source with the configured SonarQube project and the appropriate test/source scope; use the stack parser or linter for unsupported formats. Keep credentials and transient test artifacts out of commits.

Publishable packages are `@gitpagedocs/tools`, `@gitpagedocs/mcp` and `@gitpagedocs/cli`; root and frontend are private. Synchronize versions, internal dependency ranges and lockfile entries, inspect package contents, and finish validation before pushing. The current npm workflow runs on main pushes and publishes in dependency order when the CLI version is new. Confirm npm versions and the Pages deployment afterward; a successful local build alone is not publication.

> Version: 0.0.15
