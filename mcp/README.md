# @gitpagedocs/mcp

The Model Context Protocol server exposes 20 tools and 7 resources over **stdio**. It starts as a child process of your MCP client. It does not open an HTTP port or run a background daemon.

## Install and connect

Use Node.js 20+. Install the CLI in the project with `npm install --save-dev @gitpagedocs/cli`; this includes the server and its TypeScript runtime. A global installation also supports `gitpagedocs mcp start`. For a one-off run, use `npx --yes @gitpagedocs/cli mcp start`.

In VS Code, create `.vscode/mcp.json` with the following configuration. The process working directory is the project root; the MCP command has no `--root` or `--cwd` flag.

```json
{
  "servers": {
    "gitpagedocs": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${workspaceFolder}/node_modules/@gitpagedocs/cli/index.mjs",
        "mcp",
        "start"
      ],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

Open the client's MCP server controls, start GitPageDocs and list its tools/resources. Test `list_files` with `{"path":".","recursive":false}` and read `project://readme`. These operations need no provider key. A terminal launched with `mcp start` waits for JSON-RPC; ordinary text typed into stdin is not a chat command. On a source checkout, the direct entry is `node --import tsx mcp/src/bin.ts`, not `index.ts`.

## Configure a provider

Provider calls read credentials from the server process environment. MCP does not automatically load `.env` or the CLI's encrypted vault. Use the client's protected input/secret facility to inject environment values; never place real keys in a committed configuration. Restart the MCP process after changing its environment.

Select a provider using `configure_ai_provider` or `.gitpagedocs-mcp.json` at the project root:

```json
{
  "provider": "ollama",
  "model": "llama3"
}
```

| Provider | Environment |
| --- | --- |
| `openai` | `OPENAI_API_KEY` |
| `anthropic` | `ANTHROPIC_API_KEY / CLAUDE_API_KEY` |
| `gemini` | `GEMINI_API_KEY / GOOGLE_API_KEY` |
| `openrouter` | `OPENROUTER_API_KEY` |
| `ollama` | `OLLAMA_BASE_URL` |
| `azure-openai` | `AZURE_OPENAI_API_KEY + AZURE_OPENAI_BASE_URL` |
| `mistral` | `MISTRAL_API_KEY` |
| `deepseek` | `DEEPSEEK_API_KEY` |
| `cohere` | `COHERE_API_KEY` |
| `groq` | `GROQ_API_KEY` |
| `xai` | `XAI_API_KEY` |
| `together` | `TOGETHER_API_KEY` |
| `fireworks` | `FIREWORKS_API_KEY` |
| `perplexity` | `PERPLEXITY_API_KEY` |

When the saved selection is absent, unreadable or invalid JSON, the default provider is OpenAI. An unknown provider ID in readable JSON produces an explicit error instead of selecting another provider. Ollama does not require an API key; its local service and chosen model must be available. `OLLAMA_BASE_URL` is optional. Azure's base URL is the complete chat-operation URL, including deployment and API-version query when required. Model listings are the bundled catalog, not a live availability check.

## Tool reference

`?` marks an optional argument. Paths and content are strings; `recursive` is boolean. Provider identifiers come from the provider catalog. Call tools through the MCP client's tool interface.

| Tool | Arguments | Behavior |
| --- | --- | --- |
| `list_files` | `path?, recursive?` | List files (defaults: current directory, non-recursive) |
| `read_file` | `path` | Read UTF-8 text |
| `write_file` | `path, content` | Write the entire file; create parent directories |
| `search_project` | `query, extension?` | Case-insensitive substring search |
| `list_ai_providers` | `—` | Read the provider catalog |
| `list_ai_models` | `provider?` | Read the local model catalog |
| `configure_ai_provider` | `provider, model?` | Save .gitpagedocs-mcp.json |
| `ask_ai` | `prompt, provider?, model?, system?` | Return one response, without conversation history |
| `generate_documentation` | `path, provider?` | Document one source file |
| `generate_api_docs` | `path, provider?` | Describe the API in one file |
| `generate_database_docs` | `path, provider?` | Describe data models in one file |
| `analyze_source_code` | `path, provider?` | Analyze one source file |
| `generate_readme` | `provider?` | Use the tree and package.json |
| `generate_architecture_docs` | `provider?` | Use the repository tree |
| `analyze_repository` | `provider?` | Analyze the repository tree |
| `analyze_project` | `provider?` | Analyze the tree and package.json |
| `generate_changelog` | `provider?` | Use up to 80 commits, falling back to the tree |
| `generate_release_notes` | `provider?` | Use the same context as the changelog |
| `validate_docs` | `provider?` | Ask the provider to review gathered Markdown |
| `update_documentation` | `path, instructions?, provider?` | Generate and write a managed region |

`generate_*`, `analyze_*`, `ask_ai` and `validate_docs` return text; they do not save it automatically. `validate_docs` is a provider review, not a deterministic link checker. Only `write_file`, `configure_ai_provider` and `update_documentation` write files. `update_documentation` preserves text outside `<!-- gitpagedocs:start -->` / `<!-- gitpagedocs:end -->`; it appends a region when a valid pair is absent. The server does not show its own confirmation prompt; configure permissions in the MCP client.

## Resource reference

| URI | Content |
| --- | --- |
| `project://structure` | Repository tree |
| `project://docs` | Collected Markdown documents |
| `project://config` | Resolved configuration and sourcePath |
| `project://repository` | package.json content |
| `project://readme` | README.md |
| `project://ai/providers` | Provider catalog |
| `project://ai/models` | Model catalog by provider |

## Example workflow

1. Read `project://structure` and `project://readme`.
2. Call `list_ai_providers` and `list_ai_models` to select a provider/model.
3. Call `generate_api_docs` with `{"path":"src/index.ts"}` to review the returned draft.
4. Save approved text with `write_file`, or use `update_documentation` with `{"path":"docs/api.md","instructions":"Document the public API in English."}` for a managed region.

The generation step sends selected project content to the configured provider.

## Limits and troubleshooting

- File reads: up to 512,000 bytes. Listing: up to 2,000 entries; gathered project trees: 400 entries.
- Search: up to 5,000 entries, 200 matches, 240 characters per matching line.
- Documentation gathering: first 40 Markdown files among up to 2,000 entries; files over 40,000 bytes are skipped. Gathered file and Markdown context is limited to 24,000 characters. This is not a global prompt limit: tree/package context, an existing document and a caller-supplied question can add content according to the selected tool.
- Listing skips build/dependency directories such as `node_modules`, `.git`, `.next`, `out`, `dist`, `prebuilt`, `.turbo` and `coverage`. It does not interpret `.gitignore`; files such as `.env` are not automatically excluded. Run only in a trusted project and select the content to expose.
- Path checks use lexical containment; do not treat the process as an operating-system sandbox or assume symlink/junction isolation. Loading `project://config` can import JavaScript/TypeScript configuration.
- Tool failures include `isError: true`. Missing resources return `Unavailable: ...`. Check the client's stderr log for startup errors; stdout is reserved for JSON-RPC.
- If tools work but generation fails, verify provider selection, environment credentials, model availability and service connectivity.

## Package and validation

The package ships TypeScript source and delegates filesystem, configuration and provider work to `@gitpagedocs/tools`. The published CLI is the supported executable entry point. `@gitpagedocs/mcp` alone has no npm `bin` command.

From a repository checkout, run `pnpm run smoke:mcp` and `pnpm exec vitest run mcp/tests`. The tests exercise client/server requests over the MCP interfaces.

See [the main project](../README.md), [CLI package](../cli/README.md) and the [official MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) for the surrounding packages and protocol implementation.
