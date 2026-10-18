# git-page-docs: agent guide

General engineering rules (SOLID, Clean Code, skills and SonarQube) are defined in the global `AGENTS.md`; this file covers repository-specific requirements.

## Stack

pnpm + Turborepo: `frontend/` (Next.js App Router, static export, Feature-Sliced Design), `cli/` (`@gitpagedocs/cli`), `tools/` (`@gitpagedocs/tools`, shared core), and `mcp/` (`@gitpagedocs/mcp`). Commands are in `package.json`; architecture is documented in `README.md` and `frontend/README.md`.

## Change workflow

1. **TDD**: create the first failing test in `D:/Prompts/tdd/files` (Vitest harness with a `node_modules` junction to this repository). Once it passes, move the scenario into the repository's test suite and empty the draft directory.
2. **Validation**: run `pnpm run typecheck`, `pnpm run lint`, `pnpm exec vitest run`, `pnpm run smoke:all` (includes `baseline:check`), `pnpm run build`, and `PORT=3100 pnpm run test:e2e`. Port 3000 belongs to Docker Desktop; never stop that process.
3. **SonarQube**: analyze each changed file with project key `git-page-docs`, following the global `AGENTS.md`.
4. **Report**: write a Portuguese summary in `D:/Prompts/tdd/report/<date>-<topic>.md`.

## Generated artifacts

- UI strings (`langmenu`) and default configuration live in `cli/data/`. After changing them, run `node cli/index.mjs`, copy `gitpagedocs/` into `tools/gitpagedocs/`, and run `pnpm run baseline:create`.
- Markdown pages under `gitpagedocs/docs/versions/<version>/` are generated from `cli/content/docs-{en,pt,es}.mjs`: edit the templates.
- Managed regions in README, CONTRIBUTING and SECURITY come from `tools/src/documentation/sections.ts`, generated with `node cli/index.mjs docs`.
- Layout sources are in `gitpagelayouts/v2/` (`base.json` + `layouts/<id>.json`); `pnpm run layouts:sync` generates `templates/` and their documentation.

## Compatibility

Official versions start at `0.0.1`: configurations and data from that version onward must remain compatible. Earlier formats (1.1.x) are unsupported.
