<!-- gitpagedocs:start -->
### Development

This is a pnpm + turbo monorepo: `frontend/` (Next.js viewer), `cli/` (the published `gitpagedocs` npm package), `tools/` (`@gitpagedocs/tools` shared core), and `mcp/` (`@gitpagedocs/mcp` server).

- `pnpm install` — install workspace dependencies
- `pnpm run typecheck` — type-check frontend + tools + mcp
- `pnpm run lint` — lint the project
- `pnpm run test:unit` — run the Vitest unit/integration suite
- `pnpm run test:cov` — unit tests with coverage
- `pnpm run test:e2e` — Playwright frontend E2E
- `pnpm run smoke:all` — CLI/contract/tools/mcp regression wall
- `pnpm run build` — build the static site

### CLI commands

- `gitpagedocs init` — scaffold gitpagedocs config files
- `gitpagedocs config` — show the resolved gitpagedocs config
- `gitpagedocs provider [id]` — list AI providers or show one
- `gitpagedocs models [provider]` — list catalog models
- `gitpagedocs ai` — interactive AI docs generator (writes pages in the gitpagedocs pattern)
- `gitpagedocs document[:repo|:file|:folder]` — generate documentation with AI in the gitpagedocs pattern
- `gitpagedocs password` — set a documentation access password (writes the public key to config.json)
- `gitpagedocs deploy | pages` — configure GitHub Pages via Actions and push
- `gitpagedocs doctor` — diagnose the environment
- `gitpagedocs mcp start` — start the MCP server over stdio
- `gitpagedocs version` — print the CLI version
- `gitpagedocs update` — show how to update the CLI
<!-- gitpagedocs:end -->
