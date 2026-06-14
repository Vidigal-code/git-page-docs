# @gitpagedocs/mcp

The **Model Context Protocol server** for [Git Page Docs](../README.md). It exposes repository-analysis and AI documentation capabilities to MCP clients (editors, agents), delegating all logic to [`@gitpagedocs/tools`](../tools/README.md). Built on `@modelcontextprotocol/sdk` + `zod`. Ships TypeScript source; run via `tsx`.

## Start

```bash
gitpagedocs mcp start      # via the published CLI (stdio transport)
# or directly:
node --import tsx mcp/src/index.ts
```

Provider API keys are read from environment variables (per-provider) plus an optional `.gitpagedocs-mcp.json` selection file.

## Tools (20)

- **Filesystem:** `list_files`, `read_file`, `write_file`, `search_project`
- **AI:** `list_ai_providers`, `list_ai_models`, `configure_ai_provider`, `ask_ai`
- **Docs + analysis:** `generate_documentation`, `generate_api_docs`, `generate_architecture_docs`, `generate_database_docs`, `generate_readme`, `generate_changelog`, `generate_release_notes`, `update_documentation` (marker-patch), `validate_docs`, `analyze_repository`, `analyze_project`, `analyze_source_code`

## Resources (7)

`project://structure` · `project://docs` · `project://config` · `project://repository` · `project://readme` · `project://ai/providers` · `project://ai/models`

## Tests

In-process Client↔Server integration + E2E in `mcp/tests/**` and `mcp/smoke/mcp-selftest.ts`. Run from the repo root: `npm run smoke:mcp` and `npx vitest run`.
