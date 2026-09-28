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
- `gitpagedocs chat [question]` — streaming AI chat in the terminal (REPL on a TTY; one-shot with a question or piped stdin)
- `gitpagedocs document[:repo|:file|:folder]` — generate documentation with AI in the gitpagedocs pattern
- `gitpagedocs password` — set a documentation access password (writes the public key to config.json)
- `gitpagedocs config clear` — delete the stored .gitpagedocsconfig and the encrypted key vault
- `gitpagedocs docs` — refresh the managed regions of README, CONTRIBUTING and SECURITY
- `gitpagedocs deploy | pages` — configure GitHub Pages via Actions and push
- `gitpagedocs pages actions` — switch the repository's GitHub Pages source to GitHub Actions (no docs generation or push)
- `gitpagedocs pages deploy` — detect owner/repo, confirm, then generate, commit, push and print the site URL
- `gitpagedocs doctor` — diagnose the environment
- `gitpagedocs mcp start` — start the MCP server over stdio
- `gitpagedocs version` — print the CLI version
- `gitpagedocs update` — check the registry for a newer CLI and print the install command
<!-- gitpagedocs:end -->
